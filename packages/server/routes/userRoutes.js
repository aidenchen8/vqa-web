import express from "express";
import {
  loginUser,
  getPublicKey,
  updateUser,
  updateUserRoles,
} from "../controllers/userController.js";
import { protect, hasRole } from "../middleware/auth.js";

const router = express.Router();

router.get("/public-key", getPublicKey);
router.post("/login", loginUser);
router.put("/update", protect, updateUser);
router.put("/update-roles", protect, hasRole("admin"), updateUserRoles);

export default router;
