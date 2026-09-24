// Central API config — override with VITE_API_URL in frontend/.env
export const API = import.meta.env.VITE_API_URL || "https://quiz-project-aqu6.onrender.com";

export const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}` },
});

export const DIFFICULTIES = [
  { key: "easy", label: "Easy", emoji: "🟢", desc: "Foundations & basics" },
  { key: "medium", label: "Medium", emoji: "🟡", desc: "Concepts & practice" },
  { key: "hard", label: "Hard", emoji: "🔴", desc: "Advanced & tricky" },
  { key: "adaptive", label: "✨ Adaptive", emoji: "⚡", desc: "AI adjusts difficulty" },
];