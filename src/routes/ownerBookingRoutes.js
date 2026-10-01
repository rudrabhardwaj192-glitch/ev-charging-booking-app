const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
  getOwnerBookings,
  getOwnerBookingStats,
} = require("../controllers/ownerBookingController");

// =====================================================
// OWNER BOOKINGS
// =====================================================

router.get(
  "/bookings",
  verifyToken,
  getOwnerBookings
);

// =====================================================
// OWNER BOOKING STATISTICS
// =====================================================

router.get(
  "/bookings/stats",
  verifyToken,
  getOwnerBookingStats
);

module.exports = router;