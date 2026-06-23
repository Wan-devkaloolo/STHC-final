import { useState, useEffect, useCallback } from "react";
import { SHEETS_CONFIG, isConfigured } from "../data";

const BASE = "https://sheets.googleapis.com/v4/spreadsheets";

async function fetchTab(tabName) {
  const { SHEET_ID, API_KEY } = SHEETS_CONFIG;
  const range = encodeURIComponent(`${tabName}!A1:Z2000`);
  const url = `${BASE}/${SHEET_ID}/values/${range}?key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sheets API error: ${res.status}`);
  const json = await res.json();
  return json.values || [];
}

function rowsToObjects(rows) {
  if (!rows || rows.length < 2) return [];
  const [headers, ...data] = rows;
  return data.map((row) =>
    headers.reduce((obj, h, i) => {
      obj[h.trim()] = row[i] !== undefined ? row[i].trim() : "";
      return obj;
    }, {})
  );
}

function parseUGX(val) {
  if (!val) return 0;
  const clean = String(val).replace(/[^0-9.]/g, "");
  const num = parseFloat(clean) || 0;
  if (String(val).toLowerCase().includes("m")) return num * 1000000;
  if (String(val).toLowerCase().includes("k")) return num * 1000;
  return num;
}

export function useSheetData() {
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [lastSync, setLastSync] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!isConfigured()) return;
    setLoading(true);
    setError(null);
    try {
      const { SHEET_TABS } = SHEETS_CONFIG;

      const [leadsRows, quotesRows, jobsRows, expensesRows, teamRows, feedbackRows] =
        await Promise.all([
          fetchTab(SHEET_TABS.leads),
          fetchTab(SHEET_TABS.quotes).catch(() => []),
          fetchTab(SHEET_TABS.jobs),
          fetchTab(SHEET_TABS.expenses),
          fetchTab(SHEET_TABS.team).catch(() => []),
          fetchTab(SHEET_TABS.feedback).catch(() => []),
        ]);

      const leads    = rowsToObjects(leadsRows);
      const quotes   = rowsToObjects(quotesRows);
      const jobs     = rowsToObjects(jobsRows);
      const expenses = rowsToObjects(expensesRows);
      const team     = rowsToObjects(teamRows);
      const feedback = rowsToObjects(feedbackRows);

      // ── LEADS (Date, Lead Name, Phone, Source, Service Name, Status, Quoted Amount, Notes)
      const totalLeads    = leads.filter(l => l["Date"]).length;
      const wonLeads      = leads.filter(l => l["Status"] === "Won" || l["Status"] === "Closed").length;
      const quoteSent     = leads.filter(l => l["Status"] === "Quote Sent" || l["Status"] === "Quote").length;
      const assessBooked  = leads.filter(l => l["Status"] === "Assessment" || l["Status"] === "Assessment Booked").length;
      const qualLeads     = wonLeads + quoteSent + assessBooked;

      const srcCounts = (name) => leads.filter(l => l["Source"] === name).length;

      // ── JOBS (Job Date, Client, Service, Status, Quoted, Collected, Balance)
      const activeJobs    = jobs.filter(j => j["Job Date"]);
      const collected     = activeJobs.reduce((s, j) => s + parseUGX(j["Collected"]), 0);
      const outstanding   = activeJobs.reduce((s, j) => s + parseUGX(j["Balance"]), 0);
      const completedJobs = activeJobs.filter(j => parseUGX(j["Collected"]) > 0).length;
      const scheduledJobs = activeJobs.filter(j => j["Status"] === "Scheduled" || j["Status"] === "Booked").length;
      const avgJobValue   = completedJobs > 0 ? collected / completedJobs : 0;

      // ── EXPENSES
      const activeExp     = expenses.filter(e => e["Date"] || e["Category"] || e["Amount"]);
      const totalExpenses = activeExp.reduce((s, e) => {
        const amt = parseUGX(e["Amount"] || e["Amount (UGX)"] || e["Cost"] || "0");
        return s + amt;
      }, 0);
      const metaSpend = activeExp
        .filter(e => (e["Category"] || "").toLowerCase().includes("meta") || (e["Category"] || "").toLowerCase().includes("ads"))
        .reduce((s, e) => s + parseUGX(e["Amount"] || e["Amount (UGX)"] || e["Cost"] || "0"), 0);

      const grossProfit  = collected - totalExpenses;
      const profitMargin = collected > 0 ? (grossProfit / collected) * 100 : 0;

      // ── SERVICE breakdown from Jobs
      const serviceTypes = [
        "Deep Cleaning","Move-In","Move-Out","Sofa Cleaning",
        "Carpet Cleaning","Roof Tile","Paver Cleaning","High Glass","Post-Construction",
      ];
      const servicePerformance = serviceTypes.map(s => ({
        name: s,
        jobs: activeJobs.filter(j => (j["Service"] || "").toLowerCase().includes(s.toLowerCase())).length,
        revenue: activeJobs
          .filter(j => (j["Service"] || "").toLowerCase().includes(s.toLowerCase()))
          .reduce((sum, j) => sum + parseUGX(j["Collected"]), 0),
      })).filter(s => s.jobs > 0);

      // ── LEAD SOURCES
      const srcNames  = ["Facebook","Instagram","Google","Referral","Repeat Client","WhatsApp"];
      const srcColors = ["#3B82F6","#A855F7","#FFB300","#00C9A7","#FF4D6D","#10B981"];
      const leadSources = srcNames
        .map((name, i) => ({ name, value: srcCounts(name), color: srcColors[i] }))
        .filter(s => s.value > 0);

      // ── FEEDBACK (Rating, Complaint?, etc.)
      const ratings    = feedback.map(f => parseFloat(f["Rating"] || f["Rating (1-5)"] || "0")).filter(Boolean);
      const avgRating  = ratings.length ? (ratings.reduce((a,b) => a+b,0) / ratings.length).toFixed(1) : 0;
      const complaints = feedback.filter(f => (f["Complaint"] || f["Complaint?"] || "").toLowerCase() === "yes").length;

      // ── TEAM
      const teamSummary = [...new Set(team.map(r => r["Staff Name"] || r["Name"]).filter(Boolean))].map(name => {
        const rows = team.filter(r => (r["Staff Name"] || r["Name"]) === name);
        const rs = rows.map(r => parseFloat(r["Rating"] || r["Customer Rating (1-5)"] || "0")).filter(Boolean);
        return {
          name,
          assessments: rows.reduce((s,r) => s+(parseInt(r["Assessments"] || r["Assessments Done"] || "0")||0),0),
          quotes:      rows.reduce((s,r) => s+(parseInt(r["Quotes"] || r["Quotes Generated"] || "0")||0),0),
          closed:      rows.reduce((s,r) => s+(parseInt(r["Closed"] || r["Jobs Closed"] || "0")||0),0),
          revenue:     rows.reduce((s,r) => s+parseUGX(r["Revenue"] || r["Revenue Generated (UGX)"] || "0"),0),
          rating:      rs.length ? (rs.reduce((a,b)=>a+b,0)/rs.length).toFixed(1) : "0",
          attendance:  rows.reduce((s,r) => s+(parseInt(r["Attendance"] || r["Attendance (Days)"] || "0")||0),0),
          productivity: 0,
        };
      });

      setData({
        sales: {
          leadsGenerated: { daily: Math.round(totalLeads/30), weekly: Math.round(totalLeads/4), monthly: totalLeads },
          qualifiedLeads: qualLeads,
          siteAssessmentsBooked: assessBooked,
          quotesSent: quoteSent,
          jobsClosed: wonLeads,
          leadToQuote: totalLeads ? ((quoteSent/totalLeads)*100).toFixed(1) : 0,
          quoteToSale: quoteSent ? ((wonLeads/quoteSent)*100).toFixed(1) : 0,
          closingRate: totalLeads ? ((wonLeads/totalLeads)*100).toFixed(1) : 0,
          avgJobValue,
          monthlyRevenue: collected,
          revenueGrowth: 0,
        },
        marketing: {
          metaAdsSpend: metaSpend,
          costPerLead: totalLeads ? metaSpend/totalLeads : 0,
          whatsappInquiries: srcCounts("WhatsApp"),
          websiteInquiries: srcCounts("Google"),
          leadSources: leadSources.length ? leadSources : [{ name: "Facebook", value: 1, color: "#3B82F6" }],
          roas: metaSpend > 0 ? (collected/metaSpend).toFixed(1) : 0,
        },
        operations: {
          jobsCompleted: completedJobs,
          jobsScheduled: scheduledJobs,
          jobsCancelled: activeJobs.filter(j => j["Status"] === "Cancelled").length,
          avgTimePerJob: 0,
          teamUtilization: teamSummary.length > 0 ? Math.min(100, Math.round((completedJobs/teamSummary.length)*20)) : 0,
          siteAssessmentsCompleted: assessBooked,
          servicePerformance: servicePerformance.length ? servicePerformance : [],
        },
        customer: {
          satisfactionScore: avgRating || "0.0",
          googleRating: avgRating || "0.0",
          reviewsCollected: feedback.length,
          repeatRate: totalLeads ? ((srcCounts("Repeat Client")/totalLeads)*100).toFixed(0) : 0,
          referralRate: totalLeads ? ((srcCounts("Referral")/totalLeads)*100).toFixed(0) : 0,
          complaintsLogged: complaints,
          resolutionTime: 0,
        },
        financial: {
          revenueCollected: collected,
          outstanding,
          expenses: totalExpenses,
          grossProfit,
          netProfit: grossProfit,
          profitMargin: profitMargin.toFixed(1),
          revenuePerEmployee: teamSummary.length ? collected/teamSummary.length : 0,
        },
        team: teamSummary,
      });

      setLastSync(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5*60*1000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return { data, loading, error, lastSync, refetch: fetchAll };
} 
