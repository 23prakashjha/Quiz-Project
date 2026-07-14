import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "https://quiz-project-aqu6.onrender.com";

const LANGUAGES = [
  "HTML", "CSS", "JavaScript", "React", "TailwindCSS", "Node.js",
  "Express.js", "MongoDB", "Python", "Java", "C", "C++",
  "Bootstrap", "jQuery", "TypeScript", "MySQL", "Git", "GitHub",
  "Next.js", "Redux", "Docker", "Firebase", "AWS", "PHP", "Other",
];

export default function AdminPanel({ user, isAuthenticated, onLoginSuccess }) {
  const navigate = useNavigate();

  const [language, setLanguage] = useState("HTML");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);
  const [questionsList, setQuestionsList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [bulkInput, setBulkInput] = useState("");

  const filteredQuestions = questionsList.filter((q) => q.language === language);

  const resetForm = () => {
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrect(0);
  };

  const handleAddToList = () => {
    if (!question.trim()) return alert("Please enter a question.");
    if (options.some((o) => !o.trim())) return alert("Please fill all options.");

    setQuestionsList([...questionsList, {
      language,
      questionText: question.trim(),
      options: options.map((o) => o.trim()),
      correctAnswer: Number(correct),
    }]);
    resetForm();
  };

  const handleSubmitAll = async () => {
    if (questionsList.length === 0) return alert("No questions to submit.");

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${API}/api/quiz/add-multiple`,
        { questions: questionsList },
        { headers: { Authorization: token ? `Bearer ${token}` : "" } }
      );
      alert(`${res.data.count} questions added successfully!`);
      setQuestionsList([]);
    } catch (error) {
      alert("Failed to add questions. Check console.");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const removeQuestion = (idx) => {
    const actualIdx = questionsList.indexOf(filteredQuestions[idx]);
    if (actualIdx > -1) {
      setQuestionsList(questionsList.filter((_, i) => i !== actualIdx));
    }
  };

  const handleBulkAdd = () => {
    try {
      const parsed = JSON.parse(bulkInput);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return alert("Please provide a valid JSON array.");
      }
      setQuestionsList([...questionsList, ...parsed]);
      setBulkInput("");
      alert(`${parsed.length} question(s) added from JSON.`);
    } catch {
      alert("Invalid JSON format.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  // ---------- Gate: Not logged in → redirect to /login ----------
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 px-4">
        <div className="text-center max-w-md animate-scale-in">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Admin Login Required</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Please sign in with admin credentials to access this panel.</p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-lg active:scale-[0.98]"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // ---------- Gate: Not admin → access denied ----------
  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 px-4">
        <div className="text-center max-w-md animate-scale-in">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            This area is restricted to administrators only. Your account does not have admin privileges.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-lg active:scale-[0.98]"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // ---------- Admin Panel ----------
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 animate-fade-in">
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-3">
              <span className="text-4xl">⚙️</span>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Admin Panel</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Add and manage quiz questions</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40">
              <div className="w-7 h-7 rounded-full bg-linear-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                {(user.name || "A").charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">{user.name}</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold">admin</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Question Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-5 sm:p-6 animate-slide-up">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-indigo-600 rounded-full" />
                Add Question
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Language</label>
                  <select
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang}>{lang}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Question</label>
                  <textarea
                    className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all resize-none"
                    rows={2}
                    placeholder="Enter your question here..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Options</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {options.map((opt, i) => (
                      <div key={i} className={`relative rounded-lg border-2 transition-all ${
                        correct === i
                          ? "border-emerald-400 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                          : "border-gray-200 dark:border-slate-600"
                      }`}>
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <input
                          className="w-full pl-8 pr-8 py-2.5 bg-transparent text-gray-800 dark:text-gray-100 text-sm outline-none"
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...options];
                            newOpts[i] = e.target.value;
                            setOptions(newOpts);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setCorrect(i)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-500 hover:text-emerald-600 transition"
                          title="Mark as correct"
                        >
                          {correct === i ? "✓" : "○"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleAddToList}
                    className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md active:scale-[0.98]"
                  >
                    ➕ Add to List
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-4 py-2.5 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition-all"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk JSON Input */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-5 sm:p-6 animate-slide-up">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-cyan-600 rounded-full" />
                Bulk Add (JSON)
              </h2>
              <textarea
                className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 transition-all font-mono resize-none"
                rows={4}
                placeholder='[{ "language": "HTML", "questionText": "...", "options": ["A","B","C","D"], "correctAnswer": 0 }]'
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
              />
              <button
                onClick={handleBulkAdd}
                className="mt-3 w-full px-4 py-2.5 rounded-lg bg-cyan-600 text-white text-sm font-semibold hover:bg-cyan-700 transition-all shadow-md active:scale-[0.98]"
              >
                📋 Parse & Add to List
              </button>
            </div>
          </div>

          {/* Right: Questions List */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-5 sm:p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-emerald-600 rounded-full" />
                  Pending
                </h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400">
                  {questionsList.length} total
                </span>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {["All", ...LANGUAGES].slice(0, 6).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => lang !== "All" && setLanguage(lang)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      language === lang
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
                <span className="text-xs text-gray-400 dark:text-gray-500 self-center ml-1">...</span>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                {filteredQuestions.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">
                    No questions added yet for {language}
                  </p>
                ) : (
                  filteredQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl p-4 group transition-all hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-relaxed">
                          {idx + 1}. {q.questionText}
                        </p>
                        <button
                          onClick={() => removeQuestion(idx)}
                          className="shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50 transition flex items-center justify-center text-xs opacity-0 group-hover:opacity-100"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-1">
                        {q.options.map((opt, i) => (
                          <span
                            key={i}
                            className={`text-xs px-2 py-1 rounded ${
                              i === q.correctAnswer
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold"
                                : "text-gray-500 dark:text-gray-400"
                            }`}
                          >
                            {String.fromCharCode(65 + i)}. {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {questionsList.length > 0 && (
                <button
                  onClick={handleSubmitAll}
                  disabled={submitting}
                  className="mt-5 w-full px-4 py-3 rounded-xl bg-linear-to-r from-emerald-500 to-green-600 text-white text-sm font-bold hover:from-emerald-600 hover:to-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98]"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Submitting {questionsList.length} questions...
                    </span>
                  ) : (
                    `🚀 Submit All (${questionsList.length})`
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
