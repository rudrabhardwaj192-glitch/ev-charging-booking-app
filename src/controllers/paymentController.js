const crypto = require("crypto");
const Razorpay = require("razorpay");
const asyncHandler = require("../utils/asyncHandler");
const pool = require("../config/db");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ==========================================
// CREATE RAZORPAY ORDER
// POST /api/payments/create-order
// ==========================================
const createPaymentOrder = asyncHandler(async (req, res) => {
  const {
    station_id,
    booking_date,
    start_time,
    end_time,
  } = req.body;

  const user_id = req.user.id;

  // ==========================================
  // Validate required fields
  // ==========================================
  if (
    !station_id ||
    !booking_date ||
    !start_time ||
    !end_time
  ) {
    return res.status(400).json({
      success: false,
      message: "Station, date and time are required.",
    });
  }

  // ==========================================
  // Get station from DATABASE
  // ==========================================
  const stationResult = await pool.query(
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

  if (stationResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Station not found.",
    });
  }

  const station = stationResult.rows[0];

  // ==========================================
  // Check station availability
  // ==========================================
  if (!station.available) {
    return res.status(400).json({
      success: false,
      message: "This station is currently unavailable.",
    });
  }

  // ==========================================
  // Validate price and power
  // ==========================================
  const pricePerKwh = Number(station.price);
  const powerKw = Number(station.power);

  if (
    !Number.isFinite(pricePerKwh) ||
    pricePerKwh <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid station price.",
    });
  }

  if (
    !Number.isFinite(powerKw) ||
    powerKw <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid station power.",
    });
  }

  // ==========================================
  // Validate time
  // ==========================================
  const startMinutes =
    timeToMinutes(start_time);

  const endMinutes =
    timeToMinutes(end_time);

  if (
    startMinutes === null ||
    endMinutes === null
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid start or end time.",
    });
  }

  if (endMinutes <= startMinutes) {
    return res.status(400).json({
      success: false,
      message: "End time must be after start time.",
    });
  }

  // ==========================================
  // Calculate duration
  // ==========================================
  const durationMinutes =
    endMinutes - startMinutes;

  const durationHours =
    durationMinutes / 60;

  // ==========================================
  // Calculate amount on SERVER
  // ==========================================
  const estimatedEnergy =
    powerKw * durationHours;

  const totalAmount =
    pricePerKwh * estimatedEnergy;

  const finalAmount =
    Number(totalAmount.toFixed(2));

  if (
    !Number.isFinite(finalAmount) ||
    finalAmount <= 0
  ) {
    return res.status(400).json({
      success: false,
      message: "Unable to calculate booking amount.",
    });
  }

  // ==========================================
  // Check overlapping booking
  // ==========================================
  const existingBooking = await pool.query(
    `
    SELECT id
    FROM bookings
    WHERE station_id = $1
      AND booking_date = $2
      AND status != 'Cancelled'
      AND start_time < $4
      AND end_time > $3
    `,
    [
      station_id,
      booking_date,
      start_time,
      end_time,
    ]
  );

  if (existingBooking.rows.length > 0) {
    return res.status(409).json({
      success: false,
      message: "This time slot is already booked.",
    });
  }

  // ==========================================
  // Razorpay amount is in paise
  // ==========================================
  const amountInPaise =
    Math.round(finalAmount * 100);

  // ==========================================
  // Create Razorpay Order
  // ==========================================
  const order = await razorpay.orders.create({
    amount: amountInPaise,
    currency: "INR",

    receipt:
      `booking_${user_id}_${Date.now()}`,

    notes: {
      user_id: String(user_id),
      station_id: String(station_id),
      booking_date,
      start_time,
      end_time,
    },
  });

  // ==========================================
  // Create Pending Booking
  // ==========================================
  const bookingResult = await pool.query(
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
      razorpay_order_id,
      amount
    )
    VALUES
    ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
    `,
    [
      user_id,
      station_id,
      booking_date,
      start_time,
      end_time,
      "Pending",
      "Pending",
      order.id,
      finalAmount,
    ]
  );

  // ==========================================
  // Response
  // ==========================================
  res.status(201).json({
    success: true,
    message: "Payment order created successfully.",

    data: {
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.RAZORPAY_KEY_ID,

      booking: bookingResult.rows[0],

      pricing: {
        price_per_kwh: pricePerKwh,
        power_kw: powerKw,
        duration_hours: durationHours,
        estimated_energy_kwh:
          estimatedEnergy,
        total_amount: finalAmount,
      },
    },
  });
});

// ==========================================
// VERIFY PAYMENT
// POST /api/payments/verify
// ==========================================
const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const user_id = req.user.id;

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

  // ==========================================
  // Find booking
  // ==========================================
  const bookingResult = await pool.query(
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

  if (bookingResult.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message:
        "Booking associated with this payment was not found.",
    });
  }

  const booking = bookingResult.rows[0];

  // ==========================================
  // Generate expected signature
  // ==========================================
  const generatedSignature =
    crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

  // ==========================================
  // Compare signature
  // ==========================================
  const isValid =
    crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(razorpay_signature)
    );

  if (!isValid) {
    return res.status(400).json({
      success: false,
      message: "Payment verification failed.",
    });
  }

  // ==========================================
  // Prevent duplicate verification
  // ==========================================
  if (booking.payment_status === "Paid") {
    return res.status(200).json({
      success: true,
      message: "Payment already verified.",
      data: booking,
    });
  }

  // ==========================================
  // Update booking
  // ==========================================
  const updatedBooking = await pool.query(
    `
    UPDATE bookings
    SET
      payment_status = 'Paid',
      status = 'Confirmed',
      razorpay_payment_id = $1,
      razorpay_signature = $2
    WHERE id = $3
      AND user_id = $4
    RETURNING *
    `,
    [
      razorpay_payment_id,
      razorpay_signature,
      booking.id,
      user_id,
    ]
  );

  res.status(200).json({
    success: true,
    message: "Payment verified successfully.",
    data: updatedBooking.rows[0],
  });
});

// ==========================================
// Convert HH:MM into minutes
// ==========================================
function timeToMinutes(time) {
  if (
    typeof time !== "string" ||
    !/^\d{2}:\d{2}$/.test(time)
  ) {
    return null;
  }

  const [hours, minutes] =
    time.split(":").map(Number);

  if (
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  return hours * 60 + minutes;
}

module.exports = {
  createPaymentOrder,
  verifyPayment,
};