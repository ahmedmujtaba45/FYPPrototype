import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { users } from "@/mocks/users";
import { evaluations, quarterlyData } from "@/mocks/evaluations";
import { biasDetections } from "@/mocks/biasDetection";
import { kpis } from "@/mocks/kpis";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { NotificationItem } from "@/components/feature/NotificationPanel";

const MANAGER_DEPT = "Engineering";

const managerUser = users.find((u) => u.role === "manager")!;

// ─── Team-scoped data ONLY ───
const teamMembers = users.filter(
  (u) => u.role === "employee" && u.department === MANAGER_DEPT
);

const teamEvaluations = evaluations.filter((e) => {
  const emp = users.find((u) => u.id === e.employeeId);
  return emp?.department === MANAGER_DEPT;
});

const teamKpis = kpis.filter((k) => {
  const emp = users.find((u) => u.id === k.employeeId);
  return emp?.department === MANAGER_DEPT;
});

const teamBiasDetections = biasDetections.filter(
  (b) => b.department === MANAGER_DEPT
);

const teamQuarterlyData = quarterlyData.map((q) => ({
  quarter: q.quarter,
  teamAvg: teamEvaluations.reduce((sum, e) => sum + e.totalScore, 0) / (teamEvaluations.length || 1),
}));

const individualPerformanceData = teamEvaluations.map((e) => {
  const emp = users.find((u) => u.id === e.employeeId);
  return {
    name: emp?.name.split(" ")[0] || "",
    managerScore: e.managerScore,
    hrScore: e.hrScore,
    totalScore: e.totalScore,
  };
});

const radarData = [
  { subject: "Technical Skills", A: 4.5, B: 4.0, fullMark: 5 },
  { subject: "Communication", A: 4.2, B: 4.3, fullMark: 5 },
  { subject: "Leadership", A: 3.8, B: 4.5, fullMark: 5 },
  { subject: "Problem Solving", A: 4.6, B: 4.1, fullMark: 5 },
  { subject: "Collaboration", A: 4.8, B: 4.2, fullMark: 5 },
  { subject: "Innovation", A: 3.9, B: 4.4, fullMark: 5 },
];

// ---- AI Data (team-scoped) ----
const highPerformers = teamEvaluations.filter((e) => e.totalScore >= 22);
const avgPerformers = teamEvaluations.filter((e) => e.totalScore >= 19 && e.totalScore < 22);
const atRisk = teamEvaluations.filter((e) => e.totalScore < 19);

const clusteringData = [
  { name: "High Performer", value: highPerformers.length, color: "#22c55e" },
  { name: "Average Performer", value: avgPerformers.length, color: "#3b82f6" },
  { name: "At Risk", value: atRisk.length, color: "#ef4444" },
];

// Prediction chart data: actual + predicted Q2 2026 (team-scoped)
const currentTeamAvg = teamEvaluations.reduce((sum, e) => sum + e.totalScore, 0) / (teamEvaluations.length || 1);
const predictionLineData = [
  { quarter: "Q1 2025", actual: 18.0, predicted: null },
  { quarter: "Q2 2025", actual: 18.5, predicted: null },
  { quarter: "Q3 2025", actual: 19.0, predicted: null },
  { quarter: "Q4 2025", actual: 19.5, predicted: null },
  { quarter: "Q1 2026", actual: +currentTeamAvg.toFixed(1), predicted: +currentTeamAvg.toFixed(1) },
  { quarter: "Q2 2026 (Pred)", actual: null, predicted: +(currentTeamAvg + 0.9).toFixed(1) },
];

// Per-employee prediction bar data (team-scoped)
const employeePredictionData = teamEvaluations.map((e) => {
  const emp = users.find((u) => u.id === e.employeeId);
  const predicted = e.totalScore + 0.5 + Math.random() * 1.2;
  return {
    name: emp?.name.split(" ")[0] || "",
    current: e.totalScore,
    predicted: Number(predicted.toFixed(2)),
  };
});

