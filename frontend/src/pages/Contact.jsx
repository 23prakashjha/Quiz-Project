import React, { useState, useEffect } from "react";

export default function Contact() {
  const [visible, setVisible] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950 px-4 sm:px-6 lg:px-8 py-12 sm:py-20 transition-colors duration-300">
      <div className={`max-w-3xl mx-auto transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <span className="text-5xl mb-4 block">📬</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Contact{" "}
            <span className="bg-linear-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent">
              Us
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            Have questions, feedback, or suggestions? We would love to hear from you.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-6 sm:p-10">
          {submitted ? (
            <div className="text-center py-10">
              <span className="text-5xl block mb-4">✅</span>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h2>
              <p className="text-gray-600 dark:text-gray-400">Thank you for reaching out. We will get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Message</label>
                <textarea
                  name="message"
                  required
                  rows={5}
                  placeholder="Write your message..."
                  value={form.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-900 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all placeholder-gray-400 resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-lg text-white font-semibold text-sm bg-linear-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-200 active:scale-[0.98]"
              >
                Send Message
              </button>
            </form>
          )}
        </div>

        {/* Info */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
            <span className="text-2xl block mb-2">📧</span>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">support@quizverse.dev</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
            <span className="text-2xl block mb-2">🐙</span>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">GitHub</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">github.com/quizverse</p>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-200 dark:border-slate-700">
            <span className="text-2xl block mb-2">💬</span>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Feedback</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">We value your input</p>
          </div>
        </div>
      </div>
    </div>
  );
}
