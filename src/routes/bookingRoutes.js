const express = require("express");
const router = express.Router();

const {
  bookStation,
  myBookings,
  cancelMyBooking,
} = require("../controllers/bookingController");

const authMiddleware = require("../middleware/authMiddleware");

const {
  bookingValidationRules,
  validateBooking,
} = require("../validation/bookingValidation");

// Create Booking
router.post(
  "/",
  authMiddleware,
  bookingValidationRules,
  validateBooking,
  bookStation
);

// Get My Bookings
router.get("/my", authMiddleware, myBookings);

// Cancel Booking
router.patch("/:id/cancel", authMiddleware, cancelMyBooking);

module.exports = router;