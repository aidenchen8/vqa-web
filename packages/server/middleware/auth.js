import { TokenService } from "../services/tokenService.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "未授权，请先登录" });
    }

    const decoded = TokenService.verifyToken(token, "access");
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        message: "令牌已过期",
        code: "TOKEN_EXPIRED",
      });
    } else {
      res.status(401).json({ message: "无效的令牌" });
    }
  }
};

export const hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      return res.status(403).json({ message: "权限不足" });
    }

    const hasPermission = req.user.roles.some((role) => roles.includes(role));
    if (!hasPermission) {
      return res.status(403).json({ message: "权限不足" });
    }

    next();
  };
};

export default { protect, hasRole };
