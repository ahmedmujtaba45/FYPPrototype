import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { users } from "@/mocks/users";
import { evaluations, quarterlyData } from "@/mocks/evaluations";
import { kpis } from "@/mocks/kpis";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { NotificationItem } from "@/components/feature/NotificationPanel";

// ─── Team-scoped data: only employees under this manager ───
const MANAGER_DEPT = "Engineering";

const managerUser = users.find((u) => u.role === "manager")!;

const teamMembers = users.filter(
  (u) => u.role === "employee" && u.department === MANAGER_DEPT
);

const teamEvaluations = evaluations.filter((e) => {
  const emp = users.find((u) => u.id === e.employeeId);
  return emp?.department === MANAGER_DEPT;
});

// Only team-scoped quarterly data (no company-wide avg for managers)
const teamQuarterlyData = quarterlyData.map((q) => ({
  quarter: q.quarter,
  teamAvg: teamEvaluations.reduce((sum, e) => sum + e.totalScore, 0) / teamEvaluations.length,
}));

// AI Clustering: strictly this team's evaluations
const clusteringData = [
  {
    name: "High Performer",
    value: teamEvaluations.filter((e) => e.totalScore >= 22).length,
    color: "#059669",
  },
  {
    name: "Average Performer",
    value: teamEvaluations.filter((e) => e.totalScore >= 19 && e.totalScore < 22).length,
    color: "#0284c7",
  },
  {
    name: "At Risk",
    value: teamEvaluations.filter((e) => e.totalScore < 19).length,
    color: "#dc2626",
  },
];

// AI Feedback scoped to team members only
const aiTeamFeedback = teamEvaluations.map((e) => {
  const emp = users.find((u) => u.id === e.employeeId);
  return `${emp?.name || e.employeeName}: ${e.aiInsights[0]}`;
});

const currentTeamAvg = teamEvaluations.reduce((sum, e) => sum + e.totalScore, 0) / teamEvaluations.length;

const performancePredictionData = [
  { quarter: "Q1 2025", actual: 18.5 },
  { quarter: "Q2 2025", actual: 19.2 },
  { quarter: "Q3 2025", actual: 20.0 },
  { quarter: "Q4 2025", actual: 20.8 },
  { quarter: "Q1 2026", actual: +currentTeamAvg.toFixed(1), predicted: +currentTeamAvg.toFixed(1) },
  { quarter: "Q2 2026", predicted: +(currentTeamAvg + 0.8).toFixed(1) },
];

const activeSurveys = surveys.filter((s) => s.status === "active" && ((s as any).targetAudience === "manager" || (s as any).targetAudience === "both"));

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

