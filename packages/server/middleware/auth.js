import { TokenService } from "../services/tokenService.js";
import { loggerService } from "../services/loggerService.js";

export const protect = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const token = req.headers.authorization?.split(" ")[1];
    loggerService.access(req);

    if (!token) {
      loggerService.warn(`访问被拒绝：未提供令牌 - Path: ${req.path}`);
      return res.status(401).json({ message: "未授权，请先登录" });
    }

    const decoded = TokenService.verifyToken(token, "access");
    req.user = decoded;
    loggerService.info(`用户 ${decoded.username} 验证成功 - Path: ${req.path}`);

    // 记录响应时间
    res.on("finish", () => {
      const duration = Date.now() - startTime;
      loggerService.apiResponse(req, duration);
    });

    next();
  } catch (error) {
    loggerService.error(`认证错误 - Path: ${req.path}`, error);
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

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "未提供认证令牌" });
    }

    const user = await TokenService.getUserFromToken(token);

    if (!user) {
      return res.status(401).json({ message: "用户不存在" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "无效的认证令牌" });
  }
};

export default { protect, hasRole, authenticateToken };
