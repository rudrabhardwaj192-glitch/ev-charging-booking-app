const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getAllStations,
  getNearbyStations,
  recommendStations,
  getOwnerStations,
  getMyStations,
  getStationById,
  addStation,
  updateStation,
  deleteStation,
} = require("../controllers/stationController");

// ======================================================
// AUTHENTICATION
// ======================================================

router.use(authMiddleware);

// ======================================================
// GET ALL STATIONS
// GET /api/stations
// ======================================================

router.get(
  "/",
  getAllStations
);

// ======================================================
// GET NEARBY REAL EV STATIONS
// GET /api/stations/nearby
// ======================================================
//
// Uses OpenStreetMap + Overpass.
//
// IMPORTANT:
// Must come before /:id.
//

router.get(
  "/nearby",
  getNearbyStations
);

// ======================================================
// INTELLIGENT STATION RECOMMENDATION
// GET /api/stations/recommend/:vehicleId
// ======================================================
//
// Example:
//
// /api/stations/recommend/1
// ?latitude=26.2061985
// &longitude=78.1904335
//
// Uses the vehicle's battery/charging information
// and location to recommend a suitable station.
//
// IMPORTANT:
// This MUST come before /:id.
//

router.get(
  "/recommend/:vehicleId",
  recommendStations
);

// ======================================================
// GET CURRENT OWNER'S STATIONS
// GET /api/stations/owner/my
// ======================================================

router.get(
  "/owner/my",
  getMyStations
);

// ======================================================
// GET STATIONS BY OWNER
// GET /api/stations/owner/:ownerId
// ======================================================

router.get(
  "/owner/:ownerId",
  getOwnerStations
);

// ======================================================
// ADD STATION
// POST /api/stations
// ======================================================

router.post(
  "/",
  addStation
);

// ======================================================
// UPDATE STATION
// PUT /api/stations/:id
// ======================================================

router.put(
  "/:id",
  updateStation
);

// ======================================================
// GET SINGLE STATION
// GET /api/stations/:id
// ======================================================
//
// IMPORTANT:
// Keep this AFTER:
//
// /nearby
// /recommend/:vehicleId
// /owner/my
// /owner/:ownerId
//
// ======================================================

router.get(
  "/:id",
  getStationById
);

// ======================================================
// DELETE STATION
// DELETE /api/stations/:id
// ======================================================

router.delete(
  "/:id",
  deleteStation
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;