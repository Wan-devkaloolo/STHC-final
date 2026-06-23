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
      obj[h.trim()] = row[i] !== undefined ? String(row[i]).trim() : "";
      return obj;
    }, {})
  );
}

function parseUGX(val) {
  if (!val) return 0;
  const str = String(val).toLowerCase().replace(/,/g, "").replace(/ugx/gi, "").trim();
  const num = parseFloat(str.replace(/[^0-9.]/g, "")) || 0;
  if (str.includes("m")) return num * 1000000;
  if (str.includes("k")) return num * 1000;
  return num;
}

export function useSheetData() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [lastSync, setLastSync] = useState(null);

  const fetchAll = useCallback(async () => {
    if (!isConfigured()) return;
    setLoading(true);
    setError(null);
    try {
      const { SHEET_TABS } = SHEETS_CONFIG;

      const [leadsRows, jobsRows, expensesRows, teamRows, feedbackRows] =
        await Promise.all([
          fetchTab(SHEET_TABS.leads),
          fetchTab(SHEET_TABS.jobs),
          fetchTab(SHEET_TABS.expenses),
          fetchTab(SHEET_TABS.team).catch(() => []),
          fetchTab(SHEET_TABS.feedback).catch(() => []),
        ]);

      const leads    = rowsToObjects(leadsRows).filter(r => r["Date"]);
      const jobs     = rowsToObjects(jobsRows).filter(r => r["Job Date"]);
      const expenses = rowsToObjects(expensesRows).filter(r => r["Date"] || r["Category"]);
      const team     = rowsToObjects(teamRows).filter(r => r["Name"]);
      const feedback = rowsToObjects(feedbackRows).filter(r => r["Date"]);

      // ── LEADS
      // Date | Lead Name | Phone | Source | Service Name | Status | Quoted Amount | Notes
      const totalLeads   = leads.length;
      const wonLeads     = leads.filter(l => ["Won","Closed","Job Confirmed"].includes(l["Status"])).length;
      const quoteSent    = leads.filter(l => ["Quote Sent","Quote","Quoted"].includes(l["Status"])).length;
      const assessBooked = leads.filter(l => ["Assessment","Assessment Booked","Site Visit"].includes(l["Status"])).length;
      const src = (name) => leads.filter(l => l["Source"] === name).length;

      // ── JOBS
      // Job Date | Client | Service | Status | Quoted | Collected | Balance
      const collected     = jobs.reduce((s, j) => s + parseUGX(j["Collected"]), 0);
      const outstanding   = jobs.reduce((s, j) => s + parseUGX(j["Balance"]), 0);
      const completedJobs = jobs.filter(j => parseUGX(j["Collected"]) > 0).length;
      const scheduledJobs = jobs.filter(j => ["Scheduled","Booked","Pending"].includes(j["Status"])).length;
      const avgJobValue   = completedJobs > 0 ? collected / completedJobs : 0;

      // ── EXPENSES
      // Date | Category | Description | Amount
      const totalExpenses = expenses.reduce((s, e) => s + parseUGX(e["Amount"]), 0);
      const metaSpend     = expenses
        .filter(e => (e["Category"] || "").toLowerCase().includes("meta") ||
                     (e["Category"] || "").toLowerCase().includes("ads") ||
                     (e["Category"] || "").toLowerCase().includes("facebook"))
        .reduce((s, e) => s + parseUGX(e["Amount"]), 0);

      const grossProfit  = collected - totalExpenses;
      const profitMargin = collected > 0 ? (grossProfit / collected) * 100 : 0;

      // ── TEAM
      // Name | Role | Phone | Status | Daily Rate
      const teamSummary = team.map(m => ({
        name:         m["Name"],
        role:         m["Role"] || "Cleaner",
        status:       m["Status"] || "Active",
        dailyRate:    parseUGX(m["Daily Rate"]),
        assessments:  0,
        quotes:       0,
        closed:       0,
        revenue:      0,
        rating:       "0.0",
        attendance:   0,
        productivity: 0,
      }));

      // ── FEEDBACK
      // Date | Client | Rating (1-5) | Feedback | Follow Up | Needed
      const ratingKey = Object.keys(feedback[0] || {}).find(k => k.toLowerCase().includes("rating")) || "Rating (1-5)";
      const ratings   = feedback.map(f => parseFloat(f[ratingKey])).filter(n => !isNaN(n) && n > 0);
      const avgRating = ratings.length ? (ratings.reduce((a,b) => a+b,0) / ratings.length).toFixed(1) : "0.0";
      const followUps = feedback.filter(f => (f["Follow Up"] || "").toLowerCase() === "yes").length;

      // ── SERVICE BREAKDOWN from Jobs
      const serviceList = [...new Set(jobs.map(j => j["Service"]).filter(Boolean))];
      const servicePerformance = serviceList.map(s => ({
        name:    s,
        jobs:    jobs.filter(j => j["Service"] === s).length,
        revenue: jobs.filter(j => j["Service"] === s).reduce((sum, j) => sum + parseUGX(j["Collected"]), 0),
      }));

      // ── LEAD SOURCES
      const srcNames  = ["Facebook","Instagram","Google","Referral","Repeat Client","WhatsApp"];
      const srcColors = ["#3B82F6","#A855F7","#FFB300","#00C9A7","#FF4D6D","#10B981"];
      const leadSources = srcNames
        .map((name, i) => ({ name, value: src(name), color: srcColors[i] }))
        .filter(s => s.value > 0);

      setData({
        sales: {
          leadsGenerated: {
            daily:   Math.max(1, Math.round(totalLeads / 30)),
            weekly:  Math.max(1, Math.round(totalLeads / 4)),
            monthly: totalLeads,
          },
          qualifiedLeads:        wonLeads + quoteSent + assessBooked,
          siteAssessmentsBooked: assessBooked,
          quotesSent:            quoteSent,
          jobsClosed:            wonLeads,
          leadToQuote:  totalLeads ? ((quoteSent / totalLeads) * 100).toFixed(1) : "0.0",
          quoteToSale:  quoteSent  ? ((wonLeads  / quoteSent)  * 100).toFixed(1) : "0.0",
          closingRate:  totalLeads ? ((wonLeads  / totalLeads) * 100).toFixed(1) : "0.0",
          avgJobValue,
          monthlyRevenue: collected,
          revenueGrowth:  0,
        },
        marketing: {
          metaAdsSpend:      metaSpend,
          costPerLead:       totalLeads && metaSpend ? metaSpend / totalLeads : 0,
          whatsappInquiries: src("WhatsApp"),
          websiteInquiries:  src("Google"),
          leadSources:       leadSources.length ? leadSources : [{ name: "No data yet", value: 1, color: T_ACCENT }],
          roas:              metaSpend > 0 ? (collected / metaSpend).toFixed(1) : "0.0",
        },
        operations: {
          jobsCompleted:           completedJobs,
          jobsScheduled:           scheduledJobs,
          jobsCancelled:           jobs.filter(j => j["Status"] === "Cancelled").length,
          avgTimePerJob:           0,
          teamUtilization:         team.length ? Math.min(100, Math.round((completedJobs / team.length) * 20)) : 0,
          siteAssessmentsCompleted: assessBooked,
          servicePerformance,
        },
        customer: {
          satisfactionScore: avgRating,
          googleRating:      avgRating,
          reviewsCollected:  feedback.length,
          repeatRate:  totalLeads ? ((src("Repeat Client") / totalLeads) * 100).toFixed(0) : "0",
          referralRate: totalLeads ? ((src("Referral")      / totalLeads) * 100).toFixed(0) : "0",
          complaintsLogged: followUps,
          resolutionTime:   0,
        },
        financial: {
          revenueCollected:   collected,
          outstanding,
          expenses:           totalExpenses,
          grossProfit,
          netProfit:          grossProfit,
          profitMargin:       profitMargin.toFixed(1),
          revenuePerEmployee: team.length ? collected / team.length : 0,
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
    const interval = setInterval(fetchAll, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return { data, loading, error, lastSync, refetch: fetchAll };
                                       }
