import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

// 确保环境变量中有这些值
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

export class TokenService {
  static generateTokens(user) {
    // 访问令牌，有效期较短
    const accessToken = jwt.sign(
      {
        id: user._id,
        roles: user.roles,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // 刷新令牌，有效期较长
    const refreshToken = jwt.sign(
      {
        id: user._id,
        roles: user.roles,
      },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    return {
      accessToken,
      refreshToken,
      expires: Date.now() + 60 * 60 * 1000, // 1小时后过期
      refreshExpires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7天后过期
    };
  }

  static verifyToken(token, type = "access") {
    const secret = type === "access" ? JWT_SECRET : JWT_REFRESH_SECRET;
    return jwt.verify(token, secret);
  }

  static async getUserFromToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id);
      return user;
    } catch (error) {
      throw new Error("无效的认证令牌");
    }
  }
}
