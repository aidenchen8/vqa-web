import express from "express";
import {
  logout,
  loginUser,
  registerUser,
  getPublicKey,
  getUserInfo,
  updateUser,
  updateUserRoles,
  changePassword,
  refreshToken,
} from "../controllers/userController.js";
import { protect, hasRole, authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/public-key", getPublicKey);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authenticateToken, logout);
router.get("/info", authenticateToken, getUserInfo);
router.put("/update", protect, updateUser);
router.put("/update-roles", protect, hasRole("admin"), updateUserRoles);
router.put("/change-password", protect, changePassword);
router.post("/refresh-token", refreshToken);

export default router;
