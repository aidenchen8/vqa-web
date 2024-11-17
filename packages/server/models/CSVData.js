import mongoose from "mongoose";

const tableRowSchema = new mongoose.Schema({
  questionId: Number,
  question: String,
  questionTranslation: String,
  answer: String,
  vgGuide: String,
  vgGuideTranslation: String,
});

const fileDataSchema = new mongoose.Schema({
  fileName: String,
  questions: [tableRowSchema],
});

const csvDataSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    files: [fileDataSchema],
  },
  {
    timestamps: true,
  }
);

const CSVData = mongoose.model("CSVData", csvDataSchema);
export default CSVData;
