export const fmt = (n) => {
  const num = parseFloat(n) || 0;
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000)    return `${(num / 1000).toFixed(0)}K`;
  return String(Math.round(num));
};

export const fmtUGX = (n) => `UGX ${fmt(n)}`;

export const fmtPct = (n) => `${parseFloat(n || 0).toFixed(1)}%`;

export const fmtDec = (n, places = 1) => parseFloat(n || 0).toFixed(places);

export function computeAlerts(sales, customer, financial, goals) {
  const alerts = [];
  if (parseFloat(sales?.closingRate) < 15)
    alerts.push(`Closing rate at ${sales.closingRate}% — below 15% target`);
  if (parseFloat(customer?.satisfactionScore) < 4.5)
    alerts.push(`Customer rating at ${customer.satisfactionScore}★ — below 4.5 threshold`);
  if (financial?.revenueCollected < goals?.revenue)
    alerts.push(`Revenue at ${fmtUGX(financial.revenueCollected)} — target ${fmtUGX(goals.revenue)} not yet met`);
  if (parseFloat(customer?.costPerLead) > 6000)
    alerts.push(`Cost per lead at ${fmtUGX(customer.costPerLead)} — above UGX 6,000 target`);
  return alerts;
}

export function exportReport(period, sales, marketing, operations, customer, financial) {
  const date = new Date().toLocaleDateString("en-UG");
  const lines = [
    "SOVEREIGN TOUCH HOME CARE SERVICES",
    `KPI REPORT — ${period.toUpperCase()} (${date})`,
    "=".repeat(52),
    "",
    "SALES",
    `  Monthly Revenue     : ${fmtUGX(sales?.monthlyRevenue)}`,
    `  Leads Generated     : ${sales?.leadsGenerated?.monthly}`,
    `  Jobs Closed         : ${sales?.jobsClosed}`,
    `  Closing Rate        : ${sales?.closingRate}%`,
    `  Avg Job Value       : ${fmtUGX(sales?.avgJobValue)}`,
    `  Revenue Growth      : +${sales?.revenueGrowth}%`,
    "",
    "MARKETING",
    `  Meta Ads Spend      : ${fmtUGX(marketing?.metaAdsSpend)}`,
    `  Cost Per Lead       : ${fmtUGX(marketing?.costPerLead)}`,
    `  WhatsApp Inquiries  : ${marketing?.whatsappInquiries}`,
    `  ROAS                : ${marketing?.roas}x`,
    "",
    "OPERATIONS",
    `  Jobs Completed      : ${operations?.jobsCompleted}`,
    `  Jobs Scheduled      : ${operations?.jobsScheduled}`,
    `  Assessments Done    : ${operations?.siteAssessmentsCompleted}`,
    `  Team Utilization    : ${operations?.teamUtilization}%`,
    "",
    "CUSTOMER",
    `  Satisfaction Score  : ${customer?.satisfactionScore}★`,
    `  Google Rating       : ${customer?.googleRating}★`,
    `  Reviews Collected   : ${customer?.reviewsCollected}`,
    `  Repeat Client Rate  : ${customer?.repeatRate}%`,
    `  Referral Rate       : ${customer?.referralRate}%`,
    `  Complaints Logged   : ${customer?.complaintsLogged}`,
    "",
    "FINANCIALS",
    `  Revenue Collected   : ${fmtUGX(financial?.revenueCollected)}`,
    `  Outstanding         : ${fmtUGX(financial?.outstanding)}`,
    `  Total Expenses      : ${fmtUGX(financial?.expenses)}`,
    `  Gross Profit        : ${fmtUGX(financial?.grossProfit)}`,
    `  Net Profit          : ${fmtUGX(financial?.netProfit)}`,
    `  Profit Margin       : ${financial?.profitMargin}%`,
    `  Revenue/Employee    : ${fmtUGX(financial?.revenuePerEmployee)}`,
    "",
    "=".repeat(52),
    `Generated: ${new Date().toLocaleString("en-UG")}`,
    "Sovereign Touch KPI Dashboard",
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `sovereign-touch-${period}-report-${date.replace(/\//g, "-")}.txt`;
  a.click();
}

export function exportCSV(sales, financial, operations, customer) {
  const rows = [
    ["Metric", "Value"],
    ["Monthly Revenue (UGX)", financial?.revenueCollected],
    ["Net Profit (UGX)", financial?.netProfit],
    ["Profit Margin (%)", financial?.profitMargin],
    ["Total Leads", sales?.leadsGenerated?.monthly],
    ["Jobs Closed", sales?.jobsClosed],
    ["Closing Rate (%)", sales?.closingRate],
    ["Avg Job Value (UGX)", sales?.avgJobValue],
    ["Customer Rating", customer?.satisfactionScore],
    ["Reviews Collected", customer?.reviewsCollected],
    ["Complaints", customer?.complaintsLogged],
    ["Jobs Completed", operations?.jobsCompleted],
    ["Team Utilization (%)", operations?.teamUtilization],
  ];

  const csv = rows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `sovereign-touch-kpi-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
}
