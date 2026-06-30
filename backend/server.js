require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");

const connectDB = require("./config/db");
const User = require("./models/User");

const authRoutes = require("./routes/authRoutes");
const usersRoutes = require("./routes/usersRoutes");
const uploadsRoutes = require("./routes/uploadsRoutes");
const coursesRoutes = require("./routes/coursesRoutes");
const lessonsRoutes = require("./routes/lessonsRoutes");
const assignmentsRoutes = require("./routes/assignmentsRoutes");
const gradesRoutes = require("./routes/gradesRoutes");
const notificationsRoutes = require("./routes/notificationsRoutes");
const remindersRoutes = require("./routes/remindersRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allowed Origins
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
];

// CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options(/.*/, cors());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", usersRoutes);
app.use("/api/v1/uploads", uploadsRoutes);
app.use("/api/v1/courses", coursesRoutes);
app.use("/api/v1/lessons", lessonsRoutes);
app.use("/api/v1/assignments", assignmentsRoutes);
app.use("/api/v1/grades", gradesRoutes);
app.use("/api/v1/notifications", notificationsRoutes);
app.use("/api/v1/reminders", remindersRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health Check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

/**
 * Seed a default admin account if one doesn't already exist.
 * This runs only on server startup.
 */
async function seedAdmin() {
  try {
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("✅ Admin already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash(
      process.env.DEFAULT_ADMIN_PASSWORD,
      10
    );

    await User.create({
      fullName: process.env.DEFAULT_ADMIN_NAME,
      email: process.env.DEFAULT_ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
    });

    console.log("✅ Default admin created.");
  } catch (error) {
    console.error("❌ Failed to seed admin:", error);
  }
}

// Start Server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Seed default admin if necessary
    await seedAdmin();

    // Start Express
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();