const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

const {
  getAllStations,
  getStationById,
  addStation,
  updateStation,
  deleteStation,
} = require("../controllers/stationController");

// Public Routes
router.get("/", getAllStations);
router.get("/:id", getStationById);

// Admin Only Routes
router.post("/", verifyToken, isAdmin, addStation);
router.put("/:id", verifyToken, isAdmin, updateStation);
router.delete("/:id", verifyToken, isAdmin, deleteStation);

module.exports = router;