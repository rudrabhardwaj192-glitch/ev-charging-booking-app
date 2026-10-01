const { body } = require("express-validator");

// =======================
// Update Profile Validation
// =======================
const updateProfileValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required.")
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters."),

  body("email")
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Invalid email."),
];

// =======================
// Change Password Validation
// =======================
const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required."),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required.")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters."),
];

module.exports = {
  updateProfileValidation,
  changePasswordValidation,
};