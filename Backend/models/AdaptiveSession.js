import mongoose from "mongoose";

const sessionQuestionSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: "Question", default: null },
    questionText: { type: String, required: true },
    options: { type: [String], required: true },
    correctAnswer: { type: Number, required: true },
    selectedAnswer: { type: Number, default: null },
    isCorrect: { type: Boolean, default: null },
    explanation: { type: String, default: "" },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "easy" },
    aiGenerated: { type: Boolean, default: false },
  },
  { _id: false }
);

const adaptiveSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    topic: { type: String, required: true, lowercase: true, trim: true },
    questions: { type: [sessionQuestionSchema], default: [] },
    currentDifficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    streak: { type: Number, default: 0 }, // consecutive correct answers
    maxStreak: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 10 },
    askedCount: { type: Number, default: 0 },
    usedQuestionIds: { type: [mongoose.Schema.Types.ObjectId], default: [] },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

adaptiveSessionSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const AdaptiveSession = mongoose.model("AdaptiveSession", adaptiveSessionSchema);
export default AdaptiveSession;