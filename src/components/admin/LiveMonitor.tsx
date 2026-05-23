import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Activity, AlertTriangle, CheckCircle2, Clock, Loader2, Radio, Users, Zap } from "lucide-react";
import { useLiveSessions } from "@/hooks/useLiveSessions";
import { ThroughputChart } from "./ThroughputChart";
import { ProductBreakdown } from "./ProductBreakdown";

interface Snapshot {
  generated_at: string;
  kpis: {
    active_sessions: number;
    started_5m: number;
    started_1h: number;
    started_24h: number;
    completed_5m: number;
    completed_1h: number;
    completed_24h: number;
    security_violations_1h: number;
    avg_duration_seconds_1h: number;
  };
  throughput: { time: string; started: number; completed: number }[];
  product_breakdown: {
    product_slug: string;
    started: number;
    completed: number;
    completion_rate: number;
    avg_duration_seconds: number;
  }[];
  active_sessions: {
    id: string;
    user_email: string;
    user_name: string | null;
    product_slug: string;
    start_time: string;
    elapsed_seconds: number;
    current_dimension: number;
    current_item: number;
    fullscreen_exit_count: number;
    security_violations_count: number;
  }[];
  edge_function_stats: Record<string, { count: number; errors: number; p50: number; p95: number }>;
}

async function fetchSnapshot(): Promise<Snapshot> {
  const { data, error } = await supabase.functions.invoke("admin-monitoring");
  if (error) throw error;
  return data as Snapshot;
}

function fmtDur(s: number) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
}

function Kpi({
  icon: Icon,
  label,
  value,
  sub,
  tone = "default",
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  tone?: "default" | "warn" | "good";
}) {
  const toneClass =
    tone === "warn"
      ? "text-destructive"
      : tone === "good"
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-primary";
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
          <Icon className={`h-4 w-4 ${toneClass}`} />
        </div>
        <div className="text-3xl font-bold">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}

export function LiveMonitor() {
  const [filter, setFilter] = useState("");

  const query = useQuery({
    queryKey: ["admin-monitoring"],
    queryFn: fetchSnapshot,
    refetchInterval: 5000,
    refetchOnWindowFocus: false,
  });

  const { connected } = useLiveSessions(() => query.refetch());

  const data = query.data;

  const filteredSessions = useMemo(() => {
    if (!data) return [];
    const q = filter.trim().toLowerCase();
    if (!q) return data.active_sessions;
    return data.active_sessions.filter(
      (s) =>
        s.product_slug?.toLowerCase().includes(q) ||
        s.user_email?.toLowerCase().includes(q) ||
        (s.user_name ?? "").toLowerCase().includes(q)
    );
  }, [data, filter]);

  // Tick to keep elapsed times fresh between refetches
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (query.isError || !data) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-destructive">
          Failed to load monitoring data: {(query.error as Error)?.message ?? "Unknown error"}
        </CardContent>
      </Card>
    );
  }

  const k = data.kpis;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Live Monitor</h2>
          <p className="text-muted-foreground text-sm">
            Real-time activity across all assessments. Auto-refreshes every 5s.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={connected ? "default" : "secondary"} className="gap-1">
            <Radio className={`h-3 w-3 ${connected ? "animate-pulse" : ""}`} />
            {connected ? "Realtime connected" : "Polling"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            Updated {new Date(data.generated_at).toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Kpi
          icon={Users}
          label="Active now"
          value={k.active_sessions}
          sub="In-flight test sessions"
          tone="good"
        />
        <Kpi
          icon={Activity}
          label="Started (1h / 24h)"
          value={`${k.started_1h} / ${k.started_24h}`}
          sub={`${k.started_5m} in last 5 min`}
        />
        <Kpi
          icon={CheckCircle2}
          label="Completed (1h / 24h)"
          value={`${k.completed_1h} / ${k.completed_24h}`}
          sub={`${k.completed_5m} in last 5 min`}
          tone="good"
        />
        <Kpi
          icon={Clock}
          label="Avg duration (1h)"
          value={fmtDur(k.avg_duration_seconds_1h)}
          sub="Completed tests"
        />
        <Kpi
          icon={AlertTriangle}
          label="Violations (1h)"
          value={k.security_violations_1h}
          sub="Security events"
          tone={k.security_violations_1h > 0 ? "warn" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-elegant">
          <CardHeader>
            <CardTitle className="text-lg">Throughput (last 60 minutes)</CardTitle>
            <CardDescription>Tests started and completed per minute</CardDescription>
          </CardHeader>
          <CardContent>
            <ThroughputChart data={data.throughput} />
          </CardContent>
        </Card>

        <Card className="shadow-elegant">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Edge function health (1h)
            </CardTitle>
            <CardDescription>p50 / p95 latency and error rate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.keys(data.edge_function_stats).length === 0 && (
              <p className="text-sm text-muted-foreground">No edge function activity recorded.</p>
            )}
            {Object.entries(data.edge_function_stats)
              .sort((a, b) => b[1].count - a[1].count)
              .slice(0, 8)
              .map(([fn, v]) => {
                const errorRate = v.count ? (v.errors / v.count) * 100 : 0;
                return (
                  <div key={fn} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                    <div>
                      <div className="font-mono text-xs">{fn}</div>
                      <div className="text-xs text-muted-foreground">{v.count} calls</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs">
                        p50 <span className="font-medium">{v.p50}ms</span> · p95{" "}
                        <span className="font-medium">{v.p95}ms</span>
                      </div>
                      <div
                        className={`text-xs ${
                          errorRate > 5 ? "text-destructive" : "text-muted-foreground"
                        }`}
                      >
                        {errorRate.toFixed(1)}% errors
                      </div>
                    </div>
                  </div>
                );
              })}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-elegant">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">Active sessions ({data.active_sessions.length})</CardTitle>
            <CardDescription>Tests currently in progress</CardDescription>
          </div>
          <Input
            placeholder="Filter by product or user…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="max-w-xs"
          />
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[500px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Elapsed</TableHead>
                  <TableHead className="text-right">Dim / Item</TableHead>
                  <TableHead className="text-right">Violations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No active sessions
                    </TableCell>
                  </TableRow>
                )}
                {filteredSessions.map((s) => {
                  const elapsed = Math.max(
                    s.elapsed_seconds,
                    Math.round((Date.now() - new Date(s.start_time).getTime()) / 1000)
                  );
                  return (
                    <TableRow key={s.id}>
                      <TableCell className="text-sm">
                        <div>{s.user_name ?? s.user_email}</div>
                        {s.user_name && (
                          <div className="text-xs text-muted-foreground">{s.user_email}</div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{s.product_slug ?? "—"}</TableCell>
                      <TableCell className="text-xs">
                        {new Date(s.start_time).toLocaleTimeString()}
                      </TableCell>
                      <TableCell className="text-xs">{fmtDur(elapsed)}</TableCell>
                      <TableCell className="text-right text-xs">
                        {s.current_dimension} / {s.current_item}
                      </TableCell>
                      <TableCell className="text-right text-xs">
                        {s.security_violations_count > 0 ? (
                          <Badge variant="destructive">{s.security_violations_count}</Badge>
                        ) : (
                          s.fullscreen_exit_count || 0
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="text-lg">Product breakdown (last 24h)</CardTitle>
          <CardDescription>Volume and completion rate per assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductBreakdown rows={data.product_breakdown} />
        </CardContent>
      </Card>
    </div>
  );
}
