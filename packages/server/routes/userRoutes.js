import express from "express";
import {
  loginUser,
  changePassword,
  verifyToken,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/login", loginUser);
router.post("/change-password", changePassword);
router.get("/verify", protect, verifyToken);

export default router;
