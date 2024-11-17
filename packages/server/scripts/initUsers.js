import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const users = [
  {
    username: "admin",
    password: "admin123",
  },
  {
    username: "a1",
    password: "a1_vqa",
  },
  {
    username: "a2",
    password: "a2_vqa",
  },
  {
    username: "b1",
    password: "b1_vqa",
  },
  {
    username: "b2",
    password: "b2_vqa",
  },
  {
    username: "c1",
    password: "c1_vqa",
  },
  {
    username: "c2",
    password: "c2_vqa",
  },
  {
    username: "val",
    password: "val_vqa",
  },
];

const initUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected");

    // 清除现有用户
    await User.deleteMany({});
    console.log("已清除现有用户数据");

    // 创建新用户
    const createdUsers = await User.create(users);
    console.log("已创建以下用户：");
    createdUsers.forEach((user) => {
      console.log(`- ${user.username}`);
    });

    console.log("用户初始化完成");
    process.exit();
  } catch (error) {
    console.error("初始化用户失败:", error);
    process.exit(1);
  }
};

initUsers();
