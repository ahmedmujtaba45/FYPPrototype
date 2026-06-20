import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { users } from "@/mocks/users";
import { kpis } from "@/mocks/kpis";
import { evaluations, employeeQuarterlyHistory } from "@/mocks/evaluations";
import { announcements } from "@/mocks/announcements";
import { surveys } from "@/mocks/surveys";
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
} from "recharts";
import type { NotificationItem } from "@/components/feature/NotificationPanel";

const employeeUser = users.find((u) => u.id === "u3")!;
const employeeKpis = kpis.filter((k) => k.employeeId === employeeUser.id);
const employeeEval = evaluations.find((e) => e.employeeId === employeeUser.id);
const activeSurveys = surveys.filter((s) => s.status === "active" && ((s as any).targetAudience === "employee" || (s as any).targetAudience === "both"));

// AI trend data: Q1 (actual) → Q2 (predicted) → Q3 (projected) → Q4 (predicted)
const aiTrendData = [
  { quarter: "Q1", label: "Q1 2026", score: employeeEval?.totalScore ?? 20.8, type: "actual" },
  { quarter: "Q2", label: "Q2 2026", score: 21.5, type: "predicted" },
  { quarter: "Q3", label: "Q3 2026", score: 22.1, type: "projected" },
  { quarter: "Q4", label: "Q4 2026 (Predicted)", score: 22.8, type: "predicted" },
];

// ─── LocalStorage feedback helpers ───
interface ManagerFeedback {
  id: string;
  employeeId: string;
  employeeName: string;
  feedback: string;
  date: string;
  managerName: string;
}

