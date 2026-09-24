import express from "express";
import QuizAttempt from "../models/QuizAttempt.js";
import { protect } from "../middleware/authMiddleware.js";
import { analyzePerformance } from "../services/aiService.js";

const router = express.Router();

// POST /api/attempts — save a completed quiz + return AI analysis
router.post("/", protect, async (req, res) => {
  try {
    const {
      topic,
      mode = "classic",
      difficulty = "easy",
      questions = [],
      timeTakenSec = 0,
    } = req.body;

    if (!topic || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "topic and a non-empty questions array are required.",
      });
    }

    // Server-side evaluation — trust the correctAnswer, never the client's isCorrect.
    const evaluated = questions.map((q) => {
      const selected =
        typeof q.selectedAnswer === "number" ? q.selectedAnswer : null;
      const correct =
        typeof q.correctAnswer === "number" ? q.correctAnswer : 0;
      return {
        questionText: q.questionText,
        options: q.options,
        correctAnswer: correct,
        selectedAnswer: selected,
        isCorrect: selected === correct,
        explanation: q.explanation || "",
        difficulty: q.difficulty || difficulty,
        aiGenerated: Boolean(q.aiGenerated),
      };
    });

    const score = evaluated.filter((q) => q.isCorrect).length;
    const total = evaluated.length;
    const percentage = Math.round((score / total) * 100);

    const attempt = await QuizAttempt.create({
      userId: req.user._id,
      topic: topic.trim(),
      mode,
      difficulty,
      questions: evaluated,
      score,
      total,
      percentage,
      timeTakenSec,
    });

    // Pull full learning history to build/refresh the personalized AI report.
    const history = await QuizAttempt.find({ userId: req.user._id }).lean();
    const analysis = await analyzePerformance(history);

    res.status(201).json({
      success: true,
      message: "Attempt recorded.",
      attempt,
      analysis,
    });
  } catch (error) {
    console.error("❌ Error saving attempt:", error);
    res.status(500).json({ success: false, message: "Failed to save attempt.", error: error.message });
  }
});

// GET /api/attempts — student learning history
router.get("/", protect, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    res.json({ success: true, count: attempts.length, data: attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/attempts/stats — per-topic analytics + AI recommendations for the student dashboard
router.get("/stats", protect, async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ userId: req.user._id }).lean();

    const perTopic = {};
    let totalCorrect = 0;
    let totalQuestions = 0;
    let adaptiveCount = 0;

    for (const a of attempts) {
      const key = (a.topic || "general").toLowerCase();
      if (!perTopic[key]) perTopic[key] = { topic: key, attempts: 0, correct: 0, total: 0, best: 0 };
      const p = perTopic[key];
      p.attempts += 1;
      p.correct += a.score || 0;
      p.total += a.total || 0;
      p.best = Math.max(p.best, a.percentage || 0);
      totalCorrect += a.score || 0;
      totalQuestions += a.total || 0;
      if (a.mode === "adaptive") adaptiveCount += 1;
    }

    const topicStats = Object.values(perTopic).map((t) => ({
      ...t,
      avgScore: t.total ? Math.round((t.correct / t.total) * 100) : 0,
    })).sort((a, b) => a.avgScore - b.avgScore);

    const weakTopics = topicStats.filter((t) => t.avgScore < 60);
    const mastered = topicStats.filter((t) => t.avgScore >= 80);
    const overallScore = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    const analysis = await analyzePerformance(
      attempts.map((a) => ({ topic: a.topic, score: a.score, total: a.total, percentage: a.percentage }))
    );

    res.json({
      success: true,
      data: {
        totalAttempts: attempts.length,
        adaptiveCount,
        overallScore,
        totalCorrect,
        totalQuestions,
        topicStats,
        weakTopics,
        mastered,
        recent: attempts.slice(0, 10),
        analysis,
      },
    });
  } catch (error) {
    console.error("❌ Error computing stats:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;