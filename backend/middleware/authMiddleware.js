const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided. Authorization denied.",
        code: "UNAUTHORIZED",
      });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (_err) {
      return res.status(401).json({
        message: "Token is invalid or has expired.",
        code: "UNAUTHORIZED",
      });
    }

    const user = await User.findById(decoded.id).select("-password -resetPasswordToken -resetPasswordExpiry");

    if (!user) {
      return res.status(401).json({
        message: "The user belonging to this token no longer exists.",
        code: "UNAUTHORIZED",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};