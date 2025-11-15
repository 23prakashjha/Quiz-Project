import Quiz from "../models/Quiz.js";
import pdfParse from "pdf-parse";
import fs from "fs";

export const addMultipleQuestions = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No PDF uploaded" });

    const pdfData = await pdfParse(fs.readFileSync(req.file.path));
    const lines = pdfData.text.split("\n").map((l) => l.trim()).filter(Boolean);

    const questions = [];
    let current = { questionText: "", options: [], correctAnswer: null };

    for (let line of lines) {
      if (line.match(/^\d+\./)) {
        if (current.questionText) questions.push({ ...current });
        current = { questionText: line.replace(/^\d+\.\s*/, ""), options: [], correctAnswer: null };
      } else if (line.match(/^[A-D]\)/)) {
        current.options.push(line.substring(2).trim());
      } else if (line.startsWith("Answer:")) {
        const correct = line.split(":")[1].trim();
        current.correctAnswer = ["A", "B", "C", "D"].indexOf(correct);
      }
    }

    if (current.questionText) questions.push(current);

    const saved = await Quiz.insertMany(
      questions.map((q) => ({
        topic: req.body.topic || "general",
        ...q,
      }))
    );

    fs.unlinkSync(req.file.path);
    res.status(201).json({ success: true, count: saved.length, data: saved });
  } catch (err) {
    console.error("❌ Error saving questions:", err);
    res.status(500).json({ message: "Failed to save quiz questions", error: err.message });
  }
};

export const getQuestionsByTopic = async (req, res) => {
  try {
    const { topic } = req.query;
    if (!topic) return res.status(400).json({ message: "Topic is required" });

    const questions = await Quiz.find({ topic });
    if (!questions.length)
      return res.status(404).json({ message: `No questions found for topic: ${topic}` });

    res.json({ success: true, count: questions.length, data: questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
