const pool = require("../config/db");

// =====================================================
// GET OWNER BOOKINGS
// GET /api/owner/bookings
// =====================================================

const getOwnerBookings = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const result = await pool.query(
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

        u.name AS customer_name,
        u.email AS customer_email,

        s.name AS station_name,
        s.location AS station_location,
        s.charger,
        s.power

      FROM bookings b

      INNER JOIN stations s
        ON b.station_id = s.id

      INNER JOIN users u
        ON b.user_id = u.id

      WHERE s.owner_id = $1

      ORDER BY
        b.booking_date DESC,
        b.start_time DESC,
        b.id DESC
      `,
      [ownerId]
    );

    res.status(200).json({
      success: true,
      total: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("OWNER BOOKINGS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch owner bookings.",
    });
  }
};

// =====================================================
// GET OWNER BOOKING STATISTICS
// GET /api/owner/bookings/stats
// =====================================================

const getOwnerBookingStats = async (req, res) => {
  try {
    const ownerId = req.user.id;

    const result = await pool.query(
      `
      SELECT

        COUNT(b.id)::integer AS total_bookings,

        COUNT(
          CASE
            WHEN b.payment_status = 'Paid'
            THEN 1
          END
        )::integer AS paid_bookings,

        COUNT(
          CASE
            WHEN b.status = 'Confirmed'
            THEN 1
          END
        )::integer AS confirmed_bookings,

        COUNT(
          CASE
            WHEN b.status = 'Cancelled'
            THEN 1
          END
        )::integer AS cancelled_bookings,

        COALESCE(
          SUM(
            CASE
              WHEN b.payment_status = 'Paid'
              THEN b.amount
              ELSE 0
            END
          ),
          0
        )::numeric(12,2) AS total_revenue

      FROM bookings b

      INNER JOIN stations s
        ON b.station_id = s.id

      WHERE s.owner_id = $1
      `,
      [ownerId]
    );

    const stats = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        total_bookings:
          Number(stats.total_bookings) || 0,

        paid_bookings:
          Number(stats.paid_bookings) || 0,

        confirmed_bookings:
          Number(stats.confirmed_bookings) || 0,

        cancelled_bookings:
          Number(stats.cancelled_bookings) || 0,

        total_revenue:
          Number(stats.total_revenue) || 0,
      },
    });
  } catch (error) {
    console.error(
      "OWNER BOOKING STATS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch booking statistics.",
    });
  }
};

module.exports = {
  getOwnerBookings,
  getOwnerBookingStats,
};