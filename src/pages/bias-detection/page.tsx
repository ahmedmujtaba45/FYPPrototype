import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { users } from "@/mocks/users";
import { biasDetections } from "@/mocks/biasDetection";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const adminUser = users.find((u) => u.role === "admin")!;

const severityConfig: Record<string, { bg: string; text: string; border: string; icon: string }> = {
  high: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-200",
    icon: "ri-error-warning-line",
  },
  medium: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: "ri-alert-line",
  },
  low: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    icon: "ri-information-line",
  },
};

const typeLabels: Record<string, string> = {
  score_variance: "Score Variance",
  leniency_bias: "Leniency Bias",
  recency_bias: "Recency Bias",
  halo_effect: "Halo Effect",
  contrast_bias: "Contrast Bias",
};

const statusConfig: Record<string, { bg: string; text: string }> = {
  open: { bg: "bg-red-100", text: "text-red-700" },
  investigating: { bg: "bg-amber-100", text: "text-amber-700" },
  resolved: { bg: "bg-emerald-100", text: "text-emerald-700" },
};

const severityDistribution = [
  { severity: "High", count: biasDetections.filter((b) => b.severity === "high").length },
  { severity: "Medium", count: biasDetections.filter((b) => b.severity === "medium").length },
  { severity: "Low", count: biasDetections.filter((b) => b.severity === "low").length },
];

const typeDistribution = [
  { type: "Score Variance", count: biasDetections.filter((b) => b.type === "score_variance").length },
  { type: "Leniency Bias", count: biasDetections.filter((b) => b.type === "leniency_bias").length },
  { type: "Recency Bias", count: biasDetections.filter((b) => b.type === "recency_bias").length },
  { type: "Halo Effect", count: biasDetections.filter((b) => b.type === "halo_effect").length },
  { type: "Contrast Bias", count: biasDetections.filter((b) => b.type === "contrast_bias").length },
];

