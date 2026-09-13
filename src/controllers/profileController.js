const bcrypt = require("bcryptjs");

const {
  getProfile,
  updateProfile,
  getUserPassword,
  updatePassword,
} = require("../models/profileModel");

// ==========================================
// GET PROFILE
// GET /api/profile
// ==========================================
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await getProfile(userId);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error(
      "Get profile error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to get profile",
    });
  }
};

// ==========================================
// UPDATE PROFILE
// PUT /api/profile
// ==========================================
const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      email,
    } = req.body;

    // Validate name
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // Validate email
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Basic email validation
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    // Check whether another user already
    // uses this email
    const existingUser =
      await require("../config/db").query(
        `
        SELECT id
        FROM users
        WHERE email = $1
        AND id != $2
        `,
        [
          email.trim(),
          userId,
        ]
      );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Email is already registered with another account",
      });
    }

    const updatedProfile =
      await updateProfile(
        userId,
        name.trim(),
        email.trim()
      );

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "Profile updated successfully",
      data: updatedProfile,
    });
  } catch (error) {
    console.error(
      "Update profile error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update profile",
    });
  }
};

// ==========================================
// CHANGE PASSWORD
// PUT /api/profile/password
// ==========================================
const changePassword = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters",
      });
    }

    const user =
      await getUserPassword(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message:
          "Current password is incorrect",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    await updatePassword(
      userId,
      hashedPassword
    );

    res.status(200).json({
      success: true,
      message:
        "Password changed successfully",
    });
  } catch (error) {
    console.error(
      "Change password error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to change password",
    });
  }
};

module.exports = {
  getMyProfile,
  updateMyProfile,
  changePassword,
};