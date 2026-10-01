const express = require("express");

const router = express.Router();

const {
  add,
  getAll,
  remove,
} = require("../controllers/favoriteController");

const authMiddleware = require("../middleware/authMiddleware");

// ==========================================
// ADD FAVORITE
// POST /api/favorites
// ==========================================
router.post(
  "/",
  authMiddleware,
  add
);

// ==========================================
// GET MY FAVORITES
// GET /api/favorites/:user_id
// ==========================================
router.get(
  "/:user_id",
  authMiddleware,
  getAll
);

// ==========================================
// REMOVE FAVORITE
// DELETE /api/favorites
// ==========================================
router.delete(
  "/",
  authMiddleware,
  remove
);

module.exports = router;