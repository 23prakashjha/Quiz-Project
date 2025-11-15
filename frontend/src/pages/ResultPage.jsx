import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResultPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { score = 0, total = 0, language = "Quiz" } = state || {};

  const [percentage, setPercentage] = useState(0);

  // Animate progress
  useEffect(() => {
    const timer = setTimeout(() => {
      setPercentage(Math.round((score / total) * 100));
    }, 400);
    return () => clearTimeout(timer);
  }, [score, total]);

  // Emoji feedback
  const getEmoji = () => {
    if (percentage >= 80) return "🎉";
    if (percentage >= 60) return "👏";
    if (percentage >= 40) return "🙂";
    return "😅";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-100 to-indigo-200 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 text-center transform transition-all duration-500 hover:scale-[1.02]">
        <h1 className="text-3xl font-bold text-indigo-600 mb-2">
          {language.toUpperCase()} Quiz Result
        </h1>
        <p className="text-gray-500 mb-6">
          Great job finishing your quiz! Here's how you did:
        </p>

        {/* Progress Circle */}
        <div className="relative flex justify-center mb-6">
          <svg className="w-40 h-40">
            <circle
              className="text-gray-200"
              strokeWidth="10"
              stroke="currentColor"
              fill="transparent"
              r="60"
              cx="80"
              cy="80"
            />
            <circle
              className="text-indigo-500 transition-all duration-700 ease-out"
              strokeWidth="10"
              strokeDasharray={2 * Math.PI * 60}
              strokeDashoffset={
                2 * Math.PI * 60 * (1 - percentage / 100)
              }
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="60"
              cx="80"
              cy="80"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-indigo-600">
              {percentage}%
            </span>
          </div>
        </div>

        {/* Emoji + Score */}
        <div className="text-5xl mb-4">{getEmoji()}</div>
        <p className="text-lg font-semibold text-gray-700 mb-6">
          You scored{" "}
          <span className="text-indigo-600 font-bold">
            {score}
          </span>{" "}
          out of{" "}
          <span className="text-indigo-600 font-bold">
            {total}
          </span>
        </p>

        {/* Message */}
        <p className="text-gray-600 mb-8">
          {percentage >= 80
            ? "Excellent work! You really know your stuff!"
            : percentage >= 60
            ? "Nice job! You’re getting there!"
            : percentage >= 40
            ? "Good try! Keep practicing and you’ll improve!"
            : "Don’t worry — every expert starts somewhere! Try again!"}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => navigate(`/quiz/${language}`)}
            className="w-full sm:w-auto px-5 py-3 rounded-lg bg-indigo-500 text-white font-semibold hover:bg-indigo-600 transition"
          >
            Retry Quiz
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full sm:w-auto px-5 py-3 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

