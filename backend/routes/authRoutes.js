const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  loginUser,
  logoutUser,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

// POST /v1/auth/login
router.post("/login", loginUser);

// POST /v1/auth/logout
router.post("/logout", protect, logoutUser);

// POST /v1/auth/forgot-password
router.post("/forgot-password", forgotPassword);

// POST /v1/auth/reset-password
router.post("/reset-password", resetPassword);

module.exports = router;