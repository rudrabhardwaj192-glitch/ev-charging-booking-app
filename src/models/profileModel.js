const pool = require("../config/db");

// ==========================================
// GET MY PROFILE
// ==========================================
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

  return result.rows[0] || null;
};

// ==========================================
// UPDATE PROFILE
// ==========================================
const updateProfile = async (
  userId,
  name,
  email
) => {
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
    [
      name,
      email,
      userId,
    ]
  );

  return result.rows[0] || null;
};

// ==========================================
// GET USER PASSWORD
// ==========================================
const getUserPassword = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      id,
      password
    FROM users
    WHERE id = $1
    `,
    [userId]
  );

  return result.rows[0] || null;
};

// ==========================================
// UPDATE PASSWORD
// ==========================================
const updatePassword = async (
  userId,
  hashedPassword
) => {
  const result = await pool.query(
    `
    UPDATE users
    SET password = $1
    WHERE id = $2
    RETURNING
      id,
      name,
      email,
      role,
      created_at
    `,
    [
      hashedPassword,
      userId,
    ]
  );

  return result.rows[0] || null;
};

module.exports = {
  getProfile,
  updateProfile,
  getUserPassword,
  updatePassword,
};