const crypto = require("crypto");
const Razorpay = require("razorpay");
const asyncHandler = require("../utils/asyncHandler");
const pool = require("../config/db");

const {
  createBooking,
  expirePendingBookings,
} = require("../models/bookingModel");

// ======================================================
// RAZORPAY
// ======================================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ======================================================
// CREATE RAZORPAY ORDER
// POST /api/payments/create-order
// ======================================================

const createPaymentOrder = asyncHandler(
  async (req, res) => {
    const {
      station_id,
      booking_date,
      start_time,
      end_time,
    } = req.body;

    const user_id = req.user.id;

    // ==================================================
    // VALIDATE INPUT
    // ==================================================

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

    // ==================================================
    // EXPIRE OLD PAYMENT HOLDS
    // ==================================================

    await expirePendingBookings();

    // ==================================================
    // GET STATION
    // ==================================================

    const stationResult =
      await pool.query(
        `
        SELECT
          id,
          name,
          price,
          power,
          available
        FROM stations
        WHERE id = $1
        `,
        [station_id]
      );

    if (
      stationResult.rows.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Charging station not found.",
      });
    }

    const station =
      stationResult.rows[0];

    // ==================================================
    // CHECK STATION AVAILABILITY
    // ==================================================

    if (
      station.available === false
    ) {
      return res.status(409).json({
        success: false,
        message:
          "This charging station is currently unavailable.",
      });
    }

    // ==================================================
    // VALIDATE PRICE
    // ==================================================

    const pricePerKwh =
      Number(station.price);

    if (
      !Number.isFinite(
        pricePerKwh
      ) ||
      pricePerKwh <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid station price.",
      });
    }

    // ==================================================
    // VALIDATE POWER
    // ==================================================

    const powerKw =
      Number(station.power);

    if (
      !Number.isFinite(
        powerKw
      ) ||
      powerKw <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid station charging power.",
      });
    }

    // ==================================================
    // VALIDATE TIME
    // ==================================================

    const startMinutes =
      timeToMinutes(
        start_time
      );

    const endMinutes =
      timeToMinutes(
        end_time
      );

    if (
      startMinutes === null ||
      endMinutes === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid start or end time. Use HH:MM format.",
      });
    }

    if (
      endMinutes <=
      startMinutes
    ) {
      return res.status(400).json({
        success: false,
        message:
          "End time must be after start time.",
      });
    }

    // ==================================================
    // CALCULATE DURATION
    // ==================================================

    const durationMinutes =
      endMinutes -
      startMinutes;

    const durationHours =
      durationMinutes / 60;

    // ==================================================
    // ESTIMATE ENERGY
    //
    // power × time
    // ==================================================

    const estimatedEnergy =
      powerKw *
      durationHours;

    // ==================================================
    // CALCULATE AMOUNT
    //
    // price per kWh × estimated energy
    // ==================================================

    const totalAmount =
      pricePerKwh *
      estimatedEnergy;

    const finalAmount =
      Number(
        totalAmount.toFixed(2)
      );

    if (
      !Number.isFinite(
        finalAmount
      ) ||
      finalAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Unable to calculate booking amount.",
      });
    }

    // ==================================================
    // CREATE PROTECTED PENDING BOOKING
    //
    // bookingModel handles:
    //
    // - station lock
    // - availability
    // - date validation
    // - time validation
    // - overlap protection
    // - 10 minute payment hold
    // ==================================================

    let booking;

    try {
      booking =
        await createBooking(
          user_id,
          station_id,
          booking_date,
          start_time,
          end_time
        );
    } catch (error) {
      console.error(
        "Booking reservation error:",
        error
      );

      return res.status(
        error.statusCode ||
          500
      ).json({
        success: false,
        message:
          error.message ||
          "Unable to reserve charging slot.",
      });
    }

    // ==================================================
    // CREATE RAZORPAY ORDER
    // ==================================================

    let order;

    try {
      const amountInPaise =
        Math.round(
          finalAmount * 100
        );

      order =
        await razorpay.orders.create(
          {
            amount:
              amountInPaise,

            currency:
              "INR",

            receipt:
              `booking_${booking.id}_${Date.now()}`,

            notes: {
              booking_id:
                String(
                  booking.id
                ),

              user_id:
                String(
                  user_id
                ),

              station_id:
                String(
                  station_id
                ),

              booking_date:
                booking_date,

              start_time:
                start_time,

              end_time:
                end_time,
            },
          }
        );
    } catch (error) {
      console.error(
        "Razorpay order creation error:",
        error
      );

      // ==================================================
      // PAYMENT ORDER FAILED
      //
      // Release the temporary reservation.
      // ==================================================

      await pool.query(
        `
        UPDATE bookings
        SET
          status = 'Cancelled'
        WHERE id = $1
          AND status = 'Pending'
          AND payment_status = 'Pending'
        `,
        [booking.id]
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to create payment order. Your slot reservation has been released.",
      });
    }

    // ==================================================
    // SAVE RAZORPAY ORDER ID + AMOUNT
    // ==================================================

    const updatedBooking =
      await pool.query(
        `
        UPDATE bookings
        SET
          razorpay_order_id = $1,
          amount = $2
        WHERE id = $3
          AND user_id = $4
          AND status = 'Pending'
        RETURNING *
        `,
        [
          order.id,
          finalAmount,
          booking.id,
          user_id,
        ]
      );

    if (
      updatedBooking.rows.length === 0
    ) {
      // Very unlikely, but don't leave an inconsistent
      // reservation if the booking disappeared.

      await pool.query(
        `
        UPDATE bookings
        SET
          status = 'Cancelled'
        WHERE id = $1
          AND status = 'Pending'
        `,
        [booking.id]
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to link payment order with booking.",
      });
    }

    // ==================================================
    // RESPONSE
    // ==================================================

    return res.status(201).json({
      success: true,

      message:
        "Payment order created successfully.",

      data: {
        order_id:
          order.id,

        amount:
          order.amount,

        currency:
          order.currency,

        key_id:
          process.env
            .RAZORPAY_KEY_ID,

        booking:
          updatedBooking
            .rows[0],

        pricing: {
          price_per_kwh:
            pricePerKwh,

          power_kw:
            powerKw,

          duration_minutes:
            durationMinutes,

          duration_hours:
            durationHours,

          estimated_energy_kwh:
            estimatedEnergy,

          total_amount:
            finalAmount,
        },
      },
    });
  }
);

