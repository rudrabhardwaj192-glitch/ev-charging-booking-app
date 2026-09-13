const {
  addFavorite,
  getFavorites,
  removeFavorite,
} = require("../models/favoriteModel");

// ==========================================
// ADD FAVORITE
// ==========================================
const add = async (req, res) => {
  try {
    const { station_id } = req.body;

    const user_id = req.user.id;

    if (!station_id) {
      return res.status(400).json({
        success: false,
        message: "Station ID is required.",
      });
    }

    const favorite = await addFavorite(
      user_id,
      station_id
    );

    if (!favorite) {
      return res.status(200).json({
        success: true,
        message: "Station is already in favorites.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Added to favorites.",
      data: favorite,
    });

  } catch (err) {
    console.error("Add favorite error:", err);

    res.status(500).json({
      success: false,
      message: "Unable to add favorite.",
    });
  }
};

// ==========================================
// GET MY FAVORITES
// ==========================================
const getAll = async (req, res) => {
  try {
    const { user_id } = req.params;

    // User can only access their own favorites
    if (Number(user_id) !== Number(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "You can only access your own favorites.",
      });
    }

    const favorites = await getFavorites(user_id);

    res.status(200).json({
      success: true,
      total: favorites.length,
      data: favorites,
    });

  } catch (err) {
    console.error("Get favorites error:", err);

    res.status(500).json({
      success: false,
      message: "Unable to load favorites.",
    });
  }
};

// ==========================================
// REMOVE FAVORITE
// ==========================================
const remove = async (req, res) => {
  try {
    const { station_id } = req.body;

    const user_id = req.user.id;

    if (!station_id) {
      return res.status(400).json({
        success: false,
        message: "Station ID is required.",
      });
    }

    const removed = await removeFavorite(
      user_id,
      station_id
    );

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Favorite removed.",
      data: removed,
    });

  } catch (err) {
    console.error("Remove favorite error:", err);

    res.status(500).json({
      success: false,
      message: "Unable to remove favorite.",
    });
  }
};

module.exports = {
  add,
  getAll,
  remove,
};