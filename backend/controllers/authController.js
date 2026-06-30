const crypto = require("crypto");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// ─── Helpers ────────────────────────────────────────────────────────────────

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

/** Shapes the user object returned in auth responses (login). */
const toAuthUser = (user) => ({
  id: user._id.toString(),
  email: user.email,
  name: user.fullName,
  role: user.role,
});

// ─── POST /v1/auth/login ─────────────────────────────────────────────────────

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required.",
      code: "VALIDATION_ERROR",
      fields: {
        ...(!email && { email: "Email is required." }),
        ...(!password && { password: "Password is required." }),
      },
    });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        message: "Invalid email or password.",
        code: "INVALID_CREDENTIALS",
      });
    }

    return res.status(200).json({
      token: generateToken(user._id),
      user: toAuthUser(user),
    });
  } catch (err) {
    console.error("Error logging in:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── POST /v1/auth/logout ────────────────────────────────────────────────────

/**
 * Logout is stateless — the client is responsible for discarding the token.
 * Returns 204 No Content per the API spec.
 */
exports.logoutUser = (_req, res) => {
  return res.status(204).send();
};

// ─── POST /v1/auth/forgot-password ───────────────────────────────────────────

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Always respond 200 regardless of whether the email exists — prevents user enumeration.
  const successResponse = () =>
    res.status(200).json({
      message: "If that email exists, a reset link has been sent.",
    });

  if (!email) {
    // Still 200 per spec — don't reveal any info
    return successResponse();
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return successResponse();
    }

    // Generate a secure random plain token (sent to the user)
    const plainToken = crypto.randomBytes(32).toString("hex");

    // Store a hashed version so the plain token is never in the DB
    const hashedToken = crypto.createHash("sha256").update(plainToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // In development: log the token to the console for easy Postman testing.
    // Replace this block with real email sending (e.g. nodemailer) when ready.
    console.log("─────────────────────────────────────────");
    console.log("[DEV] Password reset token for:", email);
    console.log("[DEV] Token:", plainToken);
    console.log("[DEV] Expires at:", user.resetPasswordExpiry.toISOString());
    console.log("─────────────────────────────────────────");

    return successResponse();
  } catch (err) {
    console.error("Error in forgot-password:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── POST /v1/auth/reset-password ────────────────────────────────────────────

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      message: "Validation failed.",
      code: "VALIDATION_ERROR",
      fields: {
        ...(!token && { token: "Reset token is required." }),
        ...(!password && { password: "New password is required." }),
      },
    });
  }

  try {
    // Hash the incoming plain token and look it up
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: new Date() }, // must not be expired
    });

    if (!user) {
      return res.status(400).json({
        message: "The reset token is invalid or has expired.",
        code: "INVALID_OR_EXPIRED_TOKEN",
      });
    }

    // Update password and clear the reset token fields
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpiry = null;
    await user.save();

    return res.status(200).json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error("Error in reset-password:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};