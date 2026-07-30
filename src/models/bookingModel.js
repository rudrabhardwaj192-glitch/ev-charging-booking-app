const pool = require("../config/db");

// Check booking conflict
const checkBookingConflict = async (
  stationId,
  bookingDate,
  startTime,
  endTime
) => {
  const result = await pool.query(
    `
    SELECT *
    FROM bookings
    WHERE station_id = $1
      AND booking_date = $2
      AND status = 'Booked'
      AND (
        start_time < $4
        AND end_time > $3
      )
    `,
    [stationId, bookingDate, startTime, endTime]
  );

  return result.rows.length > 0;
};

// Create booking
const createBooking = async (
  userId,
  stationId,
  bookingDate,
  startTime,
  endTime
) => {
  const result = await pool.query(
    `
    INSERT INTO bookings
    (user_id, station_id, booking_date, start_time, end_time)
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
    `,
    [userId, stationId, bookingDate, startTime, endTime]
  );

  return result.rows[0];
};

// Get logged-in user's bookings
const getMyBookings = async (userId) => {
  const result = await pool.query(
    `
    SELECT
      bookings.id AS booking_id,
      stations.name AS station_name,
      stations.city,
      bookings.booking_date,
      bookings.start_time,
      bookings.end_time,
      bookings.status
    FROM bookings
    JOIN stations
      ON bookings.station_id = stations.id
    WHERE bookings.user_id = $1
    ORDER BY bookings.booking_date, bookings.start_time
    `,
    [userId]
  );

  return result.rows;
};

module.exports = {
  checkBookingConflict,
  createBooking,
  getMyBookings,
};