const express = require("express");
const router = express.Router();
const {
  loginUser,
  changePassword,
  verifyToken,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.post("/login", loginUser);
router.post("/change-password", changePassword);
router.get("/verify", protect, verifyToken);

module.exports = router;
