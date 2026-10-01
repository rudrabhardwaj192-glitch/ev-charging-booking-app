import { Routes, Route } from "react-router-dom";

// =====================================================
// HOME
// =====================================================

import HomePage from "../pages/home/HomePage";

// =====================================================
// AUTHENTICATION
// =====================================================

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// =====================================================
// STATIONS
// =====================================================

import StationList from "../pages/stations/StationList";
import StationDetails from "../pages/stations/StationDetails";

// =====================================================
// USER DASHBOARD
// =====================================================

import Dashboard from "../pages/dashboard/Dashboard";
import MyBookings from "../pages/dashboard/MyBookings";
import BookingDetails from "../pages/dashboard/BookingDetails";
import Favorites from "../pages/dashboard/Favorites";
import Profile from "../pages/dashboard/Profile";

// =====================================================
// MY EV
// =====================================================

import MyVehicle from "../pages/dashboard/MyVehicle";
import AddVehicle from "../pages/dashboard/AddVehicle";

// =====================================================
// ADMIN
// =====================================================

import AdminDashboard from "../pages/admin/Dashboard";
import AdminUsers from "../pages/admin/Users";
import AdminStations from "../pages/admin/Stations";
import AdminBookings from "../pages/admin/Bookings";

// =====================================================
// OWNER
// =====================================================

import OwnerDashboard from "../pages/owner/OwnerDashboard";
import AddStation from "../pages/owner/AddStation";
import MyStations from "../pages/owner/MyStations";
import EditStation from "../pages/owner/EditStation";

function AppRoutes() {
  return (
    <Routes>

      {/* =================================================
          HOME
      ================================================= */}

      <Route
        path="/"
        element={<HomePage />}
      />

      {/* =================================================
          AUTHENTICATION
      ================================================= */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* =================================================
          STATIONS
      ================================================= */}

      <Route
        path="/stations"
        element={<StationList />}
      />

      <Route
        path="/stations/:id"
        element={<StationDetails />}
      />

      {/* =================================================
          USER DASHBOARD
      ================================================= */}

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      {/* =================================================
          BOOKINGS
      ================================================= */}

      <Route
        path="/dashboard/bookings"
        element={<MyBookings />}
      />

      <Route
        path="/dashboard/bookings/:id"
        element={<BookingDetails />}
      />

      {/* =================================================
          FAVORITES
      ================================================= */}

      <Route
        path="/dashboard/favorites"
        element={<Favorites />}
      />

      {/* =================================================
          PROFILE
      ================================================= */}

      <Route
        path="/dashboard/profile"
        element={<Profile />}
      />

      {/* =================================================
          MY EV
      ================================================= */}

      <Route
        path="/dashboard/vehicle"
        element={<MyVehicle />}
      />

      {/* =================================================
          ADD EV
      ================================================= */}

      <Route
        path="/dashboard/vehicle/add"
        element={<AddVehicle />}
      />

      {/* =================================================
          OWNER
      ================================================= */}

      <Route
        path="/owner"
        element={<OwnerDashboard />}
      />

      <Route
        path="/owner/add-station"
        element={<AddStation />}
      />

      <Route
        path="/owner/my-stations"
        element={<MyStations />}
      />

      <Route
        path="/owner/edit/:id"
        element={<EditStation />}
      />

      {/* =================================================
          ADMIN
      ================================================= */}

      <Route
        path="/admin"
        element={<AdminDashboard />}
      />

      <Route
        path="/admin/users"
        element={<AdminUsers />}
      />

      <Route
        path="/admin/stations"
        element={<AdminStations />}
      />

      <Route
        path="/admin/bookings"
        element={<AdminBookings />}
      />

    </Routes>
  );
}

export default AppRoutes;