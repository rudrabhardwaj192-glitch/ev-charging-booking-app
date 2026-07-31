const { getAllBookings } = require("../models/bookingModel");
const { getDashboardStats } = require("../models/adminModel");

// ========================
// Get All Bookings (Admin)
// ========================
const getAllBookingsAdmin = async (req, res) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 10,
    } = req.query;

    const bookings = await getAllBookings({
      status,
      search,
      page: Number(page),
      limit: Number(limit),
    });

    return res.status(200).json({
      success: true,
      total: bookings.length,
      page: Number(page),
      limit: Number(limit),
      bookings,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ========================
// Dashboard Statistics
// ========================
const dashboard = async (req, res) => {
  try {
    const stats = await getDashboardStats();

    return res.status(200).json({
      success: true,
      dashboard: stats,
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
  getAllBookingsAdmin,
  dashboard,
};