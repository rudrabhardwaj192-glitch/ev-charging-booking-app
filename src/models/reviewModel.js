const pool = require("../config/db");

// =======================
// Check Existing Review
// =======================
const findReviewByUserAndStation = async (userId, stationId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM reviews
    WHERE user_id = $1
      AND station_id = $2
    `,
    [userId, stationId]
  );

  return result.rows[0];
};

// =======================
// Create Review
// =======================
const createReview = async (
  userId,
  stationId,
  rating,
  review
) => {
  const result = await pool.query(
    `
    INSERT INTO reviews
    (user_id, station_id, rating, review)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [userId, stationId, rating, review]
  );

  return result.rows[0];
};

// =======================
// Get Reviews By Station
// =======================
const getReviewsByStation = async (stationId) => {
  const result = await pool.query(
    `
    SELECT
      reviews.id,
      reviews.rating,
      reviews.review,
      reviews.created_at,
      users.name
    FROM reviews
    JOIN users
      ON reviews.user_id = users.id
    WHERE reviews.station_id = $1
    ORDER BY reviews.created_at DESC
    `,
    [stationId]
  );

  return result.rows;
};

module.exports = {
  findReviewByUserAndStation,
  createReview,
  getReviewsByStation,
};