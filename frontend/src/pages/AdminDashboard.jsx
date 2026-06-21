import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "https://quiz-project-yx56.onrender.com";

const HEADERS = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });

const LANG_COLORS = {
  html: "from-orange-400 to-red-500", css: "from-blue-400 to-indigo-500",
  javascript: "from-yellow-400 to-amber-500", react: "from-sky-400 to-blue-500",
  tailwindcss: "from-teal-400 to-green-500", "node.js": "from-lime-400 to-green-500",
  python: "from-blue-400 to-yellow-500", java: "from-red-400 to-orange-500",
  mongoDb: "from-emerald-400 to-green-600", git: "from-orange-500 to-red-600",
  docker: "from-sky-500 to-blue-700", default: "from-indigo-400 to-purple-500",
};

const getLangGrad = (lang) => LANG_COLORS[lang?.toLowerCase()] || LANG_COLORS.default;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("questions");
  const [questions, setQuestions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQ, setSearchQ] = useState("");

  // Create user form
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [formErr, setFormErr] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === "questions") {
        const res = await axios.get(`${API}/api/admin/questions`, HEADERS());
        setQuestions(res.data.data || []);
      } else {
        const res = await axios.get(`${API}/api/admin/users`, HEADERS());
        setUsers(res.data.data || []);
      }
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) navigate("/login");
      else alert("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [tab, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDeleteQuestion = async (id) => {
    if (!confirm("Delete this question?")) return;
    try {
      await axios.delete(`${API}/api/admin/questions/${id}`, HEADERS());
      setQuestions(questions.filter((q) => q._id !== id));
    } catch { alert("Failed to delete."); }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    try {
      await axios.delete(`${API}/api/admin/users/${id}`, HEADERS());
      setUsers(users.filter((u) => u._id !== id));
    } catch { alert("Failed to delete."); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormErr("");
    if (!form.name || !form.email || !form.password) {
      setFormErr("All fields required."); return;
    }
    if (form.password.length < 6) {
      setFormErr("Password must be at least 6 characters."); return;
    }
    try {
      setFormLoading(true);
      const res = await axios.post(`${API}/api/admin/users`, form, HEADERS());
      setUsers([res.data.data, ...users]);
      setShowCreate(false);
      setForm({ name: "", email: "", password: "", role: "user" });
    } catch (err) {
      setFormErr(err.response?.data?.message || "Failed to create user.");
    } finally {
      setFormLoading(false);
    }
  };

  const filteredQuestions = questions.filter((q) =>
    !searchQ.trim() ||
    q.language?.toLowerCase().includes(searchQ.toLowerCase()) ||
    q.questionText?.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="text-4xl">📊</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Admin Dashboard</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Manage questions and users</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin")}
            className="mt-3 sm:mt-0 px-4 py-2 rounded-xl bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-300 dark:hover:bg-slate-600 transition"
          >
            ← Add Questions
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-white dark:bg-slate-800 rounded-xl p-1 border border-gray-200 dark:border-slate-700 mb-6 shadow-sm">
          <button
            onClick={() => setTab("questions")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === "questions"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            📝 Questions ({questions.length})
          </button>
          <button
            onClick={() => setTab("users")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === "users"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
          >
            👥 Users ({users.length})
          </button>
        </div>

        {/* Tab: Questions */}
        {tab === "questions" && (
          <div className="animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">All Questions</h2>
                <div className="relative w-full sm:w-72">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 placeholder-gray-400"
                  />
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : filteredQuestions.length === 0 ? (
                <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-12">
                  {searchQ ? "No matching questions." : "No questions yet."}
                </p>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {filteredQuestions.map((q) => (
                    <div
                      key={q._id}
                      className="flex items-start gap-3 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl p-4 group hover:shadow-md transition-all"
                    >
                      <span className={`shrink-0 w-1.5 h-full min-h-[60px] rounded-full bg-linear-to-b ${getLangGrad(q.language)}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 mb-1.5">
                              {q.language}
                            </span>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-relaxed">
                              {q.questionText}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDeleteQuestion(q._id)}
                            className="shrink-0 w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 hover:bg-red-200 dark:hover:bg-red-900/50 transition flex items-center justify-center text-xs opacity-0 group-hover:opacity-100"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {q.options.map((opt, i) => (
                            <span
                              key={i}
                              className={`text-xs px-2 py-0.5 rounded ${
                                i === q.correctAnswer
                                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold ring-1 ring-emerald-300 dark:ring-emerald-700"
                                  : "bg-gray-100 dark:bg-slate-600 text-gray-500 dark:text-gray-400"
                              }`}
                            >
                              {String.fromCharCode(65 + i)}. {opt}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: Users */}
        {tab === "users" && (
          <div className="animate-fade-in space-y-6">
            {/* Create User Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-emerald-600 rounded-full" />
                  Users
                </h2>
                <button
                  onClick={() => setShowCreate(!showCreate)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md active:scale-[0.98]"
                >
                  {showCreate ? "✕ Cancel" : "➕ Create User"}
                </button>
              </div>

              {/* Create User Form */}
              {showCreate && (
                <form onSubmit={handleCreateUser} className="mb-6 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-200 dark:border-slate-600 animate-slide-down">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">New Account</h3>
                  {formErr && (
                    <p className="text-xs text-red-600 dark:text-red-400 mb-3 bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded-lg">{formErr}</p>
                  )}
                  <div className="grid sm:grid-cols-4 gap-3">
                    <input
                      type="text"
                      placeholder="Full name"
                      className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 placeholder-gray-400"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 placeholder-gray-400"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                    <input
                      type="password"
                      placeholder="Password (6+ chars)"
                      className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 placeholder-gray-400"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <select
                        className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/40"
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                      <button
                        type="submit"
                        disabled={formLoading}
                        className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-60 transition shadow-sm active:scale-[0.98]"
                      >
                        {formLoading ? "..." : "Add"}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Users List */}
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 rounded-full animate-spin" />
                </div>
              ) : users.length === 0 ? (
                <p className="text-center text-sm text-gray-400 dark:text-gray-500 py-8">No users found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-slate-600">
                        <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Name</th>
                        <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Email</th>
                        <th className="text-left py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Role</th>
                        <th className="text-right py-3 px-2 text-gray-500 dark:text-gray-400 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                          <td className="py-3 px-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-linear-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {(u.name || "U").charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-gray-800 dark:text-gray-100">{u.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-2 text-gray-500 dark:text-gray-400">{u.email}</td>
                          <td className="py-3 px-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              u.role === "admin"
                                ? "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400"
                                : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-xs font-semibold hover:bg-red-50 dark:hover:bg-red-900/30 px-2 py-1 rounded-lg transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
