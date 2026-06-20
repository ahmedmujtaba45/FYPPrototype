import { useState, useMemo } from "react";
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
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import { users } from "@/mocks/users";
import { evaluations, quarterlyData } from "@/mocks/evaluations";
import { kpis } from "@/mocks/kpis";

const employees = users.filter((u) => u.role === "employee");
const allManagers = users.filter((u) => u.role === "manager");
const allHR = users.filter((u) => u.role === "hr");

const evaluatorList = [...allManagers, ...allHR];

// --- Mock "historical" weight trends to feed KPI optimization ---
const kpiHistoryTrend = [
  { quarter: "Q1 2025", codeQualityWeight: 20, projectDeliveryWeight: 25, innovationWeight: 15, collaborationWeight: 20, documentationWeight: 10, clientSatWeight: 10 },
  { quarter: "Q2 2025", codeQualityWeight: 22, projectDeliveryWeight: 28, innovationWeight: 15, collaborationWeight: 18, documentationWeight: 10, clientSatWeight: 7 },
  { quarter: "Q3 2025", codeQualityWeight: 23, projectDeliveryWeight: 30, innovationWeight: 18, collaborationWeight: 15, documentationWeight: 10, clientSatWeight: 4 },
  { quarter: "Q4 2025", codeQualityWeight: 24, projectDeliveryWeight: 30, innovationWeight: 20, collaborationWeight: 14, documentationWeight: 8, clientSatWeight: 4 },
  { quarter: "Q1 2026", codeQualityWeight: 25, projectDeliveryWeight: 30, innovationWeight: 20, collaborationWeight: 15, documentationWeight: 5, clientSatWeight: 5 },
];

// AI-suggested optimized weights
const aiOptimizedWeights = [
  { name: "Code Quality & Reviews", current: 25, suggested: 30, trend: "+5", rationale: "Engineering variance suggests higher weight improves score differentiation." },
  { name: "Project Delivery", current: 30, suggested: 32, trend: "+2", rationale: "Strongest correlation with total score across all departments." },
  { name: "Technical Innovation", current: 20, suggested: 22, trend: "+2", rationale: "Top performers consistently exceed innovation targets." },
  { name: "Team Collaboration", current: 15, suggested: 12, trend: "-3", rationale: "Low variance across team reduces discriminating power." },
  { name: "Documentation", current: 10, suggested: 5, trend: "-5", rationale: "Minimal score variance indicates low impact on ranking." },
  { name: "Client Satisfaction", current: 5, suggested: 8, trend: "+3", rationale: "Correlates strongly with retention and revenue metrics." },
];

const weightTrendChartData = [
  { quarter: "Q1 2025", CodeQuality: 20, ProjectDelivery: 25, Innovation: 15, Collaboration: 20, Documentation: 10, ClientSat: 10 },
  { quarter: "Q2 2025", CodeQuality: 22, ProjectDelivery: 28, Innovation: 15, Collaboration: 18, Documentation: 10, ClientSat: 7 },
  { quarter: "Q3 2025", CodeQuality: 23, ProjectDelivery: 30, Innovation: 18, Collaboration: 15, Documentation: 10, ClientSat: 4 },
  { quarter: "Q4 2025", CodeQuality: 24, ProjectDelivery: 30, Innovation: 20, Collaboration: 14, Documentation: 8, ClientSat: 4 },
  { quarter: "Q1 2026", CodeQuality: 25, ProjectDelivery: 30, Innovation: 20, Collaboration: 15, Documentation: 5, ClientSat: 5 },
];

