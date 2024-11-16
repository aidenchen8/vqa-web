const FormData = require("../models/FormData");

// 保存表单数据
const saveFormData = async (req, res) => {
  try {
    const { question, answer, vgGuide, selectedBboxes, imageFileName } =
      req.body;

    // 检查是否已存在相同图片的数据
    const existingData = await FormData.findOne({
      imageFileName,
      question,
    });

    if (existingData) {
      // 更新现有数据
      existingData.answer = answer;
      existingData.vgGuide = vgGuide;
      existingData.selectedBboxes = selectedBboxes;
      existingData.user = req.user._id;

      const updatedData = await existingData.save();
      res.json(updatedData);
    } else {
      // 创建新数据
      const formData = new FormData({
        question,
        answer,
        vgGuide,
        selectedBboxes,
        imageFileName,
        user: req.user._id,
      });

      const savedData = await formData.save();
      res.json(savedData);
    }
  } catch (error) {
    res.status(500).json({ message: "保存失败", error: error.message });
  }
};

// 获取表单数据
const getFormData = async (req, res) => {
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

module.exports = {
  saveFormData,
  getFormData,
};
