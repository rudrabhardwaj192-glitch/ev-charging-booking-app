const pool = require("../config/db");

// =======================
// Get User Profile
// =======================
const getProfile = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      id,
      name,
      email,
      role,
      created_at
    FROM users
    WHERE id = $1
    `,
    [userId]
  );

  return result.rows[0];
};

// =======================
// Update Profile
// =======================
const updateProfile = async (userId, name, email) => {
  const result = await pool.query(
    `
    UPDATE users
    SET
      name = $1,
      email = $2
    WHERE id = $3
    RETURNING
      id,
      name,
      email,
      role,
      created_at
    `,
    [name, email, userId]
  );

  return result.rows[0];
};

module.exports = {
  getProfile,
  updateProfile,
};