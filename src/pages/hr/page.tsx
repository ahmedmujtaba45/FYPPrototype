import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { users } from "@/mocks/users";
import { evaluations, quarterlyData } from "@/mocks/evaluations";
import { kpis } from "@/mocks/kpis";
import { announcements } from "@/mocks/announcements";
import { surveys } from "@/mocks/surveys";
import { biasDetections } from "@/mocks/biasDetection";
import SurveyManagement from "./components/SurveyManagement";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  LineChart,
  Line,
} from "recharts";
import type { NotificationItem } from "@/components/feature/NotificationPanel";

const hrUser = users.find((u) => u.role === "hr")!;

const deptDistribution = [
  { name: "Engineering", value: 3, color: "#334155" },
  { name: "Marketing", value: 1, color: "#64748b" },
  { name: "Sales", value: 1, color: "#94a3b8" },
];

const scoreDistribution = [
  { range: "22-25", count: 2, label: "Excellent" },
  { range: "20-22", count: 2, label: "Good" },
  { range: "18-20", count: 1, label: "Average" },
  { range: "Below 18", count: 0, label: "Needs Improvement" },
];

// --- AI Features Data ---
const hrClusteringData = [
  {
    name: "High Performer",
    value: evaluations.filter((e) => e.totalScore >= 22).length,
    color: "#059669",
  },
  {
    name: "Average Performer",
    value: evaluations.filter((e) => e.totalScore >= 19 && e.totalScore < 22).length,
    color: "#0284c7",
  },
  {
    name: "At Risk",
    value: evaluations.filter((e) => e.totalScore < 19).length,
    color: "#dc2626",
  },
];

const hrPredictionData = quarterlyData.map((q) => ({
  quarter: q.quarter,
  company: q.companyAvg,
  predicted: +(q.companyAvg + 0.4).toFixed(1),
}));

const hrAiFeedback = [
  "Engineering department shows strong upward momentum with 3 out of 3 team members scoring above 20.",
  "David Kim is a top performer at 23.53; consider fast-tracking to senior technical roles.",
  "Marketing department has only 1 employee but scores well at 22.17 — maintain current KPI weights.",
  "Sales department (Amanda Foster) is performing at 22.17 with consistent client satisfaction.",
  "Company-wide average of 21.9 indicates healthy performance distribution across departments.",
];

const openBiasAlerts = biasDetections.filter((b) => b.status !== "resolved");

const kpiOptimizationSuggestions = [
  {
    kpi: "Code Quality",
    currentWeight: 25,
    suggestedWeight: 30,
    reason: "Engineering team variance suggests higher weight would improve differentiation.",
  },
  {
    kpi: "Client Satisfaction",
    currentWeight: 20,
    suggestedWeight: 22,
    reason: "Strong correlation with total score across Sales and Marketing.",
  },
  {
    kpi: "Documentation",
    currentWeight: 15,
    suggestedWeight: 12,
    reason: "Low variance indicates this KPI is not effectively differentiating performers.",
  },
];

