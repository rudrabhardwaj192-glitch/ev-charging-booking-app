const express = require("express");
const { validationResult } = require("express-validator");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

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
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    next();
  },
  addReview
);

// =======================
// Get Reviews of Station
// =======================
router.get("/station/:stationId", getStationReviews);

module.exports = router;