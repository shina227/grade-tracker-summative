const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  getNotifications,
  getUnreadCount,
  updateNotification,
  markAllRead,
  deleteNotification,
  deleteAllNotifications,
} = require("../controllers/notificationsController");

const router = express.Router();

router.use(protect);

// GET /v1/notifications
router.get("/", getNotifications);

// GET /v1/notifications/count
router.get("/count", getUnreadCount);

// POST /v1/notifications/read-all
router.post("/read-all", markAllRead);

// PATCH /v1/notifications/:notificationId
router.patch("/:notificationId", updateNotification);

// DELETE /v1/notifications/:notificationId
router.delete("/:notificationId", deleteNotification);

// DELETE /v1/notifications (Dismiss all)
router.delete("/", deleteAllNotifications);

module.exports = router;