function saveStoredFeedback(items: ManagerFeedback[]) {
  localStorage.setItem("manager_feedback", JSON.stringify(items));
}

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "evaluation" | "insights">("overview");
  const [kpiScores, setKpiScores] = useState<Record<string, number>>({});
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);
  const [surveyResponses, setSurveyResponses] = useState<Record<string, string | number>>({});
  const [surveySubmitted, setSurveySubmitted] = useState(false);
  const [managerActiveItem, setManagerActiveItem] = useState("Dashboard");

  const [evalAction, setEvalAction] = useState<"saved" | "submitted" | null>(null);

  // Manager feedback states
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState<false | "submitted" | "edited" | "deleted">(false);
  const [managerFeedbacks, setManagerFeedbacks] = useState<ManagerFeedback[]>(getStoredFeedback);
  const [editingFeedbackId, setEditingFeedbackId] = useState<string | null>(null);
  const [editFeedbackText, setEditFeedbackText] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const managerNotifications: NotificationItem[] = [
    {
      id: "mn1",
      type: "warning",
      title: "Pending Employee Evaluations",
      message: "You have 2 team members (Michael Park, David Kim) whose Q2 evaluations are still pending. Deadline: May 15.",
      timestamp: "1 hour ago",
      actionLabel: "Evaluate Now",
      actionPath: "/evaluation",
    },
    {
      id: "mn2",
      type: "alert",
      title: "Team Performance Alert",
      message: "Engineering team average dropped by 2.1% vs last quarter. AI recommends reviewing workload distribution.",
      timestamp: "3 hours ago",
      actionLabel: "View Analytics",
      actionPath: "/reports",
    },
    {
      id: "mn3",
      type: "alert",
      title: "Employee At Risk: Michael Park",
      message: "Michael Park's Q1 score is 21.0. AI flags declining trend in code review participation metrics.",
      timestamp: "6 hours ago",
      actionLabel: "View Profile",
      actionPath: "/profile",
    },
    {
      id: "mn4",
      type: "ai",
      title: "AI Evaluation Insight Available",
      message: "AI has identified a potential scoring bias in your Q1 evaluations. Review suggested recalibration.",
      timestamp: "1 day ago",
      actionLabel: "Review Insight",
      actionPath: "/bias-detection",
    },
    {
      id: "mn5",
      type: "success",
      title: "Evaluation Submission Confirmed",
      message: "Emily Chen's Q2 evaluation has been successfully submitted to HR. Confirmation ID: EV-2026-0892.",
      timestamp: "2 days ago",
    },
    {
      id: "mn6",
      type: "info",
      title: "New Employee Assignment",
      message: "Rachel Kim has been assigned to your Engineering team starting May 20. Onboarding evaluation required.",
      timestamp: "3 days ago",
      actionLabel: "View Details",
      actionPath: "/evaluation",
    },
    {
      id: "mn7",
      type: "deadline",
      title: "Q2 Evaluation Cycle Opens May 1",
      message: "The Q2 2026 evaluation cycle begins next week. Prepare your team assessment materials in advance.",
      timestamp: "4 days ago",
    },
  ];

  useEffect(() => {
    if (selectedEmployee && activeTab === "evaluation") {
      setManagerActiveItem("KPI Evaluation");
    } else if (selectedEmployee) {
      setManagerActiveItem("Team Members");
    }
  }, [selectedEmployee, activeTab]);

  // Clear feedback input when switching employees
  useEffect(() => {
    setFeedbackText("");
    setFeedbackSuccess(false);
    setEditingFeedbackId(null);
    setEditFeedbackText("");
    setDeleteConfirmId(null);
  }, [selectedEmployee]);

  const selectedEmpData = selectedEmployee
    ? users.find((u) => u.id === selectedEmployee)
    : null;
  const empKpis = selectedEmployee
    ? kpis.filter((k) => k.employeeId === selectedEmployee)
    : [];
  const empEval = selectedEmployee
    ? evaluations.find((e) => e.employeeId === selectedEmployee)
    : null;

  // Feedback history for selected employee
  const employeeFeedbacks = selectedEmployee
    ? managerFeedbacks.filter((f) => f.employeeId === selectedEmployee).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  const handleScoreChange = (kpiId: string, score: number) => {
    setKpiScores((prev) => ({ ...prev, [kpiId]: score }));
  };

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

  const handleFeedbackSubmit = () => {
    if (!selectedEmployee || !selectedEmpData || !feedbackText.trim()) return;
    const newFeedback: ManagerFeedback = {
      id: `fb-${Date.now()}`,
      employeeId: selectedEmployee,
      employeeName: selectedEmpData.name,
      feedback: feedbackText.trim(),
      date: new Date().toISOString(),
      managerName: managerUser.name,
    };
    const updated = [newFeedback, ...managerFeedbacks];
    setManagerFeedbacks(updated);
    saveStoredFeedback(updated);
    setFeedbackText("");
    setFeedbackSuccess("submitted");
  };

  const handleEditStart = (fb: ManagerFeedback) => {
    setEditingFeedbackId(fb.id);
    setEditFeedbackText(fb.feedback);
    setDeleteConfirmId(null);
  };

  const handleEditCancel = () => {
    setEditingFeedbackId(null);
    setEditFeedbackText("");
  };

  const handleEditSubmit = () => {
    if (!editingFeedbackId || !editFeedbackText.trim()) return;
    const updated = managerFeedbacks.map((fb) =>
      fb.id === editingFeedbackId
        ? { ...fb, feedback: editFeedbackText.trim(), date: new Date().toISOString() }
        : fb
    );
    setManagerFeedbacks(updated);
    saveStoredFeedback(updated);
    setEditingFeedbackId(null);
    setEditFeedbackText("");
    setFeedbackSuccess("edited");
  };

  const handleDeleteFeedback = (id: string) => {
    const updated = managerFeedbacks.filter((fb) => fb.id !== id);
    setManagerFeedbacks(updated);
    saveStoredFeedback(updated);
    setDeleteConfirmId(null);
    setFeedbackSuccess("deleted");
  };

  const selectedSurveyData = selectedSurvey ? surveys.find((s) => s.id === selectedSurvey) : null;

  const getStatusBadge = (status: string) => {
    if (status === "completed")
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
          Completed
        </span>
      );
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
        Pending
      </span>
    );
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
      activeItem={managerActiveItem}
      onItemClick={(label) => {
        setManagerActiveItem(label);
        if (label === "Dashboard") {
          setSelectedEmployee(null);
          setActiveTab("overview");
          setSelectedSurvey(null);
          setEvalAction(null);
          setFeedbackSuccess(false);
          setTimeout(() => {
            document.getElementById("section-dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        } else if (label === "Team Members") {
          setSelectedEmployee(null);
          setActiveTab("overview");
          setSelectedSurvey(null);
          setEvalAction(null);
          setFeedbackSuccess(false);
          setTimeout(() => {
            document.getElementById("section-team")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        } else if (label === "KPI Evaluation") {
          if (teamMembers.length > 0) {
            setSelectedEmployee(teamMembers[0].id);
            setActiveTab("evaluation");
          }
          setSelectedSurvey(null);
          setEvalAction(null);
          setFeedbackSuccess(false);
          setTimeout(() => {
            document.getElementById("section-evaluation")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        } else if (label === "Surveys") {
          setSelectedEmployee(null);
          setActiveTab("overview");
          setSelectedSurvey(null);
          setEvalAction(null);
          setFeedbackSuccess(false);
          setTimeout(() => {
            document.getElementById("manager-surveys")?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        }
      }}
      notifications={managerNotifications}
    >
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Manager Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage team performance evaluations and track quarterly progress
          </p>
        </div>

        {/* Stats Cards */}
        <div id="section-dashboard" className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Team Size</span>
              <span className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600">
                <i className="ri-team-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{teamMembers.length}</p>
            <p className="text-xs text-slate-400 mt-1">Active members</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Evaluations Done</span>
              <span className="w-8 h-8 flex items-center justify-center bg-emerald-50 rounded-lg text-emerald-600">
                <i className="ri-check-double-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{teamEvaluations.length}/{teamMembers.length}</p>
            <p className="text-xs text-emerald-600 mt-1">{Math.round((teamEvaluations.length / teamMembers.length) * 100)}% complete</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Team Avg Score</span>
              <span className="w-8 h-8 flex items-center justify-center bg-sky-50 rounded-lg text-sky-600">
                <i className="ri-star-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {(teamEvaluations.reduce((sum, e) => sum + e.totalScore, 0) / teamEvaluations.length).toFixed(1)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Out of 25</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Pending Reviews</span>
              <span className="w-8 h-8 flex items-center justify-center bg-amber-50 rounded-lg text-amber-600">
                <i className="ri-time-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {teamMembers.length - teamEvaluations.length}
            </p>
            <p className="text-xs text-slate-400 mt-1">Q1 2026 cycle</p>
          </div>
        </div>

        {/* AI Features Section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 flex items-center justify-center text-slate-700">
              <i className="ri-sparkling-line"></i>
            </span>
            <h2 className="text-sm font-semibold text-slate-900">AI Insights</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* AI Feedback */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 flex items-center justify-center bg-sky-50 rounded-lg text-sky-600">
                    <i className="ri-chat-ai-line"></i>
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">AI Feedback</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">AI-generated evaluation suggestions</p>
              </div>
              <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
                {aiTeamFeedback.map((feedback, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <span className="w-5 h-5 flex items-center justify-center bg-sky-100 text-sky-600 rounded-full text-xs font-medium flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed">{feedback}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Performance Prediction */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 flex items-center justify-center bg-emerald-50 rounded-lg text-emerald-600">
                    <i className="ri-line-chart-line"></i>
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">Performance Prediction</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">Predicted next quarter performance</p>
              </div>
              <div className="p-4">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performancePredictionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="quarter" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <YAxis domain={[15, 26]} tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Line type="monotone" dataKey="actual" stroke="#334155" strokeWidth={2} dot={{ fill: "#334155", r: 4 }} name="Actual" />
                      <Line type="monotone" dataKey="predicted" stroke="#059669" strokeWidth={2} strokeDasharray="6 4" dot={{ fill: "#059669", r: 4 }} name="Predicted" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-4 mt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 rounded-full bg-slate-700"></span>
                    Actual
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 rounded-full bg-emerald-600" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #059669, #059669 4px, transparent 4px, transparent 8px)' }}></span>
                    Predicted
                  </span>
                </div>
              </div>
            </div>

            {/* Clustering */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 flex items-center justify-center bg-amber-50 rounded-lg text-amber-600">
                    <i className="ri-group-3-line"></i>
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">Team Clustering</h3>
                </div>
                <p className="text-xs text-slate-500 mt-1">Employee performance categories</p>
              </div>
              <div className="p-4">
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={clusteringData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {clusteringData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-2">
                  {clusteringData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs text-slate-600">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        ></span>
                        {entry.name}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div id="section-team" className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Left: Team Members */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-900">Team Members</h2>
                <p className="text-xs text-slate-500 mt-0.5">Engineering Department</p>
              </div>
              <div className="divide-y divide-slate-100">
                {teamMembers.map((member) => {
                  const evalData = evaluations.find((e) => e.employeeId === member.id);
                  const isSelected = selectedEmployee === member.id;
                  return (
                    <button
                      key={member.id}
                      onClick={() => {
                        setSelectedEmployee(member.id);
                        setActiveTab("overview");
                        setEvalAction(null);
                        setFeedbackSuccess(false);
                      }}
                      className={`w-full flex items-center p-3 text-left transition-colors hover:bg-slate-50 ${
                        isSelected ? "bg-slate-50 border-l-2 border-l-slate-800" : "border-l-2 border-l-transparent"
                      }`}
                    >
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                      <div className="ml-3 min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{member.name}</p>
                        <p className="text-xs text-slate-500 truncate">{member.jobTitle}</p>
                      </div>
                      <div className="ml-2 flex-shrink-0">
                        {evalData ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            {evalData.totalScore.toFixed(1)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            Pending
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Employee Detail */}
          <div className="lg:col-span-2">
            {selectedEmpData ? (
              <div id="section-evaluation" className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                {/* Employee Header */}
                <div className="p-4 md:p-5 border-b border-slate-200">
                  <div className="flex items-center">
                    <img
                      src={selectedEmpData.avatar}
                      alt={selectedEmpData.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <h2 className="text-base font-semibold text-slate-900">{selectedEmpData.name}</h2>
                      <p className="text-xs text-slate-500">
                        {selectedEmpData.jobTitle} &middot; {selectedEmpData.department}
                      </p>
                    </div>
                    <div className="ml-auto">
                      {empEval && getStatusBadge(empEval.status)}
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="px-4 md:px-5 pt-4">
                  <div className="flex space-x-1 p-1 bg-slate-100 rounded-lg w-fit">
                    {(["overview", "evaluation", "insights"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => {
                          setActiveTab(tab);
                          setEvalAction(null);
                        }}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                          activeTab === tab
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-4 md:p-5">
                  {activeTab === "overview" && (
                    <div className="space-y-5">
                      {/* Score Overview */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 mb-1">Manager Score</p>
                          <p className="text-xl font-bold text-slate-900">
                            {empEval?.managerScore.toFixed(1) || "-"}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">/ 20</p>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 mb-1">HR Score</p>
                          <p className="text-xl font-bold text-slate-900">
                            {empEval?.hrScore.toFixed(1) || "-"}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">/ 5</p>
                        </div>
                        <div className="text-center p-3 bg-slate-800 rounded-lg">
                          <p className="text-xs text-slate-300 mb-1">Total Score</p>
                          <p className="text-xl font-bold text-white">
                            {empEval?.totalScore.toFixed(1) || "-"}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">/ 25</p>
                        </div>
                      </div>

                      {/* KPIs Table */}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">Assigned KPIs</h3>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-slate-200">
                                <th className="text-left py-2 px-2 text-xs font-medium text-slate-500">KPI</th>
                                <th className="text-center py-2 px-2 text-xs font-medium text-slate-500">Weight</th>
                                <th className="text-center py-2 px-2 text-xs font-medium text-slate-500">Target</th>
                                <th className="text-center py-2 px-2 text-xs font-medium text-slate-500">Actual</th>
                                <th className="text-center py-2 px-2 text-xs font-medium text-slate-500">Mgr</th>
                                <th className="text-center py-2 px-2 text-xs font-medium text-slate-500">HR</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {empKpis.map((kpi) => (
                                <tr key={kpi.id} className="hover:bg-slate-50">
                                  <td className="py-2.5 px-2">
                                    <p className="font-medium text-slate-900">{kpi.title}</p>
                                    <p className="text-xs text-slate-500">{kpi.description}</p>
                                  </td>
                                  <td className="py-2.5 px-2 text-center text-slate-700">{kpi.weight}%</td>
                                  <td className="py-2.5 px-2 text-center text-slate-700">{kpi.target}</td>
                                  <td className="py-2.5 px-2 text-center">
                                    <span
                                      className={`font-medium ${
                                        kpi.actual >= kpi.target ? "text-emerald-600" : "text-amber-600"
                                      }`}
                                    >
                                      {kpi.actual}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-2 text-center">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                                      {kpi.managerScore}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-2 text-center">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700">
                                      {kpi.hrScore}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Quarterly Chart */}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">Quarterly Progress</h3>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={teamQuarterlyData}>
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
                      <Bar dataKey="teamAvg" fill="#334155" radius={[4, 4, 0, 0]} name="Team Avg" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "evaluation" && (
                    <div className="space-y-4">
                      {/* Success Banner - Evaluation Saved */}
                      {evalAction === "saved" && (
                        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <span className="w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-full text-emerald-600 flex-shrink-0">
                            <i className="ri-check-line"></i>
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-emerald-900">Evaluation Saved</p>
                            <p className="text-xs text-emerald-700 mt-0.5">
                              Your evaluation for <strong>{selectedEmpData?.name}</strong> has been saved as a draft. You can continue editing or submit to HR when ready.
                            </p>
                          </div>
                          <button
                            onClick={() => setEvalAction(null)}
                            className="w-6 h-6 flex items-center justify-center text-emerald-500 hover:text-emerald-700 flex-shrink-0"
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        </div>
                      )}
                      {/* Success Banner - Submitted to HR */}
                      {evalAction === "submitted" && (
                        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <span className="w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-full text-emerald-600 flex-shrink-0">
                            <i className="ri-check-double-line"></i>
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-emerald-900">Submitted to HR</p>
                            <p className="text-xs text-emerald-700 mt-0.5">
                              <strong>{selectedEmpData?.name}</strong>&rsquo;s evaluation has been successfully submitted to HR for review. Confirmation ID: EV-2026-0{Math.floor(Math.random() * 9000) + 1000}.
                            </p>
                          </div>
                          <button
                            onClick={() => setEvalAction(null)}
                            className="w-6 h-6 flex items-center justify-center text-emerald-500 hover:text-emerald-700 flex-shrink-0"
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        </div>
                      )}
                      {/* Success Banner - Feedback Submitted */}
                      {feedbackSuccess && (
                        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <span className="w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-full text-emerald-600 flex-shrink-0">
                            <i className="ri-check-line"></i>
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-emerald-900">
                              {feedbackSuccess === "submitted" && "Feedback Submitted"}
                              {feedbackSuccess === "edited" && "Feedback Updated"}
                              {feedbackSuccess === "deleted" && "Feedback Deleted"}
                            </p>
                            <p className="text-xs text-emerald-700 mt-0.5">
                              {feedbackSuccess === "submitted" && (
                                <>Your feedback for <strong>{selectedEmpData?.name}</strong> has been saved and is now visible on their dashboard.</>
                              )}
                              {feedbackSuccess === "edited" && (
                                <>Your feedback for <strong>{selectedEmpData?.name}</strong> has been updated and is now visible on their dashboard.</>
                              )}
                              {feedbackSuccess === "deleted" && (
                                <>The feedback has been removed and is no longer visible on the employee&rsquo;s dashboard.</>
                              )}
                            </p>
                          </div>
                          <button
                            onClick={() => setFeedbackSuccess(false)}
                            className="w-6 h-6 flex items-center justify-center text-emerald-500 hover:text-emerald-700 flex-shrink-0"
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-900">KPI Evaluation Form</h3>
                        <span className="text-xs text-slate-500">Q1 2026</span>
                      </div>
                      {empKpis.map((kpi) => (
                        <div key={kpi.id} className="p-4 bg-slate-50 rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-sm font-medium text-slate-900">{kpi.title}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{kpi.description}</p>
                            </div>
                            <span className="text-xs text-slate-400">Weight: {kpi.weight}%</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <label className="block text-xs text-slate-500 mb-1.5">Manager Score (1-5)</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="1"
                                  max="5"
                                  step="0.5"
                                  value={kpiScores[kpi.id] ?? kpi.managerScore}
                                  onChange={(e) => handleScoreChange(kpi.id, parseFloat(e.target.value))}
                                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                                />
                                <span className="text-sm font-semibold text-slate-900 w-8 text-center">
                                  {kpiScores[kpi.id] ?? kpi.managerScore}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <label className="block text-xs text-slate-500 mb-1.5">Comments</label>
                            <textarea
                              rows={2}
                              placeholder="Add your evaluation comments..."
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
                            />
                          </div>
                        </div>
                      ))}

                      {/* Manager Feedback Section */}
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-7 h-7 flex items-center justify-center bg-sky-50 rounded-lg text-sky-600">
                            <i className="ri-message-3-line"></i>
                          </span>
                          <h3 className="text-sm font-semibold text-slate-900">Manager Feedback</h3>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">
                          Provide constructive feedback to help {selectedEmpData?.name} improve their performance. This will be visible on their dashboard.
                        </p>
                        <textarea
                          rows={4}
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder={`Share specific observations, praise, or guidance for ${selectedEmpData?.name}...`}
                          maxLength={1000}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none mb-3"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">{feedbackText.length}/1000</span>
                          <button
                            onClick={handleFeedbackSubmit}
                            disabled={!feedbackText.trim()}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                              feedbackText.trim()
                                ? "bg-slate-800 text-white hover:bg-slate-700"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            }`}
                          >
                            Submit Feedback
                          </button>
                        </div>
                      </div>

                      {/* Previous Feedback for this Employee */}
                      {employeeFeedbacks.length > 0 && (
                        <div className="space-y-3">
                          <h3 className="text-sm font-semibold text-slate-900">Previous Feedback</h3>
                          {employeeFeedbacks.map((fb) => (
                            <div key={fb.id} className="p-4 bg-white border border-slate-200 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 flex items-center justify-center bg-slate-800 rounded-full text-white text-xs">
                                    <i className="ri-user-line"></i>
                                  </span>
                                  <span className="text-xs font-medium text-slate-900">{fb.managerName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-slate-400">
                                    {new Date(fb.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                  </span>
                                  {editingFeedbackId !== fb.id && (
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={() => handleEditStart(fb)}
                                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded transition-colors"
                                        title="Edit feedback"
                                      >
                                        <i className="ri-edit-line text-xs"></i>
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirmId(fb.id)}
                                        className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Delete feedback"
                                      >
                                        <i className="ri-delete-bin-line text-xs"></i>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {editingFeedbackId === fb.id ? (
                                <div className="space-y-3">
                                  <textarea
                                    rows={3}
                                    value={editFeedbackText}
                                    onChange={(e) => setEditFeedbackText(e.target.value)}
                                    maxLength={1000}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
                                  />
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400">{editFeedbackText.length}/1000</span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={handleEditCancel}
                                        className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={handleEditSubmit}
                                        disabled={!editFeedbackText.trim()}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                                          editFeedbackText.trim()
                                            ? "bg-slate-800 text-white hover:bg-slate-700"
                                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                        }`}
                                      >
                                        Save Changes
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="text-sm text-slate-700 leading-relaxed">{fb.feedback}</p>
                                  {deleteConfirmId === fb.id && (
                                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                      <p className="text-xs text-red-700 mb-2">Are you sure you want to delete this feedback? This cannot be undone.</p>
                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => handleDeleteFeedback(fb.id)}
                                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
                                        >
                                          Delete
                                        </button>
                                        <button
                                          onClick={() => setDeleteConfirmId(null)}
                                          className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setEvalAction("saved")}
                          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                        >
                          Save Evaluation
                        </button>
                        <button
                          onClick={() => setEvalAction("submitted")}
                          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                        >
                          Submit to HR
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === "insights" && empEval && (
                    <div className="space-y-5">
                      {/* AI Prediction */}
                      <div className="p-4 bg-slate-800 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 flex items-center justify-center text-sky-400">
                            <i className="ri-sparkling-line"></i>
                          </span>
                          <h3 className="text-sm font-semibold text-white">AI Performance Prediction</h3>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{empEval.aiPrediction}</p>
                      </div>

                      {/* AI Insights List */}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">AI-Generated Insights</h3>
                        <div className="space-y-3">
                          {empEval.aiInsights.map((insight, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                              <span className="w-5 h-5 flex items-center justify-center bg-sky-100 text-sky-600 rounded-full text-xs flex-shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <p className="text-sm text-slate-700 leading-relaxed">{insight}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Performance Trend */}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">Performance Trend</h3>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={[
                                { quarter: "Q1 2025", score: 18.7 },
                                { quarter: "Q2 2025", score: 19.3 },
                                { quarter: "Q3 2025", score: 19.9 },
                                { quarter: "Q4 2025", score: 20.5 },
                                { quarter: "Q1 2026", score: empEval.totalScore },
                              ]}
                            >
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
                              <Line
                                type="monotone"
                                dataKey="score"
                                stroke="#334155"
                                strokeWidth={2}
                                dot={{ fill: "#334155", r: 4 }}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                <span className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-full text-slate-400 mx-auto mb-3">
                  <i className="ri-user-line text-xl"></i>
                </span>
                <p className="text-sm text-slate-500">Select a team member to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Surveys Section - Inline for Manager */}
        <div id="manager-surveys" className="mt-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">Available Surveys</h2>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
                    onClick={() => setSelectedSurvey(survey.id)}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                  >
                    Take Survey
                  </button>
                </div>
              ))}
            </div>
            {activeSurveys.length === 0 && (
              <div className="p-8 text-center">
                <span className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-full text-slate-400 mx-auto mb-3">
                  <i className="ri-survey-line text-xl"></i>
                </span>
                <p className="text-sm text-slate-500">No active surveys at the moment</p>
              </div>
            )}
          </div>
        </div>

        {/* Survey Form Modal */}
        {selectedSurveyData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{selectedSurveyData.title}</h3>
                  <p className="text-xs text-slate-500">{selectedSurveyData.description}</p>
                </div>
                <button
                  onClick={handleSurveyClose}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
              <div className="px-5 py-4 overflow-y-auto flex-1">
                {surveySubmitted ? (
                  <div className="text-center py-8">
                    <span className="w-14 h-14 flex items-center justify-center bg-emerald-100 rounded-full text-emerald-600 mx-auto mb-4">
                      <i className="ri-check-line text-2xl"></i>
                    </span>
                    <h4 className="text-lg font-semibold text-slate-900 mb-2">Survey Submitted!</h4>
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
                    <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="w-4 h-4 flex items-center justify-center">
                          <i className="ri-eye-off-line"></i>
                        </span>
                        <span>
                          {selectedSurveyData.isAnonymous
                            ? "This survey is anonymous."
                            : "This survey is not anonymous."}
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
                  </>
                )}
              </div>
              {!surveySubmitted && (
                <div className="flex gap-3 px-5 py-4 border-t border-slate-100">
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
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
