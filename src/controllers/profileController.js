const bcrypt = require("bcryptjs");

const {
  getProfile,
  updateProfile,
} = require("../models/profileModel");

const pool = require("../config/db");

// =======================
// Get My Profile
// =======================
const myProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await getProfile(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      profile,
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
// Update Profile
// =======================
const editProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;

    const profile = await updateProfile(userId, name, email);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      profile,
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
// Change Password
// =======================
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;

    const { currentPassword, newPassword } = req.body;

    // Get current password hash
    const userResult = await pool.query(
      `
      SELECT password
      FROM users
      WHERE id = $1
      `,
      [userId]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      `
      UPDATE users
      SET password = $1
      WHERE id = $2
      `,
      [hashedPassword, userId]
    );

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
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
  myProfile,
  editProfile,
  changePassword,
};