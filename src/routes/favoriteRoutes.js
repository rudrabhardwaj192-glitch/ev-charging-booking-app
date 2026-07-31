const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addStationToFavorites,
  getMyFavorites,
  deleteFavorite,
} = require("../controllers/favoriteController");

// =======================
// Add Favorite
// =======================
router.post(
  "/",
  authMiddleware,
  addStationToFavorites
);

// =======================
// Get My Favorites
// =======================
router.get(
  "/",
  authMiddleware,
  getMyFavorites
);

// =======================
// Remove Favorite
// =======================
router.delete(
  "/:stationId",
  authMiddleware,
  deleteFavorite
);

module.exports = router;