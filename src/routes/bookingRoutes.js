const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");

const {
  bookStation,
  myBookings,
} = require("../controllers/bookingController");

router.post("/", verifyToken, bookStation);

router.get("/my", verifyToken, myBookings);

module.exports = router;