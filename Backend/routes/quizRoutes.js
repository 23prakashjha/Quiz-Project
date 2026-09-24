import express from "express";
import Question from "../models/Question.js";
import { generateQuestions } from "../services/aiService.js";

const router = express.Router();

/**
 * ✅ GET /api/quiz
 * Fetch questions by language (topic removed)
 * Supports ?difficulty=easy|medium|hard and ?generate=1 (on-the-fly AI fallback when DB is empty)
 */
router.get("/", async (req, res) => {
  try {
    const { language, difficulty, generate } = req.query;
    const filter = {};

    if (language)
      filter.language = { $regex: `^${language.trim()}$`, $options: "i" };
    if (difficulty && ["easy", "medium", "hard"].includes(difficulty))
      filter.difficulty = difficulty;

    const questions = await Question.find(filter).lean();

    // If the bank has nothing and generation is requested (or DB is empty),
    // produce questions with the AI/mock engine so the demo always works.
    if (!questions.length && (generate === "1" || generate === "true")) {
      const generated = await generateQuestions({
        topic: language || "JavaScript",
        difficulty: difficulty || "easy",
        count: 5,
      });
      return res.status(200).json({
        success: true,
        source: "ai",
        count: generated.length,
        data: generated,
      });
    }

    if (!questions.length) {
      return res.status(404).json({
        success: false,
        message: `No questions found for language "${language || "all"}".`,
      });
    }

    res.status(200).json({
      success: true,
      source: "db",
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    console.error("❌ Error fetching questions:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching quiz questions.",
      error: error.message,
    });
  }
});

/**
 * ✅ POST /api/quiz/add
 * Add a single question (no topic)
 */
router.post("/add", async (req, res) => {
  try {
    const { language, questionText, options, correctAnswer, difficulty, explanation } = req.body;

    if (
      !language ||
      !questionText ||
      !Array.isArray(options) ||
      options.length < 2 ||
      typeof correctAnswer !== "number"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid input. Include language, questionText, at least 2 options, and a numeric correctAnswer.",
      });
    }

    const question = await Question.create({
      language: language.trim().toLowerCase(),
      questionText: questionText.trim(),
      options,
      correctAnswer,
      difficulty: ["easy", "medium", "hard"].includes(difficulty) ? difficulty : "easy",
      explanation: explanation || "",
    });

    res.status(201).json({
      success: true,
      message: "✅ Question added successfully.",
      data: question,
    });
  } catch (error) {
    console.error("❌ Error adding question:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding question.",
      error: error.message,
    });
  }
});

/**
 * ✅ POST /api/quiz/add-multiple
 * Add multiple questions (no topic)
 */
router.post("/add-multiple", async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 'questions' array.",
      });
    }

    const invalids = questions.filter(
      (q) =>
        !q.language ||
        !q.questionText ||
        !Array.isArray(q.options) ||
        q.options.length < 2 ||
        typeof q.correctAnswer !== "number"
    );

    if (invalids.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Some questions have invalid or missing fields.",
        invalidCount: invalids.length,
        invalidExamples: invalids.slice(0, 2),
      });
    }

    const formatted = questions.map((q) => ({
      ...q,
      language: q.language.trim().toLowerCase(),
      questionText: q.questionText.trim(),
      difficulty: ["easy", "medium", "hard"].includes(q.difficulty) ? q.difficulty : "easy",
      explanation: q.explanation || "",
      aiGenerated: Boolean(q.aiGenerated),
    }));

    const inserted = await Question.insertMany(formatted);

    res.status(201).json({
      success: true,
      message: `${inserted.length} question(s) added successfully.`,
      count: inserted.length,
      data: inserted,
    });
  } catch (error) {
    console.error("❌ Error adding multiple questions:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding multiple questions.",
      error: error.message,
    });
  }
});

export default router;