export default function PerformanceEvaluationPage() {
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [evaluator, setEvaluator] = useState<string>("");
  const [evalType, setEvalType] = useState<"manager" | "hr">("manager");
  const [scores, setScores] = useState<Record<string, number>>();
  const [comments, setComments] = useState<Record<string, string>>();
  const [overallComment, setOverallComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiFeedbackVisible, setAiFeedbackVisible] = useState(false);
  const [aiFeedbackLoading, setAiFeedbackLoading] = useState(false);
  const [showKpiOptimization, setShowKpiOptimization] = useState(false);
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<string>>(new Set());
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);

  const empKpis = useMemo(() => {
    if (!selectedEmployee) return [];
    return kpis.filter((k) => k.employeeId === selectedEmployee);
  }, [selectedEmployee]);

  const selectedEmpData = useMemo(() => {
    if (!selectedEmployee) return null;
    return users.find((u) => u.id === selectedEmployee) || null;
  }, [selectedEmployee]);

  const empEval = useMemo(() => {
    if (!selectedEmployee) return null;
    return evaluations.find((e) => e.employeeId === selectedEmployee) || null;
  }, [selectedEmployee]);

  const totalManagerMax = 20;
  const totalHRMax = 5;

  const handleScoreChange = (kpiId: string, val: number) => {
    setScores((prev) => ({ ...prev, [kpiId]: val }));
  };

  const handleCommentChange = (kpiId: string, val: string) => {
    setComments((prev) => ({ ...prev, [kpiId]: val }));
  };

  const getTotalScore = () => {
    let total = 0;
    empKpis.forEach((kpi) => {
      const s = scores[kpi.id];
      if (typeof s === "number") {
        total += s;
      }
    });
    return total;
  };

  const getProgressColor = (val: number, max: number) => {
    const pct = (val / max) * 100;
    if (pct >= 90) return "bg-emerald-500";
    if (pct >= 75) return "bg-sky-500";
    if (pct >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const handleSubmit = () => {
    if (!selectedEmployee || !evaluator) return;
    setIsSubmitting(true);
    setAiFeedbackVisible(false);
    setAiFeedbackLoading(true);
    setSubmittedAt(new Date().toLocaleString());

    // Simulate processing
    setTimeout(() => {
      setIsSubmitting(false);
      setAiFeedbackLoading(false);
      setAiFeedbackVisible(true);
    }, 1800);
  };

  const getAiSummary = () => {
    if (!empEval) return "";
    const total = getTotalScore();
    const pct = ((total / (evalType === "manager" ? totalManagerMax : totalHRMax)) * 100).toFixed(0);
    if (evalType === "manager") {
      return `Manager evaluation submitted for ${selectedEmpData?.name}. Overall score: ${total.toFixed(1)}/20 (${pct}%). ${empEval.aiPrediction}`;
    }
    return `HR evaluation submitted for ${selectedEmpData?.name}. Overall score: ${total.toFixed(1)}/5 (${pct}%). ${empEval.aiPrediction}`;
  };

  const getAiInsights = () => {
    if (!empEval) return [];
    return empEval.aiInsights;
  };

  const canSubmit = selectedEmployee && evaluator && empKpis.every((k) => typeof scores[k.id] === "number");

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <i className="ri-arrow-left-line"></i>
            </button>
            <div className="inline-flex items-center justify-center w-8 h-8 bg-slate-800 rounded-lg">
              <i className="ri-sparkling-line text-white text-sm"></i>
            </div>
            <h1 className="text-sm font-semibold text-slate-900">EvaluAI — Performance Evaluation</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/login")}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 whitespace-nowrap hidden sm:block"
            >
              Back to Login
            </button>
          </div>
        </div>
      </nav>

      <main className="px-4 md:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900">Performance Evaluation</h2>
          <p className="text-sm text-slate-500 mt-1">
            Score employee KPIs and get AI-powered feedback & KPI optimization suggestions instantly
          </p>
        </div>

        {/* Top Controls */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Eval Type */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Evaluation Type</label>
              <div className="flex p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setEvalType("manager")}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    evalType === "manager" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Manager (0-20)
                </button>
                <button
                  onClick={() => setEvalType("hr")}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                    evalType === "hr" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  HR (0-5)
                </button>
              </div>
            </div>

            {/* Evaluator */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Evaluator</label>
              <select
                value={evaluator}
                onChange={(e) => setEvaluator(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent bg-white"
              >
                <option value="">Select evaluator…</option>
                {evaluatorList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.jobTitle}
                  </option>
                ))}
              </select>
            </div>

            {/* Employee */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => {
                  setSelectedEmployee(e.target.value);
                  setScores({});
                  setComments({});
                  setOverallComment("");
                  setAiFeedbackVisible(false);
                  setSubmittedAt(null);
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent bg-white"
              >
                <option value="">Select employee…</option>
                {employees.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.department}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Evaluation + AI Feedback side-by-side on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Evaluation Form */}
          <div className="lg:col-span-3 space-y-4">
            {!selectedEmployee && (
              <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
                <span className="w-14 h-14 flex items-center justify-center bg-slate-100 rounded-full text-slate-400 mx-auto mb-3">
                  <i className="ri-user-search-line text-xl"></i>
                </span>
                <p className="text-sm text-slate-500">Select an employee and evaluator to start scoring</p>
              </div>
            )}

            {selectedEmployee && selectedEmpData && (
              <>
                {/* Employee info banner */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5 flex items-center gap-4">
                  <img
                    src={selectedEmpData.avatar}
                    alt={selectedEmpData.name}
                    className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-slate-900">{selectedEmpData.name}</h3>
                    <p className="text-xs text-slate-500">
                      {selectedEmpData.jobTitle} · {selectedEmpData.department} · {selectedEmpData.email}
                    </p>
                  </div>
                  {empEval && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-slate-400">Current Total</p>
                      <p className="text-lg font-bold text-slate-900">{empEval.totalScore.toFixed(1)}<span className="text-xs font-normal text-slate-400">/25</span></p>
                    </div>
                  )}
                </div>

                {/* Score summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                    <p className="text-xs text-slate-500 mb-1">Current Mgr</p>
                    <p className="text-xl font-bold text-slate-900">{empEval?.managerScore.toFixed(1) ?? "-"}<span className="text-xs text-slate-400">/20</span></p>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-4 text-center">
                    <p className="text-xs text-slate-500 mb-1">Current HR</p>
                    <p className="text-xl font-bold text-slate-900">{empEval?.hrScore.toFixed(1) ?? "-"}<span className="text-xs text-slate-400">/5</span></p>
                  </div>
                  <div className="bg-slate-800 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-300 mb-1">New {evalType === "manager" ? "Mgr" : "HR"} Total</p>
                    <p className="text-xl font-bold text-white">{getTotalScore().toFixed(1)}<span className="text-xs text-slate-400">/{evalType === "manager" ? totalManagerMax : totalHRMax}</span></p>
                  </div>
                </div>

                {/* KPI scoring cards */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">KPI Scoring — Q1 2026</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Rate each KPI on a 1–5 scale</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {empKpis.length} KPIs
                    </span>
                  </div>
                  <div className="p-4 space-y-4">
                    {empKpis.map((kpi) => {
                      const val = scores[kpi.id] ?? 0;
                      const max = 5;
                      const pct = Math.min((val / max) * 100, 100);
                      return (
                        <div key={kpi.id} className="p-4 bg-slate-50 rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{kpi.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{kpi.description}</p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-3">
                              <span className="text-xs text-slate-400">Weight</span>
                              <p className="text-sm font-semibold text-slate-900">{kpi.weight}%</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mb-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => handleScoreChange(kpi.id, star)}
                                className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
                                  val >= star
                                    ? "bg-slate-800 text-white"
                                    : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-100"
                                }`}
                              >
                                {star}
                              </button>
                            ))}
                            <span className="text-xs text-slate-400 ml-1">{val || 0} / 5</span>
                          </div>
                          <div className="mb-3">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-slate-500">Score impact</span>
                              <span className="font-medium text-slate-700">{val * (kpi.weight / 100) * (evalType === "manager" ? 4 : 1)} pts</span>
                            </div>
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${getProgressColor(val, max)}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Comment</label>
                            <textarea
                              rows={2}
                              value={comments[kpi.id] || ""}
                              onChange={(e) => handleCommentChange(kpi.id, e.target.value)}
                              placeholder={`Add ${evalType} comment for this KPI…`}
                              maxLength={500}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Overall comment + submit */}
                <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Overall Evaluation Comment</label>
                  <textarea
                    rows={3}
                    value={overallComment}
                    onChange={(e) => setOverallComment(e.target.value)}
                    placeholder={`Write an overall ${evalType} assessment…`}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none mb-4"
                  />
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-slate-500">
                      {submittedAt && (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <i className="ri-check-line"></i>
                          Submitted {submittedAt}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setScores({});
                          setComments({});
                          setOverallComment("");
                          setAiFeedbackVisible(false);
                          setSubmittedAt(null);
                        }}
                        className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                      >
                        Reset
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={!canSubmit || isSubmitting}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2 ${
                          canSubmit && !isSubmitting
                            ? "bg-slate-800 text-white hover:bg-slate-700"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        {isSubmitting && (
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        )}
                        {isSubmitting ? "Processing…" : "Submit Evaluation"}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: AI Features Panel */}
          <div className="lg:col-span-2 space-y-4">
            {/* AI Feedback Assistance */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white">
                  <i className="ri-sparkling-line"></i>
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">AI Feedback Assistance</h3>
                  <p className="text-xs text-slate-500">Automatic performance summary on submit</p>
                </div>
              </div>
              <div className="p-4">
                {!aiFeedbackVisible && !aiFeedbackLoading && (
                  <div className="text-center py-6">
                    <span className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-full text-slate-400 mx-auto mb-3">
                      <i className="ri-sparkling-line text-lg"></i>
                    </span>
                    <p className="text-sm text-slate-500">Submit an evaluation to generate AI insights</p>
                    <p className="text-xs text-slate-400 mt-1">Scores + comments feed the AI summary engine</p>
                  </div>
                )}

                {aiFeedbackLoading && (
                  <div className="py-8 text-center">
                    <span className="w-10 h-10 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-3 block"></span>
                    <p className="text-sm text-slate-600 font-medium">Analyzing evaluation data…</p>
                    <p className="text-xs text-slate-400 mt-1">Generating performance summary & insights</p>
                  </div>
                )}

                {aiFeedbackVisible && empEval && selectedEmpData && (
                  <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 flex items-center justify-center text-emerald-600">
                          <i className="ri-check-line"></i>
                        </span>
                        <span className="text-xs font-semibold text-emerald-700">Evaluation Submitted</span>
                      </div>
                      <p className="text-xs text-emerald-600">{submittedAt}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">AI Performance Summary</h4>
                      <p className="text-sm text-slate-700 leading-relaxed">{getAiSummary()}</p>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Key Insights</h4>
                      <div className="space-y-2">
                        {getAiInsights().map((insight, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 p-3 bg-slate-50 rounded-lg">
                            <span className="w-5 h-5 flex items-center justify-center bg-slate-800 text-white rounded-full text-[10px] font-bold flex-shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <p className="text-xs text-slate-700 leading-relaxed">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">Predicted Q2</p>
                        <p className="text-lg font-bold text-slate-900">{(empEval.totalScore + 0.7).toFixed(1)}</p>
                        <p className="text-[10px] text-slate-400">/ 25</p>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">Improvement</p>
                        <p className="text-lg font-bold text-emerald-600">+{((0.7 / empEval.totalScore) * 100).toFixed(1)}%</p>
                        <p className="text-[10px] text-slate-400">projected</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* KPI Optimization Suggestions */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 flex items-center justify-center bg-violet-50 rounded-lg text-violet-600">
                    <i className="ri-bar-chart-grouped-line"></i>
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">KPI Optimization</h3>
                    <p className="text-xs text-slate-500">Suggested importance based on historical trends</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowKpiOptimization(!showKpiOptimization)}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2 py-1 rounded-md hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  {showKpiOptimization ? "Hide" : "View"}
                </button>
              </div>
              <div className="p-4">
                {!showKpiOptimization ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-slate-500">Click "View" to see AI-recommended KPI weight adjustments</p>
                    <p className="text-xs text-slate-400 mt-1">Based on 5 quarters of score variance & correlation data</p>
                  </div>
                ) : (
                  <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
                    {/* Weight trend chart */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Historical Weight Trend</h4>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={weightTrendChartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="quarter" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                            <YAxis domain={[0, 40]} tick={{ fontSize: 10 }} stroke="#94a3b8" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                fontSize: "11px",
                              }}
                            />
                            <Line type="monotone" dataKey="CodeQuality" stroke="#334155" strokeWidth={2} dot={{ r: 3 }} name="Code Quality" />
                            <Line type="monotone" dataKey="ProjectDelivery" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} name="Project Delivery" />
                            <Line type="monotone" dataKey="Innovation" stroke="#0284c7" strokeWidth={2} dot={{ r: 3 }} name="Innovation" />
                            <Line type="monotone" dataKey="Collaboration" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Collaboration" />
                            <Line type="monotone" dataKey="Documentation" stroke="#64748b" strokeWidth={2} dot={{ r: 3 }} name="Documentation" />
                            <Line type="monotone" dataKey="ClientSat" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} name="Client Sat" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2 justify-center">
                        {[
                          { label: "Code Quality", color: "#334155" },
                          { label: "Project Delivery", color: "#059669" },
                          { label: "Innovation", color: "#0284c7" },
                          { label: "Collaboration", color: "#f59e0b" },
                          { label: "Documentation", color: "#64748b" },
                          { label: "Client Sat", color: "#d97706" },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center gap-1">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                            <span className="text-[11px] text-slate-600">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Suggestion list */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-700 mb-3 uppercase tracking-wide">AI Suggested Adjustments</h4>
                      <div className="space-y-3">
                        {aiOptimizedWeights.map((sugg) => {
                          const applied = appliedSuggestions.has(sugg.name);
                          const delta = sugg.suggested - sugg.current;
                          const isIncrease = delta > 0;
                          return (
                            <div
                              key={sugg.name}
                              className={`p-3 rounded-lg border transition-colors ${
                                applied ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-100"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <p className="text-sm font-medium text-slate-900">{sugg.name}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-400 line-through">{sugg.current}%</span>
                                  <span className={`text-xs font-bold ${isIncrease ? "text-emerald-600" : "text-amber-600"}`}>
                                    {sugg.suggested}%
                                  </span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isIncrease ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                                    {delta > 0 ? "+" : ""}{delta}%
                                  </span>
                                </div>
                              </div>
                              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                                <div className="flex h-full">
                                  <div
                                    className="h-full bg-slate-400 rounded-l-full"
                                    style={{ width: `${sugg.current}%` }}
                                  />
                                  <div
                                    className={`h-full rounded-r-full ${isIncrease ? "bg-emerald-500" : "bg-amber-500"}`}
                                    style={{ width: `${Math.abs(delta)}%` }}
                                  />
                                </div>
                              </div>
                              <p className="text-[11px] text-slate-500 leading-relaxed mb-2">{sugg.rationale}</p>
                              <button
                                onClick={() => {
                                  setAppliedSuggestions((prev) => {
                                    const next = new Set(prev);
                                    if (next.has(sugg.name)) next.delete(sugg.name);
                                    else next.add(sugg.name);
                                    return next;
                                  });
                                }}
                                className={`text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                                  applied
                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                }`}
                              >
                                {applied ? "Applied ✓" : "Apply Suggestion"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Radar comparison */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Current vs Optimized Weight Profile</h4>
                      <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart
                            data={aiOptimizedWeights.map((w) => ({
                              subject: w.name.replace(" & Reviews", "").replace(" & Growth", "").replace("Target ", ""),
                              current: w.current,
                              optimized: w.suggested,
                            }))}
                          >
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} stroke="#64748b" />
                            <PolarRadiusAxis domain={[0, 40]} tick={{ fontSize: 9 }} stroke="#94a3b8" />
                            <Radar name="Current" dataKey="current" stroke="#94a3b8" fill="#94a3b8" fillOpacity={0.15} />
                            <Radar name="Optimized" dataKey="optimized" stroke="#059669" fill="#059669" fillOpacity={0.2} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#fff",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                fontSize: "11px",
                              }}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex items-center justify-center gap-4 mt-2">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8]"></span>
                          <span className="text-[11px] text-slate-600">Current</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#059669]"></span>
                          <span className="text-[11px] text-slate-600">Optimized</span>
                        </span>
                      </div>
                    </div>

                    {/* Apply all / reset */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => setAppliedSuggestions(new Set(aiOptimizedWeights.map((w) => w.name)))}
                        className="flex-1 px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                      >
                        Apply All Suggestions
                      </button>
                      <button
                        onClick={() => setAppliedSuggestions(new Set())}
                        className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
