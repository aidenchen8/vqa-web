/* eslint-disable radix */
import FormData from "../models/FormData.js";
import User from "../models/User.js";
import { TokenService } from "../services/tokenService.js";

export const saveFormData = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    const user = await TokenService.getUserFromToken(token);

    const { question, answer, vgGuide, selectedBboxes, imageFileName } =
      req.body;

    await User.findByIdAndUpdate(user._id, {
      lastEditedFile: imageFileName,
    });

    let formData = await FormData.findOne({
      imageFileName,
    });

    if (formData) {
      formData.question = question;
      formData.answer = answer;
      formData.vgGuide = vgGuide;
      formData.selectedBboxes = selectedBboxes;
      formData.user = user._id;

      await formData.save();
    } else {
      formData = await FormData.create({
        imageFileName,
        question,
        answer,
        vgGuide,
        selectedBboxes,
        user: user._id,
      });
    }

    const completedQuestions = await FormData.countDocuments({
      answer: { $exists: true, $ne: "" },
    });

    res.json({
      formData,
      completedQuestions,
    });
  } catch (error) {
    res.status(500).json({ message: "保存失败", error: error.message });
  }
};

export const getFormData = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    const user = await TokenService.getUserFromToken(token);

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
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    const user = await TokenService.getUserFromToken(token);

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