// ======================================================
// VERIFY PAYMENT
// POST /api/payments/verify
// ======================================================

const verifyPayment =
  asyncHandler(
    async (req, res) => {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body;

      const user_id =
        req.user.id;

      // ==================================================
      // VALIDATE PAYMENT DATA
      // ==================================================

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Payment verification details are missing.",
        });
      }

      // ==================================================
      // FIND BOOKING
      // ==================================================

      const bookingResult =
        await pool.query(
          `
          SELECT *
          FROM bookings
          WHERE razorpay_order_id = $1
            AND user_id = $2
          `,
          [
            razorpay_order_id,
            user_id,
          ]
        );

      if (
        bookingResult.rows.length ===
        0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Booking associated with this payment was not found.",
        });
      }

      const booking =
        bookingResult.rows[0];

      // ==================================================
      // ALREADY PAID
      // ==================================================

      if (
        booking.payment_status ===
        "Paid"
      ) {
        return res.status(200).json({
          success: true,
          message:
            "Payment already verified.",
          data: booking,
        });
      }

      // ==================================================
      // DON'T CONFIRM CANCELLED BOOKING
      // ==================================================

      if (
        booking.status ===
        "Cancelled"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "This booking has expired or was cancelled.",
        });
      }

      // ==================================================
      // GENERATE SIGNATURE
      // ==================================================

      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env
              .RAZORPAY_KEY_SECRET
          )
          .update(
            `${razorpay_order_id}|${razorpay_payment_id}`
          )
          .digest("hex");

      // ==================================================
      // SAFE SIGNATURE COMPARISON
      // ==================================================

      const expectedBuffer =
        Buffer.from(
          generatedSignature,
          "utf8"
        );

      const receivedBuffer =
        Buffer.from(
          razorpay_signature,
          "utf8"
        );

      if (
        expectedBuffer.length !==
        receivedBuffer.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Payment verification failed.",
        });
      }

      const isValid =
        crypto.timingSafeEqual(
          expectedBuffer,
          receivedBuffer
        );

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message:
            "Payment verification failed.",
        });
      }

      // ==================================================
      // CONFIRM PAYMENT + BOOKING
      // ==================================================

      const updatedBooking =
        await pool.query(
          `
          UPDATE bookings
          SET
            payment_status = 'Paid',
            status = 'Confirmed',
            razorpay_payment_id = $1,
            razorpay_signature = $2
          WHERE id = $3
            AND user_id = $4
            AND razorpay_order_id = $5
            AND status = 'Pending'
            AND payment_status = 'Pending'
          RETURNING *
          `,
          [
            razorpay_payment_id,
            razorpay_signature,
            booking.id,
            user_id,
            razorpay_order_id,
          ]
        );

      // ==================================================
      // CHECK UPDATE
      // ==================================================

      if (
        updatedBooking.rows.length ===
        0
      ) {
        // Re-read booking to determine what happened.
        const latest =
          await pool.query(
            `
            SELECT *
            FROM bookings
            WHERE id = $1
            `,
            [booking.id]
          );

        if (
          latest.rows.length > 0 &&
          latest.rows[0]
            .payment_status ===
            "Paid"
        ) {
          return res.status(200).json({
            success: true,
            message:
              "Payment already verified.",
            data:
              latest.rows[0],
          });
        }

        return res.status(409).json({
          success: false,
          message:
            "Booking could not be confirmed.",
        });
      }

      // ==================================================
      // SUCCESS
      // ==================================================

      return res.status(200).json({
        success: true,

        message:
          "Payment verified successfully. Booking confirmed.",

        data:
          updatedBooking.rows[0],
      });
    }
  );

// ======================================================
// TIME CONVERSION
// ======================================================

function timeToMinutes(
  time
) {
  if (
    typeof time !==
      "string" ||
    !/^\d{2}:\d{2}$/.test(
      time
    )
  ) {
    return null;
  }

  const [
    hours,
    minutes,
  ] =
    time
      .split(":")
      .map(Number);

  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return (
    hours * 60 +
    minutes
  );
}

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createPaymentOrder,
  verifyPayment,
};