const pool = require("../config/db");

// ==========================
// GET ALL STATIONS
// Supports:
// city
// charger_type
// available
// min_power
// page
// limit
// sortBy
// order
// ==========================
const getAllStations = async (req, res) => {
  try {
    const {
      city,
      charger_type,
      available,
      min_power,
      page = 1,
      limit = 10,
      sortBy = "id",
      order = "asc",
    } = req.query;

    const allowedSortFields = ["id", "name", "city", "power_kw"];
    const allowedOrder = ["asc", "desc"];

    const sortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : "id";

    const sortOrder = allowedOrder.includes(order.toLowerCase())
      ? order.toUpperCase()
      : "ASC";

    let query = "SELECT * FROM stations WHERE 1=1";
    let values = [];

    // Filter by city
    if (city) {
      values.push(city);
      query += ` AND city = $${values.length}`;
    }

    // Filter by charger type
    if (charger_type) {
      values.push(charger_type);
      query += ` AND charger_type = $${values.length}`;
    }

    // Filter by availability
    if (available !== undefined) {
      values.push(available === "true");
      query += ` AND available = $${values.length}`;
    }

    // Filter by minimum power
    if (min_power) {
      values.push(Number(min_power));
      query += ` AND power_kw >= $${values.length}`;
    }

    // Sorting
    query += ` ORDER BY ${sortField} ${sortOrder}`;

    // Pagination
    const offset = (Number(page) - 1) * Number(limit);

    values.push(Number(limit));
    query += ` LIMIT $${values.length}`;

    values.push(offset);
    query += ` OFFSET $${values.length}`;

    const result = await pool.query(query, values);

    res.status(200).json({
      page: Number(page),
      limit: Number(limit),
      totalReturned: result.rows.length,
      sortBy: sortField,
      order: sortOrder,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database Error",
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
      city,
      address,
      charger_type,
      power_kw,
      available,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO stations
      (name, city, address, charger_type, power_kw, available)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [name, city, address, charger_type, power_kw, available]
    );

    res.status(201).json({
      message: "Station added successfully",
      station: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database Error",
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
        message: "Station not found",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database Error",
    });
  }
};

// ==========================
// ADD STATION
// ==========================
const updateStation = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      city,
      address,
      charger_type,
      power_kw,
      available,
    } = req.body;

    const result = await pool.query(
      `UPDATE stations
       SET
         name = $1,
         city = $2,
         address = $3,
         charger_type = $4,
         power_kw = $5,
         available = $6
       WHERE id = $7
       RETURNING *`,
      [
        name,
        city,
        address,
        charger_type,
        power_kw,
        available,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Station not found",
      });
    }

    res.status(200).json({
      message: "Station updated successfully",
      station: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database Error",
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
        message: "Station not found",
      });
    }

    res.status(200).json({
      message: "Station deleted successfully",
      station: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database Error",
    });
  }
};

module.exports = {
  getAllStations,
  addStation,
  getStationById,
  updateStation,
  deleteStation,
};