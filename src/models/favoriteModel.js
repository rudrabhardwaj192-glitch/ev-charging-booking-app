const pool = require("../config/db");

// =======================
// Check Favorite
// =======================
const findFavorite = async (userId, stationId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM favorites
    WHERE user_id = $1
      AND station_id = $2
    `,
    [userId, stationId]
  );

  return result.rows[0];
};

// =======================
// Add Favorite
// =======================
const addFavorite = async (userId, stationId) => {
  const result = await pool.query(
    `
    INSERT INTO favorites
    (user_id, station_id)
    VALUES ($1, $2)
    RETURNING *
    `,
    [userId, stationId]
  );

  return result.rows[0];
};

// =======================
// Get My Favorites
// =======================
const getFavorites = async (userId) => {
  const result = await pool.query(
    `
    SELECT
    favorites.id,
    stations.id AS station_id,
    stations.name,
    stations.city,
    stations.address,
    stations.charger_type
    FROM favorites
    JOIN stations
      ON favorites.station_id = stations.id
    WHERE favorites.user_id = $1
    ORDER BY favorites.created_at DESC
    `,
    [userId]
  );

  return result.rows;
};

// =======================
// Remove Favorite
// =======================
const removeFavorite = async (userId, stationId) => {
  const result = await pool.query(
    `
    DELETE FROM favorites
    WHERE user_id = $1
      AND station_id = $2
    RETURNING *
    `,
    [userId, stationId]
  );

  return result.rows[0];
};

module.exports = {
  findFavorite,
  addFavorite,
  getFavorites,
  removeFavorite,
};