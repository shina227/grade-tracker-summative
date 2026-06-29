const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { uploadFile } = require("../controllers/uploadsController");

const router = express.Router();

// All upload routes require authentication
router.use(protect);

// POST /v1/uploads
router.post("/", uploadFile);

module.exports = router;
