import { T, cardStyle, labelStyle, valueStyle } from "../theme";

export function KPICard({ label, value, sub, color = T.accent, alert }) {
  return (
    <div style={{
      ...cardStyle,
      borderLeft: `3px solid ${alert ? T.red : color}`,
      position: "relative", overflow: "hidden",
    }}>
      {alert && (
        <div style={{
          position: "absolute", top: 10, right: 12,
          width: 8, height: 8, borderRadius: "50%",
          background: T.red, animation: "pulse-red 1.5s infinite",
        }} />
      )}
      <div style={labelStyle}>{label}</div>
      <div style={{ ...valueStyle, color: alert ? T.red : color }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

export function ProgressBar({ label, current, target, formatFn }) {
  const p = target ? Math.min(Math.round((current / target) * 100), 100) : 0;
  const barColor = p >= 80 ? T.accent : p >= 50 ? T.gold : T.red;
  const display = formatFn || ((v) => v);
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 13, color: T.text, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, color: T.muted }}>{display(current)} / {display(target)}</span>
      </div>
      <div style={{ background: T.border, borderRadius: 8, height: 8, overflow: "hidden" }}>
        <div style={{
          width: `${p}%`, background: barColor,
          height: "100%", borderRadius: 8, transition: "width 0.8s ease",
        }} />
      </div>
      <div style={{ textAlign: "right", fontSize: 11, color: barColor, marginTop: 3 }}>{p}%</div>
    </div>
  );
}

export function SectionTitle({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, marginTop: 8 }}>
      <div style={{ width: 4, height: 20, background: T.accent, borderRadius: 2 }} />
      <h2 style={{ fontSize: 16, fontWeight: 800, color: T.text, margin: 0, letterSpacing: "0.02em" }}>
        {children}
      </h2>
    </div>
  );
}

export function AlertBanner({ alerts }) {
  if (!alerts || !alerts.length) return null;
  return (
    <div style={{
      background: T.red + "18", border: `1px solid ${T.red}44`,
      borderRadius: 10, padding: "12px 16px", marginBottom: 20,
    }}>
      <div style={{
        fontSize: 12, fontWeight: 800, color: T.red, marginBottom: 6,
        textTransform: "uppercase", letterSpacing: "0.06em",
      }}>
        ⚠ Active Alerts
      </div>
      {alerts.map((a, i) => (
        <div key={i} style={{ fontSize: 13, color: "#FFB3B3", marginBottom: 2 }}>• {a}</div>
      ))}
    </div>
  );
}

export function GoalModal({ goals, onSave, onClose }) {
  const [g, setG] = require("react").useState({ ...goals });
  const fmtUGX = (n) => `UGX ${n >= 1000000 ? (n/1000000).toFixed(1)+"M" : n >= 1000 ? (n/1000).toFixed(0)+"K" : n}`;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000A", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 16, padding: 28, width: "100%", maxWidth: 400,
      }}>
        <h3 style={{ color: T.text, margin: "0 0 6px", fontSize: 18, fontWeight: 800 }}>Set Monthly Targets</h3>
        <p style={{ color: T.muted, fontSize: 12, marginBottom: 20 }}>Update these each month as your business grows.</p>
        {[
          ["Revenue Target (UGX)", "revenue"],
          ["Lead Target",          "leads"],
          ["Job Target",           "jobs"],
          ["Profit Target (UGX)",  "profit"],
        ].map(([l, k]) => (
          <div key={k} style={{ marginBottom: 14 }}>
            <div style={labelStyle}>{l}</div>
            <input
              type="number" value={g[k]}
              onChange={(e) => setG({ ...g, [k]: +e.target.value })}
              style={{
                width: "100%", background: T.bg,
                border: `1px solid ${T.border}`, borderRadius: 8,
                padding: "10px 12px", color: T.text, fontSize: 14, boxSizing: "border-box",
              }}
            />
            {(k === "revenue" || k === "profit") && (
              <div style={{ fontSize: 11, color: T.muted, marginTop: 3 }}>= {fmtUGX(g[k])}</div>
            )}
          </div>
        ))}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button
            onClick={() => { onSave(g); onClose(); }}
            style={{ flex: 1, background: T.accent, color: "#000", fontWeight: 800, padding: 12, borderRadius: 8, fontSize: 14 }}
          >Save Targets</button>
          <button
            onClick={onClose}
            style={{ flex: 1, background: T.border, color: T.muted, fontWeight: 700, padding: 12, borderRadius: 8, fontSize: 14 }}
          >Cancel</button>
        </div>
      </div>
    </div>
  );
}

export function SyncBanner({ loading, error, lastSync, onRefetch, isLive }) {
  if (!isLive) return null;
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      background: loading ? T.gold + "18" : error ? T.red + "18" : T.accent + "18",
      border: `1px solid ${loading ? T.gold : error ? T.red : T.accent}44`,
      borderRadius: 8, padding: "8px 14px", marginBottom: 16, fontSize: 12,
    }}>
      <span style={{ color: loading ? T.gold : error ? T.red : T.accent, fontWeight: 700 }}>
        {loading ? "⟳ Syncing…" : error ? `⚠ ${error}` : "✓ Live data"}
      </span>
      {lastSync && !loading && <span style={{ color: T.muted }}>Updated {lastSync.toLocaleTimeString()}</span>}
      <button onClick={onRefetch} style={{ color: T.accent, fontSize: 11, fontWeight: 700 }}>Refresh</button>
    </div>
  );
}