export default function BiasDetectionPage() {
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBias, setSelectedBias] = useState<string | null>(null);
  const [detailModalBiasId, setDetailModalBiasId] = useState<string | null>(null);

  const filteredBiases = biasDetections.filter((bias) => {
    const matchesSeverity = filterSeverity === "all" || bias.severity === filterSeverity;
    const matchesStatus = filterStatus === "all" || bias.status === filterStatus;
    return matchesSeverity && matchesStatus;
  });

  const selectedBiasData = selectedBias ? biasDetections.find((b) => b.id === selectedBias) : null;
  const detailBiasData = detailModalBiasId ? biasDetections.find((b) => b.id === detailModalBiasId) : null;

  const openCount = biasDetections.filter((b) => b.status === "open").length;
  const investigatingCount = biasDetections.filter((b) => b.status === "investigating").length;
  const resolvedCount = biasDetections.filter((b) => b.status === "resolved").length;

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
          <div className="flex items-center gap-3 mb-2">
            <span className="w-10 h-10 flex items-center justify-center bg-slate-800 rounded-lg text-white">
              <i className="ri-sparkling-line text-xl"></i>
            </span>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-slate-900">AI Bias Detection</h1>
              <p className="text-sm text-slate-500">
                AI-powered analysis of scoring inconsistencies and evaluation biases
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Total Detected</span>
              <span className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-lg text-slate-600">
                <i className="ri-error-warning-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{biasDetections.length}</p>
            <p className="text-xs text-slate-400 mt-1">Bias patterns found</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Open Issues</span>
              <span className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-lg text-red-600">
                <i className="ri-error-warning-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-red-600">{openCount}</p>
            <p className="text-xs text-red-500 mt-1">Require action</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Investigating</span>
              <span className="w-8 h-8 flex items-center justify-center bg-amber-50 rounded-lg text-amber-600">
                <i className="ri-search-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-amber-600">{investigatingCount}</p>
            <p className="text-xs text-amber-500 mt-1">Under review</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Resolved</span>
              <span className="w-8 h-8 flex items-center justify-center bg-emerald-50 rounded-lg text-emerald-600">
                <i className="ri-check-line"></i>
              </span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">{resolvedCount}</p>
            <p className="text-xs text-emerald-500 mt-1">Fixed issues</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Bias by Severity</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={severityDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="severity" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#334155" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Bias by Type</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis dataKey="type" type="category" tick={{ fontSize: 11 }} stroke="#94a3b8" width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="count" fill="#64748b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4">
          <div className="flex flex-wrap gap-3">
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
            >
              <option value="all">All Severities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Bias Detection Cards */}
        <div className="space-y-4">
          {filteredBiases.map((bias) => {
            const sev = severityConfig[bias.severity] || severityConfig.low;
            const status = statusConfig[bias.status] || statusConfig.open;
            return (
              <div
                key={bias.id}
                className={`bg-white rounded-xl border ${sev.border} overflow-hidden transition-colors hover:bg-slate-50`}
              >
                <div
                  className="p-4 md:p-5 cursor-pointer"
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.closest('button, a, input, select, textarea')) return;
                    setSelectedBias(selectedBias === bias.id ? null : bias.id);
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Severity Icon */}
                    <div className={`w-10 h-10 flex items-center justify-center rounded-lg ${sev.bg} flex-shrink-0`}>
                      <span className={`w-5 h-5 flex items-center justify-center ${sev.text}`}>
                        <i className={sev.icon}></i>
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-slate-900">{bias.title}</h3>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                              {bias.status.charAt(0).toUpperCase() + bias.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {typeLabels[bias.type] || bias.type} &middot; {bias.department} &middot; {bias.affectedCount} affected
                          </p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sev.bg} ${sev.text} flex-shrink-0 ml-2`}>
                          {bias.severity.charAt(0).toUpperCase() + bias.severity.slice(1)}
                        </span>
                      </div>

                      <p className="text-sm text-slate-600 mt-2 leading-relaxed">{bias.description}</p>

                      {/* Affected Employees */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {bias.affectedEmployees.map((empName) => {
                          const emp = users.find((u) => u.name === empName);
                          return (
                            <span
                              key={empName}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-md text-xs text-slate-700"
                            >
                              {emp && (
                                <img
                                  src={emp.avatar}
                                  alt={empName}
                                  className="w-4 h-4 rounded-full object-cover"
                                />
                              )}
                              {empName}
                            </span>
                          );
                        })}
                      </div>

                      {/* Metrics */}
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 flex items-center justify-center">
                            <i className="ri-bar-chart-line"></i>
                          </span>
                          Variance: {(bias.metrics.variance * 100).toFixed(0)}%
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 flex items-center justify-center">
                            <i className="ri-team-line"></i>
                          </span>
                          Team Avg: {bias.metrics.teamAvg.toFixed(2)}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 flex items-center justify-center">
                            <i className="ri-building-line"></i>
                          </span>
                          Company Avg: {bias.metrics.companyAvg.toFixed(2)}
                        </span>
                        {bias.metrics.deviation !== 0 && (
                          <span className={`flex items-center gap-1 ${bias.metrics.deviation > 0 ? "text-emerald-600" : "text-red-600"}`}>
                            <span className="w-3 h-3 flex items-center justify-center">
                              <i className="ri-arrow-up-down-line"></i>
                            </span>
                            Deviation: {bias.metrics.deviation > 0 ? "+" : ""}{bias.metrics.deviation.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded: Recommendation */}
                  {selectedBias === bias.id && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 flex items-center justify-center bg-sky-50 rounded-lg text-sky-600 flex-shrink-0">
                          <i className="ri-lightbulb-line"></i>
                        </span>
                        <div>
                          <h4 className="text-sm font-medium text-slate-900 mb-1">AI Recommendation</h4>
                          <p className="text-sm text-slate-600 leading-relaxed">{bias.recommendation}</p>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        {bias.status !== "resolved" && (
                          <>
                            <button className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors whitespace-nowrap">
                              Mark as Resolved
                            </button>
                            <button className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors whitespace-nowrap">
                              Start Investigation
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setDetailModalBiasId(bias.id)}
                          className="px-3 py-1.5 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {filteredBiases.length === 0 && (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <span className="w-12 h-12 flex items-center justify-center bg-slate-100 rounded-full text-slate-400 mx-auto mb-3">
                <i className="ri-shield-check-line text-xl"></i>
              </span>
              <p className="text-sm text-slate-500">No bias detections match your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {detailBiasData && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setDetailModalBiasId(null)}
        >
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-4 md:p-5 flex items-start justify-between z-10">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-lg ${severityConfig[detailBiasData.severity].bg} flex-shrink-0`}
                >
                  <span className={`w-5 h-5 flex items-center justify-center ${severityConfig[detailBiasData.severity].text}`}>
                    <i className={severityConfig[detailBiasData.severity].icon}></i>
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{detailBiasData.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[detailBiasData.status].bg} ${statusConfig[detailBiasData.status].text}`}>
                      {detailBiasData.status.charAt(0).toUpperCase() + detailBiasData.status.slice(1)}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${severityConfig[detailBiasData.severity].bg} ${severityConfig[detailBiasData.severity].text}`}>
                      {detailBiasData.severity.charAt(0).toUpperCase() + detailBiasData.severity.slice(1)} Severity
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDetailModalBiasId(null)}
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>

            {/* Body */}
            <div className="p-4 md:p-5 space-y-6">
              {/* Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Bias Type</p>
                  <p className="text-sm font-semibold text-slate-900">{typeLabels[detailBiasData.type] || detailBiasData.type}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Department</p>
                  <p className="text-sm font-semibold text-slate-900">{detailBiasData.department}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Manager</p>
                  <p className="text-sm font-semibold text-slate-900">{detailBiasData.managerName}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">Detected</p>
                  <p className="text-sm font-semibold text-slate-900">
                    {new Date(detailBiasData.detectedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center text-slate-500">
                    <i className="ri-file-text-line"></i>
                  </span>
                  Description
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-lg p-3">
                  {detailBiasData.description}
                </p>
              </div>

              {/* Metrics */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center text-slate-500">
                    <i className="ri-bar-chart-box-line"></i>
                  </span>
                  Metrics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="border border-slate-200 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Variance</p>
                    <p className="text-lg font-bold text-slate-900">{(detailBiasData.metrics.variance * 100).toFixed(0)}%</p>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                      <div
                        className={`h-1.5 rounded-full ${detailBiasData.metrics.variance > 0.2 ? "bg-red-500" : detailBiasData.metrics.variance > 0.1 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${Math.min(detailBiasData.metrics.variance * 300, 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Team Average</p>
                    <p className="text-lg font-bold text-slate-900">{detailBiasData.metrics.teamAvg.toFixed(2)}</p>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Company Average</p>
                    <p className="text-lg font-bold text-slate-900">{detailBiasData.metrics.companyAvg.toFixed(2)}</p>
                  </div>
                  <div className="border border-slate-200 rounded-lg p-3">
                    <p className="text-xs text-slate-500 mb-1">Deviation</p>
                    <p className={`text-lg font-bold ${detailBiasData.metrics.deviation > 0 ? "text-emerald-600" : detailBiasData.metrics.deviation < 0 ? "text-red-600" : "text-slate-900"}`}>
                      {detailBiasData.metrics.deviation > 0 ? "+" : ""}{detailBiasData.metrics.deviation.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Affected Employees */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center text-slate-500">
                    <i className="ri-team-line"></i>
                  </span>
                  Affected Employees ({detailBiasData.affectedCount})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {detailBiasData.affectedEmployees.map((empName) => {
                    const emp = users.find((u) => u.name === empName);
                    return (
                      <div
                        key={empName}
                        className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200"
                      >
                        {emp && (
                          <img
                            src={emp.avatar}
                            alt={empName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="text-sm font-medium text-slate-900">{empName}</p>
                          {emp && (
                            <p className="text-xs text-slate-500">{emp.jobTitle}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* AI Recommendation */}
              <div>
                <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-4 h-4 flex items-center justify-center text-sky-500">
                    <i className="ri-lightbulb-line"></i>
                  </span>
                  AI Recommendation
                </h4>
                <div className="bg-sky-50 border border-sky-100 rounded-lg p-4">
                  <p className="text-sm text-slate-700 leading-relaxed">{detailBiasData.recommendation}</p>
                </div>
              </div>

              {/* Actions */}
              {detailBiasData.status !== "resolved" && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setDetailModalBiasId(null)}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                  >
                    Mark as Resolved
                  </button>
                  <button
                    onClick={() => setDetailModalBiasId(null)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    Start Investigation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
