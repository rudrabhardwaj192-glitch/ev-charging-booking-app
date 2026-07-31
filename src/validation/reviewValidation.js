const { body } = require("express-validator");

const reviewValidation = [
  body("station_id")
    .notEmpty()
    .withMessage("Station ID is required.")
    .isInt({ min: 1 })
    .withMessage("Station ID must be a positive integer."),

  body("rating")
    .notEmpty()
    .withMessage("Rating is required.")
    .isInt({ min: 1, max: 5 })
    .withMessage("Rating must be between 1 and 5."),

  body("review")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Review cannot exceed 500 characters."),
];

module.exports = {
  reviewValidation,
};