import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Question from "../models/Question.js";
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
