import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true },
    selectedAnswer: { type: Number, default: null },
    isCorrect: { type: Boolean, default: false },
    explanation: { type: String, default: "" },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
    aiGenerated: { type: Boolean, default: false },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topic: { type: String, required: true },
    mode: {
      type: String,
      enum: ["classic", "adaptive"],
      default: "classic",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "mixed"],
      default: "easy",
    },
    questions: { type: [answerSchema], default: [] },
    score: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    timeTakenSec: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    certificateId: { type: String, default: null },
  },
  { timestamps: true }
);

// Faster lookup for "learning history" + "per-topic analytics"
quizAttemptSchema.index({ userId: 1, topic: 1, createdAt: -1 });

quizAttemptSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);
export default QuizAttempt;