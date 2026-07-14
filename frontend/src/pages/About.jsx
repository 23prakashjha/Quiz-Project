import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const features = [
    { icon: "🎯", title: "Interactive Quizzes", desc: "Test your knowledge across 30+ technology topics with instant feedback." },
    { icon: "📊", title: "Track Progress", desc: "See your results and monitor improvement over time." },
    { icon: "⚡", title: "Instant Results", desc: "Get immediate feedback after completing each quiz." },
    { icon: "🌙", title: "Dark Mode", desc: "Easy on the eyes with full dark mode support." },
    { icon: "📱", title: "Responsive Design", desc: "Seamless experience on desktop, tablet, and mobile." },
    { icon: "🆓", title: "Always Free", desc: "No hidden charges. Learn and grow without limits." },
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 px-4 sm:px-6 lg:px-8 py-12 sm:py-20 transition-colors duration-300">
      <div className={`max-w-5xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-5xl mb-4 block">🧠</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            About{" "}
            <span className="bg-linear-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              QuizVerse
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            QuizVerse is a free, interactive platform designed to help developers
            master programming concepts through fun and engaging quizzes.
          </p>
        </div>

        {/* Mission */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 sm:p-10 mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
            We believe learning to code should be accessible to everyone. QuizVerse
            was built to provide a simple, distraction-free way to test and strengthen
            your programming knowledge — whether you are a beginner or an experienced developer.
          </p>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            Covering topics from HTML and CSS to DSA, Docker, and AWS, QuizVerse helps
            you identify strengths and gaps in your knowledge so you can focus on what
            matters most.
          </p>
        </div>

        {/* Features */}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Why QuizVerse?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 mb-12">
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <span className="text-3xl block mb-3">{f.icon}</span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 rounded-lg text-white font-semibold bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 active:scale-[0.98]"
          >
            Start a Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
