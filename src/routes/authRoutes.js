const express = require("express");

const router = express.Router();

const {
  register,
  login,
} = require("../controllers/authController");

const {
  registerValidation,
  loginValidation,
} = require("../validation/authValidation");

const validateRequest = require("../middleware/validateRequest");

// =======================
// Register
// =======================
router.post(
  "/register",
  registerValidation,
  validateRequest,
  register
);

// =======================
// Login
// =======================
router.post(
  "/login",
  loginValidation,
  validateRequest,
  login
);

module.exports = router;