const getPriorityBadge = (priority: string) => {
  const styles: Record<string, string> = {
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[priority] || styles.low}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

export default function HRDashboard() {
  const [activeSection, setActiveSection] = useState<"employees" | "scoring" | "reports" | "announcements" | "surveys" | "manageEmployees">("employees");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [hrScores, setHrScores] = useState<Record<string, number>>({});
  const [hrEvalAction, setHrEvalAction] = useState<"saved" | "submitted" | null>(null);
  const [announcementText, setAnnouncementText] = useState("");
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementSeverity, setAnnouncementSeverity] = useState<"high" | "medium" | "low">("medium");
  const [showNewAnnouncement, setShowNewAnnouncement] = useState(false);
  const [announcementSuccess, setAnnouncementSuccess] = useState(false);
  const [reportExportSuccess, setReportExportSuccess] = useState<"pdf" | "excel" | null>(null);

  // HR scoring evaluation states
  const [scoringActiveTab, setScoringActiveTab] = useState<"list" | "evaluate">("list");
  const [scoringSelectedEmployee, setScoringSelectedEmployee] = useState<string | null>(null);
  const [hrEvalTab, setHrEvalTab] = useState<"overview" | "evaluation" | "insights">("overview");

  // Employee management states
  const [localUsers, setLocalUsers] = useState(users);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<typeof users[0] | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [empForm, setEmpForm] = useState({ name: "", email: "", age: 30, department: "Engineering", jobTitle: "", role: "employee" as "employee" | "manager" });
  const [saveEmpLoading, setSaveEmpLoading] = useState(false);
  const [saveEmpSuccess, setSaveEmpSuccess] = useState(false);

  // AI Insights modals
  const [showAllFeedbackModal, setShowAllFeedbackModal] = useState(false);
  const [selectedBiasAlert, setSelectedBiasAlert] = useState<typeof biasDetections[0] | null>(null);
  const [showAllKpiSuggestionsModal, setShowAllKpiSuggestionsModal] = useState(false);
  const [kpiSuggestionActions, setKpiSuggestionActions] = useState<Record<number, "accepted" | "rejected" | null>>();

  const navigate = useNavigate();

  const allEmployees = localUsers.filter((u) => u.role === "employee");

  const selectedEmpData = selectedEmployee
    ? users.find((u) => u.id === selectedEmployee)
    : null;
  const empKpis = selectedEmployee
    ? kpis.filter((k) => k.employeeId === selectedEmployee)
    : [];
  const empEval = selectedEmployee
    ? evaluations.find((e) => e.employeeId === selectedEmployee)
    : null;

  const handleHrScoreChange = (kpiId: string, score: number) => {
    setHrScores((prev) => ({ ...prev, [kpiId]: score }));
  };

  // HR Scoring - select employee for evaluation
  const scoringEmpData = scoringSelectedEmployee ? users.find((u) => u.id === scoringSelectedEmployee) : null;
  const scoringEmpKpis = scoringSelectedEmployee ? kpis.filter((k) => k.employeeId === scoringSelectedEmployee) : [];
  const scoringEmpEval = scoringSelectedEmployee ? evaluations.find((e) => e.employeeId === scoringSelectedEmployee) : null;

  const sectionToLabel: Record<string, string> = {
    employees: "Employees",
    manageEmployees: "Manage Employees",
    scoring: "Scoring",
    reports: "Reports",
    announcements: "Announcements",
    surveys: "Surveys",
  };
  const labelToSection: Record<string, string> = {
    Employees: "employees",
    "Manage Employees": "manageEmployees",
    Scoring: "scoring",
    Reports: "reports",
    Announcements: "announcements",
    Surveys: "surveys",
  };

  const hrNotifications: NotificationItem[] = [
    {
      id: "hn1",
      type: "success",
      title: "Evaluation Completion Status: 94%",
      message: "45 of 48 employees have completed their Q1 evaluations. 3 pending: John Lee, Priya Sharma, Tom Nguyen.",
      timestamp: "30 minutes ago",
      actionLabel: "View Pending",
    },
    {
      id: "hn2",
      type: "info",
      title: "Department Performance: Marketing Up 4.2%",
      message: "Marketing team showed the strongest improvement this quarter. Average score increased from 20.1 to 20.9.",
      timestamp: "2 hours ago",
      actionLabel: "View Report",
    },
    {
      id: "hn3",
      type: "alert",
      title: "Bias Detection Alert: Manager Score Variance",
      message: "AI detected a 12% variance in scoring patterns for the Sales department. Recommend calibration session.",
      timestamp: "5 hours ago",
      actionLabel: "Investigate",
    },
    {
      id: "hn4",
      type: "ai",
      title: "AI Workforce Analytics Updated",
      message: "New clustering analysis available: 3 High Performers, 2 Average, 0 At Risk. Trend: Stable.",
      timestamp: "1 day ago",
      actionLabel: "View Analytics",
    },
    {
      id: "hn5",
      type: "ai",
      title: "KPI Optimization Suggestion Ready",
      message: "AI suggests adjusting 'Code Quality' weight from 25% to 30% and 'Documentation' from 15% to 12%.",
      timestamp: "1 day ago",
      actionLabel: "Review Suggestion",
    },
    {
      id: "hn6",
      type: "warning",
      title: "Employee Performance Decline Alert",
      message: "Tom Nguyen's score dropped 8% over two quarters. AI recommends early intervention and 1:1 scheduling.",
      timestamp: "2 days ago",
      actionLabel: "Schedule Review",
    },
    {
      id: "hn7",
      type: "info",
      title: "Survey Response Update: 78% Participation",
      message: "Employee wellness survey has reached 78% response rate. 12 responses received in the last 24 hours.",
      timestamp: "2 days ago",
      actionLabel: "View Results",
    },
    {
      id: "hn8",
      type: "success",
      title: "Report Generation Complete: Q1 Summary",
      message: "The quarterly performance summary report has been generated and is ready for leadership review.",
      timestamp: "3 days ago",
      actionLabel: "Open Report",
    },
  ];


  return (
    <DashboardLayout
      role="hr"
      userName={hrUser.name}
      userAvatar={hrUser.avatar}
      userRole={hrUser.jobTitle}
      userAge={hrUser.age}
      userEmail={hrUser.email}
      userDepartment={hrUser.department}
      activeItem={sectionToLabel[activeSection]}
      onItemClick={(label) => {
        const section = labelToSection[label];
        if (section) {
          setActiveSection(section as typeof activeSection);
          setSelectedEmployee(null);
          setScoringActiveTab("list");
          setScoringSelectedEmployee(null);
          setTimeout(() => {
            const sectionMap: Record<string, string> = {
              employees: "section-employees",
              manageEmployees: "section-manage",
              scoring: "section-scoring",
              reports: "section-reports",
              announcements: "section-announcements",
              surveys: "section-surveys",
            };
            const id = sectionMap[section];
            if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        }
      }}
      notifications={hrNotifications}
    >
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">HR Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage employee evaluations, track completion, and oversee company-wide performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Total Employees</span>
              <span className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600">
                <i className="ri-user-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{allEmployees.length}</p>
            <p className="text-xs text-slate-400 mt-1">Across 3 departments</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Evaluations Complete</span>
              <span className="w-8 h-8 flex items-center justify-center bg-emerald-50 rounded-lg text-emerald-600">
                <i className="ri-check-double-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{evaluations.length}/{allEmployees.length}</p>
            <p className="text-xs text-emerald-600 mt-1">{Math.round((evaluations.length / allEmployees.length) * 100)}% completion rate</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Company Avg Score</span>
              <span className="w-8 h-8 flex items-center justify-center bg-sky-50 rounded-lg text-sky-600">
                <i className="ri-star-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {(evaluations.reduce((sum, e) => sum + e.totalScore, 0) / evaluations.length).toFixed(1)}
            </p>
            <p className="text-xs text-slate-400 mt-1">Out of 25</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Active Surveys</span>
              <span className="w-8 h-8 flex items-center justify-center bg-violet-50 rounded-lg text-violet-600">
                <i className="ri-survey-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{surveys.filter((s) => s.status === "active").length}</p>
            <p className="text-xs text-slate-400 mt-1">1 pending review</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {/* AI Feedback Card */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-shadow hover:shadow-lg h-full flex flex-col">
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 flex items-center justify-center bg-sky-50 rounded-lg text-sky-600">
                    <i className="ri-chat-ai-line text-sm"></i>
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">AI Feedback</h3>
                    <p className="text-[11px] text-slate-500">Generated evaluation summaries</p>
                  </div>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col gap-3">
                {[
                  { emp: "David Kim", dept: "Engineering", badge: "Top Performer", score: 23.53, insight: "Fast-track to senior technical roles recommended." },
                  { emp: "Amanda Foster", dept: "Sales", badge: "Strong", score: 22.17, insight: "Consistent client satisfaction with room for upselling growth." },
                  { emp: "Engineering Team", dept: "All 3 members", badge: "Trending Up", score: 22.6, insight: "Upward momentum sustained for 2 consecutive quarters." },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-slate-900">{item.emp}</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-sky-700">{item.badge}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                      <span>{item.dept}</span>
                      <span className="font-semibold text-slate-700">{item.score}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{item.insight}</p>
                  </div>
                ))}
                <div className="mt-auto pt-2">
                  <button
                    onClick={() => setShowAllFeedbackModal(true)}
                    className="text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors flex items-center gap-1"
                  >
                    View all feedback <i className="ri-arrow-right-s-line"></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Performance Prediction Card */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-shadow hover:shadow-lg h-full flex flex-col">
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 flex items-center justify-center bg-emerald-50 rounded-lg text-emerald-600">
                      <i className="ri-line-chart-line text-sm"></i>
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Performance Prediction</h3>
                      <p className="text-[11px] text-slate-500">Company-wide trend forecast</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700">+0.4 pts</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="h-52 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={hrPredictionData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="quarter" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <YAxis domain={[17, 24]} tick={{ fontSize: 10 }} stroke="#94a3b8" width={35} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Line type="monotone" dataKey="company" stroke="#334155" strokeWidth={2} dot={{ fill: "#334155", r: 4 }} name="Actual" />
                      <Line type="monotone" dataKey="predicted" stroke="#059669" strokeWidth={2} strokeDasharray="6 4" dot={{ fill: "#fff", stroke: "#059669", strokeWidth: 2, r: 4 }} name="Predicted" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-5 text-xs text-slate-500 mt-auto">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 rounded-full bg-slate-700"></span>
                    Actual
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 rounded-full border-b-2 border-dashed border-emerald-600"></span>
                    Predicted
                  </span>
                </div>
              </div>
            </div>

            {/* Clustering Card */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-shadow hover:shadow-lg h-full flex flex-col">
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 flex items-center justify-center bg-amber-50 rounded-lg text-amber-600">
                      <i className="ri-group-3-line text-sm"></i>
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Clustering</h3>
                      <p className="text-[11px] text-slate-500">Workforce segmentation</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400">{evaluations.length} total</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="h-44 mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={hrClusteringData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={75}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {hrClusteringData.map((entry, index) => (
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
                <div className="space-y-2.5 mt-auto">
                  {hrClusteringData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between py-1.5 px-2.5 bg-slate-50 rounded-lg">
                      <span className="flex items-center gap-2 text-xs text-slate-700">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                        {entry.name}
                      </span>
                      <span className="text-xs font-semibold text-slate-900">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bias Detection Card */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-shadow hover:shadow-lg h-full flex flex-col">
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-lg text-red-600">
                      <i className="ri-error-warning-line text-sm"></i>
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Bias Detection</h3>
                      <p className="text-[11px] text-slate-500">Inconsistency alerts</p>
                    </div>
                  </div>
                  {openBiasAlerts.length > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">{openBiasAlerts.length} open</span>
                  )}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col gap-3">
                {openBiasAlerts.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                    <span className="w-12 h-12 flex items-center justify-center bg-emerald-50 rounded-full text-emerald-500 mb-2">
                      <i className="ri-shield-check-line text-lg"></i>
                    </span>
                    <p className="text-xs text-slate-600 font-medium">All Clear</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">No bias alerts detected</p>
                  </div>
                ) : (
                  openBiasAlerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="p-3 bg-slate-50 rounded-lg border-l-3 border-l-red-400">
                      <div className="flex items-start justify-between mb-1.5">
                        <p className="text-xs font-medium text-slate-900">{alert.title}</p>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${alert.severity === 'high' ? 'bg-red-100 text-red-700' : alert.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed mb-1">{alert.description.length > 90 ? alert.description.slice(0, 90) + "..." : alert.description}</p>
                      <button
                        onClick={() => setSelectedBiasAlert(alert)}
                        className="text-[11px] font-medium text-sky-600 hover:text-sky-700 transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* KPI Optimization Card */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-shadow hover:shadow-lg h-full flex flex-col md:col-span-2 xl:col-span-1">
              <div className="p-5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 flex items-center justify-center bg-violet-50 rounded-lg text-violet-600">
                    <i className="ri-settings-3-line text-sm"></i>
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">KPI Optimization</h3>
                    <p className="text-[11px] text-slate-500">AI weight adjustments</p>
                  </div>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col gap-3">
                {kpiOptimizationSuggestions.slice(0, 3).map((sugg, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-900">{sugg.kpi}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[11px] text-slate-400 line-through">{sugg.currentWeight}%</span>
                        <i className="ri-arrow-right-line text-[10px] text-slate-400"></i>
                        <span className="text-[11px] font-semibold text-emerald-600">{sugg.suggestedWeight}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden mb-2">
                      <div className="flex h-full">
                        <div className="h-full bg-slate-400 rounded-l-full" style={{ width: `${Math.min(sugg.currentWeight, sugg.suggestedWeight)}%` }}></div>
                        <div className="h-full bg-emerald-500 rounded-r-full" style={{ width: `${Math.abs(sugg.suggestedWeight - sugg.currentWeight)}%` }}></div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">{sugg.reason.length > 70 ? sugg.reason.slice(0, 70) + "..." : sugg.reason}</p>
                  </div>
                ))}
                <div className="mt-auto pt-2">
                  <button
                    onClick={() => setShowAllKpiSuggestionsModal(true)}
                    className="text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors flex items-center gap-1"
                  >
                    Review all suggestions <i className="ri-arrow-right-s-line"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Employees Section */}
        {activeSection === "employees" && (
          <div id="section-employees" className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">All Employees</h2>
                <p className="text-xs text-slate-500 mt-0.5">Click an employee to view details</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Sort by:</span>
                <select className="text-xs border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-800">
                  <option>Name</option>
                  <option>Department</option>
                  <option>Score</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Employee</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Department</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Role</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Manager Score</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">HR Score</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Total</th>
                    <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allEmployees.map((emp) => {
                    const evalData = evaluations.find((e) => e.employeeId === emp.id);
                    return (
                      <tr
                        key={emp.id}
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => setSelectedEmployee(emp.id)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <img
                              src={emp.avatar}
                              alt={emp.name}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                            <div className="ml-3">
                              <p className="font-medium text-slate-900">{emp.name}</p>
                              <p className="text-xs text-slate-500">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{emp.department}</td>
                        <td className="py-3 px-4 text-slate-700">{emp.jobTitle}</td>
                        <td className="py-3 px-4 text-center">
                          {evalData ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                              {evalData.managerScore.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {evalData ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700">
                              {evalData.hrScore.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {evalData ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-white">
                              {evalData.totalScore.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {evalData ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                              Pending
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Employee Detail Panel */}
            {selectedEmpData && (
              <div className="border-t border-slate-200 p-4 md:p-5 bg-slate-50">
                <div className="flex items-center mb-4">
                  <img
                    src={selectedEmpData.avatar}
                    alt={selectedEmpData.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h3 className="text-base font-semibold text-slate-900">{selectedEmpData.name}</h3>
                    <p className="text-xs text-slate-500">
                      {selectedEmpData.jobTitle} &middot; {selectedEmpData.department}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedEmployee(null)}
                    className="ml-auto w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
                    <p className="text-xs text-slate-500 mb-1">Manager Score</p>
                    <p className="text-xl font-bold text-slate-900">
                      {empEval?.managerScore.toFixed(1) || "-"}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">/ 20</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border border-slate-200">
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

                <h4 className="text-sm font-semibold text-slate-900 mb-2">KPI Breakdown</h4>
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
                        <tr key={kpi.id} className="bg-white">
                          <td className="py-2 px-2">
                            <p className="font-medium text-slate-900">{kpi.title}</p>
                          </td>
                          <td className="py-2 px-2 text-center text-slate-700">{kpi.weight}%</td>
                          <td className="py-2 px-2 text-center text-slate-700">{kpi.target}</td>
                          <td className="py-2 px-2 text-center">
                            <span className={kpi.actual >= kpi.target ? "text-emerald-600" : "text-amber-600"}>
                              {kpi.actual}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                              {kpi.managerScore}
                            </span>
                          </td>
                          <td className="py-2 px-2 text-center">
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
            )}
          </div>
        )}

        {/* HR Scoring Section - Employee list + Evaluation */}
        {activeSection === "scoring" && (
          <div id="section-scoring" className="space-y-4">
            {scoringActiveTab === "list" && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                  <h2 className="text-sm font-semibold text-slate-900">HR Scoring - Select Employee</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click an employee to evaluate their KPIs. HR overall max: 5 / 25.
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Employee</th>
                        <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Department</th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Manager Score</th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">HR Score</th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Total</th>
                        <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {allEmployees.map((emp) => {
                        const evalData = evaluations.find((e) => e.employeeId === emp.id);
                        return (
                          <tr key={emp.id} className="hover:bg-slate-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <img
                                  src={emp.avatar}
                                  alt={emp.name}
                                  className="w-9 h-9 rounded-full object-cover"
                                />
                                <div className="ml-3">
                                  <p className="font-medium text-slate-900">{emp.name}</p>
                                  <p className="text-xs text-slate-500">{emp.jobTitle}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-700">{emp.department}</td>
                            <td className="py-3 px-4 text-center">
                              {evalData ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                                  {evalData.managerScore.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {evalData ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700">
                                  {evalData.hrScore.toFixed(1)}
                                </span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {evalData ? (
                                <span className="font-bold text-slate-900">{evalData.totalScore.toFixed(1)}</span>
                              ) : (
                                <span className="text-slate-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => {
                                  setScoringSelectedEmployee(emp.id);
                                  setScoringActiveTab("evaluate");
                                  setHrEvalAction(null);
                                }}
                                className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                              >
                                Evaluate
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {scoringActiveTab === "evaluate" && scoringEmpData && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={scoringEmpData.avatar}
                      alt={scoringEmpData.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <h2 className="text-sm font-semibold text-slate-900">
                        {scoringEmpData.name}
                      </h2>
                      <p className="text-xs text-slate-500">
                        {scoringEmpData.jobTitle} &middot; {scoringEmpData.department}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setScoringActiveTab("list");
                      setScoringSelectedEmployee(null);
                      setHrEvalTab("overview");
                      setHrEvalAction(null);
                    }}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    Back to List
                  </button>
                </div>

                {/* Tabs */}
                <div className="px-4 md:px-5 pt-4">
                  <div className="flex space-x-1 p-1 bg-slate-100 rounded-lg w-fit">
                    {(["overview", "evaluation", "insights"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => {
                          setHrEvalTab(tab);
                          setHrEvalAction(null);
                        }}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                          hrEvalTab === tab
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 md:p-5">
                  {/* Overview Tab */}
                  {hrEvalTab === "overview" && (
                    <div className="space-y-5">
                      {/* Score Overview */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 mb-1">Manager Score</p>
                          <p className="text-xl font-bold text-slate-900">
                            {scoringEmpEval?.managerScore.toFixed(1) || "-"}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">/ 20</p>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 mb-1">HR Score</p>
                          <p className="text-xl font-bold text-slate-900">
                            {scoringEmpEval?.hrScore.toFixed(1) || "-"}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">/ 5</p>
                        </div>
                        <div className="text-center p-3 bg-slate-800 rounded-lg">
                          <p className="text-xs text-slate-300 mb-1">Total Score</p>
                          <p className="text-xl font-bold text-white">
                            {scoringEmpEval?.totalScore.toFixed(1) || "-"}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">/ 25</p>
                        </div>
                      </div>

                      {/* KPIs Table */}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">KPI Breakdown</h3>
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
                              {scoringEmpKpis.map((kpi) => (
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

                      {/* Quarterly Progress Chart */}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">Quarterly Progress</h3>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={quarterlyData}>
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
                              <Bar dataKey="companyAvg" fill="#334155" radius={[4, 4, 0, 0]} name="Company Avg" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Evaluation Tab */}
                  {hrEvalTab === "evaluation" && (
                    <div className="space-y-4">
                      {/* Success Banner */}
                      {hrEvalAction === "saved" && (
                        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <span className="w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-full text-emerald-600 flex-shrink-0">
                            <i className="ri-check-line"></i>
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-emerald-900">HR Scores Saved</p>
                            <p className="text-xs text-emerald-700 mt-0.5">
                              Your HR scores for <strong>{scoringEmpData?.name}</strong> have been saved as a draft. You can continue editing or finalize when ready.
                            </p>
                          </div>
                          <button
                            onClick={() => setHrEvalAction(null)}
                            className="w-6 h-6 flex items-center justify-center text-emerald-500 hover:text-emerald-700 flex-shrink-0"
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        </div>
                      )}
                      {hrEvalAction === "submitted" && (
                        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <span className="w-8 h-8 flex items-center justify-center bg-emerald-100 rounded-full text-emerald-600 flex-shrink-0">
                            <i className="ri-check-double-line"></i>
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-emerald-900">Evaluation Finalized</p>
                            <p className="text-xs text-emerald-700 mt-0.5">
                              <strong>{scoringEmpData?.name}</strong>&rsquo;s evaluation has been successfully finalized. Confirmation ID: EV-2026-0{Math.floor(Math.random() * 9000) + 1000}.
                            </p>
                          </div>
                          <button
                            onClick={() => setHrEvalAction(null)}
                            className="w-6 h-6 flex items-center justify-center text-emerald-500 hover:text-emerald-700 flex-shrink-0"
                          >
                            <i className="ri-close-line"></i>
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-slate-900">HR Scoring Form</h3>
                        <span className="text-xs text-slate-500">Q1 2026</span>
                      </div>
                      {scoringEmpKpis.map((kpi) => (
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
                              <label className="block text-xs text-slate-500 mb-1.5">HR Score (1-5)</label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="range"
                                  min="1"
                                  max="5"
                                  step="0.5"
                                  value={hrScores[kpi.id] ?? kpi.hrScore}
                                  onChange={(e) => handleHrScoreChange(kpi.id, parseFloat(e.target.value))}
                                  className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-800"
                                />
                                <span className="text-sm font-semibold text-slate-900 w-8 text-center">
                                  {hrScores[kpi.id] ?? kpi.hrScore}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="mt-3">
                            <label className="block text-xs text-slate-500 mb-1.5">HR Comments</label>
                            <textarea
                              rows={2}
                              placeholder="Add HR evaluation comments..."
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
                            />
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setHrEvalAction("saved")}
                          className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                        >
                          Save HR Scores
                        </button>
                        <button
                          onClick={() => setHrEvalAction("submitted")}
                          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                        >
                          Finalize Evaluation
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Insights Tab */}
                  {hrEvalTab === "insights" && scoringEmpEval && (
                    <div className="space-y-5">
                      {/* AI Prediction */}
                      <div className="p-4 bg-slate-800 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 flex items-center justify-center text-sky-400">
                            <i className="ri-sparkling-line"></i>
                          </span>
                          <h3 className="text-sm font-semibold text-white">AI Performance Prediction</h3>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{scoringEmpEval.aiPrediction}</p>
                      </div>

                      {/* AI Insights List */}
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900 mb-3">AI-Generated Insights</h3>
                        <div className="space-y-3">
                          {scoringEmpEval.aiInsights.map((insight, idx) => (
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
                                { quarter: "Q1 2026", score: scoringEmpEval.totalScore },
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
            )}
          </div>
        )}

        {/* Reports Section */}
        {activeSection === "reports" && (
          <div id="section-reports" className="space-y-4">
            {/* Score Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Score Distribution</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={scoreDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <YAxis dataKey="range" type="category" tick={{ fontSize: 12 }} stroke="#94a3b8" width={80} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="count" fill="#334155" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Department Distribution</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={deptDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {deptDistribution.map((entry, index) => (
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
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {deptDistribution.map((dept) => (
                    <div key={dept.name} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }}></span>
                      <span className="text-xs text-slate-600">{dept.name} ({dept.value})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Employee Performance Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Performance Summary</h3>
                <div className="flex flex-col gap-2">
                  {reportExportSuccess && (
                    <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg text-emerald-700 text-xs">
                      <i className="ri-check-line"></i>
                      {reportExportSuccess === "pdf" ? "PDF" : "Excel"} report generated successfully!
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setReportExportSuccess("pdf");
                        setTimeout(() => setReportExportSuccess(null), 3000);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap">
                      <span className="w-4 h-4 flex items-center justify-center"><i className="ri-file-pdf-line"></i></span>
                      Export PDF
                    </button>
                    <button
                      onClick={() => {
                        setReportExportSuccess("excel");
                        setTimeout(() => setReportExportSuccess(null), 3000);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap">
                      <span className="w-4 h-4 flex items-center justify-center"><i className="ri-file-excel-line"></i></span>
                      Export Excel
                    </button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Employee</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Department</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Manager</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">HR</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Total</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {evaluations.map((evalItem) => {
                      const emp = users.find((u) => u.id === evalItem.employeeId);
                      let rating = "Average";
                      if (evalItem.totalScore >= 22) rating = "Excellent";
                      else if (evalItem.totalScore >= 20) rating = "Good";
                      else if (evalItem.totalScore >= 18) rating = "Average";
                      else rating = "Needs Improvement";

                      const ratingColors: Record<string, string> = {
                        Excellent: "bg-emerald-100 text-emerald-700",
                        Good: "bg-sky-100 text-sky-700",
                        Average: "bg-amber-100 text-amber-700",
                        "Needs Improvement": "bg-red-100 text-red-700",
                      };

                      return (
                        <tr key={evalItem.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <img
                                src={emp?.avatar || ""}
                                alt={emp?.name || ""}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <span className="ml-2 font-medium text-slate-900">{emp?.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-700">{emp?.department}</td>
                          <td className="py-3 px-4 text-center font-medium text-slate-900">{evalItem.managerScore.toFixed(1)}</td>
                          <td className="py-3 px-4 text-center font-medium text-slate-900">{evalItem.hrScore.toFixed(1)}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="font-bold text-slate-900">{evalItem.totalScore.toFixed(1)}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ratingColors[rating]}`}>
                              {rating}
                            </span>
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

        {/* Announcements Section */}
        {activeSection === "announcements" && (
          <div id="section-announcements" className="space-y-4">
            {/* New Announcement */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-slate-900">Post Announcement</h2>
                <button
                  onClick={() => setShowNewAnnouncement(!showNewAnnouncement)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                >
                  <span className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-add-line"></i>
                  </span>
                  New Announcement
                </button>
              </div>

              {showNewAnnouncement && (
                <div className="space-y-3 mb-4 p-4 bg-slate-50 rounded-lg">
                  {announcementSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg text-emerald-700 text-sm">
                      <span className="w-5 h-5 flex items-center justify-center"><i className="ri-check-line"></i></span>
                      Announcement posted successfully!
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Title</label>
                    <input
                      type="text"
                      value={announcementTitle}
                      onChange={(e) => setAnnouncementTitle(e.target.value)}
                      placeholder="Enter announcement title..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Content</label>
                    <textarea
                      rows={4}
                      value={announcementText}
                      onChange={(e) => setAnnouncementText(e.target.value)}
                      placeholder="Write your announcement..."
                      maxLength={500}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
                    />
                    <p className="text-xs text-slate-400 mt-1 text-right">{announcementText.length}/500</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1.5">Severity</label>
                    <div className="flex gap-2">
                      {(["high", "medium", "low"] as const).map((sev) => (
                        <button
                          key={sev}
                          onClick={() => setAnnouncementSeverity(sev)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                            announcementSeverity === sev
                              ? "border-slate-800 bg-slate-800 text-white"
                              : "border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              sev === "high" ? "bg-red-500" : sev === "medium" ? "bg-amber-500" : "bg-slate-400"
                            }`}
                          ></span>
                          {sev.charAt(0).toUpperCase() + sev.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!announcementTitle.trim() || !announcementText.trim()) return;
                        setAnnouncementSuccess(true);
                        setTimeout(() => {
                          setShowNewAnnouncement(false);
                          setAnnouncementTitle("");
                          setAnnouncementText("");
                          setAnnouncementSeverity("medium");
                          setAnnouncementSuccess(false);
                        }, 1500);
                      }}
                      disabled={!announcementTitle.trim() || !announcementText.trim()}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                        !announcementTitle.trim() || !announcementText.trim()
                          ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                          : "bg-slate-800 text-white hover:bg-slate-700"
                      }`}
                    >
                      Post Announcement
                    </button>
                    <button
                      onClick={() => {
                        setShowNewAnnouncement(false);
                        setAnnouncementTitle("");
                        setAnnouncementText("");
                        setAnnouncementSeverity("medium");
                        setAnnouncementSuccess(false);
                      }}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Announcements List */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-900">Recent Announcements</h2>
              </div>
              <div className="divide-y divide-slate-100">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(ann.priority)}
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
          </div>
        )}

        {/* Surveys Section */}
        {activeSection === "surveys" && (
          <SurveyManagement />
        )}

        {/* Manage Employees Section */}
        {activeSection === "manageEmployees" && (
          <div id="section-manage" className="space-y-4">
            {/* Employee List Header */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">Manage Employees</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Add, edit, or remove employees from the system</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingEmployee(null);
                        setEmpForm({ name: "", email: "", age: 30, department: "Engineering", jobTitle: "", role: "employee" });
                        setSaveEmpSuccess(false);
                        setShowEmployeeModal(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                    >
                      <span className="w-4 h-4 flex items-center justify-center">
                        <i className="ri-add-line"></i>
                      </span>
                      Add Employee
                    </button>
                  </div>

                  {/* Employee Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Employee</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Department</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Role</th>
                          <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Age</th>
                          <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Status</th>
                          <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {allEmployees.map((emp) => {
                          const evalData = evaluations.find((e) => e.employeeId === emp.id);
                          return (
                            <tr key={emp.id} className="hover:bg-slate-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  <img
                                    src={emp.avatar}
                                    alt={emp.name}
                                    className="w-9 h-9 rounded-full object-cover"
                                  />
                                  <div className="ml-3">
                                    <p className="font-medium text-slate-900">{emp.name}</p>
                                    <p className="text-xs text-slate-500">{emp.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-slate-700">{emp.department}</td>
                              <td className="py-3 px-4 text-slate-700">{emp.jobTitle}</td>
                              <td className="py-3 px-4 text-center text-slate-700">{emp.age}</td>
                              <td className="py-3 px-4 text-center">
                                {evalData ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                    Evaluated
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                    Pending
                                  </span>
                                )}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingEmployee(emp);
                                      setEmpForm({
                                        name: emp.name,
                                        email: emp.email,
                                        age: emp.age,
                                        department: emp.department,
                                        jobTitle: emp.jobTitle,
                                        role: emp.role as "employee" | "manager",
                                      });
                                      setSaveEmpSuccess(false);
                                      setShowEmployeeModal(true);
                                    }}
                                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                    title="Edit"
                                  >
                                    <i className="ri-edit-line"></i>
                                  </button>
                                  <button
                                    onClick={() => setShowDeleteConfirm(emp.id)}
                                    className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <i className="ri-delete-bin-line"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {allEmployees.length === 0 && (
                    <div className="text-center py-10">
                      <span className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-full text-slate-400 mx-auto mb-3">
                        <i className="ri-user-line text-xl"></i>
                      </span>
                      <p className="text-sm text-slate-500">No employees found</p>
                      <p className="text-xs text-slate-400 mt-1">Click "Add Employee" to get started</p>
                    </div>
                  )}
                </div>

                {/* Add/Edit Employee Modal */}
                {showEmployeeModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
                      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white">
                            <i className={editingEmployee ? "ri-edit-line" : "ri-user-add-line"}></i>
                          </span>
                          <h3 className="text-sm font-semibold text-slate-900">
                            {editingEmployee ? "Edit Employee" : "Add New Employee"}
                          </h3>
                        </div>
                        <button
                          onClick={() => setShowEmployeeModal(false)}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <i className="ri-close-line"></i>
                        </button>
                      </div>

                      <div className="px-5 py-5 overflow-y-auto flex-1 space-y-4">
                        {saveEmpSuccess && (
                          <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg text-emerald-700 text-sm">
                            <span className="w-5 h-5 flex items-center justify-center">
                              <i className="ri-check-line"></i>
                            </span>
                            {editingEmployee ? "Employee updated successfully!" : "Employee added successfully!"}
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">Full Name</label>
                          <input
                            type="text"
                            value={empForm.name}
                            onChange={(e) => setEmpForm((p) => ({ ...p, name: e.target.value }))}
                            placeholder="e.g., John Smith"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1.5">Email</label>
                          <input
                            type="email"
                            value={empForm.email}
                            onChange={(e) => setEmpForm((p) => ({ ...p, email: e.target.value }))}
                            placeholder="john.smith@company.com"
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Age</label>
                            <input
                              type="number"
                              min={18}
                              max={80}
                              value={empForm.age}
                              onChange={(e) => setEmpForm((p) => ({ ...p, age: parseInt(e.target.value) || 0 }))}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Role Type</label>
                            <select
                              value={empForm.role}
                              onChange={(e) => setEmpForm((p) => ({ ...p, role: e.target.value as "employee" | "manager" }))}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent bg-white"
                            >
                              <option value="employee">Employee</option>
                              <option value="manager">Manager</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Department</label>
                            <select
                              value={empForm.department}
                              onChange={(e) => setEmpForm((p) => ({ ...p, department: e.target.value }))}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent bg-white"
                            >
                              <option value="Engineering">Engineering</option>
                              <option value="Marketing">Marketing</option>
                              <option value="Sales">Sales</option>
                              <option value="Human Resources">Human Resources</option>
                              <option value="IT">IT</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1.5">Job Title</label>
                            <input
                              type="text"
                              value={empForm.jobTitle}
                              onChange={(e) => setEmpForm((p) => ({ ...p, jobTitle: e.target.value }))}
                              placeholder="e.g., Senior Developer"
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                        <button
                          onClick={() => {
                            setSaveEmpLoading(true);
                            setTimeout(() => {
                              if (editingEmployee) {
                                setLocalUsers((prev) =>
                                  prev.map((u) =>
                                    u.id === editingEmployee.id
                                      ? {
                                          ...u,
                                          name: empForm.name,
                                          email: empForm.email,
                                          age: empForm.age,
                                          department: empForm.department,
                                          jobTitle: empForm.jobTitle,
                                          role: empForm.role,
                                        }
                                      : u
                                  )
                                );
                              } else {
                                const newId = "u" + (Math.max(...localUsers.map((u) => parseInt(u.id.replace("u", "")))) + 1);
                                setLocalUsers((prev) => [
                                  ...prev,
                                  {
                                    id: newId,
                                    name: empForm.name,
                                    email: empForm.email,
                                    age: empForm.age,
                                    role: empForm.role,
                                    department: empForm.department,
                                    jobTitle: empForm.jobTitle,
                                    avatar: `https://readdy.ai/api/search-image?query=professional%20business%20portrait%20headshot%20soft%20lighting%20neutral%20background%20corporate%20style&width=100&height=100&seq=${parseInt(newId.replace("u", "")) + 10}&orientation=squarish`,
                                  },
                                ]);
                              }
                              setSaveEmpLoading(false);
                              setSaveEmpSuccess(true);
                              setTimeout(() => {
                                setShowEmployeeModal(false);
                                setSaveEmpSuccess(false);
                              }, 1200);
                            }, 800);
                          }}
                          disabled={!empForm.name || !empForm.email || !empForm.jobTitle || saveEmpLoading}
                          className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                            !empForm.name || !empForm.email || !empForm.jobTitle || saveEmpLoading
                              ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                              : "bg-slate-800 text-white hover:bg-slate-700"
                          }`}
                        >
                          {saveEmpLoading ? (
                            <span className="flex items-center gap-2 justify-center">
                              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                              Saving...
                            </span>
                          ) : editingEmployee ? (
                            "Save Changes"
                          ) : (
                            "Add Employee"
                          )}
                        </button>
                        <button
                          onClick={() => setShowEmployeeModal(false)}
                          className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-white transition-colors whitespace-nowrap"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
                      <div className="px-5 py-5 text-center">
                        <span className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full text-red-600 mx-auto mb-3">
                          <i className="ri-delete-bin-line text-xl"></i>
                        </span>
                        <h3 className="text-sm font-semibold text-slate-900 mb-1">Delete Employee?</h3>
                        <p className="text-xs text-slate-500">
                          Are you sure you want to remove "{localUsers.find((u) => u.id === showDeleteConfirm)?.name}"? This action cannot be undone.
                        </p>
                      </div>
                      <div className="px-5 pb-5 flex gap-2">
                        <button
                          onClick={() => {
                            setLocalUsers((prev) => prev.filter((u) => u.id !== showDeleteConfirm));
                            setShowDeleteConfirm(null);
                          }}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
                        >
                          Yes, Delete
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

        {/* ===== AI Insights Modals ===== */}

        {/* All Feedback Modal */}
        {showAllFeedbackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 flex items-center justify-center bg-sky-50 rounded-lg text-sky-600">
                    <i className="ri-chat-ai-line"></i>
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">All AI Feedback</h3>
                </div>
                <button
                  onClick={() => setShowAllFeedbackModal(false)}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
              <div className="px-5 py-5 overflow-y-auto flex-1 space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-sky-700">Team Insight</span>
                    <span className="text-[11px] text-slate-400">Engineering</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Engineering department shows strong upward momentum with 3 out of 3 team members scoring above 20.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">Top Performer</span>
                    <span className="text-[11px] text-slate-400">David Kim</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    David Kim is a top performer at 23.53; consider fast-tracking to senior technical roles. Consistently exceeds targets across all KPIs with particular strength in code quality and system design.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-sky-50 text-sky-700">Strong</span>
                    <span className="text-[11px] text-slate-400">Amanda Foster</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Consistent client satisfaction with room for upselling growth. Sales performance remains steady at 22.17 with excellent client retention metrics.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700">Trending Up</span>
                    <span className="text-[11px] text-slate-400">Engineering Team</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Upward momentum sustained for 2 consecutive quarters. Average team score improved from 20.8 to 22.6, indicating effective mentorship and knowledge-sharing practices.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">Company-wide</span>
                    <span className="text-[11px] text-slate-400">All Departments</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Company-wide average of 21.9 indicates healthy performance distribution across departments. No significant outliers requiring immediate intervention.
                  </p>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setShowAllFeedbackModal(false)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bias Alert Detail Modal */}
        {selectedBiasAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-lg text-red-600">
                    <i className="ri-error-warning-line"></i>
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">Bias Alert Details</h3>
                </div>
                <button
                  onClick={() => setSelectedBiasAlert(null)}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
              <div className="px-5 py-5 overflow-y-auto flex-1 space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${selectedBiasAlert.severity === 'high' ? 'bg-red-100 text-red-700' : selectedBiasAlert.severity === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                    {selectedBiasAlert.severity}
                  </span>
                  <span className="text-[11px] text-slate-400">{selectedBiasAlert.date}</span>
                </div>
                <h4 className="text-base font-semibold text-slate-900">{selectedBiasAlert.title}</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{selectedBiasAlert.description}</p>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h5 className="text-xs font-semibold text-slate-700 mb-2">AI Analysis</h5>
                  <ul className="space-y-2">
                    {selectedBiasAlert.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="w-4 h-4 flex items-center justify-center bg-red-100 text-red-600 rounded-full text-[10px] flex-shrink-0 mt-0.5">{idx + 1}</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <h5 className="text-xs font-semibold text-amber-800 mb-1.5">Recommended Action</h5>
                  <p className="text-sm text-amber-700 leading-relaxed">
                    Schedule a calibration session with the relevant manager(s) to review scoring patterns. Consider a second review by a different evaluator for the affected employees.
                  </p>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex gap-2">
                <button
                  onClick={() => navigate("/bias-detection")}
                  className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                >
                  Open Bias Detection Page
                </button>
                <button
                  onClick={() => setSelectedBiasAlert(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-white transition-colors whitespace-nowrap"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* All KPI Suggestions Modal */}
        {showAllKpiSuggestionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 flex items-center justify-center bg-violet-50 rounded-lg text-violet-600">
                    <i className="ri-settings-3-line"></i>
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">KPI Optimization Suggestions</h3>
                </div>
                <button
                  onClick={() => setShowAllKpiSuggestionsModal(false)}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
              <div className="px-5 py-5 overflow-y-auto flex-1 space-y-4">
                {kpiOptimizationSuggestions.map((sugg, idx) => {
                  const action = kpiSuggestionActions?.[idx];
                  return (
                    <div key={idx} className={`p-4 rounded-xl border ${action === "accepted" ? "bg-emerald-50 border-emerald-200" : action === "rejected" ? "bg-slate-50 border-slate-200 opacity-60" : "bg-white border-slate-200"}`}>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-slate-900">{sugg.kpi}</h4>
                        {action === "accepted" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                            <i className="ri-check-line mr-1"></i>Accepted
                          </span>
                        )}
                        {action === "rejected" && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500">
                            <i className="ri-close-line mr-1"></i>Rejected
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Current</span>
                          <span className="text-sm font-bold text-slate-700">{sugg.currentWeight}%</span>
                        </div>
                        <i className="ri-arrow-right-line text-slate-400"></i>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500">Suggested</span>
                          <span className="text-sm font-bold text-emerald-600">{sugg.suggestedWeight}%</span>
                        </div>
                        <span className={`text-xs font-medium ${sugg.suggestedWeight > sugg.currentWeight ? "text-emerald-600" : "text-red-600"}`}>
                          {sugg.suggestedWeight > sugg.currentWeight ? "+" : ""}{sugg.suggestedWeight - sugg.currentWeight}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                        <div className="flex h-full">
                          <div className="h-full bg-slate-400 rounded-l-full transition-all" style={{ width: `${Math.min(sugg.currentWeight, sugg.suggestedWeight)}%` }}></div>
                          <div className="h-full bg-emerald-500 rounded-r-full transition-all" style={{ width: `${Math.abs(sugg.suggestedWeight - sugg.currentWeight)}%` }}></div>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed mb-3">{sugg.reason}</p>
                      {!action && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => setKpiSuggestionActions((prev) => ({ ...prev, [idx]: "accepted" }))}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors whitespace-nowrap"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => setKpiSuggestionActions((prev) => ({ ...prev, [idx]: "rejected" }))}
                            className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                <button
                  onClick={() => setShowAllKpiSuggestionsModal(false)}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
