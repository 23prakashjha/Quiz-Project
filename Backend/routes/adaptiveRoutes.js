import express from "express";
import AdaptiveSession from "../models/AdaptiveSession.js";
import QuizAttempt from "../models/QuizAttempt.js";
import Question from "../models/Question.js";
import { protect, studentsOnly } from "../middleware/authMiddleware.js";
import { generateQuestions, explainAnswer, analyzePerformance } from "../services/aiService.js";
import { evaluateAttempt } from "../utils/certificate.js";

const router = express.Router();

const DIFFS = ["easy", "medium", "hard"];
const DIFF_LEVEL = { easy: 0, medium: 1, hard: 2 };

const nextDifficultyUp = (d) => (DIFF_LEVEL[d] >= 2 ? d : DIFFS[DIFF_LEVEL[d] + 1]);
const nextDifficultyDown = (d) => (DIFF_LEVEL[d] <= 0 ? d : DIFFS[DIFF_LEVEL[d] - 1]);

// Pick one unused question for a topic at a given difficulty.
// 1) DB questions of that difficulty → 2) any DB question of the topic → 3) AI/mock generation.
async function pickQuestion(session) {
  const topicLower = session.topic.toLowerCase();
  const used = session.usedQuestionIds || [];

  const baseFilter = { language: { $regex: `^${session.topic}$`, $options: "i" } };

  for (const attempt of [session.currentDifficulty, "medium", "easy", "hard"]) {
    const q = await Question.findOne({
      ...baseFilter,
      difficulty: attempt,
      _id: { $nin: used },
    }).sort({ createdAt: -1 });

    if (q) {
      session.usedQuestionIds.push(q._id);
      return {
        questionId: q._id,
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        difficulty: q.difficulty || "easy",
        aiGenerated: q.aiGenerated || false,
      };
    }
  }

  // Fallback: existing topic questions ignoring difficulty.
  const anyQ = await Question.findOne({ ...baseFilter, _id: { $nin: used } });
  if (anyQ) {
    session.usedQuestionIds.push(anyQ._id);
    return {
      questionId: anyQ._id,
      questionText: anyQ.questionText,
      options: anyQ.options,
      correctAnswer: anyQ.correctAnswer,
      explanation: anyQ.explanation,
      difficulty: anyQ.difficulty || "easy",
      aiGenerated: anyQ.aiGenerated || false,
    };
  }

  // Fallback: AI / mock generation for a brand-new question at the current difficulty.
  const generated = await generateQuestions({
    topic: session.topic,
    difficulty: session.currentDifficulty,
    count: 1,
  });
  const g = generated && generated[0];
  if (g) {
    return {
      questionId: null,
      questionText: g.questionText,
      options: g.options,
      correctAnswer: g.correctAnswer,
      explanation: g.explanation || "",
      difficulty: g.difficulty || session.currentDifficulty,
      aiGenerated: true,
    };
  }

  return null;
}

