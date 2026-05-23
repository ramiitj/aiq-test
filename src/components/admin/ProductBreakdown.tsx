import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Row {
  product_slug: string;
  started: number;
  completed: number;
  completion_rate: number;
  avg_duration_seconds: number;
}

function fmtDur(s: number) {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}m ${r}s`;
}

export function ProductBreakdown({ rows }: { rows: Row[] }) {
  const sorted = [...rows].sort((a, b) => b.started - a.started);
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead className="text-right">Started (24h)</TableHead>
            <TableHead className="text-right">Completed</TableHead>
            <TableHead className="text-right">Completion %</TableHead>
            <TableHead className="text-right">Avg Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No test activity in the last 24 hours
              </TableCell>
            </TableRow>
          )}
          {sorted.map((r) => (
            <TableRow key={r.product_slug}>
              <TableCell className="font-mono text-xs">{r.product_slug}</TableCell>
              <TableCell className="text-right">{r.started}</TableCell>
              <TableCell className="text-right">{r.completed}</TableCell>
              <TableCell className="text-right">{(r.completion_rate * 100).toFixed(0)}%</TableCell>
              <TableCell className="text-right">{fmtDur(r.avg_duration_seconds)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
