import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { users } from "@/mocks/users";
import { kpis } from "@/mocks/kpis";
import { evaluations } from "@/mocks/evaluations";
import { biasDetections } from "@/mocks/biasDetection";
import { surveys } from "@/mocks/surveys";
import { announcements } from "@/mocks/announcements";
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
  LineChart,
  Line,
  Legend,
} from "recharts";
import type { NotificationItem } from "@/components/feature/NotificationPanel";

// ---- AI Analytics Data ----
const quarterlyData = [
  { quarter: "Q1 2025", actual: 18.0, predicted: null },
  { quarter: "Q2 2025", actual: 18.5, predicted: null },
  { quarter: "Q3 2025", actual: 19.0, predicted: null },
  { quarter: "Q4 2025", actual: 19.5, predicted: null },
  { quarter: "Q1 2026", actual: 21.9, predicted: 21.9 },
  { quarter: "Q2 2026 (Pred)", actual: null, predicted: 22.8 },
];

// Clustering (all employees)
const highPerformers = evaluations.filter((e) => e.totalScore >= 22);
const avgPerformers = evaluations.filter((e) => e.totalScore >= 19 && e.totalScore < 22);
const atRisk = evaluations.filter((e) => e.totalScore < 19);

const clusteringData = [
  { name: "High Performer", value: highPerformers.length, color: "#22c55e" },
  { name: "Average Performer", value: avgPerformers.length, color: "#3b82f6" },
  { name: "At Risk", value: atRisk.length, color: "#ef4444" },
];

const openBias = biasDetections.filter((b) => b.status === "open" || b.status === "investigating");
const resolvedBias = biasDetections.filter((b) => b.status === "resolved");

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
  {
    kpi: "Sales Target Achievement",
    currentWeight: 45,
    suggestedWeight: 40,
    reason: "Introduce client-retention metric to balance revenue focus.",
    department: "Sales",
  },
];

// AI Model status
const aiModelStats = {
  status: "Training Complete",
  lastTrained: "2026-05-08",
  datasetSize: 1247,
  accuracy: 94.2,
  confidence: 88.5,
  predictionsMade: 342,
  nextRetrain: "2026-06-01",
};

const adminUser = users.find((u) => u.role === "admin")!;

const adminNotifications: NotificationItem[] = [
  {
    id: "an1",
    type: "info",
    title: "User Management: 3 New Accounts Created",
    message: "HR created accounts for Rachel Kim, Daniel Park, and Amy Zhang. Role assignments pending admin review.",
    timestamp: "15 minutes ago",
    actionLabel: "Review Accounts",
  },
  {
    id: "an2",
    type: "alert",
    title: "System Security Alert: Unusual Login Pattern",
    message: "AI detected 5 failed login attempts from IP 203.45.12.88 on admin portal. Account temporarily locked.",
    timestamp: "1 hour ago",
    actionLabel: "View Security Log",
  },
  {
    id: "an3",
    type: "success",
    title: "AI Model Training Complete",
    message: "Performance prediction model v3.2 finished training. Accuracy: 94.2%, Dataset: 1,247 records.",
    timestamp: "3 hours ago",
    actionLabel: "View Model Stats",
  },
  {
    id: "an4",
    type: "alert",
    title: "Bias Detection Alert: Gender Score Gap",
    message: "AI flagged a potential 4.8% scoring disparity between male and female employees in Engineering.",
    timestamp: "5 hours ago",
    actionLabel: "View Analysis",
  },
  {
    id: "an5",
    type: "ai",
    title: "KPI Optimization Recommendations Ready",
    message: "AI analysis complete. Suggests 3 weight adjustments across Engineering and Sales departments.",
    timestamp: "6 hours ago",
    actionLabel: "Review Recommendations",
  },
  {
    id: "an6",
    type: "warning",
    title: "Database Activity Spike Detected",
    message: "Write operations peaked at 2,340/sec during batch import. No errors logged. Monitoring continues.",
    timestamp: "8 hours ago",
    actionLabel: "View Metrics",
  },
  {
    id: "an7",
    type: "warning",
    title: "System Performance Warning: API Latency",
    message: "Average API response time increased to 186ms (target: 150ms). Recommend cache warm-up.",
    timestamp: "1 day ago",
    actionLabel: "View Dashboard",
  },
  {
    id: "an8",
    type: "info",
    title: "Organizational Analytics Update: Q1 Complete",
    message: "Full Q1 workforce analytics package is ready. Includes clustering, trends, and attrition risk.",
    timestamp: "1 day ago",
    actionLabel: "Open Analytics",
  },
  {
    id: "an9",
    type: "alert",
    title: "Failed Login Attempts: Admin Account",
    message: "3 consecutive failed login attempts on admin@company.com. Last attempt: 2026-05-11 09:14 UTC.",
    timestamp: "2 days ago",
    actionLabel: "View Audit Log",
  },
];

const roleDistribution = [
  { name: "Employee", value: 5, color: "#334155" },
  { name: "Manager", value: 1, color: "#64748b" },
  { name: "HR", value: 1, color: "#94a3b8" },
  { name: "Admin", value: 1, color: "#cbd5e1" },
];

const deptDistribution = [
  { name: "Engineering", value: 3, color: "#334155" },
  { name: "Marketing", value: 1, color: "#64748b" },
  { name: "Sales", value: 1, color: "#94a3b8" },
  { name: "HR", value: 1, color: "#cbd5e1" },
  { name: "IT", value: 1, color: "#e2e8f0" },
];

