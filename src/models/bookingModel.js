const pool = require("../config/db");

// =======================
// Check Booking Conflict
// =======================
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

// =======================
// Create Booking
// =======================
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
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
    `,
    [userId, stationId, bookingDate, startTime, endTime]
  );

  return result.rows[0];
};

// =======================
// Get My Bookings
// =======================
const getMyBookings = async (userId, status) => {
  let query = `
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
  `;

  const values = [userId];

  if (status) {
    query += ` AND bookings.status = $2`;
    values.push(status);
  }

  query += `
    ORDER BY bookings.booking_date, bookings.start_time
  `;

  const result = await pool.query(query, values);

  return result.rows;
};

// =======================
// Cancel Booking
// =======================
const cancelBooking = async (bookingId, userId) => {
  const result = await pool.query(
    `
    UPDATE bookings
    SET status = 'Cancelled'
    WHERE id = $1
      AND user_id = $2
      AND status = 'Booked'
    RETURNING *
    `,
    [bookingId, userId]
  );

  return result.rows[0];
};

// =======================
// Admin - Get All Bookings
// =======================
const getAllBookings = async ({
  status,
  search,
  page = 1,
  limit = 10,
}) => {
  let query = `
    SELECT
      bookings.id AS booking_id,
      users.name AS user_name,
      users.email,
      stations.name AS station_name,
      stations.city,
      bookings.booking_date,
      bookings.start_time,
      bookings.end_time,
      bookings.status
    FROM bookings
    JOIN users
      ON bookings.user_id = users.id
    JOIN stations
      ON bookings.station_id = stations.id
    WHERE 1=1
  `;

  const values = [];
  let index = 1;

  // Status Filter
  if (status) {
    query += ` AND bookings.status = $${index}`;
    values.push(status);
    index++;
  }

  // Search
  if (search) {
    query += `
      AND (
        users.name ILIKE $${index}
        OR users.email ILIKE $${index}
        OR stations.name ILIKE $${index}
        OR stations.city ILIKE $${index}
      )
    `;

    values.push(`%${search}%`);
    index++;
  }

  // Pagination
  const offset = (page - 1) * limit;

  query += `
    ORDER BY bookings.booking_date DESC,
             bookings.start_time ASC
    LIMIT $${index}
    OFFSET $${index + 1}
  `;

  values.push(limit);
  values.push(offset);

  const result = await pool.query(query, values);

  return result.rows;
};

module.exports = {
  checkBookingConflict,
  createBooking,
  getMyBookings,
  cancelBooking,
  getAllBookings,
};