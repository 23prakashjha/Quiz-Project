import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API, authHeaders } from "../api.js";

const TOPIC_EMOJI = {
  html: "🌐", css: "🎨", javascript: "⚡", react: "⚛️", "tailwindcss": "🌊",
  "node.js": "🟢", "express.js": "🚂", mongodb: "🍃", python: "🐍", java: "☕",
  c: "💻", "c++": "⚙️", bootstrap: "🅱️", typescript: "📘", mysql: "🗄️",
  git: "🔀", github: "🐙", "next.js": "▲", redux: "🔄", docker: "🐳",
  firebase: "🔥", aws: "☁️", php: "🐘", jquery: "🧩", kubernetes: "☸️",
  dsa: "📊", algorithms: "🧮", os: "🖥️", networks: "🌍", dbms: "📦",
};

const scoreColor = (pct) =>
  pct >= 80 ? "from-emerald-500 to-green-500" :
  pct >= 60 ? "from-indigo-500 to-cyan-500" :
  pct >= 40 ? "from-amber-500 to-orange-500" : "from-red-500 to-pink-500";

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/attempts/stats`, authHeaders());
      setData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your analytics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (loading) {
    return (
      <div className="relative overflow-hidden min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
        <div className="aurora-blob b-indigo w-80 h-80 -top-24 -left-24" />
        <div className="aurora-blob b-cyan w-80 h-80 -bottom-24 -right-20" style={{ animationDelay: "-9s" }} />
        <div className="text-center animate-fade-in relative z-10">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Building your analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative overflow-hidden min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 px-4">
        <div className="aurora-blob b-indigo w-80 h-80 -top-24 -left-24" />
        <div className="aurora-blob b-fuchsia w-72 h-72 -bottom-20 -right-20" style={{ animationDelay: "-12s" }} />
        <div className="text-center max-w-md animate-scale-in relative z-10">
          <div className="text-6xl mb-4">📊</div>
          <p className="text-red-500 dark:text-red-400 font-semibold text-lg mb-2">{error}</p>
          <button onClick={fetchStats} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-md">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { totalAttempts, adaptiveCount, overallScore, topicStats, weakTopics, mastered, recent, analysis } = data;
  const topWeak = weakTopics[0];

  return (
    <div className="relative overflow-hidden min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 px-4 sm:px-6 lg:px-8 py-8 sm:py-10 transition-colors duration-300">
      <div className="hero-grid absolute inset-0" />
      <div className="aurora-blob b-indigo w-80 h-80 -top-24 -left-24" />
      <div className="aurora-blob b-cyan w-72 h-72 top-1/3 -right-28" style={{ animationDelay: "-10s" }} />
      <div className="aurora-blob b-fuchsia w-72 h-72 bottom-0 left-1/4" style={{ animationDelay: "-18s" }} />
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="inline-flex w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-cyan-500 items-center justify-center text-2xl shadow-lg shadow-indigo-500/25">📊</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Student Analytics</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Your learning journey at a glance</p>
            </div>
          </div>
          <button
            onClick={() => topWeak ? navigate(`/quiz/adaptive/${encodeURIComponent(topWeak.topic)}`) : navigate("/")}
            className="btn-shine mt-3 sm:mt-0 px-4 py-2.5 rounded-xl bg-linear-to-r from-fuchsia-600 to-violet-600 text-white text-sm font-bold hover:from-fuchsia-700 hover:to-violet-700 transition-all shadow-lg shadow-fuchsia-500/25"
          >
            ✨ Adaptive Quiz {topWeak ? `on ${topWeak.topic.toUpperCase()}` : ""}
          </button>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          {[
            { label: "Overall Score", value: `${overallScore}%`, emoji: "🎯", grad: "from-indigo-500 to-cyan-500" },
            { label: "Quizzes Taken", value: totalAttempts, emoji: "📝", grad: "from-blue-500 to-indigo-500" },
            { label: "Adaptive Sessions", value: adaptiveCount, emoji: "⚡", grad: "from-fuchsia-500 to-violet-500" },
            { label: "Focus Areas", value: weakTopics.length, emoji: "🎯", grad: "from-amber-500 to-orange-500" },
          ].map((c, i) => (
            <div key={i} className={`card-accent bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-200 dark:border-slate-700 shadow-sm animate-fade-in`} style={{ animationDelay: `${i * 60}ms` }}>
              <div className={`inline-flex w-10 h-10 rounded-xl bg-linear-to-br ${c.grad} items-center justify-center text-lg mb-3 shadow-md`}>{c.emoji}</div>
              <p className={`text-2xl font-extrabold ${i === 0 ? "text-gradient-anim" : "text-gray-900 dark:text-white"}`}>{c.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Topic performance */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card-accent glow-indigo bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-5 sm:p-6 animate-slide-up">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-indigo-600 rounded-full" />
                Performance by Topic
              </h2>

              {topicStats.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-3">📈</div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Take your first quiz to unlock topic analytics.</p>
                  <button onClick={() => navigate("/")} className="mt-4 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
                    Browse Topics →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {topicStats.map((t, i) => (
                    <div key={t.topic} className="animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {TOPIC_EMOJI[t.topic] || "📚"} {t.topic.charAt(0).toUpperCase() + t.topic.slice(1)}
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">({t.attempts} quiz{t.attempts > 1 ? "zes" : ""}, best {t.best}%)</span>
                        </span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{t.avgScore}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full progress-shine rounded-full bg-linear-to-r ${scoreColor(t.avgScore)} transition-all duration-700 ease-out`}
                          style={{ width: `${t.avgScore}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Learning history */}
            <div className="card-accent bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-5 sm:p-6 animate-slide-up">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-cyan-600 rounded-full" />
                Learning History
              </h2>
              {recent.length === 0 ? (
                <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">No attempts yet — go take a quiz!</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-600">
                        <th className="text-left py-2.5 px-2 text-gray-500 dark:text-gray-400 font-medium">Topic</th>
                        <th className="text-left py-2.5 px-2 text-gray-500 dark:text-gray-400 font-medium">Mode</th>
                        <th className="text-left py-2.5 px-2 text-gray-500 dark:text-gray-400 font-medium">Score</th>
                        <th className="text-left py-2.5 px-2 text-gray-500 dark:text-gray-400 font-medium">Result</th>
                        <th className="text-right py-2.5 px-2 text-gray-500 dark:text-gray-400 font-medium">When</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((a) => (
                        <tr key={a._id || a.id} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                          <td className="py-3 px-2 font-medium text-gray-800 dark:text-gray-100">
                            {TOPIC_EMOJI[a.topic] || "📚"} {a.topic.charAt(0).toUpperCase() + a.topic.slice(1)}
                          </td>
                          <td className="py-3 px-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              a.mode === "adaptive"
                                ? "bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-600 dark:text-fuchsia-300"
                                : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                            }`}>
                              {a.mode === "adaptive" ? "⚡ Adaptive" : "Classic"}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-gray-700 dark:text-gray-200">{a.score}/{a.total}</td>
                          <td className="py-3 px-2">
                            <span className={`font-semibold ${a.percentage >= 60 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                              {a.percentage}%
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right text-xs text-gray-400 dark:text-gray-500">
                            {new Date(a.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right column: AI recommendations + weak topics */}
          <div className="space-y-6">
            <div className="card-accent glow-fuchsia bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-5 sm:p-6 animate-slide-up">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🤖</span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI Recommendations</h2>
              </div>

              <div className="rounded-xl bg-fuchsia-50 dark:bg-fuchsia-900/20 p-4 mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{analysis?.overview}</p>
              </div>

              {(analysis?.weaknesses || []).length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">Weak topics to practice</p>
                  <div className="space-y-2">
                    {analysis.weaknesses.slice(0, 4).map((w, i) => (
                      <button
                        key={i}
                        onClick={() => navigate(`/quiz/adaptive/${encodeURIComponent(w.toLowerCase())}`)}
                        className="w-full flex items-center justify-between bg-white dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl px-3 py-2.5 hover:border-fuchsia-400 dark:hover:border-fuchsia-500 transition-all"
                      >
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {TOPIC_EMOJI[w.toLowerCase()] || "📚"} {w.charAt(0).toUpperCase() + w.slice(1)}
                        </span>
                        <span className="text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400">✨ Practice →</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-2">Recommended next steps</p>
              <ul className="space-y-2">
                {(analysis?.recommendations || []).slice(0, 4).map((r, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-xl bg-gray-50 dark:bg-slate-700/50 p-3 text-sm text-gray-700 dark:text-gray-200">
                    <span className="font-bold text-fuchsia-600 dark:text-fuchsia-400 shrink-0">{i + 1}.</span>{r}
                  </li>
                ))}
              </ul>
            </div>

            {mastered.length > 0 && (
              <div className="card-accent glow-emerald bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-5 sm:p-6 animate-slide-up">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🏆</span>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Mastered Topics</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mastered.map((t, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                      {TOPIC_EMOJI[t.topic] || "📚"} {t.topic.charAt(0).toUpperCase() + t.topic.slice(1)} · {t.avgScore}%
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}