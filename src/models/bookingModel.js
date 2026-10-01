const pool = require("../config/db");

// ======================================================
// CONFIGURATION
// ======================================================

const PENDING_HOLD_MINUTES = 10;

// ======================================================
// EXPIRE OLD PENDING BOOKINGS
// ======================================================

const expirePendingBookings = async () => {
  const result = await pool.query(
    `
    UPDATE bookings
    SET status = 'Cancelled'
    WHERE status = 'Pending'
      AND payment_status = 'Pending'
      AND created_at < NOW() - ($1 * INTERVAL '1 minute')
    RETURNING
      id,
      user_id,
      station_id,
      booking_date,
      start_time,
      end_time,
      status,
      payment_status
    `,
    [PENDING_HOLD_MINUTES]
  );

  return result.rows;
};

// ======================================================
// CHECK SLOT CONFLICT
// ======================================================

const checkSlotConflict = async (
  station_id,
  booking_date,
  start_time,
  end_time,
  client = pool
) => {
  const result = await client.query(
    `
    SELECT
      id,
      user_id,
      station_id,
      booking_date,
      start_time,
      end_time,
      status,
      payment_status,
      created_at
    FROM bookings
    WHERE station_id = $1
      AND booking_date = $2

      AND
      (
        status = 'Confirmed'

        OR

        (
          status = 'Pending'
          AND payment_status = 'Pending'
          AND created_at >= NOW()
              - ($5 * INTERVAL '1 minute')
        )
      )

      AND start_time < $4
      AND end_time > $3

    ORDER BY created_at ASC

    LIMIT 1
    `,
    [
      station_id,
      booking_date,
      start_time,
      end_time,
      PENDING_HOLD_MINUTES,
    ]
  );

  return result.rows[0] || null;
};

// ======================================================
// CREATE BOOKING
//
// POST /api/bookings
//
// Creates a temporary Pending booking.
// The slot is held for 10 minutes while payment
// is completed.
// ======================================================

