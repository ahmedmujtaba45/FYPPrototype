import { useState, useMemo } from "react";
import { surveys as initialSurveys } from "@/mocks/surveys";

export type SurveyVisibility = "employee" | "manager" | "both";

export interface SurveyQuestion {
  id: string;
  type: "rating" | "text" | "multiple_choice";
  question: string;
  maxRating?: number;
  options?: string[];
}

export interface SurveyItem {
  id: string;
  title: string;
  description: string;
  isAnonymous: boolean;
  status: "active" | "completed";
  deadline: string;
  responseCount: number;
  totalEmployees: number;
  targetAudience: SurveyVisibility;
  questions: SurveyQuestion[];
}

const visibilityLabels: Record<
  SurveyVisibility,
  { label: string; badge: string }
> = {
  employee: { label: "Employee", badge: "bg-sky-100 text-sky-700" },
  manager: { label: "Manager", badge: "bg-amber-100 text-amber-700" },
  both: { label: "Both", badge: "bg-violet-100 text-violet-700" },
};

const getSurveyResults = (_surveyId: string) => {
  return {
    totalResponses: 45,
    avgRatings: {
      "How satisfied are you with your current role and responsibilities?": 4.2,
      "Rate the effectiveness of communication within your team.": 3.8,
      "How well does the company support your professional development?": 4.0,
    },
    textResponses: [
      "The evaluation process is fair and transparent.",
      "I would like more frequent 1:1 meetings with my manager.",
      "The KPI targets sometimes feel unrealistic.",
    ],
  };
};

