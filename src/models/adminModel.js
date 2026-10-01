const pool = require("../config/db");

// =======================
// Dashboard Statistics
// =======================
const getDashboardStats = async () => {
  // Total Users
  const totalUsersResult = await pool.query(`
    SELECT COUNT(*) AS total_users
    FROM users
  `);

  // Total Stations
  const totalStationsResult = await pool.query(`
    SELECT COUNT(*) AS total_stations
    FROM stations
  `);

  // Total Bookings
  const totalBookingsResult = await pool.query(`
    SELECT COUNT(*) AS total_bookings
    FROM bookings
  `);

  // Active Bookings
  const activeBookingsResult = await pool.query(`
    SELECT COUNT(*) AS active_bookings
    FROM bookings
    WHERE status = 'Booked'
  `);

  // Cancelled Bookings
  const cancelledBookingsResult = await pool.query(`
    SELECT COUNT(*) AS cancelled_bookings
    FROM bookings
    WHERE status = 'Cancelled'
  `);

  return {
    totalUsers: Number(totalUsersResult.rows[0].total_users),
    totalStations: Number(totalStationsResult.rows[0].total_stations),
    totalBookings: Number(totalBookingsResult.rows[0].total_bookings),
    activeBookings: Number(activeBookingsResult.rows[0].active_bookings),
    cancelledBookings: Number(
      cancelledBookingsResult.rows[0].cancelled_bookings
    ),
  };
};

module.exports = {
  getDashboardStats,
};