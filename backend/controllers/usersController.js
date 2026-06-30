const mongoose = require("mongoose");
const User = require("../models/User");
const Course = require("../models/Course");

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Maps a Mongoose User document to the public-facing DTO shape. */
const toUserDTO = (user) => ({
  id: user._id.toString(),
  name: user.fullName,
  email: user.email,
  role: user.role,
  avatarUrl: user.profileImageUrl,
  studentId: user.studentId ?? null,
  yearOfStudy: user.yearOfStudy ?? null,
  createdAt: user.createdAt,
});

/** Maps a User document to the slimmer list-item shape used in paginated responses. */
const toUserListDTO = (user) => ({
  id: user._id.toString(),
  name: user.fullName,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

// ─── GET /v1/users/me ────────────────────────────────────────────────────────

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -resetPasswordToken -resetPasswordExpiry"
    );

    if (!user || !user.isActive) {
      return res.status(404).json({ message: "User not found.", code: "NOT_FOUND" });
    }

    return res.status(200).json(toUserDTO(user));
  } catch (err) {
    console.error("Error in getMe:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── PATCH /v1/users/me ──────────────────────────────────────────────────────

/**
 * Only `avatarUrl` may be self-updated.
 * Name, email, role, studentId, and yearOfStudy are admin-only fields.
 */
exports.updateMe = async (req, res) => {
  try {
    const { avatarUrl } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImageUrl: avatarUrl },
      { new: true, runValidators: true }
    ).select("-password -resetPasswordToken -resetPasswordExpiry");

    if (!user || !user.isActive) {
      return res.status(404).json({ message: "User not found.", code: "NOT_FOUND" });
    }

    return res.status(200).json(toUserDTO(user));
  } catch (err) {
    console.error("Error in updateMe:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── PATCH /v1/users/me/password ─────────────────────────────────────────────

exports.updateMyPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      message: "Validation failed.",
      code: "VALIDATION_ERROR",
      fields: {
        ...(!currentPassword && { currentPassword: "Current password is required." }),
        ...(!newPassword && { newPassword: "New password is required." }),
      },
    });
  }

  try {
    // Select password explicitly since it's excluded by default
    const user = await User.findById(req.user.id).select("+password");

    if (!user || !user.isActive) {
      return res.status(404).json({ message: "User not found.", code: "NOT_FOUND" });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        message: "The current password you entered is incorrect.",
        code: "INCORRECT_CURRENT_PASSWORD",
      });
    }

    user.password = newPassword;
    await user.save(); // triggers the pre-save hash hook

    return res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Error in updateMyPassword:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── GET /v1/users ───────────────────────────────────────────────────────────

exports.listUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { isActive: true };
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      const rx = new RegExp(req.query.search, "i");
      filter.$or = [{ fullName: rx }, { email: rx }];
    }

    const [users, total] = await Promise.all([
      User.find(filter).select("-password -resetPasswordToken -resetPasswordExpiry").skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      data: users.map(toUserListDTO),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error in listUsers:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── POST /v1/users ──────────────────────────────────────────────────────────

exports.createUser = async (req, res) => {
  const { name, email, role, password } = req.body;

  if (!name || !email || !role || !password) {
    return res.status(400).json({
      message: "Validation failed.",
      code: "VALIDATION_ERROR",
      fields: {
        ...(!name && { name: "Name is required." }),
        ...(!email && { email: "Email is required." }),
        ...(!role && { role: "Role is required." }),
        ...(!password && { password: "Password is required." }),
      },
    });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({
        message: "A user with that email address already exists.",
        code: "EMAIL_ALREADY_EXISTS",
      });
    }

    const user = await User.create({ fullName: name, email, role, password });

    return res.status(201).json(toUserDTO(user));
  } catch (err) {
    console.error("Error in createUser:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── GET /v1/users/:userId ───────────────────────────────────────────────────

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({ message: "User not found.", code: "NOT_FOUND" });
    }

    const target = await User.findOne({ _id: userId, isActive: true }).select(
      "-password -resetPasswordToken -resetPasswordExpiry"
    );

    if (!target) {
      return res.status(404).json({ message: "User not found.", code: "NOT_FOUND" });
    }

    // Teachers may only view students enrolled in their courses.
    // NOTE: Full enrollment scoping will be tightened once the enrollment
    // system is implemented in the Courses phase.
    if (req.user.role === "teacher") {
      if (target.role !== "student") {
        return res.status(403).json({
          message: "Teachers may only view student profiles.",
          code: "FORBIDDEN",
        });
      }
      // TODO: Add enrollment check — verify target student is enrolled
      // in at least one of this teacher's courses.
    }

    return res.status(200).json(toUserDTO(target));
  } catch (err) {
    console.error("Error in getUserById:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── PATCH /v1/users/:userId ─────────────────────────────────────────────────

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({ message: "User not found.", code: "NOT_FOUND" });
    }

    const ALLOWED = ["name", "email", "role", "studentId", "yearOfStudy"];
    const updates = {};

    for (const field of ALLOWED) {
      if (req.body[field] !== undefined) {
        // Map spec field names to schema field names
        if (field === "name") updates.fullName = req.body.name;
        else updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update.",
        code: "VALIDATION_ERROR",
      });
    }

    // Check for email conflict if email is being changed
    if (updates.email) {
      const conflict = await User.findOne({ email: updates.email, _id: { $ne: userId } });
      if (conflict) {
        return res.status(409).json({
          message: "A user with that email address already exists.",
          code: "EMAIL_ALREADY_EXISTS",
        });
      }
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, isActive: true },
      updates,
      { new: true, runValidators: true }
    ).select("-password -resetPasswordToken -resetPasswordExpiry");

    if (!user) {
      return res.status(404).json({ message: "User not found.", code: "NOT_FOUND" });
    }

    return res.status(200).json(toUserDTO(user));
  } catch (err) {
    console.error("Error in updateUser:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── DELETE /v1/users/:userId ────────────────────────────────────────────────

/**
 * Soft-delete: sets isActive = false.
 * Historical grade and submission data is preserved.
 */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(404).json({ message: "User not found.", code: "NOT_FOUND" });
    }

    const user = await User.findOneAndUpdate(
      { _id: userId, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found.", code: "NOT_FOUND" });
    }

    return res.status(204).send();
  } catch (err) {
    console.error("Error in deleteUser:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};
