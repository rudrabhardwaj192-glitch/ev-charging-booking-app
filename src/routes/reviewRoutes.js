const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const {
  addReview,
  getStationReviews,
} = require("../controllers/reviewController");

const {
  reviewValidation,
} = require("../validation/reviewValidation");

// =======================
// Create Review
// =======================
router.post(
  "/",
  authMiddleware,
  reviewValidation,
  validateRequest,
  addReview
);

// =======================
// Get Reviews
// =======================
router.get(
  "/station/:stationId",
  getStationReviews
);

module.exports = router;