const pool = require("../config/db");

// ======================================================
// CREATE VEHICLE
// ======================================================

const createVehicle = async (
  userId,
  vehicleData
) => {
  const {
    brand,
    model,
    year,
    registration_number,
    battery_capacity,
    current_battery,
    estimated_range,
    connector_type,
    max_charging_power,
  } = vehicleData;

  const result = await pool.query(
    `
    INSERT INTO vehicles
    (
      user_id,
      brand,
      model,
      year,
      registration_number,
      battery_capacity,
      current_battery,
      estimated_range,
      connector_type,
      max_charging_power
    )
    VALUES
    (
      $1,
      $2,
      $3,
      $4,
      $5,
      $6,
      $7,
      $8,
      $9,
      $10
    )
    RETURNING *
    `,
    [
      userId,
      brand,
      model,
      year || null,
      registration_number || null,
      battery_capacity || null,
      current_battery ?? 100,
      estimated_range || null,
      connector_type || null,
      max_charging_power || null,
    ]
  );

  return result.rows[0];
};

// ======================================================
// GET ALL VEHICLES OF USER
// ======================================================

const getUserVehicles = async (userId) => {
  const result = await pool.query(
    `
    SELECT *
    FROM vehicles
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [userId]
  );

  return result.rows;
};

// ======================================================
// GET SINGLE VEHICLE
// ======================================================

const getVehicleById = async (
  vehicleId,
  userId
) => {
  const result = await pool.query(
    `
    SELECT *
    FROM vehicles
    WHERE id = $1
      AND user_id = $2
    `,
    [vehicleId, userId]
  );

  return result.rows[0] || null;
};

// ======================================================
// UPDATE VEHICLE
// ======================================================

const updateVehicle = async (
  vehicleId,
  userId,
  vehicleData
) => {
  const {
    brand,
    model,
    year,
    registration_number,
    battery_capacity,
    current_battery,
    estimated_range,
    connector_type,
    max_charging_power,
  } = vehicleData;

  const result = await pool.query(
    `
    UPDATE vehicles
    SET
      brand = $1,
      model = $2,
      year = $3,
      registration_number = $4,
      battery_capacity = $5,
      current_battery = $6,
      estimated_range = $7,
      connector_type = $8,
      max_charging_power = $9,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $10
      AND user_id = $11
    RETURNING *
    `,
    [
      brand,
      model,
      year || null,
      registration_number || null,
      battery_capacity || null,
      current_battery ?? 100,
      estimated_range || null,
      connector_type || null,
      max_charging_power || null,
      vehicleId,
      userId,
    ]
  );

  return result.rows[0] || null;
};

// ======================================================
// UPDATE BATTERY
// ======================================================

const updateBattery = async (
  vehicleId,
  userId,
  currentBattery,
  estimatedRange
) => {
  const result = await pool.query(
    `
    UPDATE vehicles
    SET
      current_battery = $1,
      estimated_range = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
      AND user_id = $4
    RETURNING *
    `,
    [
      currentBattery,
      estimatedRange ?? null,
      vehicleId,
      userId,
    ]
  );

  return result.rows[0] || null;
};

// ======================================================
// DELETE VEHICLE
// ======================================================

const deleteVehicle = async (
  vehicleId,
  userId
) => {
  const result = await pool.query(
    `
    DELETE FROM vehicles
    WHERE id = $1
      AND user_id = $2
    RETURNING *
    `,
    [vehicleId, userId]
  );

  return result.rows[0] || null;
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  createVehicle,
  getUserVehicles,
  getVehicleById,
  updateVehicle,
  updateBattery,
  deleteVehicle,
};