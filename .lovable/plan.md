
## Goal

Add a real-time monitoring section to the existing Admin page that shows live concurrent test activity, throughput, and basic system performance signals — so you can watch what happens when ~40 users take SDE/PM tests at the same time.

## Where it lives

- New tab inside `src/pages/Admin.tsx` called **"Live Monitor"** (alongside existing admin tabs).
- Admin-only (already gated by `has_role(... 'admin')` and existing RLS on `tests`).

## What the dashboard shows

1. **Live KPIs (top row, refresh every 5s)**
   - Active sessions now (tests where `test_started=true`, `completed=false`, `start_time > now() - 2h`)
   - Tests started — last 5 min / last 1 h / last 24 h
   - Tests completed — last 5 min / last 1 h / last 24 h
   - Avg completion time (last 1 h) from `test_duration_seconds`
   - Security violations — last 1 h (from `security_violations`)
   - Rate-limit rejections — last 1 h (parsed from Postgres logs)

2. **Active sessions table**
   - Columns: user email (from `profiles`), product_slug, started_at, elapsed, current_dimension/current_item, fullscreen_exit_count
   - Filter by product_slug (sde-beginner, sde-advanced, pm-beginner, pm-advanced, etc.)

3. **Throughput chart (last 60 min, 1-min buckets)**
   - Stacked bars: tests started vs completed, grouped by product
   - Built with existing `recharts` (already used in Admin)

4. **Product breakdown (last 24 h)**
   - Per product_slug: started, completed, completion rate, avg duration, pass rate (from `public_results.overall_score >= passing_score`)

5. **System health panel**
   - DB health snapshot: connection saturation, DB size, deadlocks, OOM kills (from `supabase--db_health` via a new edge function)
   - Edge function p50/p95 latency for `load-assessment` and `score-test` (last 1 h, from `function_edge_logs`)
   - Edge function error rate (status_code >= 400)

## How data is fetched

- **Realtime subscriptions** on `public.tests` and `public.security_violations` for instant updates of KPIs and the active-sessions table.
  - Migration: `ALTER PUBLICATION supabase_realtime ADD TABLE public.tests, public.security_violations;` and set `REPLICA IDENTITY FULL` on both.
- **Aggregations + system metrics** via a new admin-only edge function `admin-monitoring` that:
  - Verifies caller has `admin` role (service-role client + `has_role`)
  - Runs the count/aggregate queries above
  - Calls Supabase Management API for edge logs and DB health (using `SUPABASE_SERVICE_ROLE_KEY` + project ref)
  - Returns a single JSON snapshot
  - Polled from the dashboard every 5s via `useQuery` with `refetchInterval`

## Files

- New: `supabase/functions/admin-monitoring/index.ts`
- New: `src/components/admin/LiveMonitor.tsx` (KPI cards + sessions table + system panel)
- New: `src/components/admin/ThroughputChart.tsx`
- New: `src/components/admin/ProductBreakdown.tsx`
- New: `src/hooks/useLiveSessions.ts` (realtime subscription)
- Edit: `src/pages/Admin.tsx` — add "Live Monitor" tab
- Migration: enable realtime on `tests` and `security_violations`
- Edit: `supabase/config.toml` — register `admin-monitoring` with `verify_jwt = true`

## Out of scope (can add later)

- Historical retention beyond what's already in `tests` / `function_edge_logs`
- Alerting/notifications (email/Slack on thresholds)
- Per-user drill-down pages
- Load-test runner that simulates 40 users
