const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const {
  myProfile,
  editProfile,
  changePassword,
} = require("../controllers/profileController");

const {
  updateProfileValidation,
  changePasswordValidation,
} = require("../validation/profileValidation");

// =======================
// Get My Profile
// =======================
router.get(
  "/",
  authMiddleware,
  myProfile
);

// =======================
// Update Profile
// =======================
router.put(
  "/",
  authMiddleware,
  updateProfileValidation,
  validateRequest,
  editProfile
);

// =======================
// Change Password
// =======================
router.put(
  "/change-password",
  authMiddleware,
  changePasswordValidation,
  validateRequest,
  changePassword
);

module.exports = router;