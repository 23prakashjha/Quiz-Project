import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const TOPICS = [
  { name: "HTML", icon: "🌐", gradient: "linear-gradient(135deg, #f97316, #ef4444)", desc: "Structure the web" },
  { name: "CSS", icon: "🎨", gradient: "linear-gradient(135deg, #60a5fa, #6366f1)", desc: "Style it beautiful" },
  { name: "JavaScript", icon: "⚡", gradient: "linear-gradient(135deg, #facc15, #f59e0b)", desc: "Make it interactive" },
  { name: "React", icon: "⚛️", gradient: "linear-gradient(135deg, #38bdf8, #3b82f6)", desc: "Build modern UIs" },
  { name: "TailwindCSS", icon: "🌊", gradient: "linear-gradient(135deg, #2dd4bf, #22c55e)", desc: "Utility-first CSS" },
  { name: "Node.js", icon: "🟢", gradient: "linear-gradient(135deg, #a3e635, #22c55e)", desc: "JavaScript runtime" },
  { name: "Express.js", icon: "🚂", gradient: "linear-gradient(135deg, #9ca3af, #4b5563)", desc: "Web framework" },
  { name: "MongoDB", icon: "🍃", gradient: "linear-gradient(135deg, #34d399, #16a34a)", desc: "NoSQL database" },
  { name: "Python", icon: "🐍", gradient: "linear-gradient(135deg, #60a5fa, #eab308)", desc: "Versatile language" },
  { name: "Java", icon: "☕", gradient: "linear-gradient(135deg, #f87171, #f97316)", desc: "Enterprise grade" },
  { name: "C", icon: "💻", gradient: "linear-gradient(135deg, #93c5fd, #2563eb)", desc: "Systems programming" },
  { name: "C++", icon: "⚙️", gradient: "linear-gradient(135deg, #818cf8, #4338ca)", desc: "High performance" },
  { name: "Bootstrap", icon: "🅱️", gradient: "linear-gradient(135deg, #c084fc, #9333ea)", desc: "Responsive toolkit" },
  { name: "TypeScript", icon: "📘", gradient: "linear-gradient(135deg, #60a5fa, #2563eb)", desc: "Typed JavaScript" },
  { name: "MySQL", icon: "🗄️", gradient: "linear-gradient(135deg, #22d3ee, #3b82f6)", desc: "Relational DB" },
  { name: "Git", icon: "🔀", gradient: "linear-gradient(135deg, #f97316, #dc2626)", desc: "Version control" },
  { name: "GitHub", icon: "🐙", gradient: "linear-gradient(135deg, #374151, #000000)", desc: "Code hosting" },
  { name: "Next.js", icon: "▲", gradient: "linear-gradient(135deg, #4b5563, #111827)", desc: "React framework" },
  { name: "Redux", icon: "🔄", gradient: "linear-gradient(135deg, #a855f7, #4f46e5)", desc: "State management" },
  { name: "Docker", icon: "🐳", gradient: "linear-gradient(135deg, #0ea5e9, #1d4ed8)", desc: "Containerization" },
  { name: "Firebase", icon: "🔥", gradient: "linear-gradient(135deg, #facc15, #f97316)", desc: "Backend as a service" },
  { name: "AWS", icon: "☁️", gradient: "linear-gradient(135deg, #eab308, #ea580c)", desc: "Cloud computing" },
  { name: "PHP", icon: "🐘", gradient: "linear-gradient(135deg, #818cf8, #4f46e5)", desc: "Server-side scripting" },
  { name: "jQuery", icon: "🧩", gradient: "linear-gradient(135deg, #38bdf8, #0284c7)", desc: "DOM manipulation" },
  { name: "Kubernetes", icon: "☸️", gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)", desc: "Container orchestration" },
  { name: "DSA", icon: "📊", gradient: "linear-gradient(135deg, #34d399, #059669)", desc: "Problem solving" },
  { name: "Algorithms", icon: "🧮", gradient: "linear-gradient(135deg, #818cf8, #3b82f6)", desc: "Step by step" },
  { name: "OS", icon: "🖥️", gradient: "linear-gradient(135deg, #3b82f6, #4338ca)", desc: "System core" },
  { name: "Networks", icon: "🌍", gradient: "linear-gradient(135deg, #06b6d4, #1d4ed8)", desc: "Connect the world" },
  { name: "DBMS", icon: "📦", gradient: "linear-gradient(135deg, #14b8a6, #16a34a)", desc: "Data management" },
];

