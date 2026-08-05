const asyncHandler = require("../utils/asyncHandler");

const {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
} = require("../models/bookingModel");

// ==========================================
// Create Booking
// ==========================================
const bookStation = asyncHandler(async (req, res) => {
  const {
    user_id,
    station_id,
    booking_date,
    start_time,
    end_time,
  } = req.body;

  const booking = await createBooking(
    user_id,
    station_id,
    booking_date,
    start_time,
    end_time
  );

  res.status(201).json({
    success: true,
    message: "Booking created successfully.",
    data: booking,
  });
});

// ==========================================
// Get User Bookings
// ==========================================
const myBookings = asyncHandler(async (req, res) => {
  const { user_id } = req.params;

  const bookings = await getUserBookings(user_id);

  res.status(200).json({
    success: true,
    total: bookings.length,
    data: bookings,
  });
});

// ==========================================
// Get Single Booking
// ==========================================
const getBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await getBookingById(id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found.",
    });
  }

  res.status(200).json({
    success: true,
    data: booking,
  });
});

// ==========================================
// Cancel Booking
// ==========================================
const removeBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await cancelBooking(id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found.",
    });
  }

  res.status(200).json({
    success: true,
    message: "Booking cancelled successfully.",
    data: booking,
  });
});

module.exports = {
  bookStation,
  myBookings,
  getBooking,
  removeBooking,
};