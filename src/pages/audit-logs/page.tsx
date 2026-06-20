import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { users } from "@/mocks/users";
import { auditLogs } from "@/mocks/auditLogs";

const adminUser = users.find((u) => u.role === "admin")!;

const actionLabels: Record<string, string> = {
  evaluation_submitted: "Evaluation Submitted",
  kpi_updated: "KPI Updated",
  score_changed: "Score Changed",
  user_created: "User Created",
  survey_created: "Survey Created",
  announcement_posted: "Announcement Posted",
  survey_response: "Survey Response",
  user_role_changed: "Role Changed",
  kpi_created: "KPI Created",
};

const actionIcons: Record<string, string> = {
  evaluation_submitted: "ri-check-double-line",
  kpi_updated: "ri-bar-chart-box-line",
  score_changed: "ri-star-line",
  user_created: "ri-user-add-line",
  survey_created: "ri-survey-line",
  announcement_posted: "ri-megaphone-line",
  survey_response: "ri-questionnaire-line",
  user_role_changed: "ri-shield-user-line",
  kpi_created: "ri-add-circle-line",
};

const severityStyles: Record<string, { bg: string; text: string; dot: string }> = {
  info: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
  warning: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  critical: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};

export default function AuditLogsPage() {
  const [filterAction, setFilterAction] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<string | null>(null);

  const filteredLogs = auditLogs
    .filter((log) => {
      const matchesAction = filterAction === "all" || log.action === filterAction;
      const matchesSeverity = filterSeverity === "all" || log.severity === filterSeverity;
      const matchesSearch =
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesAction && matchesSeverity && matchesSearch;
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const selectedLogData = selectedLog ? auditLogs.find((l) => l.id === selectedLog) : null;

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const uniqueActions = Array.from(new Set(auditLogs.map((l) => l.action)));

  return (
    <DashboardLayout
      role="admin"
      userName={adminUser.name}
      userAvatar={adminUser.avatar}
      userRole={adminUser.jobTitle}
    >
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track all system changes, evaluations, and user actions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Total Events</span>
              <span className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600">
                <i className="ri-file-list-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{auditLogs.length}</p>
            <p className="text-xs text-slate-400 mt-1">Last 30 days</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Evaluations</span>
              <span className="w-8 h-8 flex items-center justify-center bg-sky-50 rounded-lg text-sky-600">
                <i className="ri-check-double-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {auditLogs.filter((l) => l.action === "evaluation_submitted").length}
            </p>
            <p className="text-xs text-slate-400 mt-1">Submitted</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Score Changes</span>
              <span className="w-8 h-8 flex items-center justify-center bg-amber-50 rounded-lg text-amber-600">
                <i className="ri-star-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {auditLogs.filter((l) => l.action === "score_changed").length}
            </p>
            <p className="text-xs text-slate-400 mt-1">Modified after submission</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Warnings</span>
              <span className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-lg text-red-600">
                <i className="ri-error-warning-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {auditLogs.filter((l) => l.severity === "warning").length}
            </p>
            <p className="text-xs text-slate-400 mt-1">Require attention</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-slate-400">
                <i className="ri-search-line"></i>
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by user, target, or details..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
              />
            </div>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {actionLabels[action] || action}
                </option>
              ))}
            </select>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
            >
              <option value="all">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Logs Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Activity Timeline ({filteredLogs.length} events)
            </h2>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap">
              <span className="w-4 h-4 flex items-center justify-center">
                <i className="ri-download-line"></i>
              </span>
              Export Logs
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const sev = severityStyles[log.severity] || severityStyles.info;
              return (
                <div
                  key={log.id}
                  className="p-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedLog(selectedLog === log.id ? null : log.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${sev.bg} flex-shrink-0`}>
                      <span className={`w-5 h-5 flex items-center justify-center ${sev.text}`}>
                        <i className={actionIcons[log.action] || "ri-file-list-line"}></i>
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {actionLabels[log.action] || log.action}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {log.user} ({log.userRole}) &rarr; {log.target}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 ml-3">
                          <p className="text-xs text-slate-500">{formatDate(log.timestamp)}</p>
                          <p className="text-xs text-slate-400">{formatTime(log.timestamp)}</p>
                        </div>
                      </div>

                      <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{log.details}</p>

                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sev.bg} ${sev.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`}></span>
                          {log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}
                        </span>
                        <span className="text-xs text-slate-400">{log.targetType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {selectedLog === log.id && (
                    <div className="mt-3 ml-13 p-3 bg-slate-50 rounded-lg">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500">Action ID:</span>
                          <span className="ml-1 text-slate-700 font-mono">{log.id}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Timestamp:</span>
                          <span className="ml-1 text-slate-700">{log.timestamp}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Performed By:</span>
                          <span className="ml-1 text-slate-700">{log.user} ({log.userRole})</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Target Type:</span>
                          <span className="ml-1 text-slate-700">{log.targetType}</span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <span className="text-slate-500">Full Details:</span>
                        <p className="text-slate-700 mt-0.5">{log.details}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {filteredLogs.length === 0 && (
            <div className="p-8 text-center">
              <span className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-full text-slate-400 mx-auto mb-3">
                <i className="ri-file-list-line text-xl"></i>
              </span>
              <p className="text-sm text-slate-500">No audit logs match your filters</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
