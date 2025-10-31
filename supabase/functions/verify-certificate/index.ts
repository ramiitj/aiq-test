import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { shareCode } = await req.json();

    if (!shareCode || typeof shareCode !== 'string') {
      return new Response(
        JSON.stringify({ valid: false, error: 'Invalid share code' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create admin client with service role key to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Rate limiting: Check attempts from this IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const rateLimitKey = `verify:${clientIp}`;
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

    // Clean up old rate limit entries
    await supabase.rpc('cleanup_rate_limits');

    // Check current rate limit
    const { data: rateLimitData } = await supabase
      .from('rate_limits')
      .select('count')
      .eq('key', rateLimitKey)
      .gte('created_at', oneHourAgo)
      .maybeSingle();

    if (rateLimitData && rateLimitData.count >= 10) {
      console.log(`Rate limit exceeded for IP: ${clientIp}`);
      return new Response(
        JSON.stringify({ 
          valid: false, 
          error: 'Too many verification attempts. Please try again later.' 
        }),
        { 
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Increment or create rate limit counter
    if (rateLimitData) {
      await supabase
        .from('rate_limits')
        .update({ count: rateLimitData.count + 1 })
        .eq('key', rateLimitKey)
        .gte('created_at', oneHourAgo);
    } else {
      await supabase
        .from('rate_limits')
        .insert({ key: rateLimitKey, count: 1 });
    }

    // Server-side validation with share code check
    const { data, error } = await supabase
      .from('public_results')
      .select('id, overall_score, created_at, expires_at, dimension_scores, user_name, test_duration_seconds, percentile_rank')
      .eq('share_code', shareCode)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ valid: false }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    if (!data) {
      return new Response(
        JSON.stringify({ valid: false }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Calculate score range and level
    const score = data.overall_score;
    let scoreRange = "";
    let level = "";

    if (score >= 80) {
      scoreRange = "80-100";
      level = "Exceptional";
    } else if (score >= 60) {
      scoreRange = "60-79";
      level = "Proficient";
    } else if (score >= 40) {
      scoreRange = "40-59";
      level = "Developing";
    } else {
      scoreRange = "0-39";
      level = "Emerging";
    }

    // Return sanitized data without user_id
    return new Response(
      JSON.stringify({
        valid: true,
        issueDate: data.created_at,
        expiryDate: data.expires_at,
        scoreRange,
        level,
        userName: data.user_name,
        testDuration: data.test_duration_seconds ? `${Math.floor(data.test_duration_seconds / 60)}m ${data.test_duration_seconds % 60}s` : undefined,
        percentile: data.percentile_rank,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in verify-certificate function:', error);
    return new Response(
      JSON.stringify({ valid: false, error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
