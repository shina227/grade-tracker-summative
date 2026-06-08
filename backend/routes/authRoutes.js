const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { loginUser, getSession, logoutUser } = require("../controllers/authController");

const router = express.Router();

router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/session", protect, getSession);

module.exports = router;