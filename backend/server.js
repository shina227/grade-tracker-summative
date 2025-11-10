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

// Connect to database
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware to handle CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/courses", coursesRoutes);
app.use("/api/v1/assignments", assignmentsRoutes);
app.use("/api/v1/grades", gradesRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// Serve uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