const systemHealth = [
  { metric: "Uptime", value: 99.97, target: 99.9 },
  { metric: "API Response", value: 124, target: 200 },
  { metric: "DB Queries/sec", value: 1450, target: 2000 },
  { metric: "Active Sessions", value: 42, target: 100 },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "users" | "kpis" | "ai_analytics" | "reports" | "settings">("overview");
  const [showNewUser, setShowNewUser] = useState(false);
  const [showNewKpi, setShowNewKpi] = useState(false);
  const [userFilter, setUserFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [exportScope, setExportScope] = useState<"all" | "flagged">("all");
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  // User CRUD state
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("employee");
  const [newUserDept, setNewUserDept] = useState("Engineering");
  const [newUserJobTitle, setNewUserJobTitle] = useState("");
  const [createUserSuccess, setCreateUserSuccess] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserRole, setEditUserRole] = useState("employee");
  const [editUserDept, setEditUserDept] = useState("Engineering");
  const [editUserJobTitle, setEditUserJobTitle] = useState("");
  const [editUserSuccess, setEditUserSuccess] = useState(false);
  const [showDeleteUserConfirm, setShowDeleteUserConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteUserSuccess, setDeleteUserSuccess] = useState(false);

  // KPI CRUD state
  const [newKpiTitle, setNewKpiTitle] = useState("");
  const [newKpiDept, setNewKpiDept] = useState("Engineering");
  const [newKpiWeight, setNewKpiWeight] = useState("");
  const [newKpiTarget, setNewKpiTarget] = useState("");
  const [newKpiDesc, setNewKpiDesc] = useState("");
  const [createKpiSuccess, setCreateKpiSuccess] = useState(false);
  const [editingKpiId, setEditingKpiId] = useState<string | null>(null);
  const [editKpiTitle, setEditKpiTitle] = useState("");
  const [editKpiDept, setEditKpiDept] = useState("Engineering");
  const [editKpiWeight, setEditKpiWeight] = useState("");
  const [editKpiTarget, setEditKpiTarget] = useState("");
  const [editKpiDesc, setEditKpiDesc] = useState("");
  const [editKpiSuccess, setEditKpiSuccess] = useState(false);
  const [showDeleteKpiConfirm, setShowDeleteKpiConfirm] = useState(false);
  const [deleteKpiId, setDeleteKpiId] = useState<string | null>(null);
  const [deleteKpiSuccess, setDeleteKpiSuccess] = useState(false);

  // Settings state
  const [settingsQuarter, setSettingsQuarter] = useState("Q1 2026");
  const [settingsDeadline, setSettingsDeadline] = useState("2026-04-30");
  const [settingsManagerMax, setSettingsManagerMax] = useState(20);
  const [settingsHrMax, setSettingsHrMax] = useState(5);
  const [saveSettingsSuccess, setSaveSettingsSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const filteredUsers = users.filter((u) => {
    const matchesRole = userFilter === "all" || u.role === userFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const selectedUserData = selectedUser ? users.find((u) => u.id === selectedUser) : null;
  const userKpis = selectedUser ? kpis.filter((k) => k.employeeId === selectedUser) : [];
  const userEval = selectedUser ? evaluations.find((e) => e.employeeId === selectedUser) : null;

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: "bg-slate-800 text-white",
      manager: "bg-sky-100 text-sky-700",
      hr: "bg-violet-100 text-violet-700",
      employee: "bg-slate-100 text-slate-600",
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[role] || styles.employee}`}>
        {role === "hr" ? "HR" : role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const tabToLabel: Record<string, string> = {
    overview: "Overview",
    users: "User Management",
    kpis: "KPI Configuration",
    ai_analytics: "AI Analytics",
    reports: "Reports",
    settings: "System Settings",
  };
  const labelToTab: Record<string, string> = {
    Overview: "overview",
    "User Management": "users",
    "KPI Configuration": "kpis",
    "AI Analytics": "ai_analytics",
    Reports: "reports",
    "System Settings": "settings",
  };

  return (
    <DashboardLayout
      role="admin"
      userName={adminUser.name}
      userAvatar={adminUser.avatar}
      userRole={adminUser.jobTitle}
      userAge={adminUser.age}
      userEmail={adminUser.email}
      userDepartment={adminUser.department}
      activeItem={tabToLabel[activeTab]}
      onItemClick={(label) => {
        const tab = labelToTab[label];
        if (tab) {
          setActiveTab(tab as typeof activeTab);
          setSelectedUser(null);
          setTimeout(() => {
            const sectionMap: Record<string, string> = {
              overview: "section-overview",
              users: "section-users",
              kpis: "section-kpis",
              ai_analytics: "section-ai",
              reports: "section-reports",
              settings: "section-settings",
            };
            const id = sectionMap[tab];
            if (id) document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 100);
        }
      }}
      notifications={adminNotifications}
    >
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage users, configure KPIs, and monitor system health
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Total Users</span>
              <span className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600">
                <i className="ri-user-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{users.length}</p>
            <p className="text-xs text-slate-400 mt-1">Across 5 departments</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Active KPIs</span>
              <span className="w-8 h-8 flex items-center justify-center bg-emerald-50 rounded-lg text-emerald-600">
                <i className="ri-bar-chart-box-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{kpis.length}</p>
            <p className="text-xs text-emerald-600 mt-1">All configured</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Evaluations</span>
              <span className="w-8 h-8 flex items-center justify-center bg-sky-50 rounded-lg text-sky-600">
                <i className="ri-check-double-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{evaluations.length}</p>
            <p className="text-xs text-slate-400 mt-1">Q1 2026 cycle</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">System Uptime</span>
              <span className="w-8 h-8 flex items-center justify-center bg-violet-50 rounded-lg text-violet-600">
                <i className="ri-server-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">99.97%</p>
            <p className="text-xs text-slate-400 mt-1">Last 30 days</p>
          </div>
        </div>


        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div id="section-overview" className="space-y-4">
            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">User Role Distribution</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {roleDistribution.map((entry, index) => (
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
                  {roleDistribution.map((role) => (
                    <div key={role.name} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }}></span>
                      <span className="text-xs text-slate-600">{role.name} ({role.value})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Department Distribution</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptDistribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {deptDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">System Health Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {systemHealth.map((item) => {
                  const isGood = item.metric === "API Response" || item.metric === "DB Queries/sec"
                    ? item.value <= item.target
                    : item.value >= item.target;
                  return (
                    <div key={item.metric} className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">{item.metric}</p>
                      <p className="text-xl font-bold text-slate-900">
                        {item.metric === "API Response" ? `${item.value}ms` : item.value}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`w-2 h-2 rounded-full ${isGood ? "bg-emerald-500" : "bg-amber-500"}`}></span>
                        <span className={`text-xs ${isGood ? "text-emerald-600" : "text-amber-600"}`}>
                          {isGood ? "Healthy" : "Warning"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 flex items-center justify-center bg-sky-50 rounded-lg text-sky-600">
                    <i className="ri-survey-line"></i>
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{surveys.length} Surveys</p>
                    <p className="text-xs text-slate-500">{surveys.filter((s) => s.status === "active").length} active</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 flex items-center justify-center bg-amber-50 rounded-lg text-amber-600">
                    <i className="ri-megaphone-line"></i>
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{announcements.length} Announcements</p>
                    <p className="text-xs text-slate-500">{announcements.filter((a) => a.priority === "high").length} high priority</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 flex items-center justify-center bg-emerald-50 rounded-lg text-emerald-600">
                    <i className="ri-check-double-line"></i>
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">100% Completion</p>
                    <p className="text-xs text-slate-500">All Q1 evaluations done</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <div id="section-users" className="space-y-4">
            {/* Filters & Search */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-slate-400">
                    <i className="ri-search-line"></i>
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search users by name, email, or department..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  />
                </div>
                <select
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="hr">HR</option>
                  <option value="employee">Employee</option>
                </select>
                <button
                  onClick={() => setShowNewUser(!showNewUser)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                >
                  <span className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-add-line"></i>
                  </span>
                  Add User
                </button>
              </div>

              {/* New User Form */}
              {showNewUser && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-3">
                  <h4 className="text-sm font-semibold text-slate-900">Create New User</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Enter full name"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
                      <select
                        value={newUserRole}
                        onChange={(e) => setNewUserRole(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                      >
                        <option value="employee">Employee</option>
                        <option value="manager">Manager</option>
                        <option value="hr">HR</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
                      <select
                        value={newUserDept}
                        onChange={(e) => setNewUserDept(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                      >
                        <option>Engineering</option>
                        <option>Marketing</option>
                        <option>Sales</option>
                        <option>Human Resources</option>
                        <option>IT</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Job Title</label>
                      <input
                        type="text"
                        value={newUserJobTitle}
                        onChange={(e) => setNewUserJobTitle(e.target.value)}
                        placeholder="e.g., Senior Developer"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                      />
                    </div>
                  </div>
                  {createUserSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <span className="w-5 h-5 flex items-center justify-center text-emerald-600">
                        <i className="ri-check-line"></i>
                      </span>
                      <p className="text-xs font-medium text-emerald-700">User created successfully!</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!newUserName.trim() || !newUserEmail.trim()) {
                          alert("Please fill in all required fields.");
                          return;
                        }
                        setCreateUserSuccess(true);
                        setTimeout(() => {
                          setCreateUserSuccess(false);
                          setNewUserName("");
                          setNewUserEmail("");
                          setNewUserRole("employee");
                          setNewUserDept("Engineering");
                          setNewUserJobTitle("");
                          setShowNewUser(false);
                        }, 2000);
                      }}
                      className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                    >
                      Create User
                    </button>
                    <button
                      onClick={() => {
                        setShowNewUser(false);
                        setCreateUserSuccess(false);
                        setNewUserName("");
                        setNewUserEmail("");
                        setNewUserJobTitle("");
                      }}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-900">
                  Users ({filteredUsers.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">User</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Role</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Department</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Job Title</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Status</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-slate-50 cursor-pointer"
                        onClick={() => setSelectedUser(user.id)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-9 h-9 rounded-full object-cover"
                            />
                            <div className="ml-3">
                              <p className="font-medium text-slate-900">{user.name}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{getRoleBadge(user.role)}</td>
                        <td className="py-3 px-4 text-slate-700">{user.department}</td>
                        <td className="py-3 px-4 text-slate-700">{user.jobTitle}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const u = users.find((usr) => usr.id === user.id);
                                if (u) {
                                  setEditingUserId(user.id);
                                  setEditUserName(u.name);
                                  setEditUserEmail(u.email);
                                  setEditUserRole(u.role);
                                  setEditUserDept(u.department);
                                  setEditUserJobTitle(u.jobTitle);
                                  setEditUserSuccess(false);
                                }
                              }}
                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                            >
                              <i className="ri-edit-line"></i>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteUserId(user.id);
                                setShowDeleteUserConfirm(true);
                                setDeleteUserSuccess(false);
                              }}
                              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* User Detail Panel */}
            {selectedUserData && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <img
                      src={selectedUserData.avatar}
                      alt={selectedUserData.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <h3 className="text-base font-semibold text-slate-900">{selectedUserData.name}</h3>
                      <p className="text-xs text-slate-500">
                        {selectedUserData.jobTitle} &middot; {selectedUserData.department}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>

                {userEval && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">Manager Score</p>
                      <p className="text-xl font-bold text-slate-900">{userEval.managerScore.toFixed(1)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">/ 20</p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-slate-500 mb-1">HR Score</p>
                      <p className="text-xl font-bold text-slate-900">{userEval.hrScore.toFixed(1)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">/ 5</p>
                    </div>
                    <div className="text-center p-3 bg-slate-800 rounded-lg">
                      <p className="text-xs text-slate-300 mb-1">Total Score</p>
                      <p className="text-xl font-bold text-white">{userEval.totalScore.toFixed(1)}</p>
                      <p className="text-xs text-slate-400 mt-0.5">/ 25</p>
                    </div>
                  </div>
                )}

                {userKpis.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Assigned KPIs</h4>
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
                          {userKpis.map((kpi) => (
                            <tr key={kpi.id} className="hover:bg-slate-50">
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

            {/* Edit User Modal */}
            {editingUserId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditingUserId(null)}>
                <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg mx-4 p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-900">Edit User</h3>
                    <button
                      onClick={() => setEditingUserId(null)}
                      className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editUserName}
                        onChange={(e) => setEditUserName(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editUserEmail}
                        onChange={(e) => setEditUserEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
                        <select
                          value={editUserRole}
                          onChange={(e) => setEditUserRole(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                        >
                          <option value="employee">Employee</option>
                          <option value="manager">Manager</option>
                          <option value="hr">HR</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
                        <select
                          value={editUserDept}
                          onChange={(e) => setEditUserDept(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                        >
                          <option>Engineering</option>
                          <option>Marketing</option>
                          <option>Sales</option>
                          <option>Human Resources</option>
                          <option>IT</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Job Title</label>
                      <input
                        type="text"
                        value={editUserJobTitle}
                        onChange={(e) => setEditUserJobTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                      />
                    </div>
                    {editUserSuccess && (
                      <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <span className="w-5 h-5 flex items-center justify-center text-emerald-600">
                          <i className="ri-check-line"></i>
                        </span>
                        <p className="text-xs font-medium text-emerald-700">User edited successfully!</p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => {
                        if (!editUserName.trim() || !editUserEmail.trim()) {
                          alert("Please fill in required fields.");
                          return;
                        }
                        setEditUserSuccess(true);
                        setTimeout(() => {
                          setEditUserSuccess(false);
                          setEditingUserId(null);
                        }, 2000);
                      }}
                      className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingUserId(null)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Delete User Confirmation Modal */}
            {showDeleteUserConfirm && deleteUserId && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDeleteUserConfirm(false)}>
                <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-sm mx-4 p-5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="w-10 h-10 flex items-center justify-center bg-red-50 rounded-full text-red-600">
                      <i className="ri-alert-line"></i>
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">Delete User?</h3>
                      <p className="text-xs text-slate-500">This action cannot be undone.</p>
                    </div>
                  </div>
                  {deleteUserSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg mb-3">
                      <span className="w-5 h-5 flex items-center justify-center text-emerald-600">
                        <i className="ri-check-line"></i>
                      </span>
                      <p className="text-xs font-medium text-emerald-700">User deleted successfully!</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setDeleteUserSuccess(true);
                        setTimeout(() => {
                          setDeleteUserSuccess(false);
                          setShowDeleteUserConfirm(false);
                          setDeleteUserId(null);
                        }, 2000);
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
                    >
                      Yes, Delete
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteUserConfirm(false);
                        setDeleteUserId(null);
                      }}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* KPIs Tab */}
        {activeTab === "kpis" && (
          <div id="section-kpis" className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">KPI Configuration</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Manage and configure key performance indicators</p>
                </div>
                <button
                  onClick={() => setShowNewKpi(!showNewKpi)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                >
                  <span className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-add-line"></i>
                  </span>
                  New KPI
                </button>
              </div>

              {showNewKpi && (
                <div className="mb-4 p-4 bg-slate-50 rounded-lg space-y-3">
                  <h4 className="text-sm font-semibold text-slate-900">Create New KPI</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">KPI Title</label>
                      <input
                        type="text"
                        value={newKpiTitle}
                        onChange={(e) => setNewKpiTitle(e.target.value)}
                        placeholder="e.g., Code Quality"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
                      <select
                        value={newKpiDept}
                        onChange={(e) => setNewKpiDept(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                      >
                        <option>Engineering</option>
                        <option>Marketing</option>
                        <option>Sales</option>
                        <option>All Departments</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Weight (%)</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={newKpiWeight}
                        onChange={(e) => setNewKpiWeight(e.target.value)}
                        placeholder="25"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Target Value</label>
                      <input
                        type="number"
                        value={newKpiTarget}
                        onChange={(e) => setNewKpiTarget(e.target.value)}
                        placeholder="e.g., 95"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={newKpiDesc}
                      onChange={(e) => setNewKpiDesc(e.target.value)}
                      placeholder="Describe what this KPI measures..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
                    />
                  </div>
                  {createKpiSuccess && (
                    <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <span className="w-5 h-5 flex items-center justify-center text-emerald-600">
                        <i className="ri-check-line"></i>
                      </span>
                      <p className="text-xs font-medium text-emerald-700">KPI created successfully!</p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!newKpiTitle.trim() || !newKpiWeight.trim() || !newKpiTarget.trim()) {
                          alert("Please fill in all required fields.");
                          return;
                        }
                        setCreateKpiSuccess(true);
                        setTimeout(() => {
                          setCreateKpiSuccess(false);
                          setNewKpiTitle("");
                          setNewKpiDept("Engineering");
                          setNewKpiWeight("");
                          setNewKpiTarget("");
                          setNewKpiDesc("");
                          setShowNewKpi(false);
                        }, 2000);
                      }}
                      className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                    >
                      Create KPI
                    </button>
                    <button
                      onClick={() => {
                        setShowNewKpi(false);
                        setCreateKpiSuccess(false);
                        setNewKpiTitle("");
                        setNewKpiWeight("");
                        setNewKpiTarget("");
                        setNewKpiDesc("");
                      }}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* KPIs by Department */}
            {["Engineering", "Marketing", "Sales"].map((dept) => {
              const deptKpis = kpis.filter((k) => {
                const emp = users.find((u) => u.id === k.employeeId);
                return emp?.department === dept;
              });
              if (deptKpis.length === 0) return null;
              return (
                <div key={dept} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="p-4 border-b border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900">{dept} KPIs</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50">
                          <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">KPI</th>
                          <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Weight</th>
                          <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Target</th>
                          <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Employee</th>
                          <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {deptKpis.map((kpi) => {
                          const emp = users.find((u) => u.id === kpi.employeeId);
                          return (
                            <tr key={kpi.id} className="hover:bg-slate-50">
                              <td className="py-3 px-4">
                                <p className="font-medium text-slate-900">{kpi.title}</p>
                                <p className="text-xs text-slate-500">{kpi.description}</p>
                              </td>
                              <td className="py-3 px-4 text-center text-slate-700">{kpi.weight}%</td>
                              <td className="py-3 px-4 text-center text-slate-700">{kpi.target}</td>
                              <td className="py-3 px-4 text-center">
                                <span className="text-xs text-slate-600">{emp?.name}</span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingKpiId(kpi.id);
                                      setEditKpiTitle(kpi.title);
                                      setEditKpiDept(emp?.department || "Engineering");
                                      setEditKpiWeight(String(kpi.weight));
                                      setEditKpiTarget(String(kpi.target));
                                      setEditKpiDesc(kpi.description);
                                      setEditKpiSuccess(false);
                                    }}
                                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                                  >
                                    <i className="ri-edit-line"></i>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDeleteKpiId(kpi.id);
                                      setShowDeleteKpiConfirm(true);
                                      setDeleteKpiSuccess(false);
                                    }}
                                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
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
                </div>
              );
            })}
          </div>
        )}

        {/* Edit KPI Modal */}
        {editingKpiId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setEditingKpiId(null)}>
            <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg mx-4 p-5 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Edit KPI</h3>
                <button
                  onClick={() => setEditingKpiId(null)}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  <i className="ri-close-line"></i>
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">KPI Title</label>
                  <input
                    type="text"
                    value={editKpiTitle}
                    onChange={(e) => setEditKpiTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Department</label>
                    <select
                      value={editKpiDept}
                      onChange={(e) => setEditKpiDept(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                    >
                      <option>Engineering</option>
                      <option>Marketing</option>
                      <option>Sales</option>
                      <option>All Departments</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Weight (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={editKpiWeight}
                      onChange={(e) => setEditKpiWeight(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Target Value</label>
                  <input
                    type="number"
                    value={editKpiTarget}
                    onChange={(e) => setEditKpiTarget(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={editKpiDesc}
                    onChange={(e) => setEditKpiDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
                  />
                </div>
                {editKpiSuccess && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="w-5 h-5 flex items-center justify-center text-emerald-600">
                      <i className="ri-check-line"></i>
                    </span>
                    <p className="text-xs font-medium text-emerald-700">KPI edited successfully!</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-200">
                <button
                  onClick={() => {
                    if (!editKpiTitle.trim() || !editKpiWeight.trim() || !editKpiTarget.trim()) {
                      alert("Please fill in all required fields.");
                      return;
                    }
                    setEditKpiSuccess(true);
                    setTimeout(() => {
                      setEditKpiSuccess(false);
                      setEditingKpiId(null);
                    }, 2000);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingKpiId(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete KPI Confirmation Modal */}
        {showDeleteKpiConfirm && deleteKpiId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDeleteKpiConfirm(false)}>
            <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-sm mx-4 p-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 flex items-center justify-center bg-red-50 rounded-full text-red-600">
                  <i className="ri-alert-line"></i>
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Delete KPI?</h3>
                  <p className="text-xs text-slate-500">This action cannot be undone.</p>
                </div>
              </div>
              {deleteKpiSuccess && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg mb-3">
                  <span className="w-5 h-5 flex items-center justify-center text-emerald-600">
                    <i className="ri-check-line"></i>
                  </span>
                  <p className="text-xs font-medium text-emerald-700">KPI deleted successfully!</p>
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setDeleteKpiSuccess(true);
                    setTimeout(() => {
                      setDeleteKpiSuccess(false);
                      setShowDeleteKpiConfirm(false);
                      setDeleteKpiId(null);
                    }, 2000);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteKpiConfirm(false);
                    setDeleteKpiId(null);
                  }}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Analytics Tab */}
        {activeTab === "ai_analytics" && (
          <div id="section-ai" className="space-y-6">
            {/* 1. Performance Prediction */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white">
                  <i className="ri-sparkling-line"></i>
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Performance Prediction</h2>
                  <p className="text-xs text-slate-500">Organization-wide performance forecasting</p>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={quarterlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="quarter" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis domain={[15, 26]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }} />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Line type="monotone" dataKey="actual" stroke="#334155" strokeWidth={2} dot={{ fill: "#334155", r: 4 }} name="Actual" connectNulls={false} />
                    <Line type="monotone" dataKey="predicted" stroke="#22c55e" strokeWidth={2} strokeDasharray="6 4" dot={{ fill: "#22c55e", r: 4 }} name="AI Predicted" connectNulls={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Clustering Analytics */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white">
                  <i className="ri-sparkling-line"></i>
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Clustering Analytics</h2>
                  <p className="text-xs text-slate-500">Overall workforce performance distribution</p>
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
                {/* Category Breakdown */}
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
                            {emp?.name} &mdash; {e.totalScore.toFixed(1)}
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
                            {emp?.name} &mdash; {e.totalScore.toFixed(1)}
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
                            {emp?.name} &mdash; {e.totalScore.toFixed(1)}
                          </span>
                        );
                      })}
                      {atRisk.length === 0 && <span className="text-xs text-slate-500">No employees in this category.</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Bias Detection */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white">
                    <i className="ri-sparkling-line"></i>
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Bias Detection</h2>
                    <p className="text-xs text-slate-500">Manager scoring anomaly detection</p>
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
                    {biasDetections.map((bias) => (
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

            {/* 4. KPI Optimization */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white">
                  <i className="ri-sparkling-line"></i>
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">KPI Optimization</h2>
                  <p className="text-xs text-slate-500">AI-based KPI effectiveness and weight optimization</p>
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

            {/* 5. AI Learning Status */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white">
                  <i className="ri-sparkling-line"></i>
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">AI Learning Status</h2>
                  <p className="text-xs text-slate-500">AI model training status, dataset size, model accuracy</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Model Status */}
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-emerald-100 rounded-md text-emerald-600">
                      <i className="ri-check-line"></i>
                    </span>
                    <span className="text-xs font-medium text-slate-500">Model Status</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{aiModelStats.status}</p>
                  <p className="text-xs text-slate-500 mt-1">Last trained: {aiModelStats.lastTrained}</p>
                </div>
                {/* Dataset Size */}
                <div className="p-4 bg-sky-50 rounded-lg border border-sky-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-sky-100 rounded-md text-sky-600">
                      <i className="ri-database-2-line"></i>
                    </span>
                    <span className="text-xs font-medium text-slate-500">Dataset Size</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{aiModelStats.datasetSize.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">Evaluation records analyzed</p>
                </div>
                {/* Model Accuracy */}
                <div className="p-4 bg-violet-50 rounded-lg border border-violet-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-violet-100 rounded-md text-violet-600">
                      <i className="ri-bard-line"></i>
                    </span>
                    <span className="text-xs font-medium text-slate-500">Model Accuracy</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{aiModelStats.accuracy}%</p>
                  <p className="text-xs text-slate-500 mt-1">Cross-validated accuracy</p>
                </div>
                {/* Confidence */}
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-amber-100 rounded-md text-amber-600">
                      <i className="ri-fingerprint-line"></i>
                    </span>
                    <span className="text-xs font-medium text-slate-500">Prediction Confidence</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{aiModelStats.confidence}%</p>
                  <p className="text-xs text-slate-500 mt-1">Average prediction confidence</p>
                </div>
                {/* Predictions Made */}
                <div className="p-4 bg-rose-50 rounded-lg border border-rose-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-rose-100 rounded-md text-rose-600">
                      <i className="ri-lightbulb-line"></i>
                    </span>
                    <span className="text-xs font-medium text-slate-500">Predictions Made</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{aiModelStats.predictionsMade.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">Total predictions generated</p>
                </div>
                {/* Next Retrain */}
                <div className="p-4 bg-teal-50 rounded-lg border border-teal-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-teal-100 rounded-md text-teal-600">
                      <i className="ri-calendar-line"></i>
                    </span>
                    <span className="text-xs font-medium text-slate-500">Next Retrain</span>
                  </div>
                  <p className="text-lg font-bold text-slate-900">{aiModelStats.nextRetrain}</p>
                  <p className="text-xs text-slate-500 mt-1">Scheduled automatic retrain</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div id="section-reports" className="space-y-6">
            {/* Export Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Evaluation Reports</h2>
                <p className="text-xs text-slate-500 mt-0.5">Q1 2026 cycle summary and exports</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setShowExportModal(true); setExportSuccess(false); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                >
                  <span className="w-4 h-4 flex items-center justify-center">
                    <i className="ri-download-line"></i>
                  </span>
                  Export Report
                </button>
              </div>
            </div>

            {/* Export Modal */}
            {showExportModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowExportModal(false)}>
                <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md mx-4 p-5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white">
                        <i className="ri-download-line"></i>
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Export Report</h3>
                        <p className="text-xs text-slate-500">Download evaluation summary</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowExportModal(false)}
                      className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Format Selection */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-2">Export Format</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setExportFormat("pdf")}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-colors ${
                            exportFormat === "pdf"
                              ? "bg-slate-800 text-white border-slate-800"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <span className="w-4 h-4 flex items-center justify-center"><i className="ri-file-pdf-line"></i></span>
                          PDF Document
                        </button>
                        <button
                          onClick={() => setExportFormat("excel")}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-xs font-medium transition-colors ${
                            exportFormat === "excel"
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <span className="w-4 h-4 flex items-center justify-center"><i className="ri-file-excel-line"></i></span>
                          Excel Spreadsheet
                        </button>
                      </div>
                    </div>

                    {/* Scope Selection */}
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-2">Report Scope</label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                          <input
                            type="radio"
                            name="exportScope"
                            checked={exportScope === "all"}
                            onChange={() => setExportScope("all")}
                            className="w-4 h-4 accent-slate-800"
                          />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-slate-900">All Employees</p>
                            <p className="text-xs text-slate-500">{evaluations.length} evaluations across all departments</p>
                          </div>
                        </label>
                        <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                          <input
                            type="radio"
                            name="exportScope"
                            checked={exportScope === "flagged"}
                            onChange={() => setExportScope("flagged")}
                            className="w-4 h-4 accent-slate-800"
                          />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-slate-900">Flagged Employees Only</p>
                            <p className="text-xs text-slate-500">Employees with open bias detections</p>
                          </div>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            {openBias.length} flagged
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Success Message */}
                    {exportSuccess && (
                      <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <span className="w-5 h-5 flex items-center justify-center text-emerald-600"><i className="ri-check-line"></i></span>
                        <p className="text-xs font-medium text-emerald-700">Report generated successfully! Check your downloads.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-5 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => {
                        setIsExporting(true);
                        setTimeout(() => {
                          setIsExporting(false);
                          setExportSuccess(true);
                          if (exportFormat === "pdf") {
                            const scopeEvals = exportScope === "flagged"
                              ? evaluations.filter((ev) => {
                                  const emp = users.find((u) => u.id === ev.employeeId);
                                  return biasDetections.some(
                                    (b) => b.affectedEmployees.includes(emp?.name || "") && b.status !== "resolved"
                                  );
                                })
                              : evaluations;
                            const empData = scopeEvals.map((ev) => {
                              const emp = users.find((u) => u.id === ev.employeeId);
                              const hasBias = biasDetections.some(
                                (b) => b.affectedEmployees.includes(emp?.name || "") && b.status !== "resolved"
                              );
                              return {
                                name: emp?.name || "Unknown",
                                department: emp?.department || "-",
                                jobTitle: emp?.jobTitle || "-",
                                managerScore: ev.managerScore.toFixed(1),
                                hrScore: ev.hrScore.toFixed(1),
                                totalScore: ev.totalScore.toFixed(1),
                                competencyScores: Object.entries(ev.competencyScores).map(([k, v]) => `${k}: ${v}`).join(", "),
                                biasFlag: hasBias ? "Yes" : "No",
                              };
                            });
                            const html = `<!DOCTYPE html>
<html><head><title>Evaluation Summary Report - Q1 2026</title>
<style>body{font-family:Arial,sans-serif;margin:40px;color:#1e293b}h1{font-size:24px;margin-bottom:8px}.meta{font-size:12px;color:#64748b;margin-bottom:24px}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#f1f5f9;text-align:left;padding:10px 8px;border-bottom:2px solid #cbd5e1;font-weight:600}td{padding:10px 8px;border-bottom:1px solid #e2e8f0}.score{font-weight:600}.flag{color:#d97706;font-weight:600}.footer{margin-top:24px;font-size:11px;color:#94a3b8}</style>
</head><body><h1>Evaluation Summary Report</h1><div class="meta">Quarter: Q1 2026 &nbsp;|&nbsp; Generated: ${new Date().toLocaleDateString()} &nbsp;|&nbsp; Total Employees: ${empData.length}${exportScope === "flagged" ? " (Flagged Only)" : ""}</div>
<table><thead><tr><th>Employee</th><th>Department</th><th>Role</th><th>Manager Score</th><th>HR Score</th><th>Total Score</th><th>Bias Flag</th></tr></thead><tbody>
${empData.map((e) => `<tr><td>${e.name}</td><td>${e.department}</td><td>${e.jobTitle}</td><td class="score">${e.managerScore}</td><td class="score">${e.hrScore}</td><td class="score">${e.totalScore}</td><td>${e.biasFlag === "Yes" ? '<span class="flag">Flagged</span>' : "-"}</td></tr>`).join("")}
</tbody></table><div class="footer">Average Total Score: ${(scopeEvals.reduce((sum, e) => sum + e.totalScore, 0) / (scopeEvals.length || 1)).toFixed(1)} / 25 &nbsp;|&nbsp; Completion: 100% &nbsp;|&nbsp; Open Bias Flags: ${openBias.length}</div></body></html>`;
                            const blob = new Blob([html], { type: "text/html" });
                            const url = URL.createObjectURL(blob);
                            const win = window.open(url, "_blank");
                            if (win) win.onload = () => win.print();
                            URL.revokeObjectURL(url);
                          } else {
                            const scopeEvals = exportScope === "flagged"
                              ? evaluations.filter((ev) => {
                                  const emp = users.find((u) => u.id === ev.employeeId);
                                  return biasDetections.some(
                                    (b) => b.affectedEmployees.includes(emp?.name || "") && b.status !== "resolved"
                                  );
                                })
                              : evaluations;
                            const headers = ["Employee", "Department", "Job Title", "Manager Score", "HR Score", "Total Score", "Competencies", "Bias Flag"];
                            const rows = scopeEvals.map((ev) => {
                              const emp = users.find((u) => u.id === ev.employeeId);
                              const hasBias = biasDetections.some(
                                (b) => b.affectedEmployees.includes(emp?.name || "") && b.status !== "resolved"
                              );
                              return [
                                emp?.name || "Unknown",
                                emp?.department || "",
                                emp?.jobTitle || "",
                                ev.managerScore.toFixed(1),
                                ev.hrScore.toFixed(1),
                                ev.totalScore.toFixed(1),
                                Object.entries(ev.competencyScores).map(([k, v]) => `${k}=${v}`).join("; "),
                                hasBias ? "Yes" : "No",
                              ];
                            });
                            const csvContent = [
                              headers.join(","),
                              ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")),
                              "",
                              `"Generated","${new Date().toLocaleDateString()}"`,
                              `"Scope","${exportScope === "flagged" ? "Flagged Only" : "All Employees"}"`,
                              `"Average Total Score","${(scopeEvals.reduce((sum, e) => sum + e.totalScore, 0) / (scopeEvals.length || 1)).toFixed(1)} / 25"`,
                              `"Completion Rate","100%"`,
                              `"Open Bias Flags","${openBias.length}"`,
                            ].join("\n");
                            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                            const link = document.createElement("a");
                            link.href = URL.createObjectURL(blob);
                            link.download = `evaluation_summary_${exportScope}_${new Date().toISOString().split("T")[0]}.csv`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(link.href);
                          }
                        }, 1200);
                      }}
                      disabled={isExporting}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                        exportFormat === "excel"
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-slate-800 text-white hover:bg-slate-700"
                      } ${isExporting ? "opacity-70 cursor-not-allowed" : ""}`}
                    >
                      {isExporting ? (
                        <>
                          <span className="w-4 h-4 flex items-center justify-center animate-spin">
                            <i className="ri-loader-4-line"></i>
                          </span>
                          Generating...
                        </>
                      ) : (
                        <>
                          <span className="w-4 h-4 flex items-center justify-center">
                            <i className={exportFormat === "pdf" ? "ri-file-pdf-line" : "ri-file-excel-line"}></i>
                          </span>
                          Export as {exportFormat === "pdf" ? "PDF" : "Excel"}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setShowExportModal(false)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Score Distribution by Department */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-8 h-8 flex items-center justify-center bg-slate-800 rounded-lg text-white">
                  <i className="ri-bar-chart-grouped-line"></i>
                </span>
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Score Distribution by Department</h2>
                  <p className="text-xs text-slate-500">Manager + HR scores across departments</p>
                </div>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      {
                        department: "Engineering",
                        manager: evaluations.filter((e) => {
                          const u = users.find((u) => u.id === e.employeeId);
                          return u?.department === "Engineering";
                        }).reduce((sum, e) => sum + e.managerScore, 0) / evaluations.filter((e) => { const u = users.find((u) => u.id === e.employeeId); return u?.department === "Engineering"; }).length,
                        hr: evaluations.filter((e) => {
                          const u = users.find((u) => u.id === e.employeeId);
                          return u?.department === "Engineering";
                        }).reduce((sum, e) => sum + e.hrScore, 0) / evaluations.filter((e) => { const u = users.find((u) => u.id === e.employeeId); return u?.department === "Engineering"; }).length,
                      },
                      {
                        department: "Marketing",
                        manager: evaluations.filter((e) => {
                          const u = users.find((u) => u.id === e.employeeId);
                          return u?.department === "Marketing";
                        }).reduce((sum, e) => sum + e.managerScore, 0) / evaluations.filter((e) => { const u = users.find((u) => u.id === e.employeeId); return u?.department === "Marketing"; }).length,
                        hr: evaluations.filter((e) => {
                          const u = users.find((u) => u.id === e.employeeId);
                          return u?.department === "Marketing";
                        }).reduce((sum, e) => sum + e.hrScore, 0) / evaluations.filter((e) => { const u = users.find((u) => u.id === e.employeeId); return u?.department === "Marketing"; }).length,
                      },
                      {
                        department: "Sales",
                        manager: evaluations.filter((e) => {
                          const u = users.find((u) => u.id === e.employeeId);
                          return u?.department === "Sales";
                        }).reduce((sum, e) => sum + e.managerScore, 0) / evaluations.filter((e) => { const u = users.find((u) => u.id === e.employeeId); return u?.department === "Sales"; }).length,
                        hr: evaluations.filter((e) => {
                          const u = users.find((u) => u.id === e.employeeId);
                          return u?.department === "Sales";
                        }).reduce((sum, e) => sum + e.hrScore, 0) / evaluations.filter((e) => { const u = users.find((u) => u.id === e.employeeId); return u?.department === "Sales"; }).length,
                      },
                      {
                        department: "HR",
                        manager: evaluations.filter((e) => {
                          const u = users.find((u) => u.id === e.employeeId);
                          return u?.department === "Human Resources";
                        }).reduce((sum, e) => sum + e.managerScore, 0) / evaluations.filter((e) => { const u = users.find((u) => u.id === e.employeeId); return u?.department === "Human Resources"; }).length,
                        hr: evaluations.filter((e) => {
                          const u = users.find((u) => u.id === e.employeeId);
                          return u?.department === "Human Resources";
                        }).reduce((sum, e) => sum + e.hrScore, 0) / evaluations.filter((e) => { const u = users.find((u) => u.id === e.employeeId); return u?.department === "Human Resources"; }).length,
                      },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="department" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                    <YAxis domain={[0, 20]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => value.toFixed(2)}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar dataKey="manager" name="Manager Score" fill="#334155" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="hr" name="HR Score" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* All Evaluations Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-900">All Evaluations</h2>
                <p className="text-xs text-slate-500 mt-0.5">Q1 2026 cycle &mdash; {evaluations.length} total evaluations</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Employee</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500">Department</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Manager Score</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">HR Score</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Total Score</th>
                      <th className="text-center py-3 px-4 text-xs font-medium text-slate-500">Bias Flag</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {evaluations.map((evalItem) => {
                      const emp = users.find((u) => u.id === evalItem.employeeId);
                      const hasBias = biasDetections.some(
                        (b) =>
                          b.affectedEmployees.includes(emp?.name || "") &&
                          b.status !== "resolved"
                      );
                      return (
                        <tr key={evalItem.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <img src={emp?.avatar} alt={emp?.name} className="w-8 h-8 rounded-full object-cover" />
                              <span className="font-medium text-slate-900">{emp?.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600">{emp?.department}</td>
                          <td className="py-3 px-4 text-center text-slate-700 font-medium">{evalItem.managerScore.toFixed(1)}</td>
                          <td className="py-3 px-4 text-center text-slate-700 font-medium">{evalItem.hrScore.toFixed(1)}</td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                evalItem.totalScore >= 22
                                  ? "bg-emerald-100 text-emerald-700"
                                  : evalItem.totalScore >= 19
                                    ? "bg-sky-100 text-sky-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {evalItem.totalScore.toFixed(1)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {hasBias ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                <i className="ri-error-warning-line"></i> Flagged
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">&mdash;</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Evaluation Completion Rate */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 flex items-center justify-center bg-emerald-50 rounded-md text-emerald-600">
                    <i className="ri-check-double-line"></i>
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">Completion Rate</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">100%</p>
                <p className="text-xs text-slate-500 mt-1">{evaluations.length} of {users.filter((u) => u.role === "employee").length} employees evaluated</p>
                <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "100%" }}></div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 flex items-center justify-center bg-sky-50 rounded-md text-sky-600">
                    <i className="ri-star-line"></i>
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">Average Score</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {(evaluations.reduce((sum, e) => sum + e.totalScore, 0) / evaluations.length).toFixed(1)}
                </p>
                <p className="text-xs text-slate-500 mt-1">Across all departments</p>
                <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{
                      width: `${Math.min(100, ((evaluations.reduce((sum, e) => sum + e.totalScore, 0) / evaluations.length) / 25) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 flex items-center justify-center bg-amber-50 rounded-md text-amber-600">
                    <i className="ri-error-warning-line"></i>
                  </span>
                  <h3 className="text-sm font-semibold text-slate-900">Bias Flags</h3>
                </div>
                <p className="text-2xl font-bold text-slate-900">{openBias.length}</p>
                <p className="text-xs text-slate-500 mt-1">{resolvedBias.length} resolved in total</p>
                <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${biasDetections.length ? (openBias.length / biasDetections.length) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div id="section-settings" className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
              <h2 className="text-sm font-semibold text-slate-900 mb-4">System Settings</h2>

              <div className="space-y-5">
                {/* Evaluation Cycle */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-medium text-slate-900">Evaluation Cycle</h3>
                      <p className="text-xs text-slate-500">Configure quarterly evaluation periods</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      Active
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Current Quarter</label>
                      <select
                        value={settingsQuarter}
                        onChange={(e) => setSettingsQuarter(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                      >
                        <option>Q1 2026</option>
                        <option>Q2 2026</option>
                        <option>Q3 2026</option>
                        <option>Q4 2026</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Evaluation Deadline</label>
                      <input
                        type="date"
                        value={settingsDeadline}
                        onChange={(e) => setSettingsDeadline(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Scoring Configuration */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="text-sm font-medium text-slate-900 mb-3">Scoring Configuration</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Manager Score Max</label>
                      <input
                        type="number"
                        value={settingsManagerMax}
                        onChange={(e) => setSettingsManagerMax(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">HR Score Max</label>
                      <input
                        type="number"
                        value={settingsHrMax}
                        onChange={(e) => setSettingsHrMax(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* AI Features */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="text-sm font-medium text-slate-900 mb-3">AI Features</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Performance Prediction", desc: "AI-powered future performance forecasting", enabled: true },
                      { label: "Bias Detection", desc: "Automatically detect scoring inconsistencies", enabled: true },
                      { label: "AI Feedback Generation", desc: "Generate automated performance summaries", enabled: true },
                      { label: "KPI Optimization", desc: "Dynamically adjust KPI weights based on data", enabled: false },
                    ].map((feature) => (
                      <div key={feature.label} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{feature.label}</p>
                          <p className="text-xs text-slate-500">{feature.desc}</p>
                        </div>
                        <button
                          className={`relative w-11 h-6 rounded-full transition-colors ${
                            feature.enabled ? "bg-slate-800" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              feature.enabled ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notifications */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h3 className="text-sm font-medium text-slate-900 mb-3">Notification Settings</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Evaluation Reminders", desc: "Send reminders before evaluation deadlines", enabled: true },
                      { label: "Bias Alerts", desc: "Notify admins when bias is detected", enabled: true },
                      { label: "Survey Notifications", desc: "Alert employees about new surveys", enabled: true },
                      { label: "Score Change Alerts", desc: "Notify when scores are modified after submission", enabled: true },
                    ].map((notif) => (
                      <div key={notif.label} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{notif.label}</p>
                          <p className="text-xs text-slate-500">{notif.desc}</p>
                        </div>
                        <button
                          className={`relative w-11 h-6 rounded-full transition-colors ${
                            notif.enabled ? "bg-slate-800" : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              notif.enabled ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4 mt-4 border-t border-slate-200">
                {saveSettingsSuccess && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg mr-auto">
                    <span className="w-5 h-5 flex items-center justify-center text-emerald-600">
                      <i className="ri-check-line"></i>
                    </span>
                    <p className="text-xs font-medium text-emerald-700">Settings saved successfully!</p>
                  </div>
                )}
                <button
                  onClick={() => {
                    setSaveSettingsSuccess(true);
                    setTimeout(() => setSaveSettingsSuccess(false), 2500);
                  }}
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                >
                  Save Settings
                </button>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  Reset to Default
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reset to Default Confirmation Modal */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowResetConfirm(false)}>
            <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-sm mx-4 p-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <span className="w-10 h-10 flex items-center justify-center bg-amber-50 rounded-full text-amber-600">
                  <i className="ri-refresh-line"></i>
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Reset Settings?</h3>
                  <p className="text-xs text-slate-500">All settings will revert to default values.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSettingsQuarter("Q1 2026");
                    setSettingsDeadline("2026-04-30");
                    setSettingsManagerMax(20);
                    setSettingsHrMax(5);
                    setShowResetConfirm(false);
                    setSaveSettingsSuccess(true);
                    setTimeout(() => setSaveSettingsSuccess(false), 2500);
                  }}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors whitespace-nowrap"
                >
                  Yes, Reset
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
