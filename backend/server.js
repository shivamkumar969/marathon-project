const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const eventRoutes = require("./routes/eventRoutes");
const registrationRoutes = require("./routes/registrationRoutes");
const winnerRoutes = require("./routes/winnerRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const userRoutes = require("./routes/userRoutes");
const matchmakerRoutes = require("./routes/matchmakerRoutes");
const courseRoutes = require("./routes/courseRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

/* -------------------- SECURITY -------------------- */
// Helmet helps secure Express apps by setting various HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow images from backend to be loaded by frontend
}));

// Rate Limiting to prevent Brute Force and DoS attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Stricter limit for auth routes (login/register)
  message: "Too many login attempts, please try again after 15 minutes",
});

app.use("/api/", apiLimiter);
app.use("/api/auth", authLimiter);

/* -------------------- DATABASE -------------------- */
connectDB();

/* -------------------- MIDDLEWARES -------------------- */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
);

const path = require("path");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  "/api/analytics",
  analyticsRoutes
);

app.use(
  "/api/certificates",
  certificateRoutes
);
app.use("/api/winners", winnerRoutes);

/* -------------------- HOME ROUTE -------------------- */
app.get("/", (req, res) => {
  res.send("SMART EVENT MANAGER API RUNNING");
});

/* -------------------- API ROUTES -------------------- */

// Authentication
app.use("/api/auth", authRoutes);

// Events
app.use("/api/events", eventRoutes);

// Registrations
app.use("/api/registrations", registrationRoutes);

// Users (Admin Only Management)
app.use("/api/users", userRoutes);

// AI Smart Matchmaker
app.use("/api/matchmaker", matchmakerRoutes);

// Courses
app.use("/api/courses", courseRoutes);
app.use("/api/reports", reportRoutes);

/* -------------------- 404 ROUTE -------------------- */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found"
  });
});

/* -------------------- ERROR HANDLER -------------------- */
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

/* -------------------- SERVER START -------------------- */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server Running On Port ${PORT}`);
});