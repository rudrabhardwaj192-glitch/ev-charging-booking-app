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

  return result.rows[0] || null;
};

// =======================
// Add Favorite
// =======================
const addFavorite = async (userId, stationId) => {
  const result = await pool.query(
    `
    INSERT INTO favorites
    (
      user_id,
      station_id
    )
    VALUES
    ($1, $2)
    ON CONFLICT (user_id, station_id)
    DO NOTHING
    RETURNING *
    `,
    [userId, stationId]
  );

  return result.rows[0] || null;
};

// =======================
// Get My Favorites
// =======================
const getFavorites = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      favorites.id AS favorite_id,

      stations.id AS station_id,
      stations.name,
      stations.location,
      stations.charger,
      stations.power,
      stations.price,
      stations.rating,
      stations.reviews,
      stations.available,
      stations.image,
      stations.latitude,
      stations.longitude,

      favorites.created_at

    FROM favorites

    INNER JOIN stations
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

  return result.rows[0] || null;
};

module.exports = {
  findFavorite,
  addFavorite,
  getFavorites,
  removeFavorite,
};