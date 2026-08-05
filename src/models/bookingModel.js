const pool = require("../config/db");

// Create a new booking
const createBooking = async (
  user_id,
  station_id,
  booking_date,
  start_time,
  end_time
) => {
  const result = await pool.query(
    `
    INSERT INTO bookings
    (
      user_id,
      station_id,
      booking_date,
      start_time,
      end_time
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [
      user_id,
      station_id,
      booking_date,
      start_time,
      end_time,
    ]
  );

  return result.rows[0];
};

// Get all bookings for a user
const getUserBookings = async (user_id) => {
  const result = await pool.query(
    `
    SELECT
      b.id,
      b.booking_date,
      b.start_time,
      b.end_time,
      b.status,
      b.created_at,
      s.id AS station_id,
      s.name AS station_name,
      s.location,
      s.charger,
      s.power,
      s.price
    FROM bookings b
    JOIN stations s
      ON b.station_id = s.id
    WHERE b.user_id = $1
    ORDER BY b.booking_date DESC, b.start_time ASC
    `,
    [user_id]
  );

  return result.rows;
};

// Get booking by ID
const getBookingById = async (booking_id) => {
  const result = await pool.query(
    `
    SELECT *
    FROM bookings
    WHERE id = $1
    `,
    [booking_id]
  );

  return result.rows[0];
};

// Cancel booking
const cancelBooking = async (booking_id) => {
  const result = await pool.query(
    `
    UPDATE bookings
    SET status = 'Cancelled'
    WHERE id = $1
    RETURNING *
    `,
    [booking_id]
  );

  return result.rows[0];
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
};