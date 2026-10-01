const express = require("express");

const router = express.Router();

const {
  getAllBookingsAdmin,
  dashboard,
} = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

// =======================
// Admin Routes
// =======================

// Dashboard Statistics
router.get(
  "/dashboard",
  authMiddleware,
  adminMiddleware,
  dashboard
);

// Get All Bookings
router.get(
  "/bookings",
  authMiddleware,
  adminMiddleware,
  getAllBookingsAdmin
);

module.exports = router;