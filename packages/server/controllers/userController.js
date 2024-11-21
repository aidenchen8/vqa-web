import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// 生成RSA密钥对
const generateKeyPair = () => {
  return crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem",
    },
  });
};

const { publicKey, privateKey } = generateKeyPair();

// 获取公钥
export const getPublicKey = (req, res) => {
  res.json({ publicKey });
};

// 用户登录
export const loginUser = async (req, res) => {
  try {
    const { username, encryptedPassword } = req.body;

    // 使用私钥解密密码
    const buffer = Buffer.from(encryptedPassword, "base64");
    const password = crypto
      .privateDecrypt(
        {
          key: privateKey,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        buffer
      )
      .toString();

    const user = await User.findOne({ username });
    if (user && (await user.matchPassword(password))) {
      res.json({
        id: user._id,
        username: user.username,
        roles: user.roles,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "用户名或密码错误" });
    }
  } catch (error) {
    res.status(500).json({ message: "服务器错误" });
  }
};

// 更新用户信息
export const updateUser = async (req, res) => {
  try {
    const { username } = req.body;

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

    res.json({
      id: user._id,
      username: user.username,
      roles: user.roles,
    });
  } catch (error) {
    res.status(500).json({ message: "更新失败" });
  }
};

// 管理员更新用户角色
export const updateUserRoles = async (req, res) => {
  try {
    const { userId, roles } = req.body;

    // 验证角色是否有效
    const validRoles = ["admin", "user", "annotator", "reviewer"];
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

    res.json({
      id: user._id,
      username: user.username,
      roles: user.roles,
    });
  } catch (error) {
    res.status(500).json({ message: "更新失败" });
  }
};

export const verifyToken = async (req, res) => {
  res.json({ user: req.user });
};

export const getUserInfo = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({
      id: user._id,
      username: user.username,
      roles: user.roles,
    });
  } catch (error) {
    res.status(500).json({ message: "获取用户信息失败" });
  }
};

export default {
  loginUser,
  updateUser,
  updateUserRoles,
  verifyToken,
  getUserInfo,
};
