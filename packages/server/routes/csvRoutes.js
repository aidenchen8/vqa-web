import express from "express";
import {
  uploadCSV,
  getCSVData,
  checkUserData,
} from "../controllers/csvController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/check", protect, checkUserData);
router.post("/upload", protect, uploadCSV);
router.get("/data", protect, getCSVData);

export default router;
