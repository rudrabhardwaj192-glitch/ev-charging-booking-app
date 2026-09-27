const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  addVehicle,
  myVehicles,
  getVehicle,
  editVehicle,
  changeBattery,
  vehicleTelemetry,
  removeVehicle,
} = require("../controllers/vehicleController");

// ======================================================
// AUTHENTICATION
// ======================================================
//
// Every vehicle endpoint requires a logged-in user.
//

router.use(authMiddleware);

// ======================================================
// CREATE VEHICLE
// POST /api/vehicles
// ======================================================

router.post(
  "/",
  addVehicle
);

// ======================================================
// GET MY VEHICLES
// GET /api/vehicles
// ======================================================

router.get(
  "/",
  myVehicles
);

// ======================================================
// GET VEHICLE TELEMETRY
// GET /api/vehicles/:id/telemetry
// ======================================================
//
// IMPORTANT:
// This must be BEFORE /:id.
//

router.get(
  "/:id/telemetry",
  vehicleTelemetry
);

// ======================================================
// UPDATE BATTERY
// PUT /api/vehicles/:id/battery
// ======================================================

router.put(
  "/:id/battery",
  changeBattery
);

// ======================================================
// UPDATE VEHICLE
// PUT /api/vehicles/:id
// ======================================================

router.put(
  "/:id",
  editVehicle
);

// ======================================================
// GET SINGLE VEHICLE
// GET /api/vehicles/:id
// ======================================================

router.get(
  "/:id",
  getVehicle
);

// ======================================================
// DELETE VEHICLE
// DELETE /api/vehicles/:id
// ======================================================

router.delete(
  "/:id",
  removeVehicle
);

// ======================================================
// EXPORT
// ======================================================

module.exports = router;