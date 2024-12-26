import express from "express";
import {
  uploadCSV,
  getCSVData,
  checkUserData,
  getQuestionsByFileName,
} from "../controllers/csvController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/check", protect, checkUserData);
router.post("/upload", protect, uploadCSV);
router.get("/data", protect, getCSVData);
router.get("/query", protect, getQuestionsByFileName);

export default router;
