import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.username || user.name || user.email || "User");
    }
  }, []);

  const topics = [
    { name: "HTML", color: "from-orange-400 to-red-500" },
    { name: "CSS", color: "from-blue-400 to-indigo-500" },
    { name: "JavaScript", color: "from-yellow-400 to-amber-500" },
    { name: "React", color: "from-sky-400 to-blue-500" },
    { name: "TailwindCSS", color: "from-teal-400 to-green-500" },
    { name: "Node.js", color: "from-lime-400 to-green-500" },
    { name: "Express.js", color: "from-gray-400 to-gray-600" },
    { name: "MongoDB", color: "from-emerald-400 to-green-600" },
    { name: "Python", color: "from-blue-400 to-yellow-500" },
    { name: "Java", color: "from-red-400 to-orange-500" },
    { name: "C", color: "from-blue-300 to-blue-600" },
    { name: "C++", color: "from-indigo-400 to-indigo-700" },
    { name: "Bootstrap", color: "from-purple-400 to-purple-600" },
    { name: "jQuery", color: "from-sky-400 to-sky-600" },
    { name: "PHP", color: "from-indigo-400 to-indigo-600" },
    { name: "TypeScript", color: "from-blue-400 to-blue-600" },
    { name: "MySQL", color: "from-cyan-400 to-blue-500" },
    { name: "Git", color: "from-orange-500 to-red-600" },
    { name: "GitHub", color: "from-gray-700 to-black" },
    { name: "Next.js", color: "from-gray-600 to-gray-900" },
    { name: "Redux", color: "from-purple-500 to-indigo-600" },
    { name: "Docker", color: "from-sky-500 to-blue-700" },
    { name: "Kubernetes", color: "from-blue-500 to-cyan-600" },
    { name: "Firebase", color: "from-yellow-400 to-orange-500" },
    { name: "AWS", color: "from-yellow-500 to-orange-600" },
    { name: "Data Structures", color: "from-green-400 to-emerald-600" },
    { name: "Algorithms", color: "from-indigo-400 to-blue-600" },
    { name: "Operating System", color: "from-blue-500 to-indigo-700" },
    { name: "Computer Networks", color: "from-cyan-500 to-blue-700" },
    { name: "DBMS", color: "from-teal-500 to-green-600" },
  ];

  const handleStartQuiz = (topic) => {
    navigate(`/quiz/${topic.toLowerCase()}`);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-100 to-gray-200 dark:from-slate-900 dark:to-gray-800 px-5 py-12">

      {/* User Greeting */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-blue-600 dark:text-blue-400 drop-shadow-sm">
          Welcome, {userName}! 👋
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mt-3 text-lg">
          Choose a topic below and start mastering your coding skills 🚀
        </p>
      </div>

      {/* Topics Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 max-w-7xl mx-auto">
        {topics.map((topic, index) => (
          <div
            key={index}
            onClick={() => handleStartQuiz(topic.name)}
            className={`
              relative cursor-pointer bg-linear-to-r ${topic.color}
              rounded-2xl p-6 text-white shadow-xl backdrop-blur-lg
              transform transition-all duration-300 hover:scale-105 hover:shadow-2xl
            `}
          >
            {/* Shine Effect */}
            <div className="absolute inset-0 rounded-2xl opacity-20 bg-linear-to-br from-white to-transparent pointer-events-none"></div>

            {/* Card Content */}
            <h2 className="text-2xl font-bold text-center drop-shadow-lg">
              {topic.name}
            </h2>
            <p className="text-center text-sm opacity-90 mt-1">
              Start {topic.name} Quiz →
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-center mt-16 text-gray-600 dark:text-gray-400 text-sm">
        <p>
          © {new Date().getFullYear()} <span className="font-semibold text-blue-600 dark:text-blue-400">QuizVerse</span>  
          — Master the Code, One Quiz at a Time 🧠
        </p>
      </div>
    </div>
  );
}
