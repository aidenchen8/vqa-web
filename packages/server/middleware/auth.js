import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "未授权，请先登录" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    next();
  } catch (error) {
    res.status(401).json({ message: "未授权，token无效" });
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
