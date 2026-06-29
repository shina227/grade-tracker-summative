const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const {
  getReminders,
  createReminder,
  deleteReminder,
  deleteAllReminders,
} = require("../controllers/remindersController");

const router = express.Router();

router.use(protect);

// GET /v1/reminders
router.get("/", getReminders);

// POST /v1/reminders (Student only)
router.post("/", requireRole("student"), createReminder);

// DELETE /v1/reminders/:reminderId
router.delete("/:reminderId", deleteReminder);

// DELETE /v1/reminders (Dismiss all)
router.delete("/", deleteAllReminders);

module.exports = router;
