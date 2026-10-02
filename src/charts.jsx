// Pulled out of App.jsx into their own module so recharts (and its d3
// dependencies — a meaningful share of the app's total JS) loads as a
// separate chunk, fetched only when someone actually opens a view with a
// chart (buyer progress dashboard, seller test analytics, a score report)
// instead of being downloaded by every first-time visitor to the
// marketplace. See App.jsx's lazy()/Suspense wrapping around these.
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// Accuracy-over-attempts trend, used in both the per-test score report and
// the buyer's overall progress dashboard.
export function TrendBarChart({ T, data, height = 160 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ left: 0, right: 10, top: 6 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={T.line} vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: T.muted }} />
        <YAxis tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: T.muted }} unit="%" />
        <Tooltip contentStyle={{ fontFamily: "var(--font-body)", fontSize: 12.5, borderRadius: 6, border: `1px solid ${T.line}` }} />
        <Bar dataKey="Accuracy" fill={T.saffronDeep} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Correct-vs-missed stacked bars per topic, used in both the per-test score
// report and the buyer's overall progress dashboard.
export function TopicBreakdownChart({ T, data, height }) {
  return (
    <ResponsiveContainer width="100%" height={height ?? Math.max(160, data.length * 56)}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={T.line} horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: T.muted }} />
        <YAxis type="category" dataKey="topic" width={140} tick={{ fontSize: 12.5, fontFamily: "var(--font-body)", fill: T.ink }} />
        <Tooltip contentStyle={{ fontFamily: "var(--font-body)", fontSize: 12.5, borderRadius: 6, border: `1px solid ${T.line}` }} />
        <Bar dataKey="Correct" stackId="a" fill={T.green} radius={[0, 0, 0, 0]} />
        <Bar dataKey="Missed" stackId="a" fill={T.red} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// Per-question accuracy, color-coded red/amber/green, used in seller test
// analytics.
export function AccuracyBarChart({ T, data }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 34)}>
      <BarChart data={data} layout="vertical" margin={{ left: 10, right: 30 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={T.line} horizontal={false} />
        <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11, fontFamily: "var(--font-mono)", fill: T.muted }} />
        <YAxis type="category" dataKey="label" width={40} tick={{ fontSize: 11.5, fontFamily: "var(--font-mono)", fill: T.ink }} />
        <Tooltip
          contentStyle={{ fontFamily: "var(--font-body)", fontSize: 12.5, borderRadius: 6, border: `1px solid ${T.line}`, maxWidth: 260 }}
          formatter={(value) => [`${value}%`, "Accuracy"]}
          labelFormatter={(label, payload) => payload?.[0]?.payload?.fullText || label}
        />
        <Bar dataKey="Accuracy" radius={[0, 4, 4, 0]}>
          {data.map((d, i) => <Cell key={i} fill={d.Accuracy < 40 ? T.red : d.Accuracy < 70 ? T.saffronDeep : T.green} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