const reportNotifications: NotificationItem[] = [
  {
    id: "rn1",
    type: "success",
    title: "Report Generation Complete: Q1 Performance Summary",
    message: "Your requested Q1 performance summary report has been generated successfully. 8 pages, 5 charts included.",
    timestamp: "10 minutes ago",
    actionLabel: "Download PDF",
  },
  {
    id: "rn2",
    type: "info",
    title: "Analytics Update: Monthly Data Refresh",
    message: "Performance analytics dashboard data refreshed with latest evaluation inputs. 2 new trends identified for Engineering.",
    timestamp: "2 hours ago",
    actionLabel: "View Dashboard",
  },
  {
    id: "rn3",
    type: "ai",
    title: "AI Prediction Report Available: Q2 Forecast",
    message: "The AI prediction report for Q2 2026 is ready. Forecasts available for your 3 team members with confidence intervals.",
    timestamp: "4 hours ago",
    actionLabel: "View Report",
  },
  {
    id: "rn4",
    type: "success",
    title: "Export Complete: Team_Performance.xlsx",
    message: "Excel export of team performance data finished. File size: 1.8 MB. All 6 KPIs and 3 employees included.",
    timestamp: "1 day ago",
    actionLabel: "Download",
  },
  {
    id: "rn5",
    type: "deadline",
    title: "Scheduled Report: Q2 Mid-Quarter Review",
    message: "Your scheduled mid-quarter review report will auto-generate on May 20, 2026. Customize parameters now.",
    timestamp: "1 day ago",
    actionLabel: "Configure",
  },
  {
    id: "rn6",
    type: "info",
    title: "Performance Trend Update: Engineering +2.1%",
    message: "Weekly trend update: Engineering team average improved by 2.1% vs prior week. Trending upward.",
    timestamp: "2 days ago",
    actionLabel: "View Trend",
  },
];

// Bias detection (team-scoped)
const openBias = teamBiasDetections.filter((b) => b.status === "open" || b.status === "investigating");
const resolvedBias = teamBiasDetections.filter((b) => b.status === "resolved");

