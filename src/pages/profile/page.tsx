import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Cell,
  ReferenceLine,
  Area,
  AreaChart,
} from "recharts";
import { users } from "@/mocks/users";
import { kpis } from "@/mocks/kpis";
import { evaluations, employeeQuarterlyHistory } from "@/mocks/evaluations";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getCategory(score: number): "High Performer" | "Stable" | "At Risk" {
  if (score >= 22) return "High Performer";
  if (score >= 20) return "Stable";
  return "At Risk";
}

function categoryColor(cat: string) {
  switch (cat) {
    case "High Performer":
      return { badge: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", bar: "#10b981" };
    case "Stable":
      return { badge: "bg-amber-500", light: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", bar: "#f59e0b" };
    default:
      return { badge: "bg-red-500", light: "bg-red-50", text: "text-red-700", ring: "ring-red-200", bar: "#ef4444" };
  }
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const employees = users.filter((u) => u.role === "employee");

const departmentAverages: Record<string, number> = {
  Engineering: 21.3,
  Marketing: 22.0,
  Sales: 22.1,
  "Human Resources": 20.5,
};

/* Future prediction data per employee */
const futurePredictions: Record<string, { quarter: string; score: number; category: string; type: "actual" | "predicted" }[]> = {
  u3: [
    { quarter: "Q1", score: 20.8, category: "Stable", type: "actual" },
    { quarter: "Q2", score: 21.5, category: "High Performer", type: "predicted" },
    { quarter: "Q3", score: 22.1, category: "High Performer", type: "predicted" },
    { quarter: "Q4", score: 22.8, category: "High Performer", type: "predicted" },
  ],
  u4: [
    { quarter: "Q1", score: 21.0, category: "Stable", type: "actual" },
    { quarter: "Q2", score: 22.0, category: "High Performer", type: "predicted" },
    { quarter: "Q3", score: 22.5, category: "High Performer", type: "predicted" },
    { quarter: "Q4", score: 23.0, category: "High Performer", type: "predicted" },
  ],
  u5: [
    { quarter: "Q1", score: 22.17, category: "High Performer", type: "actual" },
    { quarter: "Q2", score: 23.0, category: "High Performer", type: "predicted" },
    { quarter: "Q3", score: 23.4, category: "High Performer", type: "predicted" },
    { quarter: "Q4", score: 23.8, category: "High Performer", type: "predicted" },
  ],
  u6: [
    { quarter: "Q1", score: 23.53, category: "High Performer", type: "actual" },
    { quarter: "Q2", score: 23.8, category: "High Performer", type: "predicted" },
    { quarter: "Q3", score: 24.0, category: "High Performer", type: "predicted" },
    { quarter: "Q4", score: 24.2, category: "High Performer", type: "predicted" },
  ],
  u7: [
    { quarter: "Q1", score: 22.17, category: "High Performer", type: "actual" },
    { quarter: "Q2", score: 22.5, category: "High Performer", type: "predicted" },
    { quarter: "Q3", score: 22.9, category: "High Performer", type: "predicted" },
    { quarter: "Q4", score: 23.3, category: "High Performer", type: "predicted" },
  ],
};

/* AI skill breakdown per employee */
const skillBreakdowns: Record<string, { skill: string; score: number; fullMark: number }[]> = {
  u3: [
    { skill: "Technical", score: 85, fullMark: 100 },
    { skill: "Collaboration", score: 92, fullMark: 100 },
    { skill: "Innovation", score: 72, fullMark: 100 },
    { skill: "Delivery", score: 78, fullMark: 100 },
    { skill: "Documentation", score: 65, fullMark: 100 },
    { skill: "Leadership", score: 70, fullMark: 100 },
  ],
  u4: [
    { skill: "Technical", score: 88, fullMark: 100 },
    { skill: "Collaboration", score: 85, fullMark: 100 },
    { skill: "Innovation", score: 80, fullMark: 100 },
    { skill: "Delivery", score: 82, fullMark: 100 },
    { skill: "Documentation", score: 78, fullMark: 100 },
    { skill: "Leadership", score: 68, fullMark: 100 },
  ],
  u5: [
    { skill: "Creativity", score: 95, fullMark: 100 },
    { skill: "Strategy", score: 88, fullMark: 100 },
    { skill: "Analytics", score: 80, fullMark: 100 },
    { skill: "Communication", score: 92, fullMark: 100 },
    { skill: "Execution", score: 90, fullMark: 100 },
    { skill: "Leadership", score: 75, fullMark: 100 },
  ],
  u6: [
    { skill: "Technical", score: 96, fullMark: 100 },
    { skill: "Reliability", score: 98, fullMark: 100 },
    { skill: "Security", score: 95, fullMark: 100 },
    { skill: "Automation", score: 88, fullMark: 100 },
    { skill: "Documentation", score: 92, fullMark: 100 },
    { skill: "Mentoring", score: 78, fullMark: 100 },
  ],
  u7: [
    { skill: "Sales", score: 94, fullMark: 100 },
    { skill: "Negotiation", score: 90, fullMark: 100 },
    { skill: "Client Mgmt", score: 92, fullMark: 100 },
    { skill: "Communication", score: 88, fullMark: 100 },
    { skill: "Strategy", score: 82, fullMark: 100 },
    { skill: "Leadership", score: 76, fullMark: 100 },
  ],
};

/* AI projected skill improvement per employee */
const projectedSkillImprovement: Record<string, { skill: string; current: number; projected: number }[]> = {
  u3: [
    { skill: "Technical", current: 85, projected: 90 },
    { skill: "Collaboration", current: 92, projected: 94 },
    { skill: "Innovation", current: 72, projected: 80 },
    { skill: "Delivery", current: 78, projected: 85 },
    { skill: "Documentation", current: 65, projected: 78 },
  ],
  u4: [
    { skill: "Technical", current: 88, projected: 92 },
    { skill: "Collaboration", current: 85, projected: 88 },
    { skill: "Innovation", current: 80, projected: 85 },
    { skill: "Delivery", current: 82, projected: 88 },
    { skill: "Documentation", current: 78, projected: 84 },
  ],
  u5: [
    { skill: "Creativity", current: 95, projected: 96 },
    { skill: "Strategy", current: 88, projected: 92 },
    { skill: "Analytics", current: 80, projected: 86 },
    { skill: "Communication", current: 92, projected: 94 },
    { skill: "Execution", current: 90, projected: 93 },
  ],
  u6: [
    { skill: "Technical", current: 96, projected: 97 },
    { skill: "Reliability", current: 98, projected: 98 },
    { skill: "Security", current: 95, projected: 97 },
    { skill: "Automation", current: 88, projected: 93 },
    { skill: "Documentation", current: 92, projected: 95 },
  ],
  u7: [
    { skill: "Sales", current: 94, projected: 96 },
    { skill: "Negotiation", current: 90, projected: 93 },
    { skill: "Client Mgmt", current: 92, projected: 94 },
    { skill: "Communication", current: 88, projected: 91 },
    { skill: "Strategy", current: 82, projected: 87 },
  ],
};

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function EmployeeProfilePage() {
  const navigate = useNavigate();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(employees[0].id);
  const [activeTab, setActiveTab] = useState<"overview" | "prediction" | "skills">("overview");

  const employee = employees.find((u) => u.id === selectedEmployeeId)!;
  const evalData = evaluations.find((e) => e.employeeId === selectedEmployeeId);
  const employeeKpis = kpis.filter((k) => k.employeeId === selectedEmployeeId);
  const skills = skillBreakdowns[selectedEmployeeId] || [];
  const projectedSkills = projectedSkillImprovement[selectedEmployeeId] || [];
  const predictions = futurePredictions[selectedEmployeeId] || [];

  const category = getCategory(evalData?.totalScore ?? 20.8);
  const catColors = categoryColor(category);
  const deptAvg = departmentAverages[employee.department] ?? 21.0;

  /* KPI bar chart data */
  const kpiBarData = employeeKpis.map((k) => ({
    name: k.title.length > 18 ? k.title.slice(0, 18) + "..." : k.title,
    manager: k.managerScore,
    hr: k.hrScore,
    weight: k.weight,
    actual: k.actual,
    target: k.target,
  }));

  /* Historical + predicted score line data */
  const trendData = employeeQuarterlyHistory.map((q) => ({
    quarter: q.quarter,
    score: q.totalScore,
    type: "actual" as const,
  }));
  // Append future predictions (skip Q1 since it's actual)
  const futureOnly = predictions.filter((p) => p.type === "predicted");
  const fullTrend = [
    ...trendData,
    ...futureOnly.map((p) => ({
      quarter: `${p.quarter} 2026`,
      score: p.score,
      type: "predicted" as const,
    })),
  ];

  /* Area chart data for confidence band prediction */
  const confidenceData = predictions.map((p) => ({
    quarter: p.quarter,
    lower: p.score - 0.8,
    upper: p.score + 0.8,
    score: p.score,
    type: p.type,
  }));

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Nav */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-sm border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/login")}
            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <i className="ri-arrow-left-line"></i>
          </button>
          <div className="flex items-center gap-2">
            <img
              src="https://public.readdy.ai/ai/img_res/44e3cbfc-e6bc-4576-b6f6-75f6ba16381b.png"
              alt="EvaluAI"
              className="h-8 w-8 object-contain"
            />
            <span className="font-semibold text-slate-800 text-sm hidden sm:inline">EvaluAI</span>
          </div>
          <span className="text-slate-300">|</span>
          <span className="text-sm font-medium text-slate-700">Employee Profile</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 hidden sm:inline">Select Employee:</span>
          <select
            value={selectedEmployeeId}
            onChange={(e) => setSelectedEmployeeId(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-slate-800"
          >
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} — {emp.jobTitle}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* ====== HERO PROFILE CARD ====== */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden relative">
          {/* Top accent bar */}
          <div className={`h-2 w-full ${catColors.badge}`} />
          <div className="p-5 md:p-6 flex flex-col md:flex-row gap-5 md:gap-6 items-start md:items-center">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={employee.avatar}
                alt={employee.name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover ring-4 ring-white shadow-md"
              />
              <div
                className={`absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full ${catColors.badge} ring-2 ring-white flex items-center justify-center`}
                title={category}
              >
                <i className="ri-check-line text-white text-xs"></i>
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl md:text-2xl font-bold text-slate-900">{employee.name}</h1>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white ${catColors.badge} shadow-sm`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  {category}
                </span>
              </div>
              <p className="text-sm text-slate-500 mb-3">
                {employee.jobTitle} &middot; {employee.department} &middot; {employee.email}
              </p>

              {/* Mini stat row */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="w-5 h-5 flex items-center justify-center text-slate-400">
                    <i className="ri-star-fill text-amber-400"></i>
                  </span>
                  <span className="font-semibold text-slate-900">{evalData?.totalScore.toFixed(1) ?? "-"}</span>
                  <span className="text-slate-400 text-xs">/ 25</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="w-5 h-5 flex items-center justify-center text-slate-400">
                    <i className="ri-bar-chart-grouped-line"></i>
                  </span>
                  <span className="text-slate-600">Dept Avg:</span>
                  <span className="font-semibold text-slate-900">{deptAvg.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="w-5 h-5 flex items-center justify-center text-slate-400">
                    <i className="ri-arrow-up-line text-emerald-500"></i>
                  </span>
                  <span className="text-slate-600">vs Dept:</span>
                  <span
                    className={`font-semibold ${(evalData?.totalScore ?? 0) >= deptAvg ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {evalData
                      ? `${((evalData.totalScore - deptAvg) / deptAvg * 100) >= 0 ? "+" : ""}${((evalData.totalScore - deptAvg) / deptAvg * 100).toFixed(1)}%`
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="w-5 h-5 flex items-center justify-center text-slate-400">
                    <i className="ri-calendar-line"></i>
                  </span>
                  <span className="text-slate-600">Age:</span>
                  <span className="font-semibold text-slate-900">{employee.age}</span>
                </div>
              </div>
            </div>

            {/* Quick score ring */}
            <div className="hidden lg:flex flex-col items-center gap-1">
              <div className={`w-16 h-16 rounded-full ${catColors.light} border-2 ${catColors.ring} flex flex-col items-center justify-center`}>
                <span className="text-lg font-bold text-slate-900">{evalData?.totalScore.toFixed(1) ?? "-"}</span>
                <span className="text-[10px] text-slate-500">/ 25</span>
              </div>
              <span className="text-[10px] text-slate-400">Total Score</span>
            </div>
          </div>
        </div>

        {/* ====== TABS ====== */}
        <div className="flex flex-wrap gap-2">
          {[
            { key: "overview" as const, label: "Overview & AI Feedback", icon: "ri-sparkling-line" },
            { key: "prediction" as const, label: "Future Performance", icon: "ri-rocket-line" },
            { key: "skills" as const, label: "Skill Analysis", icon: "ri-brain-line" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === t.key
                  ? "bg-slate-800 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span className="w-4 h-4 flex items-center justify-center">
                <i className={t.icon}></i>
              </span>
              {t.label}
            </button>
          ))}
        </div>

        {/* ====== OVERVIEW TAB ====== */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Left column: AI Feedback Summary + Category detail */}
            <div className="lg:col-span-2 space-y-5">
              {/* AI Feedback Summary */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center gap-2">
                  <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white">
                    <i className="ri-sparkling-line"></i>
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">AI Feedback Summary</h2>
                    <p className="text-xs text-slate-500">Automatically generated performance analysis</p>
                  </div>
                </div>
                <div className="p-5 space-y-5">
                  {/* AI prediction paragraph */}
                  <div className={`p-4 rounded-xl ${catColors.light} border border-slate-100`}>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      <span className="font-semibold text-slate-900">{employee.name}</span>{" "}
                      {evalData?.aiPrediction ?? "Performance evaluation data not available."}
                    </p>
                  </div>

                  {/* Key insights */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Key AI Insights</h3>
                    <div className="space-y-3">
                      {(evalData?.aiInsights ?? []).map((insight, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                          <span className="w-7 h-7 flex items-center justify-center bg-slate-800 text-white rounded-lg text-xs font-bold flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strengths vs Areas for Growth */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-7 h-7 flex items-center justify-center bg-emerald-500 rounded-lg text-white text-xs">
                          <i className="ri-thumb-up-line"></i>
                        </span>
                        <h3 className="text-sm font-semibold text-emerald-900">Strengths</h3>
                      </div>
                      <ul className="space-y-2">
                        {employeeKpis
                          .filter((k) => k.actual >= k.target)
                          .slice(0, 3)
                          .map((k) => (
                            <li key={k.id} className="flex items-start gap-2 text-sm text-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0"></span>
                              {k.title} ({((k.actual / k.target) * 100).toFixed(0)}% of target)
                            </li>
                          ))}
                        {employeeKpis.filter((k) => k.actual >= k.target).length === 0 && (
                          <li className="text-sm text-emerald-700">No KPIs currently above target — focus on improvement areas.</li>
                        )}
                      </ul>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-7 h-7 flex items-center justify-center bg-amber-500 rounded-lg text-white text-xs">
                          <i className="ri-lightbulb-line"></i>
                        </span>
                        <h3 className="text-sm font-semibold text-amber-900">Growth Opportunities</h3>
                      </div>
                      <ul className="space-y-2">
                        {employeeKpis
                          .filter((k) => k.actual < k.target)
                          .slice(0, 3)
                          .map((k) => (
                            <li key={k.id} className="flex items-start gap-2 text-sm text-amber-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"></span>
                              {k.title} ({((k.actual / k.target) * 100).toFixed(0)}% of target)
                            </li>
                          ))}
                        {employeeKpis.filter((k) => k.actual < k.target).length === 0 && (
                          <li className="text-sm text-amber-700">All KPIs above target — maintain current performance.</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* KPI Score Breakdown */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="text-sm font-semibold text-slate-900 mb-4">KPI Score Breakdown</h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={kpiBarData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#94a3b8" interval={0} angle={-25} textAnchor="end" height={60} />
                      <YAxis domain={[0, 5.5]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                      />
                      <Bar dataKey="manager" fill="#334155" radius={[4, 4, 0, 0]} name="Manager Score" barSize={20} />
                      <Bar dataKey="hr" fill="#94a3b8" radius={[4, 4, 0, 0]} name="HR Score" barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Right column: Category meter + Score cards */}
            <div className="space-y-5">
              {/* Performance Category Card */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                  <h2 className="text-sm font-semibold text-slate-900">Performance Category</h2>
                  <p className="text-xs text-slate-500 mt-0.5">AI-classified based on total score</p>
                </div>
                <div className="p-5 space-y-5">
                  {/* Big badge */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-20 h-20 rounded-full ${catColors.light} border-4 ${catColors.ring} flex flex-col items-center justify-center shadow-sm`}>
                      <span className="text-xs font-medium text-slate-500">Score</span>
                      <span className="text-xl font-bold text-slate-900">{evalData?.totalScore.toFixed(1) ?? "-"}</span>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold text-white ${catColors.badge} shadow-sm`}>
                      {category}
                    </span>
                  </div>

                  {/* Category meter */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>At Risk (&lt;20)</span>
                      <span>Stable (20-22)</span>
                      <span>High Performer (&gt;22)</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div className="flex-1 bg-red-400" />
                      <div className="flex-1 bg-amber-400" />
                      <div className="flex-1 bg-emerald-500" />
                    </div>
                    {/* Position marker */}
                    <div className="relative h-2">
                      <div
                        className="absolute top-0 w-0.5 h-4 bg-slate-800 rounded-full"
                        style={{
                          left: `${Math.min(100, Math.max(0, ((evalData?.totalScore ?? 20) / 25) * 100))}%`,
                        }}
                      >
                        <div className="absolute -top-5 -translate-x-1/2 text-[10px] font-bold text-slate-800 whitespace-nowrap">
                          {evalData?.totalScore.toFixed(1) ?? "-"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Category breakdown */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Classification</span>
                      <span className={`font-semibold ${catColors.text}`}>{category}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Confidence</span>
                      <span className="font-semibold text-slate-900">94.2%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Last Updated</span>
                      <span className="font-semibold text-slate-900">Q1 2026</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Score cards */}
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 font-medium">Manager Score</span>
                    <span className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600">
                      <i className="ri-user-star-line"></i>
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{evalData?.managerScore.toFixed(1) ?? "-"}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Out of 20</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 font-medium">HR Score</span>
                    <span className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600">
                      <i className="ri-shield-user-line"></i>
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{evalData?.hrScore.toFixed(1) ?? "-"}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Out of 5</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-500 font-medium">KPIs Tracked</span>
                    <span className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600">
                      <i className="ri-focus-3-line"></i>
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-slate-900">{employeeKpis.length}</p>
                  <p className="text-xs text-slate-400 mt-0.5">Active this quarter</p>
                </div>
              </div>

              {/* Department comparison mini chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Dept. Comparison</h3>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: employee.name.split(" ")[0], score: evalData?.totalScore ?? 0, type: "employee" },
                        { name: "Dept Avg", score: deptAvg, type: "dept" },
                      ]}
                      layout="vertical"
                      margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" domain={[0, 25]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} stroke="#94a3b8" width={70} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                        formatter={(value: number) => [value.toFixed(1), "Score"]}
                      />
                      <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={22}>
                        <Cell fill="#334155" />
                        <Cell fill="#94a3b8" />
                      </Bar>
                      <ReferenceLine x={deptAvg} stroke="#f59e0b" strokeDasharray="4 4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  <span className="inline-block w-3 h-1 bg-amber-400 rounded mr-1"></span>
                  Department average line
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ====== PREDICTION TAB ====== */}
        {activeTab === "prediction" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Main prediction chart */}
            <div className="lg:col-span-2 space-y-5">
              {/* Predicted Future Performance */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center gap-2">
                  <span className="w-8 h-8 flex items-center justify-center bg-sky-50 rounded-lg text-sky-600">
                    <i className="ri-rocket-line"></i>
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Predicted Future Performance</h2>
                    <p className="text-xs text-slate-500">AI-projected scores with confidence intervals</p>
                  </div>
                </div>
                <div className="p-5">
                  {/* Category timeline */}
                  <div className="flex items-center justify-between mb-6 px-2">
                    {predictions.map((p, idx) => {
                      const pColors = categoryColor(p.category);
                      const isLast = idx === predictions.length - 1;
                      return (
                        <div key={p.quarter} className="flex items-center flex-1">
                          <div className="flex flex-col items-center gap-1.5">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white ${pColors.badge} shadow-sm`}
                            >
                              {p.quarter}
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${pColors.light} ${pColors.text}`}>
                              {p.category}
                            </span>
                            <span className="text-xs font-bold text-slate-700">{p.score.toFixed(1)}</span>
                          </div>
                          {!isLast && (
                            <div className="flex-1 h-0.5 mx-2 bg-slate-200 relative">
                              <div className={`absolute inset-y-0 left-0 ${p.type === "actual" ? "w-full" : "w-0"} ${catColors.badge} opacity-30`} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Confidence area chart */}
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={confidenceData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="confidenceFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#334155" stopOpacity={0.15} />
                            <stop offset="100%" stopColor="#334155" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="quarter" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <YAxis domain={[19, 25]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                          formatter={(value: number, name: string) => {
                            if (name === "score") return [value.toFixed(2), "Predicted Score"];
                            return [value.toFixed(2), name === "lower" ? "Lower Bound" : "Upper Bound"];
                          }}
                        />
                        <Area type="monotone" dataKey="upper" stroke="transparent" fill="transparent" />
                        <Area type="monotone" dataKey="lower" stroke="transparent" fill="url(#confidenceFill)" />
                        <Line
                          type="monotone"
                          dataKey="score"
                          stroke="#334155"
                          strokeWidth={2.5}
                          dot={(props: { cx: number; cy: number; payload: { type: string } }) => {
                            const isPred = props.payload.type !== "actual";
                            return (
                              <g>
                                <circle
                                  cx={props.cx}
                                  cy={props.cy}
                                  r={isPred ? 5 : 4}
                                  fill={isPred ? "#fff" : "#334155"}
                                  stroke="#334155"
                                  strokeWidth={2}
                                />
                              </g>
                            );
                          }}
                          activeDot={{ r: 7, fill: "#334155" }}
                        />
                        <ReferenceLine y={22} stroke="#10b981" strokeDasharray="4 4" label={{ value: "High Performer", position: "insideTopRight", fontSize: 10, fill: "#10b981" }} />
                        <ReferenceLine y={20} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: "Stable", position: "insideTopRight", fontSize: 10, fill: "#f59e0b" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-center gap-5 mt-3">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#334155]"></span>
                      <span className="text-xs text-slate-600">Actual</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-white border-2 border-[#334155]"></span>
                      <span className="text-xs text-slate-600">Predicted</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-8 h-3 bg-slate-800/10 rounded"></span>
                      <span className="text-xs text-slate-600">Confidence band</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historical + Future combined line chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h2 className="text-sm font-semibold text-slate-900 mb-1">Performance Trajectory</h2>
                <p className="text-xs text-slate-500 mb-4">Historical data + AI predictions</p>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={fullTrend} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="quarter" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <YAxis domain={[17, 25]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                      />
                      <ReferenceLine y={22} stroke="#10b981" strokeDasharray="4 4" />
                      <ReferenceLine y={20} stroke="#f59e0b" strokeDasharray="4 4" />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#334155"
                        strokeWidth={2.5}
                        dot={(props: { cx: number; cy: number; payload: { type: string } }) => {
                          const isPred = props.payload.type !== "actual";
                          return (
                            <g>
                              <circle
                                cx={props.cx}
                                cy={props.cy}
                                r={isPred ? 5 : 4}
                                fill={isPred ? "#fff" : "#334155"}
                                stroke="#334155"
                                strokeWidth={2}
                              />
                            </g>
                          );
                        }}
                        activeDot={{ r: 6, fill: "#334155" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center gap-4 mt-3 justify-center">
                  <span className="text-[10px] text-emerald-600 font-medium">── High Performer (22+)</span>
                  <span className="text-[10px] text-amber-600 font-medium">── Stable (20-22)</span>
                  <span className="text-[10px] text-red-500 font-medium">── At Risk (&lt;20)</span>
                </div>
              </div>
            </div>

            {/* Right column: Prediction cards */}
            <div className="space-y-5">
              {/* Prediction summary */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                  <h2 className="text-sm font-semibold text-slate-900">Prediction Summary</h2>
                </div>
                <div className="p-5 space-y-4">
                  {predictions.map((p, idx) => {
                    const pColors = categoryColor(p.category);
                    const change = idx > 0 ? p.score - predictions[idx - 1].score : 0;
                    return (
                      <div key={p.quarter} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                        <div className={`w-10 h-10 rounded-lg ${pColors.light} flex items-center justify-center text-sm font-bold ${pColors.text} flex-shrink-0`}>
                          {p.quarter}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-slate-900">
                              {p.type === "actual" ? "Q1 2026 (Actual)" : `${p.quarter} 2026 (Predicted)`}
                            </span>
                            <span className="text-sm font-bold text-slate-900">{p.score.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${pColors.light} ${pColors.text}`}>
                              {p.category}
                            </span>
                            {idx > 0 && (
                              <span className={`text-[10px] font-medium ${change >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                                {change >= 0 ? "+" : ""}{change.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Predicted improvement */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Projected Q4 Change</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1 p-3 bg-slate-50 rounded-lg text-center">
                    <p className="text-xs text-slate-500 mb-1">Current</p>
                    <p className="text-xl font-bold text-slate-900">{evalData?.totalScore.toFixed(1) ?? "-"}</p>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center text-slate-400">
                    <i className="ri-arrow-right-line text-xl"></i>
                  </div>
                  <div className="flex-1 p-3 bg-sky-50 rounded-lg text-center border border-sky-100">
                    <p className="text-xs text-sky-600 mb-1">Q4 Predicted</p>
                    <p className="text-xl font-bold text-sky-700">
                      {predictions[predictions.length - 1]?.score.toFixed(1) ?? "-"}
                    </p>
                  </div>
                </div>
                {evalData && predictions.length > 0 && (
                  <div className="mt-3 p-2.5 bg-emerald-50 rounded-lg flex items-center gap-2">
                    <span className="w-5 h-5 flex items-center justify-center text-emerald-600">
                      <i className="ri-arrow-up-line"></i>
                    </span>
                    <p className="text-sm text-emerald-700">
                      <span className="font-semibold">
                        +{((predictions[predictions.length - 1].score - evalData.totalScore) / evalData.totalScore * 100).toFixed(1)}%
                      </span>{" "}
                      projected improvement by Q4
                    </p>
                  </div>
                )}
              </div>

              {/* AI factors */}
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Prediction Factors</h3>
                <div className="space-y-3">
                  {[
                    { label: "Historical trend consistency", weight: 92, color: "bg-emerald-500" },
                    { label: "KPI improvement velocity", weight: 78, color: "bg-emerald-500" },
                    { label: "Peer comparison baseline", weight: 85, color: "bg-emerald-500" },
                    { label: "Department growth rate", weight: 70, color: "bg-amber-500" },
                    { label: "Training completion impact", weight: 88, color: "bg-emerald-500" },
                  ].map((f) => (
                    <div key={f.label}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-600">{f.label}</span>
                        <span className="font-semibold text-slate-800">{f.weight}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${f.color}`} style={{ width: `${f.weight}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====== SKILLS TAB ====== */}
        {activeTab === "skills" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Radar chart */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-1">Skill Profile</h2>
              <p className="text-xs text-slate-500 mb-4">Current competency assessment</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={skills}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: "#64748b" }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <Radar name="Current" dataKey="score" stroke="#334155" fill="#334155" fillOpacity={0.15} strokeWidth={2} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                      formatter={(value: number) => [`${value}/100`, "Score"]}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Projected skill improvement */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-1">Projected Skill Growth</h2>
              <p className="text-xs text-slate-500 mb-4">AI-predicted Q4 skill levels</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={projectedSkills} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis type="category" dataKey="skill" tick={{ fontSize: 11 }} stroke="#94a3b8" width={90} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                    />
                    <Bar dataKey="current" fill="#94a3b8" radius={[0, 2, 2, 0]} name="Current" barSize={12} />
                    <Bar dataKey="projected" fill="#334155" radius={[0, 2, 2, 0]} name="Projected Q4" barSize={12} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#94a3b8]"></span>
                  <span className="text-xs text-slate-600">Current</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#334155]"></span>
                  <span className="text-xs text-slate-600">Projected Q4</span>
                </div>
              </div>
            </div>

            {/* Skill detail cards */}
            <div className="lg:col-span-2">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">Skill Breakdown & AI Recommendations</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectedSkills.map((s) => {
                  const improvement = s.projected - s.current;
                  const isStrong = s.current >= 85;
                  const isWeak = s.current < 75;
                  return (
                    <div
                      key={s.skill}
                      className={`bg-white rounded-xl border p-4 transition-all hover:shadow-sm ${
                        isStrong ? "border-emerald-200" : isWeak ? "border-amber-200" : "border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-slate-900">{s.skill}</h3>
                        {isStrong && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">Strong</span>
                        )}
                        {isWeak && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700">Focus</span>
                        )}
                      </div>
                      <div className="flex items-end gap-2 mb-2">
                        <span className="text-2xl font-bold text-slate-900">{s.current}</span>
                        <span className="text-xs text-slate-400 mb-1">/ 100</span>
                        <span className={`text-xs font-semibold mb-1 ml-auto ${improvement >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                          {improvement >= 0 ? "+" : ""}{improvement} by Q4
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                        <div
                          className={`h-full rounded-full transition-all ${isStrong ? "bg-emerald-500" : isWeak ? "bg-amber-500" : "bg-slate-600"}`}
                          style={{ width: `${s.current}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500">
                        {improvement > 5
                          ? `AI predicts significant improvement (+${improvement} pts) with focused development.`
                          : improvement > 0
                          ? `Steady growth projected (+${improvement} pts).`
                          : `Score expected to remain stable.`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
