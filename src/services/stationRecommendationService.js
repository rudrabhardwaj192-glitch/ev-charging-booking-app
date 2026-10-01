const pool = require("../config/db");

// ======================================================
// Calculate distance between two coordinates
// Haversine Formula
// ======================================================

const calculateDistance = (
  lat1,
  lon1,
  lat2,
  lon2
) => {
  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
};

// ======================================================
// Check connector compatibility
// ======================================================

const isConnectorCompatible = (
  vehicleConnector,
  stationCharger
) => {
  if (
    !vehicleConnector ||
    !stationCharger
  ) {
    return true;
  }

  const vehicle =
    String(vehicleConnector)
      .toLowerCase()
      .trim();

  const charger =
    String(stationCharger)
      .toLowerCase()
      .trim();

  return (
    charger.includes(vehicle) ||
    vehicle.includes(charger)
  );
};

// ======================================================
// Get recommended charging stations
// ======================================================

const getRecommendedStations = async ({
  latitude,
  longitude,
  connectorType,
  maxChargingPower,
}) => {
  // ----------------------------------------------
  // Get available stations
  // ----------------------------------------------

  const result = await pool.query(
    `
    SELECT
      id,
      name,
      location,
      charger,
      power,
      price,
      rating,
      reviews,
      available,
      image,
      latitude,
      longitude
    FROM stations
    WHERE available = true
      AND latitude IS NOT NULL
      AND longitude IS NOT NULL
    `
  );

  const stations = result.rows;

  // ----------------------------------------------
  // Calculate score
  // ----------------------------------------------

  const recommendations =
    stations
      .map((station) => {
        const distance =
          calculateDistance(
            Number(latitude),
            Number(longitude),
            Number(station.latitude),
            Number(station.longitude)
          );

        const compatible =
          isConnectorCompatible(
            connectorType,
            station.charger
          );

        const stationPower =
          Number(station.power) || 0;

        const price =
          Number(station.price) || 0;

        const rating =
          Number(station.rating) || 0;

        // ------------------------------------------
        // Compatibility score
        // ------------------------------------------

        const compatibilityScore =
          compatible ? 30 : 0;

        // ------------------------------------------
        // Distance score
        // Closer station = higher score
        // ------------------------------------------

        const distanceScore =
          Math.max(
            0,
            30 - distance * 3
          );

        // ------------------------------------------
        // Charging power score
        // ------------------------------------------

        let powerScore = 0;

        if (
          maxChargingPower &&
          Number(maxChargingPower) > 0
        ) {
          if (
            stationPower <=
            Number(maxChargingPower)
          ) {
            powerScore = 15;
          } else {
            powerScore = 10;
          }
        } else {
          powerScore =
            Math.min(
              stationPower / 10,
              15
            );
        }

        // ------------------------------------------
        // Rating score
        // ------------------------------------------

        const ratingScore =
          Math.min(
            rating * 2,
            10
          );

        // ------------------------------------------
        // Price score
        // Lower price = better
        // ------------------------------------------

        const priceScore =
          Math.max(
            0,
            10 - price / 10
          );

        // ------------------------------------------
        // Final recommendation score
        // ------------------------------------------

        const score =
          compatibilityScore +
          distanceScore +
          powerScore +
          ratingScore +
          priceScore;

        return {
          ...station,

          distance_km:
            Number(distance.toFixed(2)),

          compatible,

          score:
            Number(score.toFixed(2)),

          recommendation_reason:
            compatible
              ? "Nearby compatible charging station with good charging capability."
              : "Station is nearby but connector compatibility should be verified.",
        };
      })
      .sort(
        (a, b) =>
          b.score - a.score
      );

  return recommendations;
};

module.exports = {
  calculateDistance,
  getRecommendedStations,
};