// POST /api/quiz/adaptive/start — begin an adaptive session for a topic
router.post("/start", protect, studentsOnly, async (req, res) => {
  try {
    const { topic, totalQuestions = 10 } = req.body;
    if (!topic) {
      return res.status(400).json({ success: false, message: "topic is required." });
    }

    const session = await AdaptiveSession.create({
      userId: req.user._id,
      topic: topic.trim().toLowerCase(),
      currentDifficulty: "easy",
      totalQuestions: Math.min(Math.max(Number(totalQuestions) || 10, 3), 20),
    });

    const first = await pickQuestion(session);
    if (!first) {
      await AdaptiveSession.deleteOne({ _id: session._id });
      return res.status(404).json({
        success: false,
        message: `No questions available for ${topic}. Ask an admin to add some or try another topic.`,
      });
    }

    session.questions.push({ ...first, questionId: first.questionId });
    session.askedCount = 1;
    await session.save();

    res.status(200).json({
      success: true,
      sessionId: session._id,
      topic: session.topic,
      difficulty: first.difficulty,
      question: {
        index: 0,
        questionText: first.questionText,
        options: first.options,
      },
      progress: { answered: session.questions.filter((q) => q.isCorrect !== null).length, total: session.totalQuestions },
    });
  } catch (error) {
    console.error("❌ Error starting adaptive session:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/quiz/adaptive/:id/answer — evaluate, adjust difficulty, serve next question
router.post("/:id/answer", protect, studentsOnly, async (req, res) => {
  try {
    const { selectedAnswer } = req.body;
    const session = await AdaptiveSession.findById(req.params.id);

    if (!session || session.completed) {
      return res.status(404).json({ success: false, message: "Session not found or already completed." });
    }
    if (String(session.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not your session." });
    }

    // The question being answered is the most recent unanswered one.
    const current = session.questions[session.questions.length - 1];
    if (!current) {
      return res.status(400).json({ success: false, message: "No active question." });
    }

    const picked = typeof selectedAnswer === "number" ? selectedAnswer : null;
    const isCorrect = picked === current.correctAnswer;

    current.selectedAnswer = picked;
    current.isCorrect = isCorrect;
    if (!current.explanation && !isCorrect) {
      current.explanation = await explainAnswer({
        questionText: current.questionText,
        options: current.options,
        selectedAnswer: picked,
        correctAnswer: current.correctAnswer,
      });
    }
    session.questions[session.questions.length - 1] = current;

    // Adaptive core: 2 consecutive correct → bump difficulty; any wrong → step down.
    if (isCorrect) {
      session.streak += 1;
      session.maxStreak = Math.max(session.maxStreak, session.streak);
      if (session.streak >= 2) {
        session.currentDifficulty = nextDifficultyUp(session.currentDifficulty);
        session.streak = 0;
      }
    } else {
      session.streak = 0;
      session.currentDifficulty = nextDifficultyDown(session.currentDifficulty);
    }

    const answeredCount = session.questions.filter((q) => q.isCorrect !== null).length;
    const nextQuestion = await maybeCompleteOrContinue(session, answeredCount);
    if (nextQuestion && nextQuestion.done) {
      return res.status(200).json(nextQuestion.payload);
    }

    await session.save();

    res.status(200).json({
      success: true,
      isCorrect,
      correctAnswer: current.correctAnswer,
      selectedAnswer: picked,
      explanation: current.explanation,
      difficulty: nextQuestion.nextDifficulty || session.currentDifficulty,
      progress: { answered: answeredCount, total: session.totalQuestions },
      nextQuestion: nextQuestion
        ? {
            index: answeredCount,
            questionText: nextQuestion.questionText,
            options: nextQuestion.options,
            difficulty: nextQuestion.difficulty,
          }
        : null,
    });
  } catch (error) {
    console.error("❌ Error answering adaptive question:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

async function maybeCompleteOrContinue(session, answeredCount) {
  if (answeredCount < session.totalQuestions) {
    const next = await pickQuestion(session);
    if (next === null) return { done: true, payload: await completeSession(session) };
    session.questions.push({
      ...next,
      questionId: next.questionId || null,
    });
    return {
      done: false,
      questionText: next.questionText,
      options: next.options,
      difficulty: session.currentDifficulty,
      nextDifficulty: session.currentDifficulty,
    };
  }
  return { done: true, payload: await completeSession(session) };
}

async function completeSession(session) {
  // Compute final tally from answered questions.
  const answered = session.questions.filter((q) => q.isCorrect !== null);
  const score = answered.filter((q) => q.isCorrect).length;
  const { percentage, passed, certificateId } = evaluateAttempt(score, answered.length);

  session.completed = true;
  session.completedAt = new Date();
  session.askedCount = answered.length;
  await session.save();

  const attempt = await QuizAttempt.create({
    userId: session.userId,
    topic: session.topic,
    mode: "adaptive",
    difficulty: "mixed",
    questions: answered.map((q) => ({
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      selectedAnswer: q.selectedAnswer,
      isCorrect: q.isCorrect,
      explanation: q.explanation,
      difficulty: q.difficulty,
      aiGenerated: q.aiGenerated,
    })),
    score,
    total: answered.length,
    percentage,
    passed,
    certificateId,
  });

  const history = await QuizAttempt.find({ userId: session.userId }).lean();
  const analysis = await analyzePerformance(history);

  return {
    done: true,
    attempt,
    analysis,
    answers: answered.map((q) => ({
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      selectedAnswer: q.selectedAnswer,
      isCorrect: q.isCorrect,
      explanation: q.explanation,
      difficulty: q.difficulty,
    })),
    maxStreak: session.maxStreak,
  };
}

// GET /api/quiz/adaptive/:id — resume/status (single active session shared state lives server-side)
router.get("/:id", protect, studentsOnly, async (req, res) => {
  try {
    const session = await AdaptiveSession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: "Session not found." });
    if (String(session.userId) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Not your session." });
    }
    res.json({
      success: true,
      completed: session.completed,
      currentDifficulty: session.currentDifficulty,
      progress: {
        answered: session.questions.filter((q) => q.isCorrect !== null).length,
        total: session.totalQuestions,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;