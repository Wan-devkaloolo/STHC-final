import { useState } from "react";
import { T, cardStyle, labelStyle, badgeStyle } from "../theme";
import { KPICard, ProgressBar, SectionTitle, AlertBanner } from "./UIComponents";
import {
  RevenueLineChart, RevenueBarChart, LeadSourcePieChart,
  ServiceBarChart, FinanceBarChart, StarRatingChart, ConversionFunnel,
} from "./Charts";
import { fmtUGX, fmtDec, exportReport, exportCSV } from "../utils";

export function OverviewSection({ goals, alerts, sales, financial, operations, customer, revenueHistory, conversionFunnel }) {
  return (
    <div className="fade-in">
      <AlertBanner alerts={alerts} />
      <SectionTitle>Overview · {new Date().toLocaleString("en-UG", { month: "long", year: "numeric" })}</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(160px,1fr))", gap: 12, marginBottom: 24 }}>
        <KPICard label="Monthly Revenue"  value={fmtUGX(financial?.revenueCollected)} sub={`+${sales?.revenueGrowth}% vs last month`} />
        <KPICard label="Jobs Closed"      value={sales?.jobsClosed} sub={`${operations?.jobsCompleted} completed`} color={T.gold} />
        <KPICard label="Closing Rate"     value={`${sales?.closingRate}%`} sub="Target: 15%+" color={parseFloat(sales?.closingRate) >= 15 ? T.accent : T.red} alert={parseFloat(sales?.closingRate) < 15} />
        <KPICard label="Net Profit"       value={fmtUGX(financial?.netProfit)} sub={`${financial?.profitMargin}% margin`} />
        <KPICard label="Customer Rating"  value={`${customer?.satisfactionScore}★`} sub={`Google: ${customer?.googleRating}★`} color={T.gold} alert={parseFloat(customer?.satisfactionScore) < 4.5} />
        <KPICard label="Team Utilization" value={`${operations?.teamUtilization}%`} sub="active staff" color={T.purple} />
      </div>
      <SectionTitle>Revenue Trend vs Target</SectionTitle>
      <div style={{ marginBottom: 24 }}><RevenueLineChart data={revenueHistory} /></div>
      <SectionTitle>Conversion Funnel</SectionTitle>
      <div style={{ marginBottom: 24 }}><ConversionFunnel data={conversionFunnel} /></div>
      <SectionTitle>Monthly Goal Progress</SectionTitle>
      <div style={cardStyle}>
        <ProgressBar label="Revenue"    current={financial?.revenueCollected}    target={goals.revenue} formatFn={fmtUGX} />
        <ProgressBar label="Leads"      current={sales?.leadsGenerated?.monthly} target={goals.leads}   formatFn={(v) => String(v)} />
        <ProgressBar label="Jobs"       current={operations?.jobsCompleted}      target={goals.jobs}    formatFn={(v) => String(v)} />
        <ProgressBar label="Net Profit" current={financial?.netProfit}           target={goals.profit}  formatFn={fmtUGX} />
      </div>
    </div>
  );
}

export function SalesSection({ sales, revenueHistory }) {
  return (
    <div className="fade-in">
      <SectionTitle>Sales KPIs</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
        <KPICard label="Leads (Monthly)"    value={sales?.leadsGenerated?.monthly} sub={`Daily: ${sales?.leadsGenerated?.daily}`} />
        <KPICard label="Qualified Leads"    value={sales?.qualifiedLeads} color={T.blue} />
        <KPICard label="Assessments Booked" value={sales?.siteAssessmentsBooked} color={T.purple} />
        <KPICard label="Quotes Sent"        value={sales?.quotesSent} color={T.gold} />
        <KPICard label="Jobs Closed"        value={sales?.jobsClosed} color={T.accent} />
        <KPICard label="Lead → Quote"       value={`${sales?.leadToQuote}%`} color={T.blue} />
        <KPICard label="Quote → Sale"       value={`${sales?.quoteToSale}%`} color={T.purple} />
        <KPICard label="Closing Rate"       value={`${sales?.closingRate}%`} color={parseFloat(sales?.closingRate) >= 15 ? T.accent : T.red} alert={parseFloat(sales?.closingRate) < 15} />
        <KPICard label="Avg Job Value"      value={fmtUGX(sales?.avgJobValue)} color={T.gold} />
        <KPICard label="Monthly Revenue"    value={fmtUGX(sales?.monthlyRevenue)} color={T.accent} />
        <KPICard label="Revenue Growth"     value={`+${sales?.revenueGrowth}%`} color={T.accent} />
      </div>
      <SectionTitle>Revenue History</SectionTitle>
      <RevenueBarChart data={revenueHistory} />
    </div>
  );
}

