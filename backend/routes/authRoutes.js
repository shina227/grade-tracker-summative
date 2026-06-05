const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");

const {
  registerUser,
  loginUser,
  getSession,
  logoutUser,
  updateUserInfo,
  changePassword,
} = require("../controllers/authController");

const router = express.Router();

// Authentication
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/session", protect, getSession);

// Profile
router.put("/update-user", protect, updateUserInfo);
router.put("/change-password", protect, changePassword);

// Image Upload
router.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded",
    });
  }

  const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
    req.file.filename
  }`;

  res.status(200).json({
    imageUrl,
  });
});

module.exports = router;