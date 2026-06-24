            import { useState, useEffect, useCallback } from "react";
import { SUPABASE_CONFIG } from "../data";

const { URL, ANON_KEY } = SUPABASE_CONFIG;

const headers = {
  "Content-Type": "application/json",
  "apikey": ANON_KEY,
  "Authorization": `Bearer ${ANON_KEY}`,
};

async function fetchTable(table) {
  const res = await fetch(`${URL}/rest/v1/${table}?select=*`, { headers });
  if (!res.ok) throw new Error(`Supabase error on ${table}: ${res.status}`);
  return res.json();
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
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [lastSync, setLastSync] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [leads, jobs, expenses, team, feedback] = await Promise.all([
        fetchTable("leads"),
        fetchTable("jobs"),
        fetchTable("expenses"),
        fetchTable("team").catch(() => []),
        fetchTable("feedback").catch(() => []),
      ]);

      // ── LEADS
      const totalLeads   = leads.length;
      const wonLeads     = leads.filter(l => ["Won","Closed","Job Confirmed"].includes(l.status)).length;
      const quoteSent    = leads.filter(l => ["Quote Sent","Quote","Quoted"].includes(l.status)).length;
      const assessBooked = leads.filter(l => ["Assessment","Assessment Booked","Site Visit"].includes(l.status)).length;
      const src = (name) => leads.filter(l => l.source === name).length;

      // ── JOBS
      const collected     = jobs.reduce((s, j) => s + (parseFloat(j.collected) || 0), 0);
      const outstanding   = jobs.reduce((s, j) => s + (parseFloat(j.balance) || 0), 0);
      const completedJobs = jobs.filter(j => (parseFloat(j.collected) || 0) > 0).length;
      const scheduledJobs = jobs.filter(j => ["Scheduled","Booked","Pending"].includes(j.status)).length;
      const avgJobValue   = completedJobs > 0 ? collected / completedJobs : 0;

      // ── EXPENSES
      const totalExpenses = expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
      const metaSpend     = expenses
        .filter(e => (e.category || "").toLowerCase().includes("meta") ||
                     (e.category || "").toLowerCase().includes("ads") ||
                     (e.category || "").toLowerCase().includes("facebook"))
        .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);

      const grossProfit  = collected - totalExpenses;
      const profitMargin = collected > 0 ? (grossProfit / collected) * 100 : 0;

      // ── SERVICE BREAKDOWN
      const serviceList = [...new Set(jobs.map(j => j.service).filter(Boolean))];
      const servicePerformance = serviceList.map(s => ({
        name:    s,
        jobs:    jobs.filter(j => j.service === s).length,
        revenue: jobs.filter(j => j.service === s)
                     .reduce((sum, j) => sum + (parseFloat(j.collected) || 0), 0),
      }));

      // ── LEAD SOURCES
      const srcNames  = ["Facebook","Instagram","Google","Referral","Repeat Client","WhatsApp"];
      const srcColors = ["#3B82F6","#A855F7","#FFB300","#00C9A7","#FF4D6D","#10B981"];
      const leadSources = srcNames
        .map((name, i) => ({ name, value: src(name), color: srcColors[i] }))
        .filter(s => s.value > 0);

      // ── FEEDBACK
      const ratings   = feedback.map(f => parseFloat(f.rating)).filter(n => !isNaN(n) && n > 0);
      const avgRating = ratings.length
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
        : "0.0";
      const followUps = feedback.filter(f => (f.follow_up || "").toLowerCase() === "yes").length;

      // ── TEAM
      const teamSummary = team.map(m => ({
        name:         m.name,
        role:         m.role || "Cleaner",
        status:       m.status || "Active",
        dailyRate:    parseFloat(m.daily_rate) || 0,
        assessments:  0,
        quotes:       0,
        closed:       0,
        revenue:      0,
        rating:       "0.0",
        attendance:   0,
        productivity: 0,
      }));

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
          leadSources:       leadSources.length ? leadSources : [{ name: "No data yet", value: 1, color: "#00C9A7" }],
          roas:              metaSpend > 0 ? (collected / metaSpend).toFixed(1) : "0.0",
        },
        operations: {
          jobsCompleted:            completedJobs,
          jobsScheduled:            scheduledJobs,
          jobsCancelled:            jobs.filter(j => j.status === "Cancelled").length,
          avgTimePerJob:            0,
          teamUtilization:          team.length ? Math.min(100, Math.round((completedJobs / team.length) * 20)) : 0,
          siteAssessmentsCompleted: assessBooked,
          servicePerformance,
        },
        customer: {
          satisfactionScore: avgRating,
          googleRating:      avgRating,
          reviewsCollected:  feedback.length,
          repeatRate:  totalLeads ? ((src("Repeat Client") / totalLeads) * 100).toFixed(0) : "0",
          referralRate: totalLeads ? ((src("Referral") / totalLeads) * 100).toFixed(0) : "0",
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