export function MarketingSection({ marketing }) {
  return (
    <div className="fade-in">
      <SectionTitle>Marketing KPIs</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
        <KPICard label="Meta Ads Spend"     value={fmtUGX(marketing?.metaAdsSpend)} color={T.blue} />
        <KPICard label="Cost Per Lead"      value={fmtUGX(marketing?.costPerLead)} color={T.gold} />
        <KPICard label="WhatsApp Inquiries" value={marketing?.whatsappInquiries} color={T.accent} />
        <KPICard label="Website Inquiries"  value={marketing?.websiteInquiries} color={T.purple} />
        <KPICard label="ROAS"               value={`${marketing?.roas}x`} color={T.accent} />
      </div>
      <SectionTitle>Lead Source Breakdown</SectionTitle>
      <LeadSourcePieChart data={marketing?.leadSources || []} />
    </div>
  );
}

export function OperationsSection({ operations }) {
  return (
    <div className="fade-in">
      <SectionTitle>Operations KPIs</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
        <KPICard label="Jobs Completed"   value={operations?.jobsCompleted} color={T.accent} />
        <KPICard label="Jobs Scheduled"   value={operations?.jobsScheduled} color={T.blue} />
        <KPICard label="Jobs Cancelled"   value={operations?.jobsCancelled} color={T.red} alert={operations?.jobsCancelled > 5} />
        <KPICard label="Avg Time/Job"     value={`${fmtDec(operations?.avgTimePerJob)}h`} color={T.gold} />
        <KPICard label="Team Utilization" value={`${operations?.teamUtilization}%`} color={T.purple} />
        <KPICard label="Site Assessments" value={operations?.siteAssessmentsCompleted} color={T.accent} />
      </div>
      <SectionTitle>Service Category Performance</SectionTitle>
      <ServiceBarChart data={operations?.servicePerformance || []} />
    </div>
  );
}

export function CustomerSection({ customer }) {
  return (
    <div className="fade-in">
      <SectionTitle>Customer KPIs</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
        <KPICard label="Satisfaction Score" value={`${customer?.satisfactionScore}★`} color={T.gold} alert={parseFloat(customer?.satisfactionScore) < 4.5} />
        <KPICard label="Google Rating"      value={`${customer?.googleRating}★`} color={T.gold} />
        <KPICard label="Reviews Collected"  value={customer?.reviewsCollected} color={T.accent} />
        <KPICard label="Repeat Client Rate" value={`${customer?.repeatRate}%`} color={T.blue} />
        <KPICard label="Referral Rate"      value={`${customer?.referralRate}%`} color={T.purple} />
        <KPICard label="Complaints Logged"  value={customer?.complaintsLogged} color={T.red} alert={customer?.complaintsLogged > 5} />
        <KPICard label="Avg Resolution"     value={`${fmtDec(customer?.resolutionTime)}h`} color={T.gold} />
      </div>
      <SectionTitle>Star Rating Breakdown</SectionTitle>
      <StarRatingChart />
    </div>
  );
}

export function FinanceSection({ financial }) {
  return (
    <div className="fade-in">
      <SectionTitle>Financial KPIs</SectionTitle>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
        <KPICard label="Revenue Collected"  value={fmtUGX(financial?.revenueCollected)} color={T.accent} />
        <KPICard label="Outstanding"        value={fmtUGX(financial?.outstanding)} color={T.gold} />
        <KPICard label="Total Expenses"     value={fmtUGX(financial?.expenses)} color={T.red} />
        <KPICard label="Gross Profit"       value={fmtUGX(financial?.grossProfit)} color={T.blue} />
        <KPICard label="Net Profit"         value={fmtUGX(financial?.netProfit)} color={T.accent} />
        <KPICard label="Profit Margin"      value={`${financial?.profitMargin}%`} color={T.accent} />
        <KPICard label="Revenue / Employee" value={fmtUGX(financial?.revenuePerEmployee)} color={T.purple} />
      </div>
      <SectionTitle>Revenue vs Expenses vs Profit</SectionTitle>
      <FinanceBarChart revenue={financial?.revenueCollected} expenses={financial?.expenses} profit={financial?.netProfit} />
    </div>
  );
}

