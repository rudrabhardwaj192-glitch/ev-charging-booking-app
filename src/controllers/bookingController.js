const asyncHandler = require("../utils/asyncHandler");

const {
  createBooking,
  getUserBookings,
  getBookingById,
  getBookedSlots,
  cancelBooking,
} = require("../models/bookingModel");

// ==========================================
// CREATE BOOKING
// POST /api/bookings
// ==========================================
const bookStation = asyncHandler(async (req, res) => {
  const {
    station_id,
    booking_date,
    start_time,
    end_time,
  } = req.body;

  // Get user ID from verified JWT
  const user_id = req.user.id;

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
// GET USER BOOKINGS
// GET /api/bookings/user/:user_id
// ==========================================
const myBookings = asyncHandler(async (req, res) => {
  const { user_id } = req.params;

  // Only allow users to access their own bookings
  if (Number(user_id) !== Number(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: "You can only access your own bookings.",
    });
  }

  const bookings = await getUserBookings(user_id);

  res.status(200).json({
    success: true,
    total: bookings.length,
    data: bookings,
  });
});

// ==========================================
// GET SINGLE BOOKING
// GET /api/bookings/:id
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

  // Only booking owner can view it
  if (Number(booking.user_id) !== Number(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: "Access denied.",
    });
  }

  res.status(200).json({
    success: true,
    data: booking,
  });
});

// ==========================================
// GET BOOKED SLOTS
//
// GET /api/bookings/slots/:stationId?date=YYYY-MM-DD
// ==========================================
const bookedSlots = asyncHandler(async (req, res) => {
  const { stationId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      message: "Booking date is required.",
    });
  }

  const slots = await getBookedSlots(
    stationId,
    date
  );

  res.status(200).json({
    success: true,
    station_id: Number(stationId),
    date,
    data: slots,
  });
});

// ==========================================
// CANCEL BOOKING
// PUT /api/bookings/:id/cancel
// ==========================================
const removeBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking = await getBookingById(id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found.",
    });
  }

  // Only booking owner can cancel
  if (Number(booking.user_id) !== Number(req.user.id)) {
    return res.status(403).json({
      success: false,
      message: "You can only cancel your own booking.",
    });
  }

  const cancelledBooking = await cancelBooking(id);

  res.status(200).json({
    success: true,
    message: "Booking cancelled successfully.",
    data: cancelledBooking,
  });
});

module.exports = {
  bookStation,
  myBookings,
  getBooking,
  bookedSlots,
  removeBooking,
};