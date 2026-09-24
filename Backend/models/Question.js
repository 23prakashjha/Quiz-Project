import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    // 🔹 Programming language of the question
    language: {
      type: String,
      required: [true, "Language is required"], // e.g., HTML, CSS, JS, React
      trim: true,
      lowercase: true,
    },

    // 🔹 The question text
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },

    // 🔹 Options for the question
    options: {
      type: [String],
      required: [true, "Options are required"],
      validate: {
        validator: function (val) {
          // Must be an array with at least 2 options
          return Array.isArray(val) && val.length >= 2;
        },
        message: "At least two options are required.",
      },
    },

    // 🔹 Index of the correct answer (0-based)
    correctAnswer: {
      type: Number,
      required: [true, "Correct answer index is required"],
      min: [0, "Index must start from 0"],
      validate: {
        validator: function (val) {
          // Ensure correctAnswer index exists within options length
          return (
            Array.isArray(this.options) &&
            val >= 0 &&
            val < this.options.length
          );
        },
        message: "Correct answer index must be within the options range.",
      },
    },

    // 🎚️ Difficulty used by the adaptive engine (misses on old data → treated as easy)
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },

    // 💡 Optional AI/human explanation shown when the student gets it wrong
    explanation: {
      type: String,
      default: "",
    },

    // 🔹 Optional: who created the question (admin or AI)
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    // 🤖 Mark AI-generated questions (useful for admin review)
    aiGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ Optional index for faster language-based lookups
questionSchema.index({ language: 1 });

// ✅ Clean JSON output
questionSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const Question = mongoose.model("Question", questionSchema);
export default Question;
