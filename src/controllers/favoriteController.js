const {
  findFavorite,
  addFavorite,
  getFavorites,
  removeFavorite,
} = require("../models/favoriteModel");

// =======================
// Add Favorite
// =======================
const addStationToFavorites = async (req, res) => {
  try {
    const userId = req.user.id;
    const { station_id } = req.body;

    const existingFavorite = await findFavorite(userId, station_id);

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: "Station already added to favorites.",
      });
    }

    const favorite = await addFavorite(userId, station_id);

    return res.status(201).json({
      success: true,
      message: "Station added to favorites.",
      favorite,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// Get My Favorites
// =======================
const getMyFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await getFavorites(userId);

    return res.status(200).json({
      success: true,
      total: favorites.length,
      favorites,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================
// Remove Favorite
// =======================
const deleteFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { stationId } = req.params;

    const favorite = await removeFavorite(userId, stationId);

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Favorite not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Favorite removed successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addStationToFavorites,
  getMyFavorites,
  deleteFavorite,
};