// KPI optimization suggestions (team-scoped)
const kpiSuggestions = [
  {
    kpi: "Code Quality & Reviews",
    currentWeight: 25,
    suggestedWeight: 30,
    reason: "Quality is improving; increase emphasis to sustain gains.",
    department: "Engineering",
  },
  {
    kpi: "Project Delivery",
    currentWeight: 30,
    suggestedWeight: 25,
    reason: "Scores are consistently high; weight can be reallocated.",
    department: "Engineering",
  },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"performance" | "ai">("performance");
  const [reportType, setReportType] = useState<"team" | "individual">("team");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [evaluationPeriod, setEvaluationPeriod] = useState("Q1 2026 (Current)");

  const selectedEmpData = selectedEmployee
    ? users.find((u) => u.id === selectedEmployee)
    : null;
  const selectedEval = selectedEmployee
    ? teamEvaluations.find((e) => e.employeeId === selectedEmployee)
    : null;

  const handleExport = (format: "pdf" | "excel") => {
    setExportFormat(format);
    setExportLoading(true);
    setExportSuccess(false);
    setTimeout(() => {
      setExportLoading(false);
      setExportSuccess(true);
    }, 2000);
  };

  const closeModal = () => {
    setShowPdfModal(false);
    setShowExcelModal(false);
    setExportLoading(false);
    setExportSuccess(false);
  };

  const openModal = (format: "pdf" | "excel") => {
    if (format === "pdf") setShowPdfModal(true);
    else setShowExcelModal(true);
    setExportSuccess(false);
    setExportLoading(false);
  };

  const getReportFileName = () => {
    const ext = exportFormat === "pdf" ? "pdf" : "xlsx";
    const periodClean = evaluationPeriod.replace(/ \(Current\)/, "").replace(/\s/g, "_");
    if (reportType === "team") {
      return `Performance_Report_Team_${periodClean}.${ext}`;
    }
    const empName = selectedEmpData?.name?.replace(/\s/g, "_") || "Individual";
    return `Performance_Report_${empName}_${periodClean}.${ext}`;
  };

  return (
    <DashboardLayout
      role="manager"
      userName={managerUser.name}
      userAvatar={managerUser.avatar}
      userRole={managerUser.jobTitle}
      userAge={managerUser.age}
      userEmail={managerUser.email}
      userDepartment={managerUser.department}
      notifications={reportNotifications}
    >
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">Reports & Analytics</h1>
              <p className="text-sm text-slate-500 mt-1">
                Analyze team and individual performance with detailed charts
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => openModal("pdf")}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                <span className="w-4 h-4 flex items-center justify-center"><i className="ri-file-pdf-line"></i></span>
                Export PDF
              </button>
              <button
                onClick={() => openModal("excel")}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                <span className="w-4 h-4 flex items-center justify-center"><i className="ri-file-excel-line"></i></span>
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("performance")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "performance"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="w-4 h-4 flex items-center justify-center"><i className="ri-bar-chart-grouped-line"></i></span>
            Performance Reports
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === "ai"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="w-4 h-4 flex items-center justify-center"><i className="ri-sparkling-line"></i></span>
            AI Analytics Reports
          </button>
        </div>

        {/* Export Modal */}
        {(showPdfModal || showExcelModal) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-700">
                    <i className={exportFormat === "pdf" ? "ri-file-pdf-line" : "ri-file-excel-line"}></i>
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">Export {exportFormat === "pdf" ? "PDF" : "Excel"} Report</h3>
                </div>
                <button
                  onClick={closeModal}
                  className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
              <div className="px-5 py-4">
                {exportSuccess ? (
                  <div className="text-center py-6">
                    <span className="w-14 h-14 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-full mx-auto mb-3">
                      <i className="ri-check-line text-2xl"></i>
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900 mb-1">Export Complete!</h4>
                    <p className="text-xs text-slate-500 mb-4">
                      Your {exportFormat === "pdf" ? "PDF" : "Excel"} report has been generated successfully.
                    </p>
                    <div className="bg-slate-50 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 flex items-center justify-center bg-white rounded-lg text-slate-400 border border-slate-200">
                          <i className={exportFormat === "pdf" ? "ri-file-pdf-line text-lg" : "ri-file-excel-line text-lg"}></i>
                        </span>
                        <div className="text-left">
                          <p className="text-xs font-medium text-slate-900">
                            {getReportFileName()}
                          </p>
                          <p className="text-xs text-slate-500">2.4 MB &middot; Generated just now</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={closeModal} className="flex-1 px-4 py-2 bg-slate-800 text-white text-xs font-medium rounded-lg hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap">Download File</button>
                      <button onClick={closeModal} className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap">Close</button>
                    </div>
                  </div>
                ) : exportLoading ? (
                  <div className="text-center py-8">
                    <div className="relative w-12 h-12 mx-auto mb-3">
                      <div className="absolute inset-0 border-2 border-slate-200 rounded-full"></div>
                      <div className="absolute inset-0 border-2 border-slate-800 rounded-full border-t-transparent animate-spin"></div>
                      <span className="absolute inset-0 flex items-center justify-center text-slate-400"><i className={exportFormat === "pdf" ? "ri-file-pdf-line" : "ri-file-excel-line"}></i></span>
                    </div>
                    <h4 className="text-sm font-medium text-slate-900 mb-1">Generating Report...</h4>
                    <p className="text-xs text-slate-500">Please wait while we compile your data</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-1.5 block">Report Scope</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setReportType("team")}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                            reportType === "team" ? "border-slate-800 bg-slate-800 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span className="w-4 h-4 flex items-center justify-center"><i className="ri-team-line"></i></span>Team Report
                        </button>
                        <button
                          onClick={() => { setReportType("individual"); if (!selectedEmployee && teamMembers.length > 0) setSelectedEmployee(teamMembers[0].id); }}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap ${
                            reportType === "individual" ? "border-slate-800 bg-slate-800 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span className="w-4 h-4 flex items-center justify-center"><i className="ri-user-line"></i></span>Individual Report
                        </button>
                      </div>
                    </div>
                    {reportType === "individual" && (
                      <div>
                        <label className="text-xs font-medium text-slate-700 mb-1.5 block">Select Employee</label>
                        <select
                          value={selectedEmployee || ""}
                          onChange={(e) => setSelectedEmployee(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent cursor-pointer"
                        >
                          {teamMembers.map((emp) => (
                            <option key={emp.id} value={emp.id}>{emp.name} - {emp.jobTitle}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-1.5 block">Evaluation Period</label>
                      <select
                          value={evaluationPeriod}
                          onChange={(e) => setEvaluationPeriod(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-xs text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent cursor-pointer"
                        >
                        <option>Q1 2026 (Current)</option>
                        <option>Q4 2025</option>
                        <option>Q3 2025</option>
                        <option>Q2 2025</option>
                        <option>Q1 2025</option>
                        <option>Full Year 2025</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700 mb-1.5 block">Include in Report</label>
                      <div className="space-y-2">
                        {[
                          { id: "scores", label: "Performance Scores & Ratings", checked: true },
                          { id: "charts", label: "Charts & Visualizations", checked: true },
                          { id: "ai", label: "AI Insights & Predictions", checked: true },
                          { id: "kpi", label: "KPI Breakdown & Details", checked: true },
                          { id: "history", label: "Quarterly History", checked: false },
                        ].map((option) => (
                          <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" defaultChecked={option.checked} className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-800 cursor-pointer" />
                            <span className="text-xs text-slate-600">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button onClick={() => handleExport(exportFormat)} className="flex-1 px-4 py-2.5 bg-slate-800 text-white text-xs font-medium rounded-lg hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap">
                        Generate {exportFormat === "pdf" ? "PDF" : "Excel"} Report
                      </button>
                      <button onClick={closeModal} className="px-4 py-2.5 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50 transition-colors cursor-pointer whitespace-nowrap">Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= PERFORMANCE REPORTS TAB ================= */}
        {activeTab === "performance" && (
          <div className="space-y-6">
            {/* Report Type Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => { setReportType("team"); setSelectedEmployee(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  reportType === "team" ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="w-4 h-4 flex items-center justify-center"><i className="ri-team-line"></i></span>
                Team Performance
              </button>
              <button
                onClick={() => setReportType("individual")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap cursor-pointer ${
                  reportType === "individual" ? "bg-slate-800 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="w-4 h-4 flex items-center justify-center"><i className="ri-user-line"></i></span>
                Individual Performance
              </button>
            </div>

            {/* Team Performance */}
            {reportType === "team" && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
                  <h2 className="text-sm font-semibold text-slate-900 mb-4">Quarterly Performance Trend</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={teamQuarterlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="quarter" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <YAxis domain={[15, 25]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                        <Line type="monotone" dataKey="teamAvg" stroke="#334155" strokeWidth={2} dot={{ fill: "#334155", r: 4 }} name="Team Average" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
                  <h2 className="text-sm font-semibold text-slate-900 mb-4">Team Member Comparison</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={individualPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <YAxis domain={[15, 25]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                        <Bar dataKey="managerScore" fill="#334155" radius={[4, 4, 0, 0]} name="Manager Score" />
                        <Bar dataKey="hrScore" fill="#64748b" radius={[4, 4, 0, 0]} name="HR Score" />
                        <Bar dataKey="totalScore" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Total Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
                    <h2 className="text-sm font-semibold text-slate-900 mb-4">Competency Analysis</h2>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={radarData}>
                          <PolarGrid stroke="#e2e8f0" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10 }} />
                          <Radar name="Team Avg" dataKey="A" stroke="#334155" fill="#334155" fillOpacity={0.3} />
                          <Radar name="Top Performer" dataKey="B" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.3} />
                          <Legend wrapperStyle={{ fontSize: "12px" }} />
                          <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
                    <h2 className="text-sm font-semibold text-slate-900 mb-4">Team Summary</h2>
                    <div className="space-y-4">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Highest Score</span>
                          <span className="text-sm font-bold text-slate-900">23.53</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">David Kim - DevOps Engineer</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Lowest Score</span>
                          <span className="text-sm font-bold text-slate-900">20.8</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">Emily Chen - Senior Developer</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Average Improvement</span>
                          <span className="text-sm font-bold text-emerald-600">+1.8</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">From Q4 2025 to Q1 2026</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Completion Rate</span>
                          <span className="text-sm font-bold text-slate-900">100%</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">All evaluations submitted</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Individual Performance */}
            {reportType === "individual" && (
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4">
                  <h2 className="text-sm font-semibold text-slate-900 mb-3">Select Employee</h2>
                  <div className="flex flex-wrap gap-2">
                    {teamMembers.map((emp) => {
                      const evalData = teamEvaluations.find((e) => e.employeeId === emp.id);
                      return (
                        <button
                          key={emp.id}
                          onClick={() => setSelectedEmployee(emp.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer whitespace-nowrap ${
                            selectedEmployee === emp.id ? "bg-slate-800 text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <img src={emp.avatar} alt={emp.name} className="w-6 h-6 rounded-full object-cover" />
                          <span className="whitespace-nowrap">{emp.name}</span>
                          {evalData && <span className={`text-xs ml-1 ${selectedEmployee === emp.id ? "text-slate-300" : "text-slate-400"}`}>{evalData.totalScore.toFixed(1)}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedEmpData && selectedEval && (
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
                      <div className="flex items-center">
                        <img src={selectedEmpData.avatar} alt={selectedEmpData.name} className="w-14 h-14 rounded-full object-cover" />
                        <div className="ml-4">
                          <h2 className="text-lg font-semibold text-slate-900">{selectedEmpData.name}</h2>
                          <p className="text-sm text-slate-500">{selectedEmpData.jobTitle} &middot; {selectedEmpData.department}</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="text-3xl font-bold text-slate-900">{selectedEval.totalScore.toFixed(1)}</p>
                          <p className="text-xs text-slate-500">/ 25 Total</p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                        <p className="text-xs text-slate-500 mb-1">Manager Score</p>
                        <p className="text-2xl font-bold text-slate-900">{selectedEval.managerScore.toFixed(1)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">/ 20</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                        <p className="text-xs text-slate-500 mb-1">HR Score</p>
                        <p className="text-2xl font-bold text-slate-900">{selectedEval.hrScore.toFixed(1)}</p>
                        <p className="text-xs text-slate-400 mt-0.5">/ 5</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                        <p className="text-xs text-slate-500 mb-1">Quarter</p>
                        <p className="text-2xl font-bold text-slate-900">Q1 2026</p>
                      </div>
                      <div className="bg-white rounded-xl p-4 border border-slate-200 text-center">
                        <p className="text-xs text-slate-500 mb-1">Status</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Completed</span>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
                      <h3 className="text-sm font-semibold text-slate-900 mb-4">Performance Trend</h3>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={[
                            { quarter: "Q1 2025", score: 18.7 },
                            { quarter: "Q2 2025", score: 19.3 },
                            { quarter: "Q3 2025", score: 19.9 },
                            { quarter: "Q4 2025", score: 20.5 },
                            { quarter: "Q1 2026", score: selectedEval.totalScore },
                          ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="quarter" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                            <YAxis domain={[3, 5]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                            <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} />
                            <Line type="monotone" dataKey="score" stroke="#334155" strokeWidth={2} dot={{ fill: "#334155", r: 4 }} activeDot={{ r: 6 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white"><i className="ri-sparkling-line"></i></span>
                        <h3 className="text-sm font-semibold text-slate-900">AI Insights</h3>
                      </div>
                      <div className="space-y-3">
                        {selectedEval.aiInsights.map((insight, idx) => (
                          <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                            <span className="w-6 h-6 flex items-center justify-center bg-slate-200 text-slate-700 rounded-full text-xs font-semibold flex-shrink-0 mt-0.5">{idx + 1}</span>
                            <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {!selectedEmployee && (
                  <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                    <span className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-full text-slate-400 mx-auto mb-3"><i className="ri-user-line text-xl"></i></span>
                    <p className="text-sm text-slate-500">Select an employee to view their detailed performance report</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= AI ANALYTICS REPORTS TAB ================= */}
        {activeTab === "ai" && (
          <div className="space-y-6">
            {/* 1. Performance Prediction Reports */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white"><i className="ri-sparkling-line"></i></span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Performance Prediction Reports</h2>
                  <p className="text-xs text-slate-500">AI-generated forecasts for your team performance</p>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Company prediction line chart */}
                <div>
                  <h3 className="text-xs font-medium text-slate-700 mb-2">Performance Forecast</h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={predictionLineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="quarter" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                        <YAxis domain={[15, 26]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                        <Line type="monotone" dataKey="actual" stroke="#334155" strokeWidth={2} dot={{ fill: "#334155", r: 4 }} name="Actual" connectNulls />
                        <Line type="monotone" dataKey="predicted" stroke="#22c55e" strokeWidth={2} strokeDasharray="6 4" dot={{ fill: "#22c55e", r: 4 }} name="AI Predicted" connectNulls />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                {/* Per-employee prediction bar chart */}
                <div>
                  <h3 className="text-xs font-medium text-slate-700 mb-2">Employee Predicted Scores (Q2 2026)</h3>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={employeePredictionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <YAxis domain={[15, 26]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                        <Bar dataKey="current" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Current Q1" />
                        <Bar dataKey="predicted" fill="#22c55e" radius={[4, 4, 0, 0]} name="Predicted Q2" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Clustering Analytics Reports */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white"><i className="ri-sparkling-line"></i></span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Clustering Analytics Reports</h2>
                  <p className="text-xs text-slate-500">AI workforce segmentation for your Engineering team</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pie Chart */}
                <div className="md:col-span-1">
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={clusteringData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {clusteringData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} />
                        <Legend wrapperStyle={{ fontSize: "12px" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                {/* Category breakdown */}
                <div className="md:col-span-2 space-y-3">
                  {/* High Performers */}
                  <div className="p-3 rounded-lg border border-emerald-100 bg-emerald-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        <span className="text-sm font-medium text-slate-900">High Performer</span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">{highPerformers.length} employees</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {highPerformers.map((e) => {
                        const emp = users.find((u) => u.id === e.employeeId);
                        return (
                          <span key={e.id} className="inline-flex items-center gap-1.5 px-2 py-1 bg-white rounded-md text-xs text-slate-700 border border-emerald-100 whitespace-nowrap">
                            <img src={emp?.avatar} alt={emp?.name} className="w-5 h-5 rounded-full object-cover" />
                            {emp?.name} — {e.totalScore.toFixed(1)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  {/* Average Performers */}
                  <div className="p-3 rounded-lg border border-sky-100 bg-sky-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-sky-500"></span>
                        <span className="text-sm font-medium text-slate-900">Average Performer</span>
                      </div>
                      <span className="text-xs font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">{avgPerformers.length} employees</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {avgPerformers.map((e) => {
                        const emp = users.find((u) => u.id === e.employeeId);
                        return (
                          <span key={e.id} className="inline-flex items-center gap-1.5 px-2 py-1 bg-white rounded-md text-xs text-slate-700 border border-sky-100 whitespace-nowrap">
                            <img src={emp?.avatar} alt={emp?.name} className="w-5 h-5 rounded-full object-cover" />
                            {emp?.name} — {e.totalScore.toFixed(1)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  {/* At Risk */}
                  <div className="p-3 rounded-lg border border-red-100 bg-red-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="text-sm font-medium text-slate-900">At Risk</span>
                      </div>
                      <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">{atRisk.length} employees</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {atRisk.map((e) => {
                        const emp = users.find((u) => u.id === e.employeeId);
                        return (
                          <span key={e.id} className="inline-flex items-center gap-1.5 px-2 py-1 bg-white rounded-md text-xs text-slate-700 border border-red-100 whitespace-nowrap">
                            <img src={emp?.avatar} alt={emp?.name} className="w-5 h-5 rounded-full object-cover" />
                            {emp?.name} — {e.totalScore.toFixed(1)}
                          </span>
                        );
                      })}
                      {atRisk.length === 0 && <span className="text-xs text-slate-500">No employees in this category.</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Bias Detection Reports */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white"><i className="ri-sparkling-line"></i></span>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Bias Detection Reports</h2>
                    <p className="text-xs text-slate-500">AI-identified evaluation inconsistencies and alerts</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-xs font-medium px-2.5 py-1 bg-red-100 text-red-700 rounded-full">{openBias.length} Open</span>
                  <span className="text-xs font-medium px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full">{resolvedBias.length} Resolved</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left py-2.5 px-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Bias Type</th>
                      <th className="text-left py-2.5 px-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Severity</th>
                      <th className="text-left py-2.5 px-3 text-xs font-medium text-slate-500 uppercase tracking-wide hidden sm:table-cell">Department</th>
                      <th className="text-left py-2.5 px-3 text-xs font-medium text-slate-500 uppercase tracking-wide">Status</th>
                      <th className="text-left py-2.5 px-3 text-xs font-medium text-slate-500 uppercase tracking-wide hidden md:table-cell">AI Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {teamBiasDetections.map((bias) => (
                      <tr key={bias.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-3">
                          <p className="font-medium text-slate-900">{bias.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{bias.description.substring(0, 70)}...</p>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            bias.severity === "high" ? "bg-red-100 text-red-700" :
                            bias.severity === "medium" ? "bg-amber-100 text-amber-700" :
                            "bg-slate-100 text-slate-700"
                          }`}>
                            {bias.severity.charAt(0).toUpperCase() + bias.severity.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-700 hidden sm:table-cell">{bias.department}</td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            bias.status === "open" ? "bg-red-100 text-red-700" :
                            bias.status === "investigating" ? "bg-amber-100 text-amber-700" :
                            "bg-emerald-100 text-emerald-700"
                          }`}>
                            {bias.status.charAt(0).toUpperCase() + bias.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-600 hidden md:table-cell max-w-xs">{bias.recommendation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 4. AI Feedback Reports */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white"><i className="ri-sparkling-line"></i></span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">AI Feedback Reports</h2>
                  <p className="text-xs text-slate-500">AI-generated summaries and insights for your team</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teamEvaluations.map((evalItem) => {
                  const emp = users.find((u) => u.id === evalItem.employeeId);
                  return (
                    <div key={evalItem.id} className="p-4 border border-slate-100 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={emp?.avatar} alt={emp?.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{emp?.name}</p>
                          <p className="text-xs text-slate-500">{emp?.jobTitle} &middot; Score {evalItem.totalScore.toFixed(1)}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {evalItem.aiInsights.slice(0, 2).map((insight, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="w-5 h-5 flex items-center justify-center bg-slate-200 text-slate-700 rounded-full text-[10px] font-semibold flex-shrink-0 mt-0.5">{idx + 1}</span>
                            <p className="text-xs text-slate-700 leading-relaxed">{insight}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-500">
                          <span className="font-medium text-slate-700">AI Prediction:</span> {evalItem.aiPrediction}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. KPI Optimization Reports */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white"><i className="ri-sparkling-line"></i></span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">KPI Optimization Reports</h2>
                  <p className="text-xs text-slate-500">AI-suggested weight adjustments for balanced evaluations</p>
                </div>
              </div>
              <div className="space-y-4">
                {kpiSuggestions.map((suggestion, idx) => (
                  <div key={idx} className="p-4 border border-slate-100 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{suggestion.kpi}</p>
                        <p className="text-xs text-slate-500">{suggestion.department} Department</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md line-through">{suggestion.currentWeight}%</span>
                        <span className="text-xs text-slate-400"><i className="ri-arrow-right-line"></i></span>
                        <span className="text-xs font-medium px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md">{suggestion.suggestedWeight}%</span>
                      </div>
                    </div>
                    {/* Mini bar for weight shift */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden flex">
                        <div className="h-full bg-slate-300" style={{ width: `${suggestion.currentWeight}%` }}></div>
                        <div className="h-full bg-emerald-400" style={{ width: `${Math.max(0, suggestion.suggestedWeight - suggestion.currentWeight)}%` }}></div>
                      </div>
                      <span className="text-xs font-medium text-emerald-600 whitespace-nowrap">
                        {suggestion.suggestedWeight > suggestion.currentWeight ? "+" : ""}{suggestion.suggestedWeight - suggestion.currentWeight}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <span className="font-medium text-slate-800">AI Reason:</span> {suggestion.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
