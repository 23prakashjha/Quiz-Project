import express from "express";
import QuizAttempt from "../models/QuizAttempt.js";
import { protect } from "../middleware/authMiddleware.js";
import { generateQuestions, explainAnswer, analyzePerformance } from "../services/aiService.js";

const router = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  res.status(403).json({ success: false, message: "Admin access required." });
};

// POST /api/ai/generate-questions — AI / mock question generation for admins
router.post("/generate-questions", protect, adminOnly, async (req, res) => {
  try {
    const { topic, difficulty, count } = req.body;
    if (!topic) {
      return res.status(400).json({ success: false, message: "topic is required." });
    }

    const questions = await generateQuestions({ topic, difficulty, count });
    res.status(200).json({
      success: true,
      source: process.env.OPENAI_API_KEY ? "openai" : "mock",
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ai/explain — "why is my answer wrong?" explanation for any question
router.post("/explain", protect, async (req, res) => {
  try {
    const { questionText, options, selectedAnswer, correctAnswer } = req.body;
    if (!questionText || !Array.isArray(options)) {
      return res.status(400).json({ success: false, message: "questionText and options are required." });
    }
    const explanation = await explainAnswer({ questionText, options, selectedAnswer, correctAnswer });
    res.json({ success: true, explanation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ai/analyze — personalized study report from the student's learning history
router.post("/analyze", protect, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user._id }).lean();
    const analysis = await analyzePerformance(
      attempts.map((a) => ({ topic: a.topic, score: a.score, total: a.total, percentage: a.percentage }))
    );
    res.json({ success: true, analysis });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;