export default function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");
  const [search, setSearch] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name || user.email || "User");
    }
    setTimeout(() => setVisible(true), 100);
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return TOPICS;
    const q = search.toLowerCase();
    return TOPICS.filter(
      (t) => t.name.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q)
    );
  }, [search]);

  const handleStartQuiz = (topic) => {
    navigate(`/quiz/${topic.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 px-4 sm:px-6 lg:px-8 py-8 sm:py-12 transition-colors duration-300">
      {/* Hero Section */}
      <div className={`text-center mb-8 sm:mb-12 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm font-medium mb-4">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          30+ Topics to Explore
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
          Welcome back,{" "}
          <span className="bg-linear-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
            {userName}
          </span>
          <span className="inline-block animate-float">👋</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Challenge yourself with interactive quizzes across{" "}
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">30+ technologies</span>.
          Master the code, one quiz at a time.
        </p>
      </div>

      {/* Search Bar */}
      <div className={`max-w-xl mx-auto mb-8 sm:mb-12 transition-all duration-700 delay-100 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="relative group">
          <div className="absolute inset-0 bg-linear-to-r from-indigo-500 to-cyan-500 rounded-xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
          <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-xl shadow-lg shadow-indigo-500/5 border border-gray-200 dark:border-slate-700 overflow-hidden">
            <svg className="w-5 h-5 text-gray-400 ml-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search topics... (e.g., React, Python)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3.5 bg-transparent text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none text-sm"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="mr-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {search && filtered.length === 0 && (
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-3">
            No topics found for "{search}". Try a different search term.
          </p>
        )}
      </div>

      {/* Topics Grid */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 max-w-7xl mx-auto transition-all duration-700 delay-200 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {filtered.map((topic, index) => (
          <div
            key={topic.name}
            onClick={() => handleStartQuiz(topic.name)}
            className="group relative cursor-pointer rounded-xl sm:rounded-2xl p-5 sm:p-6 text-white shadow-lg hover:shadow-2xl card-hover overflow-hidden animate-fade-in"
            style={{ background: topic.gradient, animationDelay: `${index * 50}ms`, animationFillMode: "backwards" }}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white" />
            </div>

            {/* Glass Shine */}
            <div className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-0 group-hover:opacity-20 bg-linear-to-br from-white to-transparent transition-opacity duration-300 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl sm:text-3xl">{topic.icon}</span>
                <span className="text-2xl sm:text-3xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-2">
                  →
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold drop-shadow-lg mb-1">
                {topic.name}
              </h2>
              <p className="text-xs sm:text-sm opacity-80">{topic.desc}</p>
            </div>

            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl sm:rounded-2xl" />
          </div>
        ))}
      </div>

      {/* Stats Footer */}
      <div className={`text-center mt-12 sm:mt-16 transition-all duration-700 delay-300 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="inline-flex flex-wrap items-center justify-center gap-6 sm:gap-10 px-6 sm:px-10 py-4 sm:py-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 shadow-sm">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-indigo-600 dark:text-indigo-400">{TOPICS.length}+</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Topics</p>
          </div>
          <div className="w-px h-10 bg-gray-200 dark:bg-slate-600" />
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-cyan-600 dark:text-cyan-400">Free</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Always</p>
          </div>
          <div className="w-px h-10 bg-gray-200 dark:bg-slate-600" />
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">Instant</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Results</p>
          </div>
        </div>
        <p className="mt-6 text-xs sm:text-sm text-gray-400 dark:text-gray-500">
          © {new Date().getFullYear()} QuizVerse — Master the Code, One Quiz at a Time 🧠
        </p>
      </div>
    </div>
  );
}
