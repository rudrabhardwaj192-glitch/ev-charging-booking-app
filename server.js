require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

// =======================
// Database Connection
// =======================
const testDatabase = require("./src/config/testConnection");

// =======================
// Logger
// =======================
const logger = require("./src/config/logger");

// =======================
// Error Handler
// =======================
const errorHandler = require("./src/middleware/errorHandler");

// =======================
// Security Middleware
// =======================
const {
  helmetMiddleware,
  compressionMiddleware,
  apiLimiter,
} = require("./src/middleware/securityMiddleware");

// =======================
// Swagger
// =======================
const {
  swaggerUi,
  swaggerSpec,
} = require("./src/config/swagger");

// =======================
// Route Imports
// =======================
const authRoutes = require("./src/routes/authRoutes");
const stationRoutes = require("./src/routes/stationRoutes");
const bookingRoutes = require("./src/routes/bookingRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const favoriteRoutes = require("./src/routes/favoriteRoutes");
const profileRoutes = require("./src/routes/profileRoutes");

// =======================
// Global Middleware
// =======================
app.use(helmetMiddleware);
app.use(compressionMiddleware);

app.use(cors());
app.use(express.json());

// =======================
// Rate Limiter
// =======================
app.use(apiLimiter);

// =======================
// HTTP Logger
// =======================
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// =======================
// Swagger
// =======================
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// =======================
// API Routes
// =======================
app.use("/api/auth", authRoutes);
app.use("/api/stations", stationRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/profile", profileRoutes);

// =======================
// Home Route
// =======================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚗 EV Charging API is Running Successfully",
    version: "1.0.0",
  });
});

// =======================
// Health Check
// =======================
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    timestamp: new Date(),
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
// Error Handler
// =======================
app.use(errorHandler);

// =======================
// Start Server
// =======================
const PORT = process.env.PORT || 5000;

async function startServer() {
  await testDatabase();

  app.listen(PORT, () => {
    logger.info(`🚀 Server started on port ${PORT}`);
    console.log(`🚀 Server started on port ${PORT}`);
  });
}

startServer();