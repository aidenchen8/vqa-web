import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "用户名或密码错误" });
    }
  } catch (error) {
    res.status(500).json({ message: "服务器错误" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { username, oldPassword, newPassword } = req.body;
    const user = await User.findOne({ username });

    if (user && (await user.matchPassword(oldPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ message: "密码修改成功" });
    } else {
      res.status(400).json({ message: "用户名或原密码错误" });
    }
  } catch (error) {
    res.status(500).json({ message: "服务器错误" });
  }
};

export const verifyToken = async (req, res) => {
  res.json({ user: req.user });
};

export default {
  loginUser,
  changePassword,
  verifyToken,
};
