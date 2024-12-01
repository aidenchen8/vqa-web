import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
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
    const createdUsers = [];
    for (const userData of users) {
      try {
        // 生成盐值
        const salt = await bcrypt.genSalt(10);
        // 使用盐值加密密码
        const hashedPassword = await bcrypt.hash(userData.password, salt);

        // 创建用户
        const user = await User.create({
          username: userData.username,
          password: hashedPassword,
          roles: userData.roles,
        });

        createdUsers.push(user);
        console.log(
          `✓ 创建用户成功: ${user.username}, 角色: ${user.roles.join(", ")}`
        );
      } catch (error) {
        console.error(`✗ 创建用户失败: ${userData.username}`, error.message);
      }
    }

    console.log("\n用户初始化完成");
    console.log(`成功创建 ${createdUsers.length} 个用户`);
    console.log(`失败 ${users.length - createdUsers.length} 个用户`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("初始化用户失败:", error);
    process.exit(1);
  }
};

// 添加错误处理
process.on("unhandledRejection", (error) => {
  console.error("未处理的 Promise 拒绝:", error);
  process.exit(1);
});

initUsers();
