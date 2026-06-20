import { useState } from "react";
import DashboardLayout from "@/components/feature/DashboardLayout";
import { users } from "@/mocks/users";
import { surveys } from "@/mocks/surveys";

const employeeUser = users.find((u) => u.id === "u3")!;

export default function SurveyPage() {
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);
  const [surveyResponses, setSurveyResponses] = useState<Record<string, string | number | string[]>>({});
  const [submitted, setSubmitted] = useState(false);

  const selectedSurveyData = selectedSurvey ? surveys.find((s) => s.id === selectedSurvey) : null;

  const handleSurveyResponse = (questionId: string, value: string | number | string[]) => {
    setSurveyResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleMultiSelect = (questionId: string, option: string) => {
    const current = (surveyResponses[questionId] as string[]) || [];
    if (current.includes(option)) {
      handleSurveyResponse(questionId, current.filter((o) => o !== option));
    } else if (current.length < 3) {
      handleSurveyResponse(questionId, [...current, option]);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedSurvey(null);
      setSurveyResponses({});
    }, 3000);
  };

  const activeSurveys = surveys.filter((s) => s.status === "active");
  const completedSurveys = surveys.filter((s) => s.status === "completed");

  return (
    <DashboardLayout
      role="employee"
      userName={employeeUser.name}
      userAvatar={employeeUser.avatar}
      userRole={employeeUser.jobTitle}
    >
      <div className="p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Surveys</h1>
          <p className="text-sm text-slate-500 mt-1">
            Participate in company surveys and share your feedback
          </p>
        </div>

        {!selectedSurveyData && (
          <div className="space-y-4">
            {/* Active Surveys */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200">
                <h2 className="text-sm font-semibold text-slate-900">Active Surveys</h2>
                <p className="text-xs text-slate-500 mt-0.5">Surveys available for participation</p>
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
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 flex items-center justify-center">
                          <i className="ri-user-line"></i>
                        </span>
                        {survey.responseCount}/{survey.totalEmployees} responded
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
            </div>

            {/* Completed Surveys */}
            {completedSurveys.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200">
                  <h2 className="text-sm font-semibold text-slate-900">Completed Surveys</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Past surveys you have participated in</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {completedSurveys.map((survey) => (
                    <div key={survey.id} className="p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-sm font-medium text-slate-900">{survey.title}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{survey.description}</p>
                        </div>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          Completed
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 flex items-center justify-center">
                            <i className="ri-calendar-line"></i>
                          </span>
                          Closed: {survey.deadline}
                          </span>
                        <span className="flex items-center gap-1">
                          <span className="w-3 h-3 flex items-center justify-center">
                            <i className="ri-user-line"></i>
                          </span>
                          {survey.responseCount}/{survey.totalEmployees} responded
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Survey Form */}
        {selectedSurveyData && (
          <div className="bg-white rounded-xl border border-slate-200 p-4 md:p-5">
            {submitted ? (
              <div className="text-center py-12">
                <span className="w-16 h-16 flex items-center justify-center bg-emerald-100 rounded-full text-emerald-600 mx-auto mb-4">
                  <i className="ri-check-line text-2xl"></i>
                </span>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Survey Submitted!</h2>
                <p className="text-sm text-slate-500">Thank you for your feedback. Your responses have been recorded.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">{selectedSurveyData.title}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedSurveyData.description}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSurvey(null);
                      setSurveyResponses({});
                    }}
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
                          <p className="text-xs text-slate-400 mb-2">Select up to 3 options</p>
                          {q.options.map((option) => {
                            const selected = ((surveyResponses[q.id] as string[]) || []).includes(option);
                            return (
                              <label
                                key={option}
                                className={`flex items-center gap-2 cursor-pointer p-2 rounded-lg transition-colors ${
                                  selected ? "bg-slate-100" : "hover:bg-slate-50"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selected}
                                  onChange={() => handleMultiSelect(q.id, option)}
                                  className="w-4 h-4 rounded border-slate-300 text-slate-800 focus:ring-slate-800"
                                />
                                <span className="text-sm text-slate-700">{option}</span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4 mt-4 border-t border-slate-200">
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors whitespace-nowrap"
                  >
                    Submit Survey
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSurvey(null);
                      setSurveyResponses({});
                    }}
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
