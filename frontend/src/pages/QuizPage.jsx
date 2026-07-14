import React, { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const API = "https://quiz-project-aqu6.onrender.com";

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(600); // 10 min
  const [timerActive, setTimerActive] = useState(false);

  const navigate = useNavigate();
  const { topic } = useParams();
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError("");

        if (!topic) { setError("No topic specified."); return; }

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserName(user.name || user.email || "User");
        }

        const normalizedTopic = topic.trim().toLowerCase();
        const res = await axios.get(
          `${API}/api/quiz?language=${encodeURIComponent(normalizedTopic)}`
        );

        if (res.data?.success) {
          const qs = res.data.data;
          setQuestions(qs);
          if (qs.length > 0) {
            setTimeLeft(qs.length * 60); // 1 min per question
            setTimerActive(true);
          }
          if (qs.length === 0) setError(`No ${topic.toUpperCase()} questions found.`);
        } else {
          setError(res.data?.message || "No questions found.");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load quiz questions.");
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [topic]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive]);

  useEffect(() => {
    if (timeLeft === 0 && timerActive) {
      clearInterval(timerRef.current);
      submitQuiz();
    }
  }, [timeLeft, timerActive]);

  const submitQuiz = useCallback(() => {
    if (submitting || questions.length === 0) return;
    setSubmitting(true);
    clearInterval(timerRef.current);

    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score++;
    });

    navigate("/result", {
      state: { score, total: questions.length, language: topic },
    });
  }, [answers, questions, navigate, topic, submitting]);

  const answered = Object.keys(answers).length;
  const progress = questions.length > 0 ? (answered / questions.length) * 100 : 0;

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getOptionClass = (qIdx, optIdx) => {
    const base = "flex items-center gap-3 w-full p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer text-left text-sm sm:text-base";
    if (answers[qIdx] === optIdx) {
      return `${base} border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm`;
    }
    return `${base} border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700/50 text-gray-700 dark:text-gray-200 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
        <div className="text-center animate-fade-in">
          <div className="w-12 h-12 mx-auto mb-4 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 px-4">
        <div className="text-center max-w-md animate-scale-in">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-red-500 dark:text-red-400 font-semibold text-lg mb-2">{error}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Try a different topic or come back later.</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-md"
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-5 py-2.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition"
            >
              Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 transition-colors duration-300">
      {/* Top Bar */}
      <div className="sticky top-16 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {userName.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{userName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{topic?.toUpperCase()} Quiz</p>
              </div>
            </div>

            {/* Timer */}
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

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
              <span>{answered} of {questions.length} answered</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
        <div className="animate-fade-in" key={currentQ}>
          {/* Question Navigation */}
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

          {/* Question Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-5 sm:p-8">
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-2">
              Question {currentQ + 1} of {questions.length}
            </p>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-6 leading-relaxed">
              {questions[currentQ]?.questionText}
            </h2>

            <div className="space-y-3">
              {questions[currentQ]?.options.map((opt, idx) => (
                <label
                  key={idx}
                  className={getOptionClass(currentQ, idx)}
                >
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

          {/* Navigation Buttons */}
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
                className="px-4 sm:px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-md shadow-indigo-500/25"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={submitQuiz}
                disabled={submitting}
                className="px-5 sm:px-6 py-2.5 rounded-xl text-sm font-semibold bg-linear-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-md shadow-emerald-500/25"
              >
                {submitting ? "Submitting..." : "Submit Quiz ✓"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
