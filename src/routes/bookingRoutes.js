const express = require("express");
const router = express.Router();

const {
  bookStation,
  myBookings,
  getBooking,
  removeBooking,
} = require("../controllers/bookingController");

const {
  bookingValidationRules,
  validateBooking,
} = require("../validation/bookingValidation"); // ✅ Fixed path

const authMiddleware = require("../middleware/authMiddleware");

// ==========================================
// Create Booking
// POST /api/bookings
// ==========================================
router.post(
  "/",
  authMiddleware,
  bookingValidationRules,
  validateBooking,
  bookStation
);

// ==========================================
// Get All Bookings of a User
// GET /api/bookings/user/:user_id
// ==========================================
router.get(
  "/user/:user_id",
  authMiddleware,
  myBookings
);

// ==========================================
// Get Single Booking
// GET /api/bookings/:id
// ==========================================
router.get(
  "/:id",
  authMiddleware,
  getBooking
);

// ==========================================
// Cancel Booking
// PUT /api/bookings/:id/cancel
// ==========================================
router.put(
  "/:id/cancel",
  authMiddleware,
  removeBooking
);

module.exports = router;