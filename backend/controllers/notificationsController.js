const mongoose = require("mongoose");
const Notification = require("../models/Notification");

// ─── Helpers ────────────────────────────────────────────────────────────────

const toNotificationDTO = (n) => ({
  id: n._id.toString(),
  title: n.title,
  body: n.body,
  isRead: n.isRead,
  createdAt: n.createdAt,
});

// ─── GET /v1/notifications ───────────────────────────────────────────────────

exports.getNotifications = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };
    if (req.query.isRead !== undefined) {
      filter.isRead = req.query.isRead === "true";
    }

    const [notifications, total] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Notification.countDocuments(filter),
    ]);

    return res.status(200).json({
      data: notifications.map(toNotificationDTO),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Error in getNotifications:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── GET /v1/notifications/count ─────────────────────────────────────────────

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ userId: req.user._id, isRead: false });
    return res.status(200).json({ count });
  } catch (err) {
    console.error("Error in getUnreadCount:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── PATCH /v1/notifications/:notificationId ──────────────────────────────────

exports.updateNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(404).json({ message: "Notification not found.", code: "NOT_FOUND" });
    }

    const { isRead } = req.body;
    if (isRead === undefined) {
      return res.status(400).json({
        message: "Validation failed.",
        code: "VALIDATION_ERROR",
        fields: { isRead: "isRead boolean is required." },
      });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: req.user._id },
      { isRead },
      { new: true, runValidators: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found.", code: "NOT_FOUND" });
    }

    return res.status(200).json(toNotificationDTO(notification));
  } catch (err) {
    console.error("Error in updateNotification:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── POST /v1/notifications/read-all ─────────────────────────────────────────

exports.markAllRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({ updated: result.modifiedCount });
  } catch (err) {
    console.error("Error in markAllRead:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── DELETE /v1/notifications/:notificationId ────────────────────────────────

exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(404).json({ message: "Notification not found.", code: "NOT_FOUND" });
    }

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found.", code: "NOT_FOUND" });
    }

    return res.status(204).send();
  } catch (err) {
    console.error("Error in deleteNotification:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── DELETE /v1/notifications ────────────────────────────────────────────────

exports.deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    return res.status(204).send();
  } catch (err) {
    console.error("Error in deleteAllNotifications:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};
