require("dotenv").config();

const express = require("express");

const stationRoutes = require("./src/routes/stationRoutes");
const authRoutes = require("./src/routes/authRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/stations", stationRoutes);
app.use("/auth", authRoutes);
app.use("/bookings", bookingRoutes);

// Default Route
app.get("/", (req, res) => {
  res.json({
    message: "EV Charging API is running 🚗⚡",
  });
});

// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});