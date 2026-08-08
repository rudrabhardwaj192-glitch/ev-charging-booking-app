const pool = require("../config/db");

// ==========================
// GET ALL STATIONS
// ==========================
const getAllStations = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM stations ORDER BY id ASC"
    );

    res.status(200).json({
      success: true,
      total: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// GET OWNER STATIONS
// ==========================
const getOwnerStations = async (req, res) => {
  try {
    const { ownerId } = req.params;

    const result = await pool.query(
      "SELECT * FROM stations WHERE owner_id = $1 ORDER BY id DESC",
      [ownerId]
    );

    res.status(200).json({
      success: true,
      total: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// GET STATION BY ID
// ==========================
const getStationById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT * FROM stations WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Station not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// ADD STATION
// ==========================
const addStation = async (req, res) => {
  try {
    const {
      name,
      location,
      charger,
      power,
      price,
      image,
      available,
      owner_id,
      latitude,
      longitude,
    } = req.body;

    if (!name || !location || !charger || !power || !price) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields.",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO stations
      (
        name,
        location,
        charger,
        power,
        price,
        rating,
        reviews,
        available,
        image,
        owner_id,
        latitude,
        longitude
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *
      `,
      [
        name,
        location,
        charger,
        power,
        price,
        0,
        0,
        available,
        image,
        owner_id,
        latitude,
        longitude,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Station added successfully",
      station: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// UPDATE STATION
// ==========================
const updateStation = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      location,
      charger,
      power,
      price,
      image,
      available,
      latitude,
      longitude,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE stations
      SET
        name = $1,
        location = $2,
        charger = $3,
        power = $4,
        price = $5,
        image = $6,
        available = $7,
        latitude = $8,
        longitude = $9
      WHERE id = $10
      RETURNING *
      `,
      [
        name,
        location,
        charger,
        power,
        price,
        image,
        available,
        latitude,
        longitude,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Station not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Station updated successfully",
      station: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// DELETE STATION
// ==========================
const deleteStation = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM stations WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Station not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Station deleted successfully",
      station: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getAllStations,
  getOwnerStations,
  getStationById,
  addStation,
  updateStation,
  deleteStation,
};