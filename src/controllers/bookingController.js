const {
  createBooking,
  checkBookingConflict,
  getMyBookings,
} = require("../models/bookingModel");

// Create booking
const bookStation = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      station_id,
      booking_date,
      start_time,
      end_time,
    } = req.body;

    if (
      !station_id ||
      !booking_date ||
      !start_time ||
      !end_time
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const conflict = await checkBookingConflict(
      station_id,
      booking_date,
      start_time,
      end_time
    );

    if (conflict) {
      return res.status(409).json({
        message: "This time slot is already booked.",
      });
    }

    const booking = await createBooking(
      userId,
      station_id,
      booking_date,
      start_time,
      end_time
    );

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

// Get logged-in user's bookings
const myBookings = async (req, res) => {
  try {
    const bookings = await getMyBookings(req.user.id);

    res.status(200).json(bookings);

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = {
  bookStation,
  myBookings,
};