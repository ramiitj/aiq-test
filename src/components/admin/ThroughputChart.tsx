import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface Bucket {
  time: string;
  started: number;
  completed: number;
}

export function ThroughputChart({ data }: { data: Bucket[] }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={9} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "hsl(var(--background))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="started" stackId="a" fill="hsl(var(--primary))" name="Started" />
          <Bar dataKey="completed" stackId="a" fill="hsl(var(--accent))" name="Completed" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
