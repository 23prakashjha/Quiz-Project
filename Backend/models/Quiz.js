import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  topic: { type: String, required: true },
  questionText: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
});

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
