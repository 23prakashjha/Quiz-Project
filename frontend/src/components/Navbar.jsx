import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar({ onLogout, user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [dark, setDark] = useState(() => {
    return localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Home", icon: "🏠" },
    ...(user?.role === "admin"
      ? [
          { path: "/admin", label: "Admin", icon: "⚙️" },
          { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
        ]
      : []),
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700 shadow-lg shadow-gray-200/20 dark:shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => navigate("/")}>
            <span className="text-2xl">🧠</span>
            <span className="text-xl font-extrabold bg-linear-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent group-hover:from-indigo-500 group-hover:to-cyan-400 transition-all">
              QuizVerse
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => { navigate(link.path); setMobileOpen(false); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.path)
                    ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </button>
            ))}

            {/* Dark mode toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Toggle dark mode"
            >
              {dark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* User Dropdown */}
            {user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-linear-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate">
                    {user.name || "User"}
                  </span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 py-2 z-50 animate-slide-down">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                        {user.role || "user"}
                      </span>
                    </div>

                    {/* Menu Items */}
                    <button
                      onClick={() => { navigate("/"); setUserMenuOpen(false); }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <span>🏠</span> Home
                    </button>
                    {user.role === "admin" && (
                      <>
                        <button
                          onClick={() => { navigate("/admin"); setUserMenuOpen(false); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <span>⚙️</span> Admin Panel
                        </button>
                        <button
                          onClick={() => { navigate("/admin/dashboard"); setUserMenuOpen(false); }}
                          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                          <span>📊</span> Dashboard
                        </button>
                      </>
                    )}
                    <div className="border-t border-gray-100 dark:border-slate-700 mt-1 pt-1">
                      <button
                        onClick={() => { setUserMenuOpen(false); onLogout(); navigate("/login"); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
              aria-label="Toggle dark mode"
            >
              {dark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 overflow-hidden ${mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="px-4 pb-4 space-y-1 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
          {user && (
            <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-lg bg-gray-50 dark:bg-slate-800/50">
              <div className="w-9 h-9 rounded-full bg-linear-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
            </div>
          )}
          {navLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => { navigate(link.path); setMobileOpen(false); }}
              className={`flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive(link.path)
                  ? "bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800"
              }`}
            >
              <span>{link.icon}</span>
              {link.label}
            </button>
          ))}
          <button
            onClick={() => { onLogout(); navigate("/login"); setMobileOpen(false); }}
            className="flex items-center gap-2 w-full px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
