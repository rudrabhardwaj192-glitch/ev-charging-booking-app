const asyncHandler = require("../utils/asyncHandler");

const {
  createBooking,
  getUserBookings,
  getBookingById,
  getBookedSlots,
  cancelBooking,
  expirePendingBookings,
} = require("../models/bookingModel");

// ======================================================
// CREATE BOOKING
// POST /api/bookings
//
// IMPORTANT:
// Booking/payment should normally go through Razorpay.
// This endpoint is kept for compatibility.
// ======================================================
const bookStation = asyncHandler(async (req, res) => {
  const {
    station_id,
    booking_date,
    start_time,
    end_time,
  } = req.body;

  const user_id = req.user.id;

  if (
    !station_id ||
    !booking_date ||
    !start_time ||
    !end_time
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Station, date and time are required.",
    });
  }

  // Remove old unpaid holds first
  await expirePendingBookings();

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

// ======================================================
// GET USER BOOKINGS
// GET /api/bookings/user/:user_id
// ======================================================
const myBookings = asyncHandler(async (req, res) => {
  const { user_id } = req.params;

  // User can only see their own bookings
  if (
    Number(user_id) !==
    Number(req.user.id)
  ) {
    return res.status(403).json({
      success: false,
      message:
        "You can only access your own bookings.",
    });
  }

  // Expire old pending payments
  await expirePendingBookings();

  const bookings =
    await getUserBookings(user_id);

  res.status(200).json({
    success: true,
    total: bookings.length,
    data: bookings,
  });
});

// ======================================================
// GET SINGLE BOOKING
// GET /api/bookings/:id
// ======================================================
const getBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking =
    await getBookingById(id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found.",
    });
  }

  // Only owner can view
  if (
    Number(booking.user_id) !==
    Number(req.user.id)
  ) {
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

// ======================================================
// GET BOOKED SLOTS
// GET /api/bookings/slots/:stationId?date=YYYY-MM-DD
// ======================================================
const bookedSlots = asyncHandler(async (req, res) => {
  const { stationId } = req.params;
  const { date } = req.query;

  if (!date) {
    return res.status(400).json({
      success: false,
      message: "Booking date is required.",
    });
  }

  // Expire old pending payments
  await expirePendingBookings();

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

// ======================================================
// CANCEL BOOKING
// PUT /api/bookings/:id/cancel
// ======================================================
const removeBooking = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const booking =
    await getBookingById(id);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found.",
    });
  }

  // Only owner can cancel
  if (
    Number(booking.user_id) !==
    Number(req.user.id)
  ) {
    return res.status(403).json({
      success: false,
      message:
        "You can only cancel your own booking.",
    });
  }

  if (booking.status === "Cancelled") {
    return res.status(400).json({
      success: false,
      message:
        "This booking is already cancelled.",
    });
  }

  const cancelledBooking =
    await cancelBooking(id);

  res.status(200).json({
    success: true,
    message:
      "Booking cancelled successfully.",
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