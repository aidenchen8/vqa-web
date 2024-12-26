import CSVData from "../models/CSVData.js";
import { TokenService } from "../services/tokenService.js";
import Papa from "papaparse";
import { loggerService } from "../services/loggerService.js";

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
    loggerService.info(`检查用户数据 - User: ${req.user.username}`);
    res.json({ hasData: !!csvData });
  } catch (error) {
    loggerService.error("检查用户数据失败", error);
    res.status(500).json({ message: "检查失败", error: error.message });
  }
};

// 上传并处理CSV文件
export const uploadCSV = async (req, res) => {
  const startTime = Date.now();
  try {
    const fileContent = req.body.fileContent;
    const forceUpdate = req.body.forceUpdate;
    const authType = req.body.type;
    const user = await TokenService.getUserFromToken(
      req.headers.authorization.split(" ")[1]
    );

    loggerService.info(
      `开始上传CSV文件 - User: ${user.username}, Type: ${authType}`
    );

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

    const duration = Date.now() - startTime;
    loggerService.info(
      `CSV文件上传成功 - User: ${user.username}, Duration: ${duration}ms`
    );
    res.json({
      message: "文件上传成功",
      status: "success",
    });
  } catch (error) {
    loggerService.error("上传CSV文件失败", error);
    res.status(500).json({ message: "上传失败", error: error.message });
  }
};

// 获取用户的CSV数据索引列表
export const getCSVData = async (req, res) => {
  try {
    const user = await TokenService.getUserFromToken(
      req.headers.authorization.split(" ")[1]
    );
    loggerService.info(`获取CSV数据列表 - User: ${user.username}`);

    if (!user || !user.roles) {
      return res.status(401).json({ message: "未找到用户信息或角色" });
    }

    // 只查询文件名列表和类型信息
    const csvDataList = await CSVData.find(
      { type: { $in: user.roles } },
      { "files.fileName": 1, type: 1 }
    );

    if (csvDataList.length === 0) {
      return res.status(404).json({ message: "未找到CSV数据" });
    }

    // 转换数据格式
    const result = csvDataList.map((csvData) => ({
      fileIndexMap: csvData.files.map((file) => file.fileName),
      type: csvData.type,
    }));

    res.json(result);
  } catch (error) {
    loggerService.error("获取CSV数据列表失败", error);
    res.status(500).json({ message: "获取数据失败", error: error.message });
  }
};

// 新增：根据文件名获取具体问题数据
export const getQuestionsByFileName = async (req, res) => {
  try {
    const { fileName } = req.query;
    const user = await TokenService.getUserFromToken(
      req.headers.authorization.split(" ")[1]
    );

    loggerService.info(
      `获取文件问题数据 - User: ${user.username}, File: ${fileName}`
    );

    if (!user || !user.roles) {
      return res.status(401).json({ message: "未找到用户信息或角色" });
    }

    const csvData = await CSVData.findOne(
      {
        type: { $in: user.roles },
        "files.fileName": fileName,
      },
      {
        "files.$": 1,
        type: 1,
      }
    );

    if (!csvData || !csvData.files[0]) {
      return res.status(404).json({ message: "未找到对应文件数据" });
    }

    res.json(csvData.files[0]);
  } catch (error) {
    loggerService.error("获取文件问题数据失败", error);
    res.status(500).json({ message: "获取数据失败", error: error.message });
  }
};
