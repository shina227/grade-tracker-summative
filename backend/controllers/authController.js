const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

// Transform User model into frontend AuthUser shape
const toAuthUser = (user) => ({
  id: user._id.toString(),
  email: user.email,
  name: user.fullName,
  role: user.role || "student",
});

// Register User
exports.registerUser = async (req, res) => {
  const { fullName, email, password, profileImageUrl } = req.body;

  if (!fullName || !email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already in use",
      });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      profileImageUrl,
    });

    res.status(201).json({
      user: toAuthUser(user),
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({
      message: "Error registering user",
      error: err.message,
    });
  }
};

// Login User
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    res.status(200).json({
      user: toAuthUser(user),
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({
      message: "Error logging in",
      error: err.message,
    });
  }
};

// Session / Current User
exports.getSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(toAuthUser(user));
  } catch (err) {
    res.status(500).json({
      message: "Error getting session",
      error: err.message,
    });
  }
};

// Logout User
exports.logoutUser = async (_req, res) => {
  res.status(200).json({
    message: "Logged out",
  });
};

// Update User Info
exports.updateUserInfo = async (req, res) => {
  const { fullName, email } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (fullName) {
      user.fullName = fullName;
    }

    if (email) {
      const emailExists = await User.findOne({ email });

      if (emailExists && emailExists.id !== req.user.id) {
        return res.status(400).json({
          message: "Email already in use",
        });
      }

      user.email = email;
    }

    await user.save();

    res.status(200).json({
      message: "User info updated",
      user: toAuthUser(user),
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating user info",
      error: err.message,
    });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      message: "Both current and new passwords are required",
    });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Error changing password",
      error: err.message,
    });
  }
};