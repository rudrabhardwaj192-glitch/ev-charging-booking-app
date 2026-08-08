const pool = require("../config/db");

// ==========================================
// CREATE BOOKING
// Prevent overlapping bookings
// ==========================================
const createBooking = async (
  user_id,
  station_id,
  booking_date,
  start_time,
  end_time
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check for overlapping active booking
    const conflict = await client.query(
      `
      SELECT id
      FROM bookings
      WHERE station_id = $1
        AND booking_date = $2
        AND status != 'Cancelled'
        AND start_time < $4
        AND end_time > $3
      LIMIT 1
      `,
      [
        station_id,
        booking_date,
        start_time,
        end_time,
      ]
    );

    if (conflict.rows.length > 0) {
      const error = new Error(
        "This time slot is already booked."
      );

      error.statusCode = 409;

      throw error;
    }

    const result = await client.query(
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

    await client.query("COMMIT");

    return result.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// ==========================================
// GET ALL BOOKINGS FOR USER
// ==========================================
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
    ORDER BY
      b.booking_date DESC,
      b.start_time ASC
    `,
    [user_id]
  );

  return result.rows;
};

// ==========================================
// GET BOOKING BY ID
// ==========================================
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

// ==========================================
// GET BOOKED SLOTS
// ==========================================
const getBookedSlots = async (
  station_id,
  booking_date
) => {
  const result = await pool.query(
    `
    SELECT
      id,
      start_time,
      end_time,
      status
    FROM bookings
    WHERE station_id = $1
      AND booking_date = $2
      AND status != 'Cancelled'
    ORDER BY start_time ASC
    `,
    [
      station_id,
      booking_date,
    ]
  );

  return result.rows;
};

// ==========================================
// CANCEL BOOKING
// ==========================================
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
  getBookedSlots,
  cancelBooking,
};