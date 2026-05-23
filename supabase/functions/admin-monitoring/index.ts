import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

    const userClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claims?.claims) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claims.claims.sub as string;
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    // Verify admin
    const { data: isAdmin } = await admin.rpc('has_role', {
      _user_id: userId,
      _role: 'admin',
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const now = Date.now();
    const iso = (ms: number) => new Date(now - ms).toISOString();
    const MIN = 60_000;
    const HOUR = 60 * MIN;
    const DAY = 24 * HOUR;

    // Run counts in parallel
    const [
      activeSessions,
      started5m,
      started1h,
      started24h,
      completed5m,
      completed1h,
      completed24h,
      violations1h,
      avgDur1h,
      product24h,
      activeRows,
    ] = await Promise.all([
      admin.from('tests').select('*', { count: 'exact', head: true })
        .eq('test_started', true).eq('completed', false)
        .gte('start_time', iso(2 * HOUR)),
      admin.from('tests').select('*', { count: 'exact', head: true })
        .eq('test_started', true).gte('created_at', iso(5 * MIN)),
      admin.from('tests').select('*', { count: 'exact', head: true })
        .eq('test_started', true).gte('created_at', iso(HOUR)),
      admin.from('tests').select('*', { count: 'exact', head: true })
        .eq('test_started', true).gte('created_at', iso(DAY)),
      admin.from('tests').select('*', { count: 'exact', head: true })
        .eq('completed', true).gte('end_time', iso(5 * MIN)),
      admin.from('tests').select('*', { count: 'exact', head: true })
        .eq('completed', true).gte('end_time', iso(HOUR)),
      admin.from('tests').select('*', { count: 'exact', head: true })
        .eq('completed', true).gte('end_time', iso(DAY)),
      admin.from('security_violations').select('*', { count: 'exact', head: true })
        .gte('timestamp', iso(HOUR)),
      admin.from('tests').select('test_duration_seconds')
        .eq('completed', true).gte('end_time', iso(HOUR))
        .not('test_duration_seconds', 'is', null),
      admin.from('tests').select('product_slug, completed, test_duration_seconds, created_at, end_time')
        .gte('created_at', iso(DAY)),
      admin.from('tests')
        .select('id, user_id, product_slug, start_time, current_dimension, current_item, fullscreen_exit_count, security_violations_count')
        .eq('test_started', true).eq('completed', false)
        .gte('start_time', iso(2 * HOUR))
        .order('start_time', { ascending: false })
        .limit(200),
    ]);

    // Throughput per minute, last 60 minutes
    const buckets: Record<string, { started: number; completed: number }> = {};
    for (let i = 59; i >= 0; i--) {
      const t = new Date(now - i * MIN);
      t.setSeconds(0, 0);
      buckets[t.toISOString()] = { started: 0, completed: 0 };
    }
    const bucketKey = (d: string | null) => {
      if (!d) return null;
      const t = new Date(d);
      t.setSeconds(0, 0);
      const k = t.toISOString();
      return buckets[k] ? k : null;
    };

    const productAgg: Record<string, { started: number; completed: number; totalDur: number; durCount: number }> = {};
    for (const r of product24h.data ?? []) {
      const slug = r.product_slug || 'unknown';
      productAgg[slug] ??= { started: 0, completed: 0, totalDur: 0, durCount: 0 };
      productAgg[slug].started += 1;
      if (r.completed) {
        productAgg[slug].completed += 1;
        if (r.test_duration_seconds) {
          productAgg[slug].totalDur += r.test_duration_seconds;
          productAgg[slug].durCount += 1;
        }
      }
      const sk = bucketKey(r.created_at);
      if (sk) buckets[sk].started += 1;
      if (r.completed) {
        const ck = bucketKey(r.end_time);
        if (ck) buckets[ck].completed += 1;
      }
    }

    const durations = (avgDur1h.data ?? []).map((r: any) => r.test_duration_seconds).filter(Boolean);
    const avgDuration = durations.length
      ? Math.round(durations.reduce((a: number, b: number) => a + b, 0) / durations.length)
      : 0;

    // Enrich active sessions with user email
    const sessions = activeRows.data ?? [];
    const userIds = [...new Set(sessions.map((s: any) => s.user_id))];
    let profilesMap: Record<string, { email: string; name: string | null }> = {};
    if (userIds.length) {
      const { data: profs } = await admin
        .from('profiles')
        .select('user_id, email, name')
        .in('user_id', userIds);
      profilesMap = Object.fromEntries(
        (profs ?? []).map((p: any) => [p.user_id, { email: p.email, name: p.name }])
      );
    }

    // Edge function logs (last 1h) via analytics
    let edgeStats: Record<string, { count: number; errors: number; p50: number; p95: number }> = {};
    try {
      const PROJECT_REF = SUPABASE_URL.match(/https:\/\/([^.]+)\./)?.[1];
      if (PROJECT_REF) {
        const sql = `
          select m.function_id as fn, response.status_code as status, m.execution_time_ms as ms
          from function_edge_logs
          cross join unnest(metadata) as m
          cross join unnest(m.response) as response
          where timestamp > timestamp_sub(current_timestamp(), interval 60 minute)
          limit 5000
        `;
        const resp = await fetch(
          `https://api.supabase.com/v1/projects/${PROJECT_REF}/analytics/endpoints/logs.all?sql=${encodeURIComponent(sql)}`,
          { headers: { Authorization: `Bearer ${SERVICE_KEY}` } }
        );
        if (resp.ok) {
          const j = await resp.json();
          const byFn: Record<string, { ms: number[]; errors: number; count: number }> = {};
          for (const row of j.result ?? []) {
            const fn = row.fn || 'unknown';
            byFn[fn] ??= { ms: [], errors: 0, count: 0 };
            byFn[fn].count += 1;
            if (row.ms != null) byFn[fn].ms.push(row.ms);
            if (row.status >= 400) byFn[fn].errors += 1;
          }
          const pct = (arr: number[], p: number) => {
            if (!arr.length) return 0;
            const s = [...arr].sort((a, b) => a - b);
            return s[Math.min(s.length - 1, Math.floor(s.length * p))];
          };
          for (const [fn, v] of Object.entries(byFn)) {
            edgeStats[fn] = {
              count: v.count,
              errors: v.errors,
              p50: pct(v.ms, 0.5),
              p95: pct(v.ms, 0.95),
            };
          }
        }
      }
    } catch (_e) {
      // edge stats are best-effort
    }

    const productBreakdown = Object.entries(productAgg).map(([slug, v]) => ({
      product_slug: slug,
      started: v.started,
      completed: v.completed,
      completion_rate: v.started ? v.completed / v.started : 0,
      avg_duration_seconds: v.durCount ? Math.round(v.totalDur / v.durCount) : 0,
    }));

    const throughput = Object.entries(buckets).map(([t, v]) => ({
      time: t,
      started: v.started,
      completed: v.completed,
    }));

    const activeSessionsList = sessions.map((s: any) => ({
      id: s.id,
      user_email: profilesMap[s.user_id]?.email ?? '—',
      user_name: profilesMap[s.user_id]?.name ?? null,
      product_slug: s.product_slug,
      start_time: s.start_time,
      elapsed_seconds: Math.max(0, Math.round((now - new Date(s.start_time).getTime()) / 1000)),
      current_dimension: s.current_dimension,
      current_item: s.current_item,
      fullscreen_exit_count: s.fullscreen_exit_count,
      security_violations_count: s.security_violations_count,
    }));

    return new Response(
      JSON.stringify({
        generated_at: new Date().toISOString(),
        kpis: {
          active_sessions: activeSessions.count ?? 0,
          started_5m: started5m.count ?? 0,
          started_1h: started1h.count ?? 0,
          started_24h: started24h.count ?? 0,
          completed_5m: completed5m.count ?? 0,
          completed_1h: completed1h.count ?? 0,
          completed_24h: completed24h.count ?? 0,
          security_violations_1h: violations1h.count ?? 0,
          avg_duration_seconds_1h: avgDuration,
        },
        throughput,
        product_breakdown: productBreakdown,
        active_sessions: activeSessionsList,
        edge_function_stats: edgeStats,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
