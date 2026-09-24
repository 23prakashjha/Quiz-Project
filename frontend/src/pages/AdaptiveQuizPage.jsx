import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { API, authHeaders } from "../api.js";

const DIFF_COLORS = {
  easy: { bg: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400", badge: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400" },
  medium: { bg: "bg-amber-500", text: "text-amber-600 dark:text-amber-400", badge: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400" },
  hard: { bg: "bg-red-500", text: "text-red-600 dark:text-red-400", badge: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400" },
};

export default function AdaptiveQuizPage() {
  const navigate = useNavigate();
  const { topic } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [question, setQuestion] = useState(null);
  const [difficulty, setDifficulty] = useState("easy");
  const [progress, setProgress] = useState({ answered: 0, total: 10 });
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(null);
  const [answering, setAnswering] = useState(false);
  const [streaks, setStreaks] = useState(0);
  const startedRef = useRef(false);

  const start = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.post(
        `${API}/api/quiz/adaptive/start`,
        { topic, totalQuestions: 10 },
        authHeaders()
      );
      setSessionId(res.data.sessionId);
      setQuestion(res.data.question);
      setDifficulty(res.data.difficulty);
      setProgress(res.data.progress);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start adaptive quiz.");
    } finally {
      setLoading(false);
    }
  }, [topic]);

  // kick off on mount (ref guards against StrictMode double-invoke)
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    start();
  }, [start]);

  const handleSelect = async (optIdx) => {
    if (selected !== null || answering) return;
    setSelected(optIdx);
    setAnswering(true);
    try {
      const res = await axios.post(
        `${API}/api/quiz/adaptive/${sessionId}/answer`,
        { selectedAnswer: optIdx },
        authHeaders()
      );
      const d = res.data;
      setRevealed({
        isCorrect: d.isCorrect,
        correctAnswer: d.correctAnswer,
        explanation: d.explanation,
        done: Boolean(d.attempt),
        attempt: d.attempt,
        analysis: d.analysis,
        answers: d.answers,
        maxStreak: d.maxStreak,
      });
      setProgress(d.progress);
      if (!d.done) {
        setQuestion(d.nextQuestion);
        setDifficulty(d.difficulty);
      }
      setStreaks(d.isCorrect ? (prev) => prev + 1 : 0);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong while answering.");
      setSelected(null);
    } finally {
      setAnswering(false);
    }
  };

  const nextQuestion = () => {
    if (revealed.done) {
      navigate("/result", {
        state: { attempt: revealed.attempt, analysis: revealed.analysis, answers: revealed.answers, language: topic },
      });
      return;
    }
    setSelected(null);
    setRevealed(null);
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden min-h-screen flex items-center justify-center bg-linear-to-br from-fuchsia-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
        <div className="aurora-blob b-fuchsia w-80 h-80 -top-24 -left-24" />
        <div className="aurora-blob b-indigo w-80 h-80 -bottom-24 -right-20" style={{ animationDelay: "-9s" }} />
        <div className="text-center animate-fade-in relative z-10">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-fuchsia-200 dark:border-fuchsia-900 border-t-fuchsia-600 rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Analyzing your first question...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative overflow-hidden min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 px-4">
        <div className="aurora-blob b-fuchsia w-72 h-72 -top-20 -right-20" />
        <div className="aurora-blob b-indigo w-72 h-72 -bottom-20 -left-20" style={{ animationDelay: "-10s" }} />
        <div className="text-center max-w-md animate-scale-in relative z-10">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-red-500 dark:text-red-400 font-semibold text-lg mb-2">{error}</p>
          <button onClick={() => navigate("/")} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-md">
            Back Home
          </button>
        </div>
      </div>
    );
  }

  const diffMeta = DIFF_COLORS[difficulty] || DIFF_COLORS.easy;
  const answeredCount = progress.answered;
  const total = progress.total || 10;

  return (
    <div className="relative overflow-hidden min-h-screen bg-linear-to-br from-fuchsia-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 transition-colors duration-300">
      <div className="aurora-blob b-fuchsia w-72 h-72 -top-20 -right-20" />
      <div className="aurora-blob b-indigo w-80 h-80 bottom-0 -left-24" style={{ animationDelay: "-12s" }} />
      <div className="sticky top-16 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                ✨ Adaptive · {topic?.toUpperCase()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                AI adjusts difficulty after every answer
              </p>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${diffMeta.badge} transition-colors duration-300`}>
              {difficulty}
            </span>
          </div>

          {/* Difficulty meter */}
          <div className="mt-3 flex gap-1.5">
            {["easy", "medium", "hard"].map((d) => (
              <div
                key={d}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  ["easy", "medium", "hard"].indexOf(difficulty) >= ["easy", "medium", "hard"].indexOf(d)
                    ? DIFF_COLORS[d].bg
                    : "bg-gray-200 dark:bg-slate-700"
                }`}
              />
            ))}
          </div>

          {/* Progress */}
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{answeredCount} of {total} answered</span>
            {streaks > 0 && <span className="text-amber-600 dark:text-amber-400 font-semibold">🔥 {streaks} correct in a row</span>}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 relative z-10">
        {revealed ? (
          <div className="animate-fade-in">
            {/* Feedback card */}
            <div className={`rounded-2xl shadow-lg border p-5 sm:p-6 mb-4 ${
              revealed.isCorrect
                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 glow-emerald"
                : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 glow-fuchsia"
            }`}>
              <div className="flex items-start gap-3">
                <span className="text-3xl">{revealed.isCorrect ? "✅" : "❌"}</span>
                <div className="min-w-0">
                  <h3 className={`font-bold text-lg ${revealed.isCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {revealed.isCorrect ? "Correct!" : "Not quite right"}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    Correct answer:{" "}
                    <strong>
                      {String.fromCharCode(65 + revealed.correctAnswer)}.{" "}
                      {question?.options?.[revealed.correctAnswer] ?? ""}
                    </strong>
                  </p>

                  {!revealed.isCorrect && (
                    <div className="mt-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-fuchsia-600 dark:text-fuchsia-400 mb-1 flex items-center gap-1">
                        <span className="text-sm">🤖</span> AI Explanation
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
                        {revealed.explanation || "Practice this concept — the adaptive engine will revisit it."}
                      </p>
                    </div>
                  )}

                  {revealed.done && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Quiz complete! Your adaptive report is ready.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={nextQuestion}
              className="btn-shine w-full py-3 rounded-xl bg-linear-to-r from-fuchsia-600 to-violet-600 text-white font-bold text-sm hover:from-fuchsia-700 hover:to-violet-700 transition-all shadow-lg shadow-fuchsia-500/25 active:scale-[0.98]"
            >
              {revealed.done ? "View AI Report →" : "Next Question →"}
            </button>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-5 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-wider text-fuchsia-600 dark:text-fuchsia-400 mb-2">
                Question {answeredCount + 1} of {total}
              </p>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6 leading-relaxed">
                {question?.questionText}
              </h2>

              <div className="space-y-3">
                {question?.options.map((opt, idx) => {
                  const base = "flex items-center gap-3 w-full p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left text-sm sm:text-base hover:translate-x-1";
                  const cls = selected === idx
                    ? `${base} border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 shadow-sm`
                    : `${base} border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-gray-700 dark:text-gray-200 hover:border-fuchsia-300 dark:hover:border-fuchsia-500 hover:bg-fuchsia-50/50 dark:hover:bg-fuchsia-900/20 cursor-pointer`;
                  return (
                    <button key={idx} className={cls} onClick={() => handleSelect(idx)} disabled={selected !== null}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                        selected === idx ? "bg-fuchsia-600 text-white" : "bg-gray-100 dark:bg-slate-600 text-gray-500 dark:text-gray-300"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="font-medium">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
              Answer correctly twice in a row to level up · get one wrong to step down
            </p>
          </div>
        )}
      </div>
    </div>
  );
}