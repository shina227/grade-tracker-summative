require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const coursesRoutes = require("./routes/coursesRoutes");
const assignmentsRoutes = require("./routes/assignmentsRoutes");
const gradesRoutes = require("./routes/gradesRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// DB Connection
connectDB();

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

app.options("/(.*)", cors());

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/courses", coursesRoutes);
app.use("/api/v1/assignments", assignmentsRoutes);
app.use("/api/v1/grades", gradesRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Health Check (useful for Render debugging)
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});