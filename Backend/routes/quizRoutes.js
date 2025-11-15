import express from "express";
import Question from "../models/Question.js";

const router = express.Router();

/**
 * ✅ GET /api/quiz
 * Fetch questions by language (topic removed)
 */
router.get("/", async (req, res) => {
  try {
    const { language } = req.query;
    const filter = {};

    if (language)
      filter.language = { $regex: `^${language.trim()}$`, $options: "i" };

    const questions = await Question.find(filter).lean();

    if (!questions.length) {
      return res.status(404).json({
        success: false,
        message: `No questions found for language "${language || "all"}".`,
      });
    }

    res.status(200).json({
      success: true,
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
    const { language, questionText, options, correctAnswer } = req.body;

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



