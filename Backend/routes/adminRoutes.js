import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Question from "../models/Question.js";
import QuizAttempt from "../models/QuizAttempt.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({ success: false, message: "Admin access required." });
};

// GET /api/admin/questions — all questions
router.get("/questions", protect, adminOnly, async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: questions.length, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/questions/:id — delete a question
router.delete("/questions/:id", protect, adminOnly, async (req, res) => {
  try {
    const deleted = await Question.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "Question not found." });
    res.json({ success: true, message: "Question deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/questions/:id — edit a question
router.put("/questions/:id", protect, adminOnly, async (req, res) => {
  try {
    const { language, questionText, options, correctAnswer, difficulty, explanation } = req.body;
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: "Question not found." });

    // Load-modify-save so cross-field validators (correctAnswer vs options length) run against the full doc.
    if (typeof language === "string") question.language = language;
    if (typeof questionText === "string") question.questionText = questionText;
    if (Array.isArray(options)) question.options = options;
    if (typeof correctAnswer === "number") question.correctAnswer = correctAnswer;
    if (typeof difficulty === "string") question.difficulty = difficulty;
    if (typeof explanation === "string") question.explanation = explanation;

    await question.save();
    res.json({ success: true, message: "Question updated.", data: question });
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/stats — platform-wide quiz statistics for the teacher dashboard
router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const [totalUsers, totalQuestions, totalAttempts, attempts] = await Promise.all([
      User.countDocuments(),
      Question.countDocuments(),
      QuizAttempt.countDocuments(),
      QuizAttempt.find().populate("userId", "name email").sort({ createdAt: -1 }).lean(),
    ]);

    const attemptsByTopic = {};
    const perUser = {};
    for (const a of attempts) {
      const key = (a.topic || "general").toLowerCase();
      if (!attemptsByTopic[key]) attemptsByTopic[key] = { topic: key, count: 0, correct: 0, total: 0 };
      attemptsByTopic[key].count += 1;
      attemptsByTopic[key].correct += a.score || 0;
      attemptsByTopic[key].total += a.total || 0;

      const uid = String(a.userId?._id || "anon");
      if (!perUser[uid]) perUser[uid] = { name: a.userId?.name || "Unknown", email: a.userId?.email, attempts: 0, correct: 0, total: 0 };
      perUser[uid].attempts += 1;
      perUser[uid].correct += a.score || 0;
      perUser[uid].total += a.total || 0;
    }

    const overallCorrect = totalAttempts ? attempts.reduce((s, a) => s + (a.score || 0), 0) : 0;
    const overallTotal = totalAttempts ? attempts.reduce((s, a) => s + (a.total || 0), 0) : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalQuestions,
        totalAttempts,
        overallScore: overallTotal ? Math.round((overallCorrect / overallTotal) * 100) : 0,
        topics: Object.values(attemptsByTopic)
          .map((t) => ({ ...t, avgScore: t.total ? Math.round((t.correct / t.total) * 100) : 0 }))
          .sort((a, b) => b.count - a.count),
        bestUsers: Object.values(perUser)
          .map((u) => ({ ...u, avgScore: u.total ? Math.round((u.correct / u.total) * 100) : 0 }))
          .sort((a, b) => b.avgScore - a.avgScore)
          .slice(0, 8),
        recentAttempts: attempts.slice(0, 20).map((a) => ({
          id: a._id,
          name: a.userId?.name || "Unknown",
          email: a.userId?.email,
          topic: a.topic,
          mode: a.mode,
          difficulty: a.difficulty,
          score: a.score,
          total: a.total,
          percentage: a.percentage,
          createdAt: a.createdAt,
        })),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users — all users
router.get("/users", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/admin/users — admin creates a user
router.post("/users", protect, adminOnly, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required." });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: "Email already in use." });

    const user = await User.create({ name, email, password, role: role || "user" });
    const data = { id: user._id, name: user.name, email: user.email, role: user.role };

    res.status(201).json({ success: true, message: "User created.", data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/admin/users/:id — delete a user
router.delete("/users/:id", protect, adminOnly, async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: "User not found." });

    const deleted = await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: `User "${deleted.name}" deleted.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
