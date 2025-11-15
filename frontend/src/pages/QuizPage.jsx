import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function QuizPage() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { topic } = useParams(); // <-- "html", "css", "javascript", etc.

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError("");

        if (!topic) {
          setError("No topic specified.");
          return;
        }

        // Load stored user
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setUserName(user.name || user.email || "User");
        }

        // Normalize topic (html → html)
        const normalizedTopic = topic.trim().toLowerCase();

        // API Request
        const res = await axios.get(
          `http://localhost:5000/api/quiz?topic=${encodeURIComponent(
            normalizedTopic
          )}`
        );

        if (res.data?.success) {
          const filtered = res.data.data.filter(
            (q) => q.language.trim().toLowerCase() === normalizedTopic
          );

          setQuestions(filtered);

          if (filtered.length === 0) {
            setError(`No ${topic.toUpperCase()} questions found.`);
          }
        } else {
          setError(res.data?.message || "No questions found.");
        }
      } catch (err) {
        console.error("❌ Error fetching questions:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load quiz questions. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [topic]);

  const submitQuiz = () => {
    if (questions.length === 0) return;

    let score = 0;

    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) score++;
    });

    navigate("/result", {
      state: { score, total: questions.length, topic },
    });
  };

  // Loading
  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-gray-500">
        Loading quiz questions...
      </div>
    );

  // Error Page
  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-red-500 font-semibold mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow-md mt-6">
      {/* Welcome */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">
          Welcome, {userName}! 👋
        </h1>
        <p className="text-gray-600">
          You are practicing{" "}
          <span className="font-semibold text-blue-500">
            {topic.toUpperCase()}
          </span>{" "}
          MCQs.
        </p>
      </div>

      {/* Questions */}
      {questions.map((q, i) => (
        <div key={q._id || i} className="mb-6 border-b pb-4">
          <p className="font-semibold text-lg mb-2">
            {i + 1}. {q.questionText}
          </p>

          {q.options.map((opt, idx) => (
            <label
              key={idx}
              className={`block cursor-pointer rounded-lg p-2 transition ${
                answers[i] === idx
                  ? "bg-blue-100 border-l-4 border-blue-500"
                  : "hover:bg-blue-50"
              }`}
            >
              <input
                type="radio"
                name={`q${i}`}
                value={idx}
                checked={answers[i] === idx}
                onChange={() => setAnswers({ ...answers, [i]: idx })}
                className="mr-2"
              />
              {opt}
            </label>
          ))}
        </div>
      ))}

      {/* Submit Button */}
      {questions.length > 0 && (
        <button
          onClick={submitQuiz}
          className="bg-blue-500 text-white w-full py-3 mt-4 rounded-lg hover:bg-blue-600 transition duration-200"
        >
          Submit Quiz
        </button>
      )}
    </div>
  );
}
