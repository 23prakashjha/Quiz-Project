import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { API, authHeaders } from "../api.js";

const CONFETTI_COLORS = ["#4f46e5", "#06b6d4", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#ec4899"];

export default function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const attempt = state?.attempt || null;
  const analysis = state?.analysis || null;
  const answers = state?.answers || attempt?.questions || null;
  const language = state?.language || "Quiz";
  const localScore = state?.localScore ?? attempt?.score ?? 0;
  const localTotal = state?.localTotal ?? attempt?.total ?? 0;

  const [percentage, setPercentage] = useState(0);
  const [showConfetti, setShowConfetti] = useState(true);
  const [explaining, setExplaining] = useState(null);
  const [explainText, setExplainText] = useState({});
  const [certificateId] = useState(
    () => attempt?.certificateId || `QV-${Date.now().toString(36).toUpperCase().slice(-6)}${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  );

  const userName = (() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const u = JSON.parse(storedUser);
      return u.name || u.email || "Student";
    }
    return "Student";
  })();

  const passed =
    typeof attempt?.passed === "boolean"
      ? attempt.passed
      : Math.round((localScore / Math.max(localTotal, 1)) * 100) >= 60;

  useEffect(() => {
    const timer = setTimeout(() => {
      setPercentage(Math.round((localScore / Math.max(localTotal, 1)) * 100));
    }, 400);
    const confettiTimer = setTimeout(() => setShowConfetti(false), 4000);
    return () => { clearTimeout(timer); clearTimeout(confettiTimer); };
  }, [localScore, localTotal]);

  const { emoji, message, color, grade } = useMemo(() => {
    if (percentage >= 90) return { emoji: "🏆", message: "Outstanding! You're a quiz master!", color: "from-yellow-400 to-amber-500", grade: "A+" };
    if (percentage >= 80) return { emoji: "🎉", message: "Excellent work! You really know your stuff!", color: "from-emerald-400 to-green-500", grade: "A" };
    if (percentage >= 70) return { emoji: "👏", message: "Great job! Almost there!", color: "from-blue-400 to-indigo-500", grade: "B+" };
    if (percentage >= 60) return { emoji: "🙂", message: "Nice job! You're getting there!", color: "from-indigo-400 to-purple-500", grade: "B" };
    if (percentage >= 40) return { emoji: "💪", message: "Good try! Keep practicing and you'll improve!", color: "from-orange-400 to-red-500", grade: "C" };
    return { emoji: "😅", message: "Don't worry — every expert starts somewhere! Try again!", color: "from-red-400 to-pink-500", grade: "D" };
  }, [percentage]);

  const confettiPieces = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      id: i,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${2 + Math.random() * 2}s`,
      size: `${6 + Math.random() * 8}px`,
    }));
  }, []);

  const handleShare = async () => {
    const text = `🧠 I scored ${localScore}/${localTotal} (${percentage}%) on the ${language.toUpperCase()} quiz at QuizVerse AI! Can you beat my score?`;
    if (navigator.share) {
      await navigator.share({ title: "QuizVerse AI Result", text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text);
      alert("Result copied to clipboard!");
    }
  };

  const shareCertificate = async () => {
    const text = `🎓 I earned a Certificate of Achievement on QuizVerse AI — ${percentage}% on the ${language.toUpperCase()} quiz! (#${certificateId})`;
    if (navigator.share) {
      await navigator.share({ title: "QuizVerse AI Certificate", text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text);
      alert("Certificate details copied to clipboard!");
    }
  };

  const handleExplain = async (q, idx) => {
    if (explaining === idx) return;
    setExplaining(idx);
    try {
      const res = await axios.post(
        `${API}/api/ai/explain`,
        {
          questionText: q.questionText,
          options: q.options,
          selectedAnswer: q.selectedAnswer,
          correctAnswer: q.correctAnswer,
        },
        authHeaders()
      );
      setExplainText((prev) => ({ ...prev, [idx]: res.data.explanation }));
    } catch {
      setExplainText((prev) => ({ ...prev, [idx]: "Could not reach the AI service right now." }));
    } finally {
      setExplaining(null);
    }
  };

  const reviewItems = Array.isArray(answers) ? answers : [];

  return (
    <div className="relative overflow-hidden min-h-screen bg-linear-to-br from-indigo-100 via-white to-cyan-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 transition-colors duration-300">
      <div className="aurora-blob b-indigo w-80 h-80 -top-24 -left-24" />
      <div className="aurora-blob b-cyan w-80 h-80 top-1/3 -right-28" style={{ animationDelay: "-8s" }} />
      <div className="aurora-blob b-fuchsia w-72 h-72 bottom-0 left-1/4" style={{ animationDelay: "-16s" }} />
      <div className="max-w-3xl mx-auto px-4 py-10 relative overflow-hidden z-10">
        {showConfetti && confettiPieces.map((p) => (
          <div
            key={p.id}
            className="confetti-piece absolute top-0 rounded-sm"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}

        {/* Score card */}
        <div className="w-full max-w-md mx-auto animate-scale-in">
          <div className="glow-indigo bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl shadow-indigo-500/10 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 p-6 sm:p-8 text-center">
            <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-linear-to-r ${color} text-white text-xs font-bold mb-4 shadow-lg`}>
              {grade}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {language.toUpperCase()} Quiz
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{attempt?.mode === "adaptive" ? "Adaptive · AI-adjusted difficulty" : "Here's how you performed"}</p>

            <div className="relative flex justify-center mb-6">
              <svg className="w-36 h-36 sm:w-40 sm:h-40 -rotate-90">
                <circle className="text-gray-200 dark:text-slate-600" strokeWidth="8" stroke="currentColor" fill="transparent" r="64" cx="80" cy="80" />
                <circle
                  className="text-indigo-500 progress-ring"
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 64}
                  strokeDashoffset={2 * Math.PI * 64 * (1 - percentage / 100)}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="64"
                  cx="80"
                  cy="80"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl sm:text-5xl mb-1">{emoji}</span>
                <span className="text-2xl sm:text-3xl font-extrabold text-gradient-anim">{percentage}%</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-indigo-600 dark:text-indigo-400">{localScore}</span>
              <span className="text-gray-400 dark:text-gray-500 text-lg font-medium">/ {localTotal}</span>
            </div>

            <div className="flex items-center justify-center gap-6 mb-5">
              <div className="flex items-center gap-1.5 text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-gray-600 dark:text-gray-300">Correct: <strong className="text-emerald-600 dark:text-emerald-400">{localScore}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-gray-600 dark:text-gray-300">Wrong: <strong className="text-red-600 dark:text-red-400">{localTotal - localScore}</strong></span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6">
              <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">{message}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate(`/quiz/${language.toLowerCase()}`)} className="btn-shine flex-1 px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98]">
                🔄 Retry Quiz
              </button>
              <button onClick={() => navigate("/dashboard")} className="btn-shine flex-1 px-5 py-3 rounded-xl bg-linear-to-r from-fuchsia-600 to-violet-600 text-white font-semibold text-sm hover:from-fuchsia-700 hover:to-violet-700 transition-all shadow-lg shadow-fuchsia-500/25 active:scale-[0.98]">
                📊 My Analytics
              </button>
            </div>
            <button
              onClick={handleShare}
              className="mt-4 w-full px-5 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-gray-400 text-sm font-medium hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
            >
              📤 Share your result
            </button>
          </div>
        </div>

        {/* Certificate of Achievement */}
        {passed && (
          <div className="mt-8 animate-slide-up">
            <div id="quiz-certificate" className="card-accent glow-emerald relative bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-xl border-4 border-double border-indigo-200 dark:border-indigo-700 p-6 sm:p-10 text-center overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-100 dark:bg-emerald-900/30 opacity-60" />
              <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-indigo-100 dark:bg-indigo-900/30 opacity-60" />
              <div className="relative z-10">
                <span className="text-4xl sm:text-5xl inline-block animate-float">🎓</span>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">Certificate of Achievement</p>
                <div className="my-4 flex items-center justify-center gap-3">
                  <span className="h-px w-16 sm:w-24 bg-linear-to-r from-transparent to-emerald-400" />
                  🏆
                  <span className="h-px w-16 sm:w-24 bg-linear-to-r from-emerald-400 to-transparent" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">This is proudly presented to</p>
                <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-gradient-anim">{userName}</h2>
                <p className="mt-4 text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
                  for successfully completing the <strong className="text-indigo-600 dark:text-indigo-400 capitalize">{language}</strong> quiz with a score of{" "}
                  <strong className="text-gray-900 dark:text-white">{localScore}/{localTotal} ({percentage}%)</strong>
                </p>
                <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-linear-to-r ${color} text-white text-xs font-bold my-4 shadow-md`}>
                  {emoji} Grade {grade}
                </div>
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-gray-500 dark:text-gray-400 mt-2">
                  <span>📅 {new Date().toLocaleDateString()}</span>
                  <span>🪪 {certificateId}</span>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-slate-700 flex items-center justify-center gap-3 text-xs">
                  <span>🎓</span>
                  <span className="font-bold text-gray-700 dark:text-gray-200 tracking-wide">QuizVerse AI</span>
                  <span className="text-gray-400 dark:text-gray-500">·</span>
                  <span className="italic text-gray-500 dark:text-gray-400">"Learn, Practice, Master"</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button onClick={() => window.print()} className="btn-shine flex-1 px-5 py-3 rounded-xl bg-linear-to-r from-emerald-600 to-green-600 text-white font-semibold text-sm hover:from-emerald-700 hover:to-green-700 transition-all shadow-lg shadow-emerald-500/25 active:scale-[0.98]">
                🖨 Print / Save as PDF
              </button>
              <button onClick={shareCertificate} className="flex-1 px-5 py-3 rounded-xl bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 text-sm font-semibold hover:bg-gray-200 dark:hover:bg-slate-600 transition-all active:scale-[0.98]">
                📤 Share certificate
              </button>
            </div>
          </div>
        )}

        {/* AI performance report */}
        {analysis && (
          <div className="mt-8 animate-slide-up">
            <div className="card-accent glow-indigo bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">🤖</span>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">AI Performance Report</h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Personalized for your learning history</p>
                </div>
              </div>

              <div className="mb-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 p-4">
                <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{analysis.overview}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">💪 Strengths</p>
                  <ul className="space-y-1.5">
                    {(analysis.strengths || []).slice(0, 4).map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                        <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2">🎯 Focus Areas</p>
                  <ul className="space-y-1.5">
                    {(analysis.weaknesses || []).slice(0, 4).map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-200">
                        <span className="text-red-500 mt-0.5 shrink-0">•</span>{w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="text-xs font-bold uppercase tracking-wider text-fuchsia-600 dark:text-fuchsia-400 mb-2">📌 Recommended next steps</p>
              <ul className="space-y-2">
                {(analysis.recommendations || []).slice(0, 4).map((r, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-xl bg-gray-50 dark:bg-slate-700/50 p-3 text-sm text-gray-700 dark:text-gray-200">
                    <span className="font-bold text-fuchsia-600 dark:text-fuchsia-400 shrink-0">{i + 1}.</span>{r}
                  </li>
                ))}
              </ul>

              {(analysis.suggestedTopics || []).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {(analysis.suggestedTopics || []).slice(0, 4).map((t, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(`/quiz/adaptive/${encodeURIComponent(t)}`)}
                      className="px-3 py-1.5 rounded-full bg-fuchsia-100 dark:bg-fuchsia-900/40 text-fuchsia-700 dark:text-fuchsia-300 text-xs font-semibold hover:bg-fuchsia-200 dark:hover:bg-fuchsia-900/60 transition-all"
                    >
                      ✨ Adaptive {t} →
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Answer review */}
        {reviewItems.length > 0 && (
          <div className="mt-8 animate-slide-up">
            <div className="card-accent glow-indigo bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl">🧾</span>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Answer Review</h2>
              </div>

              <div className="space-y-4">
                {reviewItems.map((q, idx) => {
                  const wasCorrect = q.isCorrect;
                  return (
                    <div key={idx} className={`rounded-xl border-2 p-4 ${
                      wasCorrect
                        ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10"
                        : "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10"
                    }`}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                          <span>{wasCorrect ? "✅" : "❌"}</span>
                          <span>Q{idx + 1}. {q.questionText}</span>
                        </p>
                        {q.difficulty && (
                          <span className="shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400">{q.difficulty}</span>
                        )}
                      </div>

                      <div className="mt-2 space-y-1 text-sm">
                        <p className={wasCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                          Your answer: {String.fromCharCode(65 + q.selectedAnswer)}. {q.options[q.selectedAnswer] ?? "—"}
                        </p>
                        {!wasCorrect && (
                          <p className="text-gray-700 dark:text-gray-300">
                            Correct: {String.fromCharCode(65 + q.correctAnswer)}. {q.options[q.correctAnswer]}
                          </p>
                        )}
                      </div>

                      {!wasCorrect && (
                        <div className="mt-3">
                          {q.explanation ? (
                            <div className="rounded-lg bg-white dark:bg-slate-800 p-3 text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                              <span className="mr-1">🤖</span>{q.explanation}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleExplain(q, idx)}
                              disabled={explaining === idx}
                              className="px-3 py-1.5 rounded-lg bg-fuchsia-600 text-white text-xs font-semibold hover:bg-fuchsia-700 transition disabled:opacity-60"
                            >
                              {explaining === idx ? "Asking AI..." : "🤖 Explain why I got this wrong"}
                            </button>
                          )}
                          {explainText[idx] && (
                            <div className="mt-2 rounded-lg bg-white dark:bg-slate-800 p-3 text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                              <span className="mr-1">🤖</span>{explainText[idx]}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}