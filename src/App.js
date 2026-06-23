import { useState } from "react";
import { T } from "./theme";
import {
  salesData, marketingData, operationsData, customerData,
  financialData, teamData, revenueHistory, conversionFunnel,
  initialGoals, isConfigured,
} from "./data";
import { useSheetData } from "./hooks/useSheetData";
import { computeAlerts } from "./utils";
import { GoalModal, SyncBanner } from "./components/UIComponents";
import {
  OverviewSection, SalesSection, MarketingSection, OperationsSection,
  CustomerSection, FinanceSection, TeamSection, ReportsSection,
} from "./components/Sections";

const NAV = [
  { id: "overview",    label: "Overview",  icon: "◈" },
  { id: "sales",       label: "Sales",     icon: "◎" },
  { id: "marketing",   label: "Marketing", icon: "◉" },
  { id: "operations",  label: "Ops",       icon: "⬡" },
  { id: "customer",    label: "Clients",   icon: "♡" },
  { id: "finance",     label: "Finance",   icon: "◇" },
  { id: "team",        label: "Team",      icon: "◑" },
  { id: "reports",     label: "Reports",   icon: "☰" },
];

export default function App() {
  const [section,   setSection]   = useState("overview");
  const [goals,     setGoals]     = useState(initialGoals);
  const [showGoals, setShowGoals] = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);

  const { data: liveData, loading, error, lastSync, refetch } = useSheetData();
  const live = isConfigured();

  const sales      = liveData?.sales      || salesData;
  const marketing  = liveData?.marketing  || marketingData;
  const operations = liveData?.operations || operationsData;
  const customer   = liveData?.customer   || customerData;
  const financial  = liveData?.financial  || financialData;
  const team       = liveData?.team       || teamData;

  const alerts = computeAlerts(sales, customer, financial, goals);

  const sectionProps = {
    goals, alerts,
    sales, marketing, operations, customer, financial, team,
    revenueHistory, conversionFunnel,
  };

  const renderSection = () => {
    switch (section) {
      case "overview":   return <OverviewSection   {...sectionProps} />;
      case "sales":      return <SalesSection      {...sectionProps} />;
      case "marketing":  return <MarketingSection  {...sectionProps} />;
      case "operations": return <OperationsSection {...sectionProps} />;
      case "customer":   return <CustomerSection   {...sectionProps} />;
      case "finance":    return <FinanceSection     {...sectionProps} />;
      case "team":       return <TeamSection        {...sectionProps} />;
      case "reports":    return <ReportsSection     {...sectionProps} />;
      default:           return null;
    }
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: "'Inter', -apple-system, sans-serif", color: T.text }}>

      <div style={{
        background: T.card,
        borderBottom: `1px solid ${T.border}`,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ color: T.muted, fontSize: 20, padding: "2px 6px", lineHeight: 1 }}
          >
            ☰
          </button>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: T.accent, letterSpacing: "0.06em" }}>
              SOVEREIGN TOUCH
            </div>
            <div style={{ fontSize: 10, color: T.muted, letterSpacing: "0.04em" }}>
              HOME CARE SERVICES · KPI DASHBOARD
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {live && (
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: loading ? T.gold : error ? T.red : T.accent,
              boxShadow: `0 0 6px ${loading ? T.gold : error ? T.red : T.accent}`,
            }} />
          )}
          {alerts.length > 0 && (
            <div style={{
              background: T.red, color: "#fff",
              fontSize: 11, fontWeight: 800,
              borderRadius: "50%", width: 20, height: 20,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {alerts.length}
            </div>
          )}
          <button
            onClick={() => setShowGoals(true)}
            style={{
              background: T.accent + "22", color: T.accent,
              border: `1px solid ${T.accent}44`,
              borderRadius: 8, padding: "6px 12px",
              fontSize: 12, fontWeight: 700,
            }}
          >
            Set Goals
          </button>
        </div>
      </div>

      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }}>
          <div style={{
            background: T.card, width: 230, height: "100%",
            borderRight: `1px solid ${T.border}`,
            padding: "20px 0", overflowY: "auto",
          }}>
            <div style={{
              padding: "0 20px 20px",
              borderBottom: `1px solid ${T.border}`,
              marginBottom: 10,
            }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: T.accent, letterSpacing: "0.06em" }}>
                SOVEREIGN TOUCH
              </div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Home Care Services</div>
              {live && (
                <div style={{ marginTop: 8, fontSize: 10, color: error ? T.red : T.accent, fontWeight: 700 }}>
                  {error ? "⚠ Sheet sync error" : "● Live Google Sheets data"}
                </div>
              )}
            </div>

            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => { setSection(n.id); setMenuOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  width: "100%", padding: "12px 20px",
                  background: section === n.id ? T.accent + "18" : "none",
                  borderLeft: section === n.id ? `3px solid ${T.accent}` : "3px solid transparent",
                  color: section === n.id ? T.accent : T.muted,
                  fontSize: 13, fontWeight: section === n.id ? 700 : 500,
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 16 }}>{n.icon}</span>
                {n.label}
              </button>
            ))}

            <div style={{
              margin: "20px 16px 0", padding: 12,
              background: live ? T.accent + "12" : T.border + "44",
              borderRadius: 8, fontSize: 11,
            }}>
              <div style={{ color: live ? T.accent : T.muted, fontWeight: 700, marginBottom: 4 }}>
                {live ? "✓ Google Sheets Connected" : "○ Using Demo Data"}
              </div>
              <div style={{ color: T.muted, lineHeight: 1.5 }}>
                {live
                  ? `Last sync: ${lastSync ? lastSync.toLocaleTimeString() : "pending"}`
                  : "Add your Sheet ID in src/data.js to connect live data."}
              </div>
              {live && (
                <button
                  onClick={() => { refetch(); setMenuOpen(false); }}
                  style={{ marginTop: 6, color: T.accent, fontSize: 11, fontWeight: 700 }}
                >
                  Refresh now →
                </button>
              )}
            </div>
          </div>
          <div style={{ flex: 1, background: "#0009" }} onClick={() => setMenuOpen(false)} />
        </div>
      )}

      <div style={{ padding: "16px 16px 100px" }}>
        <SyncBanner loading={loading} error={error} lastSync={lastSync} onRefetch={refetch} isLive={live} />
        {renderSection()}
      </div>

      <div className="bottom-nav" style={{
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: T.card, borderTop: `1px solid ${T.border}`,
        display: "flex", overflowX: "auto", zIndex: 100,
        padding: "4px 0", WebkitOverflowScrolling: "touch",
      }}>
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => setSection(n.id)}
            style={{
              flex: "0 0 auto", display: "flex", flexDirection: "column",
              alignItems: "center", gap: 2, padding: "6px 12px",
              color: section === n.id ? T.accent : T.muted,
              fontSize: 10, fontWeight: section === n.id ? 800 : 500,
              borderTop: section === n.id ? `2px solid ${T.accent}` : "2px solid transparent",
              transition: "color 0.2s",
            }}
          >
            <span style={{ fontSize: 18 }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </div>

      {showGoals && (
        <GoalModal goals={goals} onSave={setGoals} onClose={() => setShowGoals(false)} />
      )}
    </div>
  );
}
