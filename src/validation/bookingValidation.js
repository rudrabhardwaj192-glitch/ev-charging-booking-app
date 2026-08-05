const { body, validationResult } = require("express-validator");

const bookingValidationRules = [
  body("station_id")
    .notEmpty()
    .withMessage("Station ID is required.")
    .isInt({ min: 1 })
    .withMessage("Station ID must be a positive integer."),

  body("booking_date")
    .notEmpty()
    .withMessage("Booking date is required.")
    .isISO8601()
    .withMessage("Booking date must be in YYYY-MM-DD format."),

  body("start_time")
    .notEmpty()
    .withMessage("Start time is required."),

  body("end_time")
    .notEmpty()
    .withMessage("End time is required."),
];

const validateBooking = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }

  next();
};

module.exports = {
  bookingValidationRules,
  validateBooking,
};