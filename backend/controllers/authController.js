const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });

const toAuthUser = (user) => ({
  id: user._id.toString(),
  email: user.email,
  name: user.fullName,
  role: user.role,
});

// POST /auth/login
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({
      user: toAuthUser(user),
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Error logging in:", err);
    return res.status(500).json({ message: "Error logging in" });
  }
};

// GET /auth/session
exports.getSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json(toAuthUser(user));
  } catch (err) {
    console.error("Error getting session:", err);
    return res.status(500).json({ message: "Error getting session" });
  }
};

// POST /auth/logout
exports.logoutUser = (_req, res) => {
  return res.json({ message: "Logged out" });
};