function EditSurveyModal({
  survey,
  onClose,
  onSave,
}: {
  survey: SurveyItem;
  onClose: () => void;
  onSave: (updated: Partial<SurveyItem>) => void;
}) {
  const [editTitle, setEditTitle] = useState(survey.title);
  const [editDesc, setEditDesc] = useState(survey.description);
  const [editDeadline, setEditDeadline] = useState(survey.deadline);
  const [editAnon, setEditAnon] = useState(survey.isAnonymous);
  const [editVisibility, setEditVisibility] =
    useState<SurveyVisibility>(survey.targetAudience);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 flex items-center justify-center bg-amber-100 rounded-lg text-amber-600">
              <i className="ri-edit-line"></i>
            </span>
            <h3 className="text-sm font-semibold text-slate-900">
              Edit Survey
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Survey Title
            </label>
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Description
            </label>
            <textarea
              rows={2}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Deadline
              </label>
              <input
                type="date"
                value={editDeadline}
                onChange={(e) => setEditDeadline(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Visibility
              </label>
              <select
                value={editVisibility}
                onChange={(e) =>
                  setEditVisibility(e.target.value as SurveyVisibility)
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent bg-white"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="edit-anon"
              checked={editAnon}
              onChange={(e) => setEditAnon(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-800"
            />
            <label htmlFor="edit-anon" className="text-xs text-slate-700">
              Anonymous
            </label>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              Questions ({survey.questions.length})
            </label>
            <div className="space-y-2">
              {survey.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg"
                >
                  <span className="w-5 h-5 flex items-center justify-center bg-slate-200 text-slate-700 rounded-full text-xs font-semibold">
                    {idx + 1}
                  </span>
                  <span className="text-xs text-slate-700 flex-1 truncate">
                    {q.question}
                  </span>
                  <span className="text-xs text-slate-400 capitalize">
                    {q.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 px-5 py-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
          <button
            onClick={() => {
              onSave({
                title: editTitle,
                description: editDesc,
                deadline: editDeadline,
                isAnonymous: editAnon,
                targetAudience: editVisibility,
              });
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            Save Changes
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SurveyManagement() {
  const [surveyList, setSurveyList] = useState<SurveyItem[]>(
    initialSurveys as SurveyItem[]
  );

  const [showCreateSurvey, setShowCreateSurvey] = useState(false);
  const [createSurveyTitle, setCreateSurveyTitle] = useState("");
  const [createSurveyDesc, setCreateSurveyDesc] = useState("");
  const [createSurveyDeadline, setCreateSurveyDeadline] = useState("");
  const [createSurveyAnon, setCreateSurveyAnon] = useState(false);
  const [createSurveyVisibility, setCreateSurveyVisibility] =
    useState<SurveyVisibility>("both");
  const [createSurveySuccess, setCreateSurveySuccess] = useState(false);

  const [viewSurveyResults, setViewSurveyResults] = useState<string | null>(
    null
  );
  const [editSurveyId, setEditSurveyId] = useState<string | null>(null);
  const [closeSurveyConfirm, setCloseSurveyConfirm] = useState<string | null>(
    null
  );

  const activeCount = useMemo(
    () => surveyList.filter((s) => s.status === "active").length,
    [surveyList]
  );

  const handleCloseSurvey = (surveyId: string) => {
    setSurveyList((prev) =>
      prev.map((s) => (s.id === surveyId ? { ...s, status: "completed" } : s))
    );
    setCloseSurveyConfirm(null);
  };

  const handleCreateSurvey = () => {
    if (!createSurveyTitle.trim()) return;
    const newSurvey: SurveyItem = {
      id: "s" + (surveyList.length + 1),
      title: createSurveyTitle,
      description: createSurveyDesc,
      isAnonymous: createSurveyAnon,
      status: "active",
      deadline: createSurveyDeadline || "2026-06-30",
      responseCount: 0,
      totalEmployees: 60,
      targetAudience: createSurveyVisibility,
      questions: [
        {
          id: "sq_new_1",
          type: "rating",
          question: "How satisfied are you with your current experience?",
          maxRating: 5,
        },
        {
          id: "sq_new_2",
          type: "text",
          question: "What improvements would you suggest?",
        },
      ],
    };
    setSurveyList((prev) => [...prev, newSurvey]);
    setCreateSurveySuccess(true);
    setTimeout(() => {
      setShowCreateSurvey(false);
      setCreateSurveyTitle("");
      setCreateSurveyDesc("");
      setCreateSurveyDeadline("");
      setCreateSurveyAnon(false);
      setCreateSurveyVisibility("both");
      setCreateSurveySuccess(false);
    }, 1500);
  };

  const handleEditSave = (updated: Partial<SurveyItem>) => {
    setSurveyList((prev) =>
      prev.map((s) =>
        s.id === editSurveyId ? ({ ...s, ...updated } as SurveyItem) : s
      )
    );
  };

  const editingSurvey = useMemo(
    () => surveyList.find((s) => s.id === editSurveyId),
    [surveyList, editSurveyId]
  );

  return (
    <div id="section-surveys" className="space-y-4">
      {/* Create Survey Inline */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Survey Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Create and manage surveys with visibility controls{" "}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 ml-1">
                {activeCount} active
              </span>
            </p>
          </div>
          <button
            onClick={() => setShowCreateSurvey(!showCreateSurvey)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
          >
            <span className="w-4 h-4 flex items-center justify-center">
              <i className="ri-add-line"></i>
            </span>
            Create Survey
          </button>
        </div>

        {showCreateSurvey && (
          <div className="mb-4 p-4 bg-slate-50 rounded-lg space-y-3">
            <h4 className="text-sm font-semibold text-slate-900">
              Create New Survey
            </h4>
            {createSurveySuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg text-emerald-700 text-sm">
                <span className="w-5 h-5 flex items-center justify-center">
                  <i className="ri-check-line"></i>
                </span>
                Survey created successfully!
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Survey Title
              </label>
              <input
                type="text"
                value={createSurveyTitle}
                onChange={(e) => setCreateSurveyTitle(e.target.value)}
                placeholder="e.g., Q2 2026 Employee Satisfaction Survey"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                value={createSurveyDesc}
                onChange={(e) => setCreateSurveyDesc(e.target.value)}
                placeholder="Describe the purpose of this survey..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent resize-none"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Deadline
                </label>
                <input
                  type="date"
                  value={createSurveyDeadline}
                  onChange={(e) => setCreateSurveyDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Survey Visibility
                </label>
                <select
                  value={createSurveyVisibility}
                  onChange={(e) =>
                    setCreateSurveyVisibility(e.target.value as SurveyVisibility)
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-transparent bg-white"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="both">Both</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input
                  type="checkbox"
                  id="anon"
                  checked={createSurveyAnon}
                  onChange={(e) => setCreateSurveyAnon(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-800"
                />
                <label htmlFor="anon" className="text-xs text-slate-700">
                  Anonymous Survey
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateSurvey}
                disabled={!createSurveyTitle.trim()}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  !createSurveyTitle.trim()
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-slate-800 text-white hover:bg-slate-700"
                }`}
              >
                Create Survey
              </button>
              <button
                onClick={() => {
                  setShowCreateSurvey(false);
                  setCreateSurveyTitle("");
                  setCreateSurveyDesc("");
                  setCreateSurveyDeadline("");
                  setCreateSurveyAnon(false);
                  setCreateSurveyVisibility("both");
                  setCreateSurveySuccess(false);
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Surveys List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {surveyList.map((survey) => {
            const vis = visibilityLabels[survey.targetAudience];
            return (
              <div
                key={survey.id}
                className="p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">
                      {survey.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {survey.description}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      survey.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {survey.status === "active" ? "Active" : "Completed"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 flex items-center justify-center">
                      <i className="ri-user-line"></i>
                    </span>
                    {survey.responseCount}/{survey.totalEmployees} responses
                  </span>
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
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${vis.badge}`}
                  >
                    <span className="w-3 h-3 flex items-center justify-center mr-1">
                      <i className="ri-group-line"></i>
                    </span>
                    {vis.label}
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => setViewSurveyResults(survey.id)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    View Results
                  </button>
                  <button
                    onClick={() => setEditSurveyId(survey.id)}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    Edit Survey
                  </button>
                  {survey.status === "active" && (
                    <button
                      onClick={() => setCloseSurveyConfirm(survey.id)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
                    >
                      Close Survey
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* View Results Modal */}
      {viewSurveyResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 flex items-center justify-center bg-sky-100 rounded-lg text-sky-600">
                  <i className="ri-bar-chart-grouped-line"></i>
                </span>
                <h3 className="text-sm font-semibold text-slate-900">
                  {surveyList.find((s) => s.id === viewSurveyResults)?.title} -
                  Results
                </h3>
              </div>
              <button
                onClick={() => setViewSurveyResults(null)}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="px-5 py-4 overflow-y-auto flex-1 space-y-5">
              {(() => {
                const results = getSurveyResults(viewSurveyResults);
                return (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">
                          Total Responses
                        </p>
                        <p className="text-xl font-bold text-slate-900">
                          {results.totalResponses}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">
                          Response Rate
                        </p>
                        <p className="text-xl font-bold text-slate-900">
                          {Math.round((results.totalResponses / 60) * 100)}%
                        </p>
                      </div>
                      <div className="text-center p-3 bg-slate-50 rounded-lg">
                        <p className="text-xs text-slate-500 mb-1">
                          Avg Rating
                        </p>
                        <p className="text-xl font-bold text-slate-900">
                          {(
                            Object.values(results.avgRatings).reduce(
                              (a, b) => a + b,
                              0
                            ) / Object.values(results.avgRatings).length
                          ).toFixed(1)}
                        </p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-3">
                        Rating Results
                      </h4>
                      <div className="space-y-3">
                        {Object.entries(results.avgRatings).map(
                          ([question, rating]) => (
                            <div
                              key={question}
                              className="p-3 bg-slate-50 rounded-lg"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-slate-700">
                                  {question}
                                </p>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-sky-50 text-sky-700">
                                  {rating.toFixed(1)} / 5
                                </span>
                              </div>
                              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-slate-800 rounded-full"
                                  style={{
                                    width: `${(rating / 5) * 100}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900 mb-3">
                        Text Responses (Sample)
                      </h4>
                      <div className="space-y-2">
                        {results.textResponses.map((text, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-slate-50 rounded-lg"
                          >
                            <p className="text-sm text-slate-700">
                              &ldquo;{text}&rdquo;
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
            <div className="px-5 py-4 border-t border-slate-100">
              <button
                onClick={() => setViewSurveyResults(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Survey Modal */}
      {editingSurvey && (
        <EditSurveyModal
          survey={editingSurvey}
          onClose={() => setEditSurveyId(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Close Survey Confirmation Modal */}
      {closeSurveyConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="px-5 py-5 text-center">
              <span className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full text-red-600 mx-auto mb-3">
                <i className="ri-alert-line text-xl"></i>
              </span>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Close Survey?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to close &ldquo;
                {
                  surveyList.find((s) => s.id === closeSurveyConfirm)?.title
                }
                &rdquo;? This action cannot be undone.
              </p>
            </div>
            <div className="px-5 pb-5 flex gap-2">
              <button
                onClick={() => handleCloseSurvey(closeSurveyConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors whitespace-nowrap"
              >
                Yes, Close Survey
              </button>
              <button
                onClick={() => setCloseSurveyConfirm(null)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
