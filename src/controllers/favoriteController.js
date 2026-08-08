const {
  addFavorite,
  getFavorites,
  removeFavorite,
} = require("../models/favoriteModel");

const add = async (req, res) => {
  try {
    const { user_id, station_id } = req.body;

    const favorite = await addFavorite(user_id, station_id);

    res.status(201).json({
      success: true,
      message: "Added to favorites",
      data: favorite,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getAll = async (req, res) => {
  try {
    const { user_id } = req.params;

    const favorites = await getFavorites(user_id);

    res.json({
      success: true,
      data: favorites,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
    });
  }
};

const remove = async (req, res) => {
  try {
    const { user_id, station_id } = req.body;

    await removeFavorite(user_id, station_id);

    res.json({
      success: true,
      message: "Favorite Removed",
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
    });
  }
};

module.exports = {
  add,
  getAll,
  remove,
};