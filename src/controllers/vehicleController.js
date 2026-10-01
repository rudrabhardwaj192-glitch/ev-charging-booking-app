const {
  createVehicle,
  getUserVehicles,
  getVehicleById,
  updateVehicle,
  updateBattery,
  deleteVehicle,
} = require("../models/vehicleModel");

// ======================================================
// CREATE VEHICLE
// POST /api/vehicles
// ======================================================

const addVehicle = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      brand,
      model,
    } = req.body;

    if (!brand || !model) {
      return res.status(400).json({
        success: false,
        message: "Vehicle brand and model are required.",
      });
    }

    const vehicle = await createVehicle(
      userId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Vehicle added successfully.",
      data: vehicle,
    });
  } catch (error) {
    console.error("Add vehicle error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to add vehicle.",
    });
  }
};

// ======================================================
// GET MY VEHICLES
// GET /api/vehicles
// ======================================================

const myVehicles = async (req, res) => {
  try {
    const userId = req.user.id;

    const vehicles = await getUserVehicles(userId);

    res.status(200).json({
      success: true,
      total: vehicles.length,
      data: vehicles,
    });
  } catch (error) {
    console.error("Get vehicles error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load vehicles.",
    });
  }
};

// ======================================================
// GET SINGLE VEHICLE
// GET /api/vehicles/:id
// ======================================================

const getVehicle = async (req, res) => {
  try {
    const userId = req.user.id;
    const vehicleId = req.params.id;

    const vehicle = await getVehicleById(
      vehicleId,
      userId
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: vehicle,
    });
  } catch (error) {
    console.error("Get vehicle error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load vehicle.",
    });
  }
};

// ======================================================
// UPDATE VEHICLE
// PUT /api/vehicles/:id
// ======================================================

const editVehicle = async (req, res) => {
  try {
    const userId = req.user.id;
    const vehicleId = req.params.id;

    const vehicle = await updateVehicle(
      vehicleId,
      userId,
      req.body
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully.",
      data: vehicle,
    });
  } catch (error) {
    console.error("Update vehicle error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update vehicle.",
    });
  }
};

// ======================================================
// UPDATE BATTERY
// PUT /api/vehicles/:id/battery
// ======================================================

const changeBattery = async (req, res) => {
  try {
    const userId = req.user.id;
    const vehicleId = req.params.id;

    const {
      current_battery,
      estimated_range,
    } = req.body;

    if (
      current_battery === undefined ||
      current_battery === null
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Current battery percentage is required.",
      });
    }

    const battery = Number(current_battery);

    if (
      Number.isNaN(battery) ||
      battery < 0 ||
      battery > 100
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Battery percentage must be between 0 and 100.",
      });
    }

    const vehicle = await updateBattery(
      vehicleId,
      userId,
      battery,
      estimated_range
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Battery information updated.",
      data: vehicle,
    });
  } catch (error) {
    console.error("Battery update error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update battery.",
    });
  }
};

// ======================================================
// DELETE VEHICLE
// DELETE /api/vehicles/:id
// ======================================================

const removeVehicle = async (req, res) => {
  try {
    const userId = req.user.id;
    const vehicleId = req.params.id;

    const vehicle = await deleteVehicle(
      vehicleId,
      userId
    );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully.",
    });
  } catch (error) {
    console.error("Delete vehicle error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete vehicle.",
    });
  }
};

module.exports = {
  addVehicle,
  myVehicles,
  getVehicle,
  editVehicle,
  changeBattery,
  removeVehicle,
};