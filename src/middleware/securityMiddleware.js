const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

// =======================
// Helmet
// =======================
const helmetMiddleware = helmet();

// =======================
// Compression
// =======================
const compressionMiddleware = compression();

// =======================
// Rate Limiter
// =======================
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 Minutes
  max: 100,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

module.exports = {
  helmetMiddleware,
  compressionMiddleware,
  apiLimiter,
};