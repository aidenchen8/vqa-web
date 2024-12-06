import CSVData from "../models/CSVData.js";
import { TokenService } from "../services/tokenService.js";
import Papa from "papaparse";

// 解析CSV文件
const parseCSVFile = (fileContent) => {
  return new Promise((resolve, reject) => {
    Papa.parse(fileContent, {
      complete: (results) => {
        const rows = results.data;
        const dataMap = new Map();
        let questionId = 1; // 题目编号从1开始

        // 跳过表头，处理每一行
        rows.slice(1).forEach((columns) => {
          if (columns.length < 2) return;

          const fileName = columns[1];
          const fileQuestions = [];

          // 处理5个问题
          for (let i = 0; i < 5; i++) {
            if (columns[2 + i * 5]) {
              // 只有当问题存在时才添加
              fileQuestions.push({
                questionId: questionId++, // 递增题目编号
                question: columns[2 + i * 5] || "",
                questionTranslation: columns[3 + i * 5] || "",
                answer: columns[4 + i * 5] || "",
                vgGuide: columns[5 + i * 5] || "",
                vgGuideTranslation: columns[6 + i * 5] || "",
              });
            }
          }

          if (fileQuestions.length > 0) {
            dataMap.set(fileName, fileQuestions);
          }
        });

        resolve(dataMap);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

// 检查用户是否已有数据
export const checkUserData = async (req, res) => {
  try {
    const csvData = await CSVData.findOne({ user: req.user._id });
    res.json({ hasData: !!csvData });
  } catch (error) {
    res.status(500).json({ message: "检查失败", error: error.message });
  }
};

// 上传并处理CSV文件
export const uploadCSV = async (req, res) => {
  try {
    const fileContent = req.body.fileContent;
    const forceUpdate = req.body.forceUpdate; // 是否强制更新
    const authType = req.body.type; // 获取用户类型

    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "未提供认证令牌" });
    }

    const user = await TokenService.getUserFromToken(token);

    if (!user) {
      return res.status(401).json({ message: "未找到用户信息" });
    }

    // 检查是否存在数据
    const existingData = await CSVData.findOne({ user: user._id });
    if (existingData && !forceUpdate) {
      return res.status(409).json({
        message: "已存在题目数据",
        requireConfirmation: true,
      });
    }

    // 解析CSV文件内容
    const dataMap = await parseCSVFile(fileContent);

    // 转换数据格式
    const files = Array.from(dataMap.entries()).map(
      ([fileName, questions]) => ({
        fileName,
        questions,
      })
    );

    if (existingData) {
      // 清空并更新数据
      existingData.files = files;
    } else {
      // 创建新数据，添加权限类型
      await CSVData.create({
        user: user._id,
        type: authType,
        files,
      });
    }

    res.json({
      message: "文件上传成功",
      status: "success",
    });
  } catch (error) {
    res.status(500).json({ message: "上传失败", error: error.message });
  }
};

// 获取用户的CSV数据
export const getCSVData = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    const user = await TokenService.getUserFromToken(token);

    if (!user || !user.roles) {
      return res.status(401).json({ message: "未找到用户信息或角色" });
    }

    // 根据用户的 roles 查询 CSV 数据
    const csvDataList = await CSVData.find({ type: { $in: user.roles } });

    if (csvDataList.length === 0) {
      return res.status(404).json({ message: "未找到CSV数据" });
    }

    // 转换数据格式为前端所需的格式
    const result = csvDataList.map((csvData) => {
      const questionsMap = {};
      const fileIndexMap = [];

      csvData.files.forEach((file) => {
        questionsMap[file.fileName] = file.questions;
        fileIndexMap.push(file.fileName);
      });

      return {
        questionsMap,
        fileIndexMap,
        type: csvData.type, // 返回对应的类型
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "获取数据失败", error: error.message });
  }
};
