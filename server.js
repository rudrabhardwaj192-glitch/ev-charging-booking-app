require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// =======================
// Database Connection
// =======================
require("./src/config/testConnection");

// =======================
// Middleware
// =======================
app.use(cors());
app.use(express.json());

// =======================
// Routes
// =======================
const authRoutes = require("./src/routes/authRoutes");
const stationRoutes = require("./src/routes/stationRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const favoriteRoutes = require("./src/routes/favoriteRoutes");

// =======================
// API Routes
// =======================
app.use("/auth", authRoutes);
app.use("/stations", stationRoutes);
app.use("/bookings", bookingRoutes);
app.use("/admin", adminRoutes);
app.use("/reviews", reviewRoutes);
app.use("/favorites", favoriteRoutes);

// =======================
// Home Route
// =======================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚗 EV Charging API is Running Successfully",
  });
});

// =======================
// 404 Route
// =======================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// =======================
// Server
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});