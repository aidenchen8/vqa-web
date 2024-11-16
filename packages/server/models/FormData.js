const mongoose = require("mongoose");

const bboxSchema = new mongoose.Schema({
  type: String,
  bbox2d: [Number],
});

const formDataSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
    vgGuide: {
      type: String,
      required: true,
    },
    selectedBboxes: [bboxSchema],
    imageFileName: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true, // 自动添加 createdAt 和 updatedAt 字段
  }
);

const FormData = mongoose.model("FormData", formDataSchema);
module.exports = FormData;
