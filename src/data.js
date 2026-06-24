export const SHEETS_CONFIG = {
  SHEET_ID: "19Q_qmfwIuGeLqqiJVH1ZF9QjV_vcY7SZ-eQtwU7tq10",
  API_KEY:  "AIzaSyAoQ5aLBgr6zXfnQE4CXHhooqvuTMuBdk4",
  SHEET_TABS: {
    leads:     "Leads",
    quotes:    "Quotes",
    jobs:      "Jobs",
    expenses:  "Expenses",
    team:      "Team",
    feedback:  "Feedback",
  },
};

export const isConfigured = () =>
  SHEETS_CONFIG.SHEET_ID !== "YOUR_SHEET_ID_HERE" &&
  SHEETS_CONFIG.API_KEY  !== "YOUR_GOOGLE_API_KEY_HERE";

export const initialGoals = {
  revenue: 15000000,
  leads:   120,
  jobs:    80,
  profit:  4500000,
};

export const salesData = {
  leadsGenerated:       { daily: 4, weekly: 28, monthly: 112 },
  qualifiedLeads:       78,
  siteAssessmentsBooked: 52,
  quotesSent:           45,
  jobsClosed:           31,
  leadToQuote:          40.2,
  quoteToSale:          68.9,
  closingRate:          27.7,
  avgJobValue:          385000,
  monthlyRevenue:       11935000,
  revenueGrowth:        18.4,
};

export const marketingData = {
  metaAdsSpend:      420000,
  costPerLead:       3750,
  whatsappInquiries: 67,
  websiteInquiries:  31,
  leadSources: [
    { name: "Facebook",       value: 38, color: "#3B82F6" },
    { name: "Instagram",      value: 22, color: "#A855F7" },
    { name: "Google",         value: 18, color: "#FFB300" },
    { name: "Referral",       value: 14, color: "#00C9A7" },
    { name: "Repeat Clients", value: 8,  color: "#FF4D6D" },
  ],
  roas: 28.4,
};

export const operationsData = {
  jobsCompleted:              31,
  jobsScheduled:              18,
  jobsCancelled:              4,
  avgTimePerJob:              3.2,
  teamUtilization:            78,
  siteAssessmentsCompleted:   48,
  servicePerformance: [
    { name: "Deep Cleaning",         jobs: 9, revenue: 3240000 },
    { name: "Move-In",               jobs: 5, revenue: 1750000 },
    { name: "Move-Out",              jobs: 4, revenue: 1320000 },
    { name: "Sofa Cleaning",         jobs: 3, revenue: 510000  },
    { name: "Carpet Cleaning",       jobs: 3, revenue: 675000  },
    { name: "Roof Tile",             jobs: 2, revenue: 1100000 },
    { name: "Paver Cleaning",        jobs: 2, revenue: 840000  },
    { name: "High Glass",            jobs: 2, revenue: 1800000 },
    { name: "Post-Construction",     jobs: 1, revenue: 700000  },
  ],
};

export const customerData = {
  satisfactionScore: 4.7,
  googleRating:      4.6,
  reviewsCollected:  23,
  repeatRate:        34,
  referralRate:      22,
  complaintsLogged:  3,
  resolutionTime:    6.5,
};

export const financialData = {
  revenueCollected:   11935000,
  outstanding:        2850000,
  expenses:           7240000,
  grossProfit:        4695000,
  netProfit:          3820000,
  profitMargin:       32.0,
  revenuePerEmployee: 1492000,
};

export const teamData = [
  { name: "Sarah Namutebi", assessments: 14, quotes: 12, closed: 9, revenue: 3465000, rating: 4.9, attendance: 98, productivity: 94 },
  { name: "Brian Okello",   assessments: 11, quotes: 9,  closed: 7, revenue: 2695000, rating: 4.7, attendance: 95, productivity: 88 },
  { name: "Grace Atim",     assessments: 9,  quotes: 8,  closed: 6, revenue: 2310000, rating: 4.8, attendance: 100,productivity: 91 },
  { name: "Moses Kato",     assessments: 8,  quotes: 7,  closed: 5, revenue: 1925000, rating: 4.5, attendance: 90, productivity: 82 },
  { name: "Rita Namukasa",  assessments: 6,  quotes: 5,  closed: 4, revenue: 1540000, rating: 4.6, attendance: 96, productivity: 79 },
];

export const revenueHistory = [
  { month: "Jan", revenue: 7200000,  target: 12000000 },
  { month: "Feb", revenue: 8500000,  target: 12000000 },
  { month: "Mar", revenue: 9100000,  target: 13000000 },
  { month: "Apr", revenue: 8800000,  target: 13000000 },
  { month: "May", revenue: 10100000, target: 14000000 },
  { month: "Jun", revenue: 11935000, target: 15000000 },
];

export const conversionFunnel = [
  { name: "Leads Generated", value: 112, fill: "#3B82F6" },
  { name: "Qualified Leads", value: 78,  fill: "#A855F7" },
  { name: "Assessments",     value: 52,  fill: "#00C9A7" },
  { name: "Quotes Sent",     value: 45,  fill: "#FFB300" },
  { name: "Jobs Closed",     value: 31,  fill: "#FF4D6D" },
];
