const express = require("express");

const router = express.Router();

const {
  createPaymentOrder,
  verifyPayment,
} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

// ==========================================
// CREATE RAZORPAY ORDER
// POST /api/payments/create-order
// ==========================================
router.post(
  "/create-order",
  authMiddleware,
  createPaymentOrder
);

// ==========================================
// VERIFY RAZORPAY PAYMENT
// POST /api/payments/verify
// ==========================================
router.post(
  "/verify",
  authMiddleware,
  verifyPayment
);

module.exports = router;