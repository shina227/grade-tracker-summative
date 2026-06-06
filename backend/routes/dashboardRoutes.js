const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getDashboardStats,
} = require("../controllers/dashboardController");

const router = express.Router();

// NEW contract endpoint
router.get("/stats", protect, getDashboardStats);

module.exports = router;