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
      const [leadsRows, jobsRows, expensesRows, teamRows, feedbackRows] =
        await Promise.all([
          fetchTab(SHEET_TABS.leads),
          fetchTab(SHEET_TABS.jobs),
          fetchTab(SHEET_TABS.expenses),
          fetchTab(SHEET_TABS.team).catch(() => []),
          fetchTab(SHEET_TABS.feedback).catch(() => []),
        ]);

      const leads    = rowsToObjects(leadsRows);
      const jobs     = rowsToObjects(jobsRows);
      const expenses = rowsToObjects(expensesRows);
      const team     = rowsToObjects(teamRows);
      const feedback = rowsToObjects(feedbackRows);

      const totalLeads   = leads.length;
      const wonLeads     = leads.filter(l => l["Status"] === "Won").length;
      const quoteSent    = leads.filter(l => l["Status"] === "Quote Sent" || l["Quoted?"] === "Yes").length;
      const assessBooked = leads.filter(l => l["Status"] === "Assessment Booked").length;

      const paidJobs      = jobs.filter(j => j["Payment Status"] === "Paid");
      const revenue       = paidJobs.reduce((s, j) => s + (parseFloat(j["Job Value (UGX)"]) || 0), 0);
      const outstanding   = jobs.filter(j => j["Payment Status"] === "Pending")
                               .reduce((s, j) => s + (parseFloat(j["Job Value (UGX)"]) || 0), 0);
      const totalExpenses = expenses.reduce((s, e) => s + (parseFloat(e["Amount (UGX)"]) || 0), 0);
      const metaSpend     = expenses.filter(e => e["Category"] === "Meta Ads")
                                    .reduce((s, e) => s + (parseFloat(e["Amount (UGX)"]) || 0), 0);
      const avgJobValue   = paidJobs.length ? revenue / paidJobs.length : 0;
      const grossProfit   = revenue - totalExpenses;
      const profitMargin  = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

      const ratings    = feedback.map(f => parseFloat(f["Rating (1-5)"])).filter(Boolean);
      const avgRating  = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      const complaints = feedback.filter(f => f["Complaint?"] === "Yes").length;

      const serviceTypes = [
        "Deep Cleaning","Move-In Cleaning","Move-Out Cleaning","Sofa Cleaning",
        "Carpet Cleaning","Roof Tile Cleaning","Paver Cleaning","High Glass Cleaning",
        "Post-Construction Cleaning",
      ];
      const servicePerformance = serviceTypes.map(s => ({
        name: s.replace(" Cleaning", "").replace("Post-Construction", "Post-Const."),
        jobs:    jobs.filter(j => j["Service Type"] === s).length,
        revenue: jobs.filter(j => j["Service Type"] === s)
                     .reduce((sum, j) => sum + (parseFloat(j["Job Value (UGX)"]) || 0), 0),
      }));

      const srcNames  = ["Facebook","Instagram","Google","Referral","Repeat Client","WhatsApp"];
      const srcColors = ["#3B82F6","#A855F7","#FFB300","#00C9A7","#FF4D6D","#10B981"];
      const leadSources = srcNames.map((name, i) => ({
        name,
        value: leads.filter(l => l["Source"] === name).length,
        color: srcColors[i],
      })).filter(s => s.value > 0);

      const teamSummary = [...new Set(team.map(r => r["Staff Name"]))].map(name => {
        const rows = team.filter(r => r["Staff Name"] === name);
        return {
          name,
          assessments: rows.reduce((s, r) => s + (parseInt(r["Assessments Done"]) || 0), 0),
          quotes:      rows.reduce((s, r) => s + (parseInt(r["Quotes Generated"]) || 0), 0),
          closed:      rows.reduce((s, r) => s + (parseInt(r["Jobs Closed"]) || 0), 0),
          revenue:     rows.reduce((s, r) => s + (parseFloat(r["Revenue Generated (UGX)"]) || 0), 0),
          rating: (() => {
            const rs = rows.map(r => parseFloat(r["Customer Rating (1-5)"])).filter(Boolean);
            return rs.length ? (rs.reduce((a,b) => a+b,0)/rs.length).toFixed(1) : 0;
          })(),
          attendance: (() => {
            const at = rows.map(r => parseInt(r["Attendance (Days)"])).filter(Boolean);
            return at.length ? Math.round(at.reduce((a,b)=>a+b,0)/at.length*100/5) : 0;
          })(),
          productivity: Math.min(100, Math.round(
            (rows.reduce((s,r)=>s+(parseInt(r["Jobs Closed"])||0),0) /
             Math.max(1, rows.reduce((s,r)=>s+(parseInt(r["Quotes Generated"])||0),0))) * 100
          )),
        };
      });

      setData({
        sales: {
          leadsGenerated: { daily: Math.round(totalLeads/30), weekly: Math.round(totalLeads/4), monthly: totalLeads },
          qualifiedLeads: assessBooked + quoteSent + wonLeads,
          siteAssessmentsBooked: assessBooked,
          quotesSent: quoteSent,
          jobsClosed: wonLeads,
          leadToQuote: totalLeads ? ((quoteSent / totalLeads) * 100).toFixed(1) : 0,
          quoteToSale: quoteSent ? ((wonLeads / quoteSent) * 100).toFixed(1) : 0,
          closingRate: totalLeads ? ((wonLeads / totalLeads) * 100).toFixed(1) : 0,
          avgJobValue,
          monthlyRevenue: revenue,
          revenueGrowth: 0,
        },
        marketing: {
          metaAdsSpend: metaSpend,
          costPerLead: totalLeads ? metaSpend / totalLeads : 0,
          whatsappInquiries: leads.filter(l => l["Source"] === "WhatsApp").length,
          websiteInquiries: leads.filter(l => l["Source"] === "Google").length,
          leadSources,
          roas: metaSpend > 0 ? (revenue / metaSpend).toFixed(1) : 0,
        },
        operations: {
          jobsCompleted: jobs.length,
          jobsScheduled: jobs.filter(j => j["Payment Status"] === "Pending").length,
          jobsCancelled: 0,
          avgTimePerJob: 0,
          teamUtilization: 0,
          siteAssessmentsCompleted: assessBooked,
          servicePerformance,
        },
        customer: {
          satisfactionScore: avgRating.toFixed(1),
          googleRating: avgRating.toFixed(1),
          reviewsCollected: feedback.length,
          repeatRate: totalLeads ? ((leads.filter(l=>l["Source"]==="Repeat Client").length/totalLeads)*100).toFixed(0) : 0,
          referralRate: totalLeads ? ((leads.filter(l=>l["Source"]==="Referral").length/totalLeads)*100).toFixed(0) : 0,
          complaintsLogged: complaints,
          resolutionTime: 0,
        },
        financial: {
          revenueCollected: revenue,
          outstanding,
          expenses: totalExpenses,
          grossProfit,
          netProfit: grossProfit,
          profitMargin: profitMargin.toFixed(1),
          revenuePerEmployee: teamSummary.length ? revenue / teamSummary.length : 0,
        },
        team: teamSummary,
        meta: { totalLeads, totalJobs: jobs.length, totalExpenses },
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
