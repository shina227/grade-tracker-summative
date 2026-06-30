const mongoose = require("mongoose");
const Reminder = require("../models/Reminder");

// ─── Helpers ────────────────────────────────────────────────────────────────

const toReminderDTO = (reminder) => {
  const now = new Date();
  const due = new Date(reminder.dueDate);
  // Urgent if due within the next 48 hours or overdue
  const isUrgent = due.getTime() - now.getTime() <= 48 * 60 * 60 * 1000;

  return {
    id: reminder._id.toString(),
    title: reminder.title,
    detail: reminder.detail ?? "",
    dueDate: due.toISOString(),
    isUrgent,
  };
};

// ─── GET /v1/reminders ────────────────────────────────────────────────────────

exports.getReminders = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = { userId: req.user._id };

    const [reminders, total] = await Promise.all([
      Reminder.find(filter).sort({ dueDate: 1 }).skip(skip).limit(limit).lean(),
      Reminder.countDocuments(filter),
    ]);

    return res.status(200).json({
      data: reminders.map(toReminderDTO),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error("Error in getReminders:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── POST /v1/reminders ───────────────────────────────────────────────────────

exports.createReminder = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students can create personal reminders.", code: "FORBIDDEN" });
    }

    const { title, detail, dueDate } = req.body;
    if (!title || !dueDate) {
      return res.status(400).json({
        message: "Validation failed.",
        code: "VALIDATION_ERROR",
        fields: {
          ...(!title && { title: "Title is required." }),
          ...(!dueDate && { dueDate: "Due date is required." }),
        },
      });
    }

    const reminder = await Reminder.create({
      userId: req.user._id,
      title,
      detail: detail ?? "",
      dueDate,
    });

    return res.status(201).json(toReminderDTO(reminder));
  } catch (err) {
    console.error("Error in createReminder:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── DELETE /v1/reminders/:reminderId ─────────────────────────────────────────

exports.deleteReminder = async (req, res) => {
  try {
    const { reminderId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(reminderId)) {
      return res.status(404).json({ message: "Reminder not found.", code: "NOT_FOUND" });
    }

    const reminder = await Reminder.findOneAndDelete({
      _id: reminderId,
      userId: req.user._id,
    });

    if (!reminder) {
      return res.status(404).json({ message: "Reminder not found.", code: "NOT_FOUND" });
    }

    return res.status(204).send();
  } catch (err) {
    console.error("Error in deleteReminder:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};

// ─── DELETE /v1/reminders ─────────────────────────────────────────────────────

exports.deleteAllReminders = async (req, res) => {
  try {
    await Reminder.deleteMany({ userId: req.user._id });
    return res.status(204).send();
  } catch (err) {
    console.error("Error in deleteAllReminders:", err);
    return res.status(500).json({ message: "Internal server error.", code: "INTERNAL_ERROR" });
  }
};
