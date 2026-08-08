const express = require("express");

const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const isAdmin = require("../middleware/adminMiddleware");

const {
  getAllStations,
  getOwnerStations,
  getStationById,
  addStation,
  updateStation,
  deleteStation,
} = require("../controllers/stationController");

// ==========================
// PUBLIC ROUTES
// ==========================

// Get all stations
router.get("/", getAllStations);

// Get stations by owner
// IMPORTANT: Keep this BEFORE "/:id"
router.get("/owner/:ownerId", getOwnerStations);

// Get station by ID
router.get("/:id", getStationById);

// ==========================
// PROTECTED ROUTES
// ==========================

// Add station
router.post("/", verifyToken, isAdmin, addStation);

// Update station
router.put("/:id", verifyToken, isAdmin, updateStation);

// Delete station
router.delete("/:id", verifyToken, isAdmin, deleteStation);

module.exports = router;