import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { T, cardStyle } from "../theme";
import { fmtUGX } from "../utils";

const tooltipStyle = {
  contentStyle: { background: T.card, border: `1px solid ${T.border}`, borderRadius: 8, fontSize: 12 },
  labelStyle: { color: T.text, fontWeight: 700 },
};
const axisProps = { tick: { fill: T.muted, fontSize: 10 }, axisLine: false, tickLine: false };

export function RevenueLineChart({ data }) {
  return (
    <div style={cardStyle}>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
          <XAxis dataKey="month" {...axisProps} />
          <YAxis {...axisProps} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} />
          <Tooltip {...tooltipStyle} formatter={(v, name) => [fmtUGX(v), name]} />
          <Legend wrapperStyle={{ fontSize: 12, color: T.muted }} />
          <Line type="monotone" dataKey="revenue" stroke={T.accent} strokeWidth={3} dot={{ fill: T.accent, r: 4 }} name="Revenue" />
          <Line type="monotone" dataKey="target" stroke={T.gold} strokeWidth={2} strokeDasharray="5 5" dot={false} name="Target" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueBarChart({ data }) {
  return (
    <div style={cardStyle}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
          <XAxis dataKey="month" {...axisProps} />
          <YAxis {...axisProps} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} />
          <Tooltip {...tooltipStyle} formatter={(v) => [fmtUGX(v), "Revenue"]} />
          <Bar dataKey="revenue" fill={T.accent} radius={[4,4,0,0]} name="Revenue" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LeadSourcePieChart({ data }) {
  return (
    <div style={cardStyle}>
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
            {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip {...tooltipStyle} formatter={(v, n) => [`${v}`, n]} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", justifyContent: "center", marginTop: 4 }}>
        {data.map((s) => (
          <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 9, height: 9, borderRadius: "50%", background: s.color }} />
            <span style={{ fontSize: 11, color: T.muted }}>{s.name}: <b style={{ color: T.text }}>{s.value}</b></span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ServiceBarChart({ data }) {
  return (
    <div style={cardStyle}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={T.border} horizontal={false} />
          <XAxis type="number" {...axisProps} />
          <YAxis dataKey="name" type="category" {...axisProps} width={110} />
          <Tooltip {...tooltipStyle} formatter={(v, name) => [name === "revenue" ? fmtUGX(v) : v, name === "revenue" ? "Revenue" : "Jobs"]} />
          <Bar dataKey="jobs" fill={T.accent} radius={[0,4,4,0]} name="jobs" />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ marginTop: 12 }}>
        {data.map((s) => (
          <div key={s.name} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.border}44` }}>
            <span style={{ fontSize: 12, color: T.muted }}>{s.name}</span>
            <span style={{ fontSize: 12, color: T.text, fontWeight: 600 }}>{s.jobs} jobs · {fmtUGX(s.revenue)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FinanceBarChart({ revenue, expenses, profit }) {
  const d = [{ name: "This Month", revenue, expenses, profit }];
  return (
    <div style={cardStyle}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={d} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
          <XAxis dataKey="name" {...axisProps} />
          <YAxis {...axisProps} tickFormatter={(v) => `${(v/1000000).toFixed(0)}M`} />
          <Tooltip {...tooltipStyle} formatter={(v) => [fmtUGX(v)]} />
          <Legend wrapperStyle={{ fontSize: 12, color: T.muted }} />
          <Bar dataKey="revenue"  fill={T.accent} radius={[4,4,0,0]} name="Revenue" />
          <Bar dataKey="expenses" fill={T.red}    radius={[4,4,0,0]} name="Expenses" />
          <Bar dataKey="profit"   fill={T.blue}   radius={[4,4,0,0]} name="Profit" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StarRatingChart({ feedback }) {
  const counts = [5,4,3,2,1].map((star) => ({
    star,
    count: feedback
      ? feedback.filter((f) => parseInt(f["Rating (1-5)"]) === star).length
      : [14,7,2,0,0][5-star],
  }));
  const total = counts.reduce((s, c) => s + c.count, 0) || 1;
  return (
    <div style={cardStyle}>
      {counts.map(({ star, count }) => (
        <div key={star} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <span style={{ fontSize: 12, color: T.muted, width: 28 }}>{star}★</span>
          <div style={{ flex: 1, background: T.border, borderRadius: 4, height: 10, overflow: "hidden" }}>
            <div style={{ width: `${(count/total)*100}%`, background: star >= 4 ? T.accent : star === 3 ? T.gold : T.red, height: "100%", borderRadius: 4, transition: "width 0.5s ease" }} />
          </div>
          <span style={{ fontSize: 12, color: T.text, fontWeight: 600, width: 20 }}>{count}</span>
        </div>
      ))}
    </div>
  );
}

export function ConversionFunnel({ data }) {
  const max = data[0]?.value || 1;
  return (
    <div style={cardStyle}>
      {data.map((item, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: T.muted }}>{item.name}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>{item.value}</span>
          </div>
          <div style={{ background: T.border, borderRadius: 4, height: 10, overflow: "hidden" }}>
            <div style={{ width: `${(item.value/max)*100}%`, background: item.fill, height: "100%", borderRadius: 4, transition: "width 0.5s ease" }} />
          </div>
        </div>
      ))}
    </div>
  );
}