export function TeamSection({ team }) {
  return (
    <div className="fade-in">
      <SectionTitle>Team Performance</SectionTitle>
      {(team || []).map((m, i) => (
        <div key={i} style={{ ...cardStyle, marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{m.name}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>Revenue: {fmtUGX(m.revenue)} · Rating: {m.rating}★</div>
            </div>
            <div style={badgeStyle(m.productivity >= 90 ? T.accent : m.productivity >= 75 ? T.gold : T.red)}>
              {m.productivity}% productivity
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {[["Assessments", m.assessments],["Quotes", m.quotes],["Closed", m.closed],["Attendance", `${m.attendance}%`],["Rating", `${m.rating}★`],["Revenue", fmtUGX(m.revenue)]].map(([l, v]) => (
              <div key={l} style={{ background: T.bg, borderRadius: 8, padding: "8px 10px" }}>
                <div style={{ fontSize: 10, color: T.muted, marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 10, color: T.muted, marginBottom: 4 }}>Productivity Score</div>
            <div style={{ background: T.border, borderRadius: 4, height: 6 }}>
              <div style={{ width: `${m.productivity}%`, background: m.productivity >= 90 ? T.accent : m.productivity >= 75 ? T.gold : T.red, height: "100%", borderRadius: 4, transition: "width 0.5s ease" }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ReportsSection({ sales, marketing, operations, customer, financial }) {
  const [period, setPeriod] = useState("monthly");
  return (
    <div className="fade-in">
      <SectionTitle>Generate Reports</SectionTitle>
      <div style={cardStyle}>
        <div style={labelStyle}>Report Period</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {["daily", "weekly", "monthly"].map((p) => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: "8px 18px", borderRadius: 8,
              border: `1px solid ${period === p ? T.accent : T.border}`,
              background: period === p ? T.accent + "22" : "transparent",
              color: period === p ? T.accent : T.muted,
              fontWeight: 700, fontSize: 13, textTransform: "capitalize",
            }}>{p}</button>
          ))}
        </div>
        <div style={{ background: T.bg, borderRadius: 10, padding: 16, fontFamily: "monospace", fontSize: 12, color: T.muted, lineHeight: 1.8, marginBottom: 20 }}>
          <div style={{ color: T.accent, fontWeight: 700, marginBottom: 4 }}>SOVEREIGN TOUCH HOME CARE SERVICES</div>
          <div style={{ color: T.text }}>KPI Report — {period.charAt(0).toUpperCase() + period.slice(1)} · {new Date().toLocaleDateString("en-UG")}</div>
          <div style={{ marginTop: 8 }}>Revenue: {fmtUGX(sales?.monthlyRevenue)} · Jobs: {sales?.jobsClosed} · Closing: {sales?.closingRate}%</div>
          <div>Net Profit: {fmtUGX(financial?.netProfit)} · Margin: {financial?.profitMargin}% · Rating: {customer?.satisfactionScore}★</div>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => exportReport(period, sales, marketing, operations, customer, financial)} style={{ flex: 1, minWidth: 140, background: T.accent, color: "#000", fontWeight: 800, padding: "12px 16px", borderRadius: 8, fontSize: 13 }}>
            ⬇ Export Report (.txt)
          </button>
          <button onClick={() => exportCSV(sales, financial, operations, customer)} style={{ flex: 1, minWidth: 140, background: T.gold + "22", color: T.gold, fontWeight: 800, padding: "12px 16px", borderRadius: 8, border: `1px solid ${T.gold}44`, fontSize: 13 }}>
            ⬇ Export Data (.csv)
          </button>
        </div>
      </div>
    </div>
  );
}
