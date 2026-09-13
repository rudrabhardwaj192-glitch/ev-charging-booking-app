const {
  getVehicleById,
} = require("../models/vehicleModel");

const {
  getRecommendedStations,
} = require("../services/stationRecommendationService");

// ======================================================
// GET RECOMMENDED STATIONS
//
// GET
// /api/stations/recommend/:vehicleId
// ?latitude=
// &longitude=
// ======================================================

const recommendStations = async (
  req,
  res
) => {
  try {
    const userId = req.user.id;

    const vehicleId =
      req.params.vehicleId;

    const {
      latitude,
      longitude,
    } = req.query;

    // ----------------------------------------------
    // Validate location
    // ----------------------------------------------

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Latitude and longitude are required.",
      });
    }

    const userLatitude =
      Number(latitude);

    const userLongitude =
      Number(longitude);

    if (
      !Number.isFinite(userLatitude) ||
      !Number.isFinite(userLongitude)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid latitude or longitude.",
      });
    }

    // ----------------------------------------------
    // Get user's vehicle
    // ----------------------------------------------

    const vehicle =
      await getVehicleById(
        vehicleId,
        userId
      );

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message:
          "Vehicle not found.",
      });
    }

    // ----------------------------------------------
    // Get recommendations
    // ----------------------------------------------

    const recommendations =
      await getRecommendedStations({
        latitude:
          userLatitude,

        longitude:
          userLongitude,

        connectorType:
          vehicle.connector_type,

        maxChargingPower:
          vehicle.max_charging_power,
      });

    if (
      recommendations.length === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "No available charging stations found nearby.",
      });
    }

    // ----------------------------------------------
    // Best station
    // ----------------------------------------------

    const bestStation =
      recommendations[0];

    res.status(200).json({
      success: true,

      message:
        "Charging stations recommended successfully.",

      vehicle: {
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        current_battery:
          vehicle.current_battery,
        connector_type:
          vehicle.connector_type,
        max_charging_power:
          vehicle.max_charging_power,
      },

      recommendation: {
        station: bestStation,
        reason:
          bestStation.recommendation_reason,
      },

      total:
        recommendations.length,

      data:
        recommendations,
    });
  } catch (error) {
    console.error(
      "Station recommendation error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Unable to generate station recommendations.",
    });
  }
};

module.exports = {
  recommendStations,
};