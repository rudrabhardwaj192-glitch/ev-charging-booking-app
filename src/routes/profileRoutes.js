const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getMyProfile,
  updateMyProfile,
  changePassword,
} = require("../controllers/profileController");

// GET /api/profile
router.get(
  "/",
  authMiddleware,
  getMyProfile
);

// PUT /api/profile
router.put(
  "/",
  authMiddleware,
  updateMyProfile
);

// PUT /api/profile/password
router.put(
  "/password",
  authMiddleware,
  changePassword
);

module.exports = router;