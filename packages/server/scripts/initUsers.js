import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const users = [
  {
    username: "admin",
    password: "admin123",
    roles: ["admin", "user"],
  },
  {
    username: "a1",
    password: "user123",
    roles: ["a1"],
  },
  {
    username: "a2",
    password: "user123",
    roles: ["a2"],
  },
  {
    username: "b1",
    password: "user123",
    roles: ["b1"],
  },
  {
    username: "b2",
    password: "user123",
    roles: ["b2"],
  },
  {
    username: "c1",
    password: "user123",
    roles: ["c1"],
  },
  {
    username: "c2",
    password: "user123",
    roles: ["c2"],
  },
  {
    username: "val",
    password: "user123",
    roles: ["val"],
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
