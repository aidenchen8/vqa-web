/* eslint-disable radix */
import FormData from "../models/FormData.js";
import User from "../models/User.js";

export const saveFormData = async (req, res) => {
  try {
    const { question, answer, vgGuide, selectedBboxes, imageFileName } =
      req.body;

    await User.findByIdAndUpdate(req.user._id, {
      lastEditedFile: imageFileName,
    });

    let formData = await FormData.findOne({
      imageFileName,
      question,
    });

    if (formData) {
      formData.answer = answer;
      formData.vgGuide = vgGuide;
      formData.selectedBboxes = selectedBboxes;
      formData.user = req.user._id;

      await formData.save();
    } else {
      formData = await FormData.create({
        imageFileName,
        question,
        answer,
        vgGuide,
        selectedBboxes,
        user: req.user._id,
      });
    }

    res.json(formData);
  } catch (error) {
    res.status(500).json({ message: "保存失败", error: error.message });
  }
};

export const getFormData = async (req, res) => {
  try {
    const { imageFileName } = req.query;

    const formData = await FormData.find({ imageFileName })
      .populate("user", "username")
      .sort("-createdAt");

    res.json(formData);
  } catch (error) {
    res.status(500).json({ message: "获取数据失败", error: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const totalQuestions = await FormData.countDocuments();
    const completedQuestions = await FormData.countDocuments({
      answer: { $exists: true, $ne: "" },
    });

    res.json({
      totalQuestions,
      completedQuestions,
    });
  } catch (error) {
    res.status(500).json({ message: "获取统计信息失败", error: error.message });
  }
};

export const queryFormData = async (req, res) => {
  try {
    const { fileName, questionId, page = 1, pageSize = 10 } = req.query;
    const query = {};

    if (fileName) {
      query.imageFileName = fileName;
    }
    if (questionId) {
      query.questionId = parseInt(questionId);
    }

    const total = await FormData.countDocuments(query);
    const data = await FormData.find(query)
      .populate("user", "username")
      .sort("questionId")
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    res.json({
      total,
      data,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
    });
  } catch (error) {
    res.status(500).json({ message: "查询失败", error: error.message });
  }
};

export const getLastEdited = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ lastEditedFile: user.lastEditedFile });
  } catch (error) {
    res.status(500).json({ message: "获取失败", error: error.message });
  }
};

export default {
  saveFormData,
  getFormData,
  getStats,
  queryFormData,
  getLastEdited,
};
