require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

// =====================================================
// DATABASE CONNECTION
// =====================================================

const testDatabase = require("./src/config/testConnection");

// =====================================================
// LOGGER
// =====================================================

const logger = require("./src/config/logger");

// =====================================================
// ERROR HANDLER
// =====================================================

const errorHandler = require("./src/middleware/errorHandler");

// =====================================================
// SECURITY MIDDLEWARE
// =====================================================

const {
  helmetMiddleware,
  compressionMiddleware,
  apiLimiter,
} = require("./src/middleware/securityMiddleware");

// =====================================================
// SWAGGER
// =====================================================

const {
  swaggerUi,
  swaggerSpec,
} = require("./src/config/swagger");

// =====================================================
// ROUTE IMPORTS
// =====================================================

const authRoutes = require("./src/routes/authRoutes");

const stationRoutes = require("./src/routes/stationRoutes");

const bookingRoutes = require("./src/routes/bookingRoutes");

const adminRoutes = require("./src/routes/adminRoutes");

const reviewRoutes = require("./src/routes/reviewRoutes");

const favoriteRoutes = require("./src/routes/favoriteRoutes");

const profileRoutes = require("./src/routes/profileRoutes");

// =====================================================
// VEHICLE ROUTES
// =====================================================

const vehicleRoutes = require("./src/routes/vehicleRoutes");

// =====================================================
// RAZORPAY PAYMENT ROUTES
// =====================================================

const paymentRoutes = require("./src/routes/paymentRoutes");

// =====================================================
// OWNER BOOKING ROUTES
// =====================================================

const ownerBookingRoutes = require("./src/routes/ownerBookingRoutes");

// =====================================================
// GLOBAL MIDDLEWARE
// =====================================================

app.use(helmetMiddleware);

app.use(compressionMiddleware);

app.use(cors());

app.use(express.json());

// =====================================================
// RATE LIMITER
// =====================================================

app.use(apiLimiter);

// =====================================================
// HTTP LOGGER
// =====================================================

app.use(
  morgan("combined", {
    stream: {
      write: (message) => {
        logger.info(message.trim());
      },
    },
  })
);

// =====================================================
// SWAGGER
// =====================================================

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// =====================================================
// API ROUTES
// =====================================================

// =====================================================
// AUTHENTICATION
// =====================================================

app.use(
  "/api/auth",
  authRoutes
);

// =====================================================
// CHARGING STATIONS
// =====================================================

app.use(
  "/api/stations",
  stationRoutes
);

// =====================================================
// USER BOOKINGS
// =====================================================

app.use(
  "/api/bookings",
  bookingRoutes
);

// =====================================================
// ADMIN
// =====================================================

app.use(
  "/api/admin",
  adminRoutes
);

// =====================================================
// REVIEWS
// =====================================================

app.use(
  "/api/reviews",
  reviewRoutes
);

// =====================================================
// FAVORITES
// =====================================================

app.use(
  "/api/favorites",
  favoriteRoutes
);

// =====================================================
// USER PROFILE
// =====================================================

app.use(
  "/api/profile",
  profileRoutes
);

// =====================================================
// USER VEHICLES / EV
// =====================================================

app.use(
  "/api/vehicles",
  vehicleRoutes
);

// =====================================================
// RAZORPAY PAYMENT API
// =====================================================

app.use(
  "/api/payments",
  paymentRoutes
);

// =====================================================
// OWNER API
// =====================================================

app.use(
  "/api/owner",
  ownerBookingRoutes
);

// =====================================================
// HOME ROUTE
// =====================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message:
      "🚗 EV Charging API is Running Successfully",
    version: "1.0.0",
  });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "OK",
    timestamp: new Date(),
  });
});

// =====================================================
// 404 ROUTE
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================

app.use(errorHandler);

// =====================================================
// START SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;

async function startServer() {
  try {
    // Test database before starting server
    await testDatabase();

    app.listen(PORT, () => {
      logger.info(
        `🚀 Server started on port ${PORT}`
      );

      console.log(
        `🚀 Server started on port ${PORT}`
      );
    });
  } catch (error) {
    logger.error(
      `❌ Server startup failed: ${error.message}`
    );

    console.error(
      "❌ Server startup failed:",
      error.message
    );

    process.exit(1);
  }
}

startServer();