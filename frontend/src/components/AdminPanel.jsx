import React, { useState } from "react";
import axios from "axios";

axios.defaults.baseURL = "https://quiz-project-yx56.onrender.com";

export default function AdminPanel() {
  const [language, setLanguage] = useState("HTML");
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correct, setCorrect] = useState(0);

  // All saved MCQs
  const [questionsList, setQuestionsList] = useState([]);

  const languages = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "TailwindCSS",
    "Node.js",
    "Express.js",
    "MongoDB",
    "Python",
    "Java",
    "C",
    "C++",
    "Bootstrap",
    "jQuery",
    "Other",
  ];

  // Filter list based on selected language
  const filteredQuestions = questionsList.filter(
    (q) => q.language === language
  );

  // Add question to list
  const handleAddToList = () => {
    if (!question.trim()) return alert("⚠️ Please enter a question.");
    if (options.some((opt) => !opt.trim()))
      return alert("⚠️ Please fill all options.");

    const newQuestion = {
      language,
      questionText: question.trim(),
      options: options.map((o) => o.trim()),
      correctAnswer: Number(correct),
    };

    setQuestionsList([...questionsList, newQuestion]);
    setQuestion("");
    setOptions(["", "", "", ""]);
    setCorrect(0);
  };

  // Submit all questions
  const handleSubmitAll = async () => {
    if (questionsList.length === 0)
      return alert("⚠️ No questions to submit.");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "/api/quiz/add-multiple",
        { questions: questionsList },
        { headers: { Authorization: token ? `Bearer ${token}` : "" } }
      );

      alert(`✅ ${res.data.count} questions added successfully!`);
      setQuestionsList([]);
    } catch (error) {
      console.error(error);
      alert("❌ Failed to add questions.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 mt-10 rounded-2xl shadow-md">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
        🧠 Admin Panel — Add & Filter MCQs
      </h2>

      {/* Language Selector */}
      <div className="mb-4">
        <label className="block font-semibold mb-1">Select Language</label>
        <select
          className="border p-2 w-full rounded-lg"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          {languages.map((lang) => (
            <option key={lang}>{lang}</option>
          ))}
        </select>
      </div>

      {/* Question Input */}
      <div className="mt-4">
        <label className="block font-semibold mb-1">Question</label>
        <input
          className="border p-2 w-full rounded-lg"
          placeholder="Enter your question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>

      {/* Options */}
      <div className="mt-4">
        <label className="block font-semibold mb-2">Options</label>
        {options.map((opt, i) => (
          <input
            key={i}
            className="border p-2 w-full mb-2 rounded-lg"
            placeholder={`Option ${i + 1}`}
            value={opt}
            onChange={(e) => {
              const newOpts = [...options];
              newOpts[i] = e.target.value;
              setOptions(newOpts);
            }}
          />
        ))}
      </div>

      {/* Correct Answer */}
      <div className="mt-4">
        <label className="block font-semibold mb-1">Correct Option</label>
        <select
          className="border p-2 w-full rounded-lg"
          value={correct}
          onChange={(e) => setCorrect(Number(e.target.value))}
        >
          {options.map((_, i) => (
            <option key={i} value={i}>
              Option {i + 1}
            </option>
          ))}
        </select>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <button
          onClick={handleAddToList}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-semibold"
        >
          ➕ Add to List
        </button>

        <button
          onClick={handleSubmitAll}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 font-semibold"
        >
          🚀 Submit All
        </button>
      </div>

      {/* FILTERED QUESTIONS PREVIEW */}
      {filteredQuestions.length > 0 && (
        <div className="mt-8 border-t pt-4">
          <h3 className="text-xl font-semibold mb-3 text-gray-700">
            Showing {language} Questions ({filteredQuestions.length})
          </h3>

          {filteredQuestions.map((q, idx) => (
            <div
              key={idx}
              className="bg-gray-50 border p-3 rounded-lg mb-2 shadow-sm"
            >
              <p className="font-semibold">
                {idx + 1}. {q.questionText}
              </p>

              <ul className="list-disc ml-6 mt-1 text-gray-700">
                {q.options.map((opt, i) => (
                  <li
                    key={i}
                    className={
                      i === q.correctAnswer
                        ? "text-green-600 font-bold"
                        : ""
                    }
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
