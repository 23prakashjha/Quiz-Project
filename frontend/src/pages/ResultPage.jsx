import React, { useEffect, useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const CONFETTI_COLORS = ["#4f46e5", "#06b6d4", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#ec4899"];

export default function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { score = 0, total = 0, language = "Quiz" } = state || {};

  const [percentage, setPercentage] = useState(0);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPercentage(Math.round((score / Math.max(total, 1)) * 100));
    }, 400);
    const confettiTimer = setTimeout(() => setShowConfetti(false), 4000);
    return () => { clearTimeout(timer); clearTimeout(confettiTimer); };
  }, [score, total]);

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
    const text = `🧠 I scored ${score}/${total} (${percentage}%) on the ${language.toUpperCase()} quiz at QuizVerse! Can you beat my score?`;
    if (navigator.share) {
      await navigator.share({ title: "QuizVerse Result", text }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(text);
      alert("Result copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-100 via-white to-cyan-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 p-4 relative overflow-hidden transition-colors duration-300">
      {/* Confetti */}
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

      <div className="w-full max-w-md animate-scale-in">
        {/* Result Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl shadow-indigo-500/10 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 p-6 sm:p-8 text-center transform transition-all duration-500 hover:scale-[1.01]">
          {/* Grade Badge */}
          <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-linear-to-r ${color} text-white text-xs font-bold mb-4 shadow-lg`}>
            {grade}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {language.toUpperCase()} Quiz
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Here's how you performed</p>

          {/* Progress Ring */}
          <div className="relative flex justify-center mb-6">
            <svg className="w-36 h-36 sm:w-40 sm:h-40 -rotate-90">
              <circle
                className="text-gray-200 dark:text-slate-600"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="64"
                cx="80"
                cy="80"
              />
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
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {percentage}%
              </span>
            </div>
          </div>

          {/* Score Display */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-4xl sm:text-5xl font-extrabold text-indigo-600 dark:text-indigo-400">{score}</span>
            <span className="text-gray-400 dark:text-gray-500 text-lg font-medium">/ {total}</span>
          </div>

          {/* Correct / Wrong Breakdown */}
          <div className="flex items-center justify-center gap-6 mb-5">
            <div className="flex items-center gap-1.5 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-gray-600 dark:text-gray-300">Correct: <strong className="text-emerald-600 dark:text-emerald-400">{score}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-gray-600 dark:text-gray-300">Wrong: <strong className="text-red-600 dark:text-red-400">{total - score}</strong></span>
            </div>
          </div>

          {/* Message */}
          <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6">
            <p className="text-gray-700 dark:text-gray-200 text-sm leading-relaxed">{message}</p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(`/quiz/${language.toLowerCase()}`)}
              className="flex-1 px-5 py-3 rounded-xl bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98]"
            >
              🔄 Retry Quiz
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 px-5 py-3 rounded-xl bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 font-semibold text-sm hover:bg-gray-300 dark:hover:bg-slate-600 transition-all active:scale-[0.98]"
            >
              🏠 Home
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="mt-4 w-full px-5 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-gray-400 text-sm font-medium hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
          >
            📤 Share your result
          </button>
        </div>
      </div>
    </div>
  );
}
