const express = require("express");
const router = express.Router();
const { saveFormData, getFormData } = require("../controllers/formController");
const { protect } = require("../middleware/auth");

router.post("/save", protect, saveFormData);
router.get("/", protect, getFormData);

module.exports = router;
