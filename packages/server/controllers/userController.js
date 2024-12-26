import { TokenService } from "../services/tokenService.js";
import User from "../models/User.js";
import { loggerService } from "../services/loggerService.js";

// 用户注册
export const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    loggerService.info(`用户注册请求 - Username: ${username}`);

    // 检查请求参数
    if (!username || !password) {
      console.log("Missing required fields:", {
        username: !!username,
        password: !!password,
      });
      return res.status(400).json({ message: "缺少必要参数" });
    }

    // 检查用户是否已存在
    const userExists = await User.findOne({ username });
    if (userExists) {
      console.log("User already exists:", username);
      return res.status(400).json({ message: "用户名已存在" });
    }

    // 创建新用户
    const user = await User.create({
      username,
      password,
      roles: ["user"],
    });

    // 生成令牌
    const tokens = TokenService.generateTokens(user);

    loggerService.info(`用户注册成功 - Username: ${username}`);

    return res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        roles: user.roles,
      },
      ...tokens,
    });
  } catch (error) {
    loggerService.error("用户注册失败", error);
    return res
      .status(500)
      .json({ message: "注册失败", details: error.message });
  }
};

// 用户登录
export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    loggerService.info(`用户登录尝试 - Username: ${username}`);

    // 先查找用户
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "用户名或密码错误" });
    }

    // 直接验证密码
    if (await user.matchPassword(password)) {
      loggerService.info(`用户登录成功 - Username: ${username}`);
      const tokens = TokenService.generateTokens(user);
      res.json({
        user: {
          id: user._id,
          username: user.username,
          roles: user.roles,
        },
        ...tokens,
      });
    } else {
      loggerService.warn(`用户登录失败：密码错误 - Username: ${username}`);
      res.status(401).json({ message: "用户名或密码错误" });
    }
  } catch (error) {
    loggerService.error("用户登录失败", error);
    res.status(500).json({ message: "登录失败" });
  }
};

// 刷新令牌
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    // 验证 refresh token
    const decoded = TokenService.verifyToken(refreshToken, "refresh");

    // 获取用户信息
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "用户不存在" });
    }

    // 生成新令牌
    const tokens = TokenService.generateTokens(user);

    res.json({
      user: {
        id: user._id,
        username: user.username,
        roles: user.roles,
      },
      ...tokens,
    });
  } catch (error) {
    res.status(401).json({ message: "无效的刷新令牌" });
  }
};

// 登出
export const logout = async (req, res) => {
  try {
    // 获取当前的 token
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      // 可以选择将 token 加入黑名单
      // await TokenBlacklist.create({ token, expiredAt: new Date() });
    }

    res.json({ message: "登出成功" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "登出失败" });
  }
};

// 更新用��信息
export const updateUser = async (req, res) => {
  try {
    const { username } = req.body;
    loggerService.info(
      `更新用户信息 - User: ${req.user.username}, NewUsername: ${username}`
    );

    // 检查用户名是否已存在
    if (username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(400).json({ message: "用户名已存在" });
      }
    }

    const user = await User.findById(req.user._id);
    if (username) user.username = username;

    await user.save();

    loggerService.info(`用户信息更新成功 - User: ${user.username}`);
    res.json({
      id: user._id,
      username: user.username,
      roles: user.roles,
    });
  } catch (error) {
    loggerService.error("更新用户信息失败", error);
    res.status(500).json({ message: "更新失败" });
  }
};

// 管理员更新用户角色
export const updateUserRoles = async (req, res) => {
  try {
    const { userId, roles } = req.body;
    loggerService.info(
      `更新用户角色 - AdminUser: ${req.user.username}, TargetUser: ${userId}, NewRoles: ${roles.join(",")}`
    );

    // 验证角色是否有效
    const validRoles = ["admin", "user", "a1", "a2", "b1", "b2", "c1", "c2"];
    const invalidRoles = roles.filter((role) => !validRoles.includes(role));
    if (invalidRoles.length > 0) {
      return res.status(400).json({ message: "包含无效的角色" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "用户不存在" });
    }

    user.roles = roles;
    await user.save();

    loggerService.info(`用户角色更新成功 - UserId: ${userId}`);
    res.json({
      id: user._id,
      username: user.username,
      roles: user.roles,
    });
  } catch (error) {
    loggerService.error("更新用户角色失败", error);
    res.status(500).json({ message: "更新失败" });
  }
};

export const verifyToken = async (req, res) => {
  res.json({ user: req.user });
};

export const getUserInfo = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "未提供认证令牌" });
    }

    const user = await TokenService.getUserFromToken(token);

    if (!user) {
      return res.status(401).json({ message: "未找到用户信息" });
    }

    res.json({
      id: user._id,
      username: user.username,
      roles: user.roles,
    });
  } catch (error) {
    console.error("Get user info error:", error);
    res.status(500).json({ message: "获取用户信息失败" });
  }
};

// 修改密码
export const changePassword = async (req, res) => {
  try {
    loggerService.info(`修改密码请求 - User: ${req.user.username}`);

    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    // 验证旧密码
    if (!(await user.matchPassword(oldPassword))) {
      return res.status(401).json({ message: "原密码错误" });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    loggerService.info(`密码修改成功 - User: ${req.user.username}`);
    res.json({ message: "密码修改成功" });
  } catch (error) {
    loggerService.error("修改密码失败", error);
    res.status(500).json({ message: "密码修改失败" });
  }
};

// 获取所有用户
export const getAllUsers = async (req, res) => {
  try {
    loggerService.info(`获取所有用户列表 - RequestUser: ${req.user.username}`);
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    loggerService.error("获取用户列表失败", error);
    res.status(500).json({ message: "获取用户列表失败" });
  }
};

// 批量更新用户角色
export const batchUpdateRoles = async (req, res) => {
  try {
    const { userIds, roles } = req.body;
    loggerService.info(
      `批量更新用户角色 - AdminUser: ${req.user.username}, Users: ${userIds.length}, NewRoles: ${roles.join(",")}`
    );

    await User.updateMany(
      { _id: { $in: userIds } },
      { $set: { roles: roles } }
    );

    loggerService.info(`批量更新用户角色成功 - Users: ${userIds.length}`);
    res.json({ message: "批量更新成功" });
  } catch (error) {
    loggerService.error("批量更新用户角色失败", error);
    res.status(500).json({ message: "批量更新失败" });
  }
};

export default {
  registerUser,
  loginUser,
  updateUser,
  updateUserRoles,
  verifyToken,
  getUserInfo,
  changePassword,
  getAllUsers,
  batchUpdateRoles,
};
