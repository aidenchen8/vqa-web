import express from "express";
import {
  saveFormData,
  getFormData,
  getStats,
  getLastEdited,
} from "../controllers/formController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", protect, getStats);
router.get("/query", protect, getFormData);
router.post("/save", protect, saveFormData);
router.get("/last-edited", protect, getLastEdited);

export default router;