function getStoredFeedback(): ManagerFeedback[] {
  try {
    const raw = localStorage.getItem("manager_feedback");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"overview" | "history" | "feedback" | "announcements" | "surveys">("overview");
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);
  const [surveyResponses, setSurveyResponses] = useState<Record<string, string | number>>();
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  const [managerFeedbacks, setManagerFeedbacks] = useState<ManagerFeedback[]>(getStoredFeedback);

  // Refresh feedback when tab changes to feedback
  useEffect(() => {
    if (activeTab === "feedback") {
      setManagerFeedbacks(getStoredFeedback());
    }
  }, [activeTab]);

  const myManagerFeedbacks = managerFeedbacks
    .filter((f) => f.employeeId === employeeUser.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSurveySelect = (surveyId: string) => {
    setSelectedSurvey(surveyId);
    setSurveyResponses({});
    setSurveySubmitted(false);
  };

  const employeeNotifications: NotificationItem[] = [
    {
      id: "en1",
      type: "deadline",
      title: "Q2 Evaluation Deadline Approaching",
      message: "Your Q2 performance evaluation is due on May 15, 2026. Please ensure all self-assessment sections are completed.",
      timestamp: "2 hours ago",
      actionLabel: "View Details",
      actionPath: "/employee",
    },
    {
      id: "en2",
      type: "info",
      title: "New KPI Assigned: Documentation Quality",
      message: "Your manager has assigned a new KPI focused on technical documentation quality. Weight: 15%, Target: 90%.",
      timestamp: "5 hours ago",
      actionLabel: "Review KPI",
      actionOnClick: () => setActiveTab("overview"),
    },
    {
      id: "en3",
      type: "success",
      title: "Q1 Evaluation Submitted Successfully",
      message: "Your Q1 2026 performance evaluation has been submitted and received by HR. You scored 20.8 out of 25.",
      timestamp: "1 day ago",
    },
    {
      id: "en4",
      type: "ai",
      title: "AI Feedback Available for Q1",
      message: "Your AI-generated performance summary is now ready. Includes 5 personalized insights and a Q2 performance prediction.",
      timestamp: "1 day ago",
      actionLabel: "View Feedback",
      actionOnClick: () => setActiveTab("feedback"),
    },
    {
      id: "en5",
      type: "info",
      title: "Manager Feedback: Strengths & Growth",
      message: "Sarah Mitchell left detailed feedback on your leadership and collaboration skills. Overall rating: Strong.",
      timestamp: "2 days ago",
      actionLabel: "Read Feedback",
      actionPath: "/employee",
    },
    {
      id: "en6",
      type: "deadline",
      title: "Quarterly Self-Review Reminder",
      message: "Don't forget to submit your quarterly self-review by May 10. This helps managers prepare fair evaluations.",
      timestamp: "3 days ago",
    },
    {
      id: "en7",
      type: "ai",
      title: "Performance Prediction Updated",
      message: "Based on recent project completions, AI predicts a Q2 score of 21.5 — a 3.4% improvement from Q1.",
      timestamp: "4 days ago",
      actionLabel: "View Prediction",
      actionOnClick: () => setActiveTab("feedback"),
    },
    {
      id: "en8",
      type: "warning",
      title: "Survey: Employee Satisfaction",
      message: "Please complete the Q1 2026 Employee Satisfaction Survey. Your input shapes workplace improvements. Closes May 5.",
      timestamp: "5 days ago",
      actionLabel: "Take Survey",
      actionOnClick: () => {
        setActiveTab("surveys");
        handleSurveySelect("s1");
      },
    },
  ];

  const handleSurveyResponse = (questionId: string, value: string | number) => {
    setSurveyResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSurveySubmit = () => {
    setSurveySubmitted(true);
  };

  const handleSurveyClose = () => {
    setSelectedSurvey(null);
    setSurveyResponses({});
    setSurveySubmitted(false);
  };

  const selectedSurveyData = selectedSurvey ? surveys.find((s) => s.id === selectedSurvey) : null;

  const getProgressColor = (actual: number, target: number) => {
    const pct = (actual / target) * 100;
    if (pct >= 100) return "bg-emerald-500";
    if (pct >= 80) return "bg-sky-500";
    if (pct >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const tabToLabel: Record<string, string> = {
    overview: "Overview",
    history: "Performance History",
    feedback: "AI Feedback",
    announcements: "Announcements",
    surveys: "Surveys",
  };
  const labelToTab: Record<string, string> = {
    Overview: "overview",
    "Performance History": "history",
    "AI Feedback": "feedback",
    Announcements: "announcements",
    Surveys: "surveys",
  };

  return (
    <DashboardLayout
      role="employee"
      userName={employeeUser.name}
      userAvatar={employeeUser.avatar}
      userRole={employeeUser.jobTitle}
      userAge={employeeUser.age}
      userEmail={employeeUser.email}
      userDepartment={employeeUser.department}
      activeItem={tabToLabel[activeTab]}
      onItemClick={(label) => {
        const tab = labelToTab[label];
        if (tab) {
          setActiveTab(tab as typeof activeTab);
          setSelectedSurvey(null);
          setSurveySubmitted(false);
          setTimeout(() => {
            const sectionMap: Record<string, string> = {
              overview: "section-overview",
              history: "section-performance",
              feedback: "section-feedback",
              announcements: "section-announcements",
              surveys: "section-surveys",
            };
            const id = sectionMap[tab];
            if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        }
      }}
      notifications={employeeNotifications}
    >
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">My Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            View your performance metrics, KPIs, and feedback
          </p>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Manager Score</span>
              <span className="w-8 h-8 flex items-center justify-center bg-sky-50 rounded-lg text-sky-600">
                <i className="ri-user-star-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {employeeEval?.managerScore.toFixed(1) || "-"}
            </p>
            <p className="text-xs text-slate-400 mt-1">Out of 20</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">HR Score</span>
              <span className="w-8 h-8 flex items-center justify-center bg-violet-50 rounded-lg text-violet-600">
                <i className="ri-shield-user-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {employeeEval?.hrScore.toFixed(1) || "-"}
            </p>
            <p className="text-xs text-slate-400 mt-1">Out of 5</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Total Score</span>
              <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white">
                <i className="ri-star-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {employeeEval?.totalScore.toFixed(1) || "-"}
            </p>
            <p className="text-xs text-slate-400 mt-1">Out of 25</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">KPIs Completed</span>
              <span className="w-8 h-8 flex items-center justify-center bg-emerald-50 rounded-lg text-emerald-600">
                <i className="ri-checkbox-circle-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{employeeKpis.length}</p>
            <p className="text-xs text-slate-400 mt-1">All tracked</p>
          </div>
        </div>



        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div id="section-overview" className="space-y-4">
            {/* KPIs */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-900">My KPIs - Q1 2026</h2>
                <p className="text-xs text-slate-500 mt-0.5">Track your key performance indicators</p>
              </div>
              <div className="p-4 space-y-4">
                {employeeKpis.map((kpi) => {
                  const progress = Math.min((kpi.actual / kpi.target) * 100, 100);
                  return (
                    <div key={kpi.id} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-sm font-medium text-slate-900">{kpi.title}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{kpi.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400">Weight</span>
                          <p className="text-sm font-semibold text-slate-900">{kpi.weight}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-slate-500">Progress</span>
                            <span className="font-medium text-slate-700">
                              {kpi.actual} / {kpi.target}
                            </span>
                          </div>
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${getProgressColor(kpi.actual, kpi.target)}`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                          Manager: {kpi.managerScore}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700">
                          HR: {kpi.hrScore}
                        </span>
                        <span className={`text-xs font-medium ${kpi.actual >= kpi.target ? "text-emerald-600" : "text-amber-600"}`}>
                          {kpi.actual >= kpi.target ? "Target Met" : "Below Target"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Score Breakdown by KPI</h2>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={employeeKpis}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="title" tick={{ fontSize: 11 }} stroke="#94a3b8" angle={-20} textAnchor="end" height={60} />
                    <YAxis domain={[15, 25]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="managerScore" fill="#334155" radius={[4, 4, 0, 0]} name="Manager" />
                    <Bar dataKey="hrScore" fill="#94a3b8" radius={[4, 4, 0, 0]} name="HR" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === "history" && (
          <div id="section-performance" className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">Quarterly Performance History</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={employeeQuarterlyHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="quarter" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis domain={[15, 25]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Line type="monotone" dataKey="managerScore" stroke="#334155" strokeWidth={2} dot={{ fill: "#334155", r: 4 }} name="Manager Score" />
                    <Line type="monotone" dataKey="hrScore" stroke="#64748b" strokeWidth={2} dot={{ fill: "#64748b", r: 4 }} name="HR Score" />
                    <Line type="monotone" dataKey="totalScore" stroke="#0ea5e9" strokeWidth={2} dot={{ fill: "#0ea5e9", r: 4 }} name="Total Score" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-900">Quarterly Score History</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Quarter</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Manager Score</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">HR Score</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Total Score</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Change</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employeeQuarterlyHistory.map((q, idx) => {
                      const prev = idx > 0 ? employeeQuarterlyHistory[idx - 1].totalScore : q.totalScore;
                      const change = q.totalScore - prev;
                      return (
                        <tr key={q.quarter} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-medium text-slate-900">{q.quarter}</td>
                          <td className="py-3 px-4 text-center text-slate-700">{q.managerScore.toFixed(1)}</td>
                          <td className="py-3 px-4 text-center text-slate-700">{q.hrScore.toFixed(1)}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-bold text-slate-900">{q.totalScore.toFixed(1)}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {idx === 0 ? (
                              <span className="text-slate-400">-</span>
                            ) : change > 0 ? (
                              <span className="text-emerald-600 font-medium">+{change.toFixed(2)}</span>
                            ) : change < 0 ? (
                              <span className="text-red-600 font-medium">{change.toFixed(2)}</span>
                            ) : (
                              <span className="text-slate-500">0.00</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AI Feedback Tab */}
        {activeTab === "feedback" && employeeEval && (
          <div id="section-feedback" className="space-y-6">
            {/* Manager Feedback Card */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center bg-sky-50 rounded-lg text-sky-600">
                  <i className="ri-message-3-line"></i>
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Manager Feedback</h2>
                  <p className="text-xs text-slate-500">Direct feedback from your manager</p>
                </div>
              </div>
              <div className="p-4 md:p-5">
                {myManagerFeedbacks.length > 0 ? (
                  <div className="space-y-4">
                    {myManagerFeedbacks.map((fb) => (
                      <div key={fb.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-full text-white text-xs">
                              <i className="ri-user-line"></i>
                            </span>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{fb.managerName}</p>
                              <p className="text-xs text-slate-500">Manager</p>
                            </div>
                          </div>
                          <span className="text-xs text-slate-400">
                            {new Date(fb.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{fb.feedback}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-full text-slate-400 mx-auto mb-3">
                      <i className="ri-message-3-line text-xl"></i>
                    </span>
                    <p className="text-sm text-slate-500">No manager feedback yet</p>
                    <p className="text-xs text-slate-400 mt-1">Feedback from your manager will appear here once shared.</p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Feedback - Automatic Performance Summary */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white">
                  <i className="ri-sparkling-line"></i>
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">AI Feedback</h2>
                  <p className="text-xs text-slate-500">Automatic performance summary</p>
                </div>
              </div>
              <div className="p-4 md:p-5 space-y-4">
                <p className="text-sm text-slate-700 leading-relaxed">
                  {employeeEval.aiPrediction}
                </p>
                <div className="space-y-3">
                  {employeeEval.aiInsights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <span className="w-6 h-6 flex items-center justify-center bg-slate-800 text-white rounded-full text-xs font-semibold flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance Prediction */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center bg-sky-50 rounded-lg text-sky-600">
                  <i className="ri-bar-chart-grouped-line"></i>
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Performance Prediction</h2>
                  <p className="text-xs text-slate-500">Predicted next quarter performance score</p>
                </div>
              </div>
              <div className="p-4 md:p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-1 p-4 bg-slate-50 rounded-lg text-center">
                    <p className="text-xs text-slate-500 mb-1">Current Score (Q1)</p>
                    <p className="text-2xl font-bold text-slate-900">{employeeEval.totalScore.toFixed(1)}</p>
                    <p className="text-xs text-slate-400">/ 25</p>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center text-slate-400">
                    <i className="ri-arrow-right-line text-xl"></i>
                  </div>
                  <div className="flex-1 p-4 bg-sky-50 rounded-lg text-center border border-sky-100">
                    <p className="text-xs text-sky-600 mb-1">Predicted Q2 Score</p>
                    <p className="text-2xl font-bold text-sky-700">21.5</p>
                    <p className="text-xs text-sky-500">/ 25</p>
                  </div>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center text-emerald-600">
                    <i className="ri-arrow-up-line"></i>
                  </span>
                  <p className="text-sm text-emerald-700">
                    <span className="font-semibold">+{((21.5 - employeeEval.totalScore) / employeeEval.totalScore * 100).toFixed(1)}%</span> improvement projected based on current trajectory
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Trend Graph */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center bg-violet-50 rounded-lg text-violet-600">
                  <i className="ri-line-chart-line"></i>
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Performance Trend Graph</h2>
                  <p className="text-xs text-slate-500">Q1 &rarr; Q2 &rarr; Q3 &rarr; Predicted Q4</p>
                </div>
              </div>
              <div className="p-4 md:p-5">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={aiTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="quarter" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <YAxis domain={[19, 24]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        formatter={(value: number, _name: string, props: { payload: { type: string; label: string } }) => [
                          value,
                          `${props.payload.label} (${props.payload.type === "actual" ? "Actual" : "Predicted"})`,
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#334155"
                        strokeWidth={2}
                        dot={(props: { cx: number; cy: number; payload: { type: string } }) => {
                          const isPredicted = props.payload.type !== "actual";
                          return (
                            <g>
                              <circle cx={props.cx} cy={props.cy} r={isPredicted ? 5 : 4} fill={isPredicted ? "#fff" : "#334155"} stroke="#334155" strokeWidth={2} />
                            </g>
                          );
                        }}
                        activeDot={{ r: 6, fill: "#334155" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#334155]"></span>
                    <span className="text-xs text-slate-600">Actual</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-white border-2 border-[#334155]"></span>
                    <span className="text-xs text-slate-600">Predicted</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-8 h-8 flex items-center justify-center bg-emerald-50 rounded-lg text-emerald-600">
                    <i className="ri-thumb-up-line"></i>
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">Key Strengths</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                    Consistently delivers high-quality code with strong attention to detail
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                    Excellent team collaboration and mentoring capabilities
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0"></span>
                    Strong technical problem-solving skills
                  </li>
                </ul>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-8 h-8 flex items-center justify-center bg-amber-50 rounded-lg text-amber-600">
                    <i className="ri-lightbulb-line"></i>
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">Areas for Growth</h3>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
                    Improve technical documentation practices
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
                    Focus on time management for better project delivery
                  </li>
                  <li className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
                    Increase participation in cross-team initiatives
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <div id="section-announcements" className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-sm font-semibold text-slate-900">Company Announcements</h2>
              <p className="text-xs text-slate-500 mt-0.5">Stay updated with the latest news</p>
            </div>
            <div className="divide-y divide-slate-100">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          ann.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : ann.priority === "medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {ann.priority.charAt(0).toUpperCase() + ann.priority.slice(1)}
                      </span>
                      <h3 className="text-sm font-medium text-slate-900">{ann.title}</h3>
                    </div>
                    <span className="text-xs text-slate-400">{ann.date}</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mb-2">{ann.content}</p>
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <span className="w-3 h-3 flex items-center justify-center">
                      <i className="ri-user-line"></i>
                    </span>
                    {ann.author} &middot; {ann.authorRole}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Surveys Tab - List */}
        {activeTab === "surveys" && !selectedSurvey && (
          <div id="section-surveys" className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-900">Available Surveys</h2>
                <p className="text-xs text-slate-500 mt-0.5">Participate in company surveys</p>
              </div>
              <div className="divide-y divide-slate-100">
                {activeSurveys.map((survey) => (
                  <div key={survey.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-sm font-medium text-slate-900">{survey.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{survey.description}</p>
                      </div>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        Active
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 flex items-center justify-center">
                          <i className="ri-calendar-line"></i>
                        </span>
                        Deadline: {survey.deadline}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 flex items-center justify-center">
                          <i className="ri-eye-off-line"></i>
                        </span>
                        {survey.isAnonymous ? "Anonymous" : "Named"}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 flex items-center justify-center">
                          <i className="ri-questionnaire-line"></i>
                        </span>
                        {survey.questions.length} questions
                      </span>
                    </div>
                    <button
                      onClick={() => handleSurveySelect(survey.id)}
                      className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                    >
                      Take Survey
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {activeSurveys.length === 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <span className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-full text-slate-400 mx-auto mb-3">
                  <i className="ri-survey-line text-xl"></i>
                </span>
                <p className="text-sm text-slate-500">No active surveys at the moment</p>
              </div>
            )}
          </div>
        )}

        {/* Survey Form */}
        {activeTab === "surveys" && selectedSurveyData && (
          <div id="section-surveys" className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
            {surveySubmitted ? (
              <div className="text-center py-12">
                <span className="w-16 h-16 flex items-center justify-center bg-emerald-100 rounded-full text-emerald-600 mx-auto mb-4">
                  <i className="ri-check-line text-2xl"></i>
                </span>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Survey Submitted!</h2>
                <p className="text-sm text-slate-500 mb-6">Thank you for your feedback. Your responses have been recorded.</p>
                <button
                  onClick={handleSurveyClose}
                  className="px-5 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                >
                  Go Back to Surveys
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">{selectedSurveyData.title}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedSurveyData.description}</p>
                  </div>
                  <button
                    onClick={handleSurveyClose}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="w-4 h-4 flex items-center justify-center">
                      <i className="ri-eye-off-line"></i>
                    </span>
                    <span>
                      {selectedSurveyData.isAnonymous
                        ? "This survey is anonymous. Your responses will not be linked to your identity."
                        : "This survey is not anonymous. Your responses will be linked to your profile."}
                    </span>
                  </div>
                </div>

                <div className="space-y-5">
                  {selectedSurveyData.questions.map((q, idx) => (
                    <div key={q.id} className="p-4 border border-slate-200 rounded-lg">
                      <div className="flex items-start gap-2 mb-3">
                        <span className="w-6 h-6 flex items-center justify-center bg-slate-800 text-white rounded-full text-xs font-semibold flex-shrink-0">
                          {idx + 1}
                        </span>
                        <p className="text-sm font-medium text-slate-900">{q.question}</p>
                      </div>

                      {q.type === "rating" && (
                        <div className="flex items-center gap-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleSurveyResponse(q.id, star)}
                              className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                                (surveyResponses[q.id] as number) >= star
                                  ? "bg-slate-800 text-white"
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                              }`}
                            >
                              {star}
                            </button>
                          ))}
                          <span className="text-xs text-slate-400 ml-2">
                            {(surveyResponses[q.id] as number) || 0} / 5
                          </span>
                        </div>
                      )}

                      {q.type === "text" && (
                        <textarea
                          rows={3}
                          value={(surveyResponses[q.id] as string) || ""}
                          onChange={(e) => handleSurveyResponse(q.id, e.target.value)}
                          placeholder="Type your response..."
                          maxLength={500}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
                        />
                      )}

                      {q.type === "multiple_choice" && q.options && (
                        <div className="space-y-2">
                          {q.options.map((option) => (
                            <label key={option} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-800"
                              />
                              <span className="text-sm text-slate-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4 mt-4 border-t border-slate-200">
                  <button
                    onClick={handleSurveySubmit}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                  >
                    Submit Survey
                  </button>
                  <button
                    onClick={handleSurveyClose}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
