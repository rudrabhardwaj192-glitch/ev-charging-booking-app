import { Routes, Route } from "react-router-dom";

// Home
import HomePage from "../pages/home/HomePage";

// Authentication
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Stations
import StationList from "../pages/stations/StationList";
import StationDetails from "../pages/stations/StationDetails";

// User Dashboard
import Dashboard from "../pages/dashboard/Dashboard";
import MyBookings from "../pages/dashboard/MyBookings";
import Favorites from "../pages/dashboard/Favorites";
import Profile from "../pages/dashboard/Profile";

// Admin
import AdminDashboard from "../pages/admin/Dashboard";
import AdminUsers from "../pages/admin/Users";
import AdminStations from "../pages/admin/Stations";
import AdminBookings from "../pages/admin/Bookings";

// Owner
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import AddStation from "../pages/owner/AddStation";
import MyStations from "../pages/owner/MyStations";
import EditStation from "../pages/owner/EditStation";

function AppRoutes() {
  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<HomePage />} />

      {/* Authentication */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Stations */}
      <Route path="/stations" element={<StationList />} />
      <Route path="/stations/:id" element={<StationDetails />} />

      {/* User Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/bookings" element={<MyBookings />} />
      <Route path="/dashboard/favorites" element={<Favorites />} />
      <Route path="/dashboard/profile" element={<Profile />} />

      {/* Owner */}
      <Route path="/owner" element={<OwnerDashboard />} />
      <Route path="/owner/add-station" element={<AddStation />} />
      <Route path="/owner/my-stations" element={<MyStations />} />
      <Route path="/owner/edit/:id" element={<EditStation />} />

      {/* Admin */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/stations" element={<AdminStations />} />
      <Route path="/admin/bookings" element={<AdminBookings />} />
    </Routes>
  );
}

export default AppRoutes;