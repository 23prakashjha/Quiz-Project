import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { API, authHeaders, DIFFICULTIES } from "../api.js";

export default function QuizPage() {
  const [setup, setSetup] = useState(true);
  const [difficulty, setDifficulty] = useState("easy");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600);
  const [timerActive, setTimerActive] = useState(false);

  const navigate = useNavigate();
  const { topic } = useParams();
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name || user.email || "User");
    }
  }, []);

  const startQuiz = async () => {
    if (!topic) { setError("No topic specified."); return; }

    if (difficulty === "adaptive") {
      navigate(`/quiz/adaptive/${encodeURIComponent(topic)}`);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const normalized = topic.trim().toLowerCase();
      const res = await axios.get(
        `${API}/api/quiz?language=${encodeURIComponent(normalized)}&difficulty=${difficulty}&generate=1`
      );

      if (res.data?.success) {
        const qs = res.data.data;
        if (!qs.length) { setError(`No ${topic.toUpperCase()} questions found.`); return; }
        setQuestions(qs);
        setTimeLeft(qs.length * 60);
        setTimerActive(true);
        setSetup(false);
        startTimeRef.current = Date.now();
      } else {
        setError(res.data?.message || "No questions found.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load quiz questions.");
    } finally {
      setLoading(false);
    }
  };

  const submitQuiz = useCallback(async () => {
    if (submitting || questions.length === 0) return;
    setSubmitting(true);
    clearInterval(timerRef.current);

    const timeTakenSec = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current) / 1000)
      : 0;

    const payload = questions.map((q, i) => ({
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      selectedAnswer: answers[i] ?? null,
      explanation: q.explanation || "",
      difficulty: q.difficulty || difficulty,
      aiGenerated: Boolean(q.aiGenerated),
    }));

    try {
      const res = await axios.post(
        `${API}/api/attempts`,
        { topic, mode: "classic", difficulty, questions: payload, timeTakenSec },
        authHeaders()
      );
      navigate("/result", {
        state: {
          attempt: res.data.attempt,
          analysis: res.data.analysis,
          language: topic,
        },
      });
    } catch {
      // Offline safety net: still show results locally.
      let score = 0;
      questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) score++; });
      navigate("/result", {
        state: {
          attempt: null,
          localScore: score,
          localTotal: questions.length,
          language: topic,
        },
      });
    }
  }, [answers, questions, navigate, topic, difficulty, submitting]);

  useEffect(() => {
    if (!timerActive) return undefined;
    timerRef.current = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  useEffect(() => {
    if (timeLeft === 0 && timerActive && !submitting) submitQuiz();
  }, [timeLeft, timerActive, submitQuiz, submitting]);

  const answered = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answered / questions.length) * 100 : 0;

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getOptionClass = (qIdx, optIdx) => {
    const base = "flex items-center gap-3 w-full p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left text-sm sm:text-base hover:translate-x-1";
    if (answers[qIdx] === optIdx) {
      return `${base} border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm`;
    }
    return `${base} border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-gray-700 dark:text-gray-200 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20`;
  };

  /* ---------- Difficulty setup screen ---------- */
  if (setup) {
    return (
      <div className="relative overflow-hidden min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 px-4 py-8 transition-colors duration-300">
        <div className="hero-grid absolute inset-0" />
        <div className="aurora-blob b-indigo w-80 h-80 -top-24 -left-24" />
        <div className="aurora-blob b-cyan w-72 h-72 -bottom-24 -right-20" style={{ animationDelay: "-10s" }} />
        <div className="w-full max-w-2xl animate-slide-up relative z-10">
          <div className="text-center mb-8">
            <div className="text-5xl mb-3">🎯</div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              {topic?.toUpperCase() || "Quiz"}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
              Choose a difficulty — or let QuizVerse AI adapt to you in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.key}
                onClick={() => setDifficulty(d.key)}
                className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 group ${
                  difficulty === d.key
                    ? d.key === "adaptive"
                      ? "border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20 glow-fuchsia"
                      : "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 glow-indigo"
                    : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl">{d.emoji}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    difficulty === d.key
                      ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-300"
                  }`}>
                    {d.key === "adaptive" ? "AI MODE" : d.label.toUpperCase()}
                  </span>
                </div>
                <p className="font-bold text-gray-900 dark:text-white text-lg">{d.label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{d.desc}</p>
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg px-4 py-3 mb-5 animate-slide-down">
              {error}
            </div>
          )}

          <button
            onClick={startQuiz}
            disabled={loading}
            className={`btn-shine w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all shadow-lg disabled:opacity-60 active:scale-[0.98] ${
              difficulty === "adaptive"
                ? "bg-linear-to-r from-fuchsia-600 to-violet-600 shadow-fuchsia-500/25"
                : "bg-linear-to-r from-indigo-600 to-cyan-500 shadow-indigo-500/25"
            }`}
          >
            {loading ? "Loading questions..." : difficulty === "adaptive" ? "✨ Start Adaptive Quiz" : "Start Quiz"}
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full mt-3 py-2.5 rounded-xl bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition"
          >
            ← Back to topics
          </button>
        </div>
      </div>
    );
  }

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="relative overflow-hidden min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
        <div className="aurora-blob b-indigo w-80 h-80 -top-24 -left-24" />
        <div className="aurora-blob b-cyan w-80 h-80 -bottom-24 -right-20" style={{ animationDelay: "-9s" }} />
        <div className="text-center animate-fade-in relative z-10">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (error) {
    return (
      <div className="relative overflow-hidden min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 px-4">
        <div className="aurora-blob b-indigo w-80 h-80 -top-24 -left-24" />
        <div className="aurora-blob b-fuchsia w-72 h-72 -bottom-20 -right-20" style={{ animationDelay: "-12s" }} />
        <div className="text-center max-w-md animate-scale-in relative z-10">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-red-500 dark:text-red-400 font-semibold text-lg mb-2">{error}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Try a different topic, difficulty, or come back later.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => startQuiz()} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-md">
              Retry
            </button>
            <button onClick={() => navigate("/")} className="px-5 py-2.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition">
              Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Quiz ---------- */
  return (
    <div className="relative overflow-hidden min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 transition-colors duration-300">
      <div className="aurora-blob b-indigo w-80 h-80 -top-24 -left-24" />
      <div className="aurora-blob b-cyan w-72 h-72 bottom-0 -right-24" style={{ animationDelay: "-13s" }} />
      <div className="sticky top-16 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {userName.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {topic?.toUpperCase()} · <span className="capitalize">{difficulty}</span>
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-bold ${
              timeLeft < 60
                ? "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse"
                : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200"
            }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(timeLeft)}
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
              <span>{answered} of {questions.length} answered</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full progress-shine bg-linear-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 relative z-10">
        <div className="animate-fade-in" key={currentQ}>
          <div className="flex flex-wrap gap-1.5 mb-6">
            {questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  i === currentQ
                    ? "bg-indigo-600 text-white shadow-md"
                    : answers[i] !== undefined
                    ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-5 sm:p-8">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Question {currentQ + 1} of {questions.length}
              </p>
              {questions[currentQ]?.difficulty && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400">
                  {questions[currentQ].difficulty}
                </span>
              )}
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6 leading-relaxed">
              {questions[currentQ]?.questionText}
            </h2>

            <div className="space-y-3">
              {questions[currentQ]?.options.map((opt, idx) => (
                <label key={idx} className={getOptionClass(currentQ, idx)}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                    answers[currentQ] === idx
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-slate-600 text-gray-500 dark:text-gray-300"
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <input
                    type="radio"
                    name={`q${currentQ}`}
                    value={idx}
                    checked={answers[currentQ] === idx}
                    onChange={() => setAnswers({ ...answers, [currentQ]: idx })}
                    className="sr-only"
                  />
                  <span className="font-medium">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 gap-3">
            <button
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              className="px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              ← Previous
            </button>

            <span className="text-xs text-gray-400 dark:text-gray-500">
              {currentQ + 1} / {questions.length}
            </span>

            {currentQ < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
                className="btn-shine px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/25"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={submitQuiz}
                disabled={submitting}
                className="btn-shine px-5 sm:px-6 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-500/25"
              >
                {submitting ? "Analyzing..." : "Submit & Analyze ✓"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}