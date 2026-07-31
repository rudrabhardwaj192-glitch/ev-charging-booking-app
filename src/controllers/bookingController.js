const {
  checkBookingConflict,
  createBooking,
  getMyBookings,
  cancelBooking,
} = require("../models/bookingModel");

// ========================
// Create Booking
// ========================
const bookStation = async (req, res) => {
  try {
    const { station_id, booking_date, start_time, end_time } = req.body;
    const userId = req.user.id;

    // Business Rule
    if (start_time >= end_time) {
      return res.status(400).json({
        success: false,
        message: "Start time must be before end time.",
      });
    }

    // Check booking conflict
    const conflict = await checkBookingConflict(
      station_id,
      booking_date,
      start_time,
      end_time
    );

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: "This time slot is already booked.",
      });
    }

    // Create Booking
    const booking = await createBooking(
      userId,
      station_id,
      booking_date,
      start_time,
      end_time
    );

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
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
// Get My Bookings
// ========================
const myBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const status = req.query.status;

    const bookings = await getMyBookings(userId, status);

    return res.status(200).json({
      success: true,
      total: bookings.length,
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
// Cancel Booking
// ========================
const cancelMyBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    const booking = await cancelBooking(bookingId, userId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or already cancelled.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
      booking,
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
  bookStation,
  myBookings,
  cancelMyBooking,
};