const createBooking = async (
  user_id,
  station_id,
  booking_date,
  start_time,
  end_time
) => {
  const client =
    await pool.connect();

  try {
    await client.query(
      "BEGIN"
    );

    // ==================================================
    // EXPIRE OLD PENDING BOOKINGS
    // ==================================================

    await client.query(
      `
      UPDATE bookings
      SET status = 'Cancelled'
      WHERE status = 'Pending'
        AND payment_status = 'Pending'
        AND created_at < NOW()
            - ($1 * INTERVAL '1 minute')
      `,
      [PENDING_HOLD_MINUTES]
    );

    // ==================================================
    // CHECK STATION
    //
    // FOR UPDATE locks the station row while we
    // perform the booking check and insert.
    // ==================================================

    const stationResult =
      await client.query(
        `
        SELECT
          id,
          name,
          available,
          price,
          power,
          charger
        FROM stations
        WHERE id = $1
        FOR UPDATE
        `,
        [station_id]
      );

    if (
      stationResult.rows.length === 0
    ) {
      const error =
        new Error(
          "Charging station not found."
        );

      error.statusCode = 404;

      throw error;
    }

    const station =
      stationResult.rows[0];

    // ==================================================
    // CHECK STATION AVAILABILITY
    // ==================================================

    if (
      station.available ===
      false
    ) {
      const error =
        new Error(
          "This charging station is currently unavailable."
        );

      error.statusCode = 409;

      throw error;
    }

    // ==================================================
    // VALIDATE DATE
    // ==================================================

    const dateResult =
      await client.query(
        `
        SELECT
          $1::date AS booking_date,
          CURRENT_DATE AS today
        `,
        [booking_date]
      );

    const dateRow =
      dateResult.rows[0];

    if (
      dateRow.booking_date <
      dateRow.today
    ) {
      const error =
        new Error(
          "You cannot create a booking for a past date."
        );

      error.statusCode = 400;

      throw error;
    }

    // ==================================================
    // VALIDATE TIME
    // ==================================================

    const timeResult =
      await client.query(
        `
        SELECT
          $1::time AS start_time,
          $2::time AS end_time
        `,
        [
          start_time,
          end_time,
        ]
      );

    const timeRow =
      timeResult.rows[0];

    if (
      timeRow.start_time >=
      timeRow.end_time
    ) {
      const error =
        new Error(
          "End time must be later than start time."
        );

      error.statusCode = 400;

      throw error;
    }

    // ==================================================
    // CHECK CURRENT-TIME BOOKING
    //
    // If booking is today, don't allow a slot that
    // has already started.
    // ==================================================

    const currentTimeResult =
      await client.query(
        `
        SELECT
          CURRENT_DATE = $1::date AS is_today,
          CURRENT_TIME AS current_time
        `,
        [booking_date]
      );

    const current =
      currentTimeResult
        .rows[0];

    if (
      current.is_today &&
      timeRow.start_time <=
        current.current_time
    ) {
      const error =
        new Error(
          "The selected time has already passed."
        );

      error.statusCode = 400;

      throw error;
    }

    // ==================================================
    // CHECK SLOT CONFLICT
    // ==================================================

    const conflict =
      await checkSlotConflict(
        station_id,
        booking_date,
        start_time,
        end_time,
        client
      );

    if (conflict) {
      const error =
        new Error(
          "This time slot is already booked or temporarily reserved."
        );

      error.statusCode = 409;

      error.conflictingBooking =
        conflict;

      throw error;
    }

    // ==================================================
    // CALCULATE BOOKING AMOUNT
    //
    // Current station price is treated as price/kWh.
    //
    // We don't guess the energy consumed here because
    // booking duration alone cannot accurately determine
    // actual vehicle energy consumption.
    //
    // Existing payment flow can update amount later.
    // ==================================================

    const result =
      await client.query(
        `
        INSERT INTO bookings
        (
          user_id,
          station_id,
          booking_date,
          start_time,
          end_time,
          status,
          payment_status,
          amount
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          'Pending',
          'Pending',
          NULL
        )
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

    await client.query(
      "COMMIT"
    );

    return result.rows[0];
  } catch (error) {
    await client.query(
      "ROLLBACK"
    );

    throw error;
  } finally {
    client.release();
  }
};

// ======================================================
// GET USER BOOKINGS
// ======================================================

const getUserBookings = async (
  user_id
) => {
  const result =
    await pool.query(
      `
      SELECT
        b.id,
        b.user_id,
        b.station_id,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.status,
        b.payment_status,
        b.amount,
        b.razorpay_order_id,
        b.razorpay_payment_id,
        b.created_at,

        s.name AS station_name,
        s.location,
        s.charger,
        s.power,
        s.price,
        s.rating,
        s.latitude,
        s.longitude

      FROM bookings b

      INNER JOIN stations s
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

// ======================================================
// GET SINGLE BOOKING
// ======================================================

const getBookingById = async (
  booking_id
) => {
  const result =
    await pool.query(
      `
      SELECT
        b.id,
        b.user_id,
        b.station_id,
        b.booking_date,
        b.start_time,
        b.end_time,
        b.status,
        b.payment_status,
        b.amount,
        b.razorpay_order_id,
        b.razorpay_payment_id,
        b.razorpay_signature,
        b.created_at,

        s.name AS station_name,
        s.location,
        s.charger,
        s.power,
        s.price,
        s.rating,
        s.latitude,
        s.longitude

      FROM bookings b

      INNER JOIN stations s
        ON b.station_id = s.id

      WHERE b.id = $1
      `,
      [booking_id]
    );

  return (
    result.rows[0] ||
    null
  );
};

// ======================================================
// GET BOOKED SLOTS
// ======================================================

const getBookedSlots = async (
  station_id,
  booking_date
) => {
  // Remove expired holds first.
  await expirePendingBookings();

  const result =
    await pool.query(
      `
      SELECT
        id,
        start_time,
        end_time,
        status,
        payment_status
      FROM bookings

      WHERE station_id = $1
        AND booking_date = $2

        AND
        (
          status = 'Confirmed'

          OR

          (
            status = 'Pending'
            AND payment_status = 'Pending'
            AND created_at >= NOW()
                - ($3 * INTERVAL '1 minute')
          )
        )

      ORDER BY
        start_time ASC
      `,
      [
        station_id,
        booking_date,
        PENDING_HOLD_MINUTES,
      ]
    );

  return result.rows;
};

// ======================================================
// CANCEL BOOKING
// ======================================================

const cancelBooking = async (
  booking_id
) => {
  const result =
    await pool.query(
      `
      UPDATE bookings

      SET
        status = 'Cancelled'

      WHERE id = $1
        AND status != 'Cancelled'

      RETURNING *
      `,
      [booking_id]
    );

  return (
    result.rows[0] ||
    null
  );
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  getBookedSlots,
  cancelBooking,
  checkSlotConflict,
  expirePendingBookings,
};