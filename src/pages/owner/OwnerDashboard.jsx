import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  FaBolt,
  FaChargingStation,
  FaPlus,
  FaEdit,
  FaTrash,
  FaPowerOff,
  FaMapMarkerAlt,
  FaRupeeSign,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

import api from "../../services/api";
import { getOwnerBookingStats } from "../../services/ownerService";

function OwnerDashboard() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // =====================================================
  // STATE
  // =====================================================

  const [stations, setStations] = useState([]);

  const [bookingStats, setBookingStats] = useState({
    total_bookings: 0,
    paid_bookings: 0,
    confirmed_bookings: 0,
    cancelled_bookings: 0,
    total_revenue: 0,
  });

  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD OWNER STATIONS
  // =====================================================

  const loadStations = async () => {
    try {
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get(
        "/stations/owner/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStations(response.data.data || []);
    } catch (error) {
      console.error(
        "Owner stations error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load your stations"
      );
    }
  };

  // =====================================================
  // LOAD OWNER BOOKING STATISTICS
  // =====================================================

  const loadBookingStats = async () => {
    try {
      if (!token) {
        navigate("/login");
        return;
      }

      const response =
        await getOwnerBookingStats(token);

      setBookingStats(
        response.data || {
          total_bookings: 0,
          paid_bookings: 0,
          confirmed_bookings: 0,
          cancelled_bookings: 0,
          total_revenue: 0,
        }
      );
    } catch (error) {
      console.error(
        "Booking statistics error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load booking statistics"
      );
    }
  };

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  const loadDashboard = async () => {
    setLoading(true);

    await Promise.all([
      loadStations(),
      loadBookingStats(),
    ]);

    setLoading(false);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // =====================================================
  // DELETE STATION
  // =====================================================

  const handleDelete = async (stationId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this charging station?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/stations/${stationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        "Station deleted successfully"
      );

      await loadStations();
    } catch (error) {
      console.error(
        "Delete station error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete station"
      );
    }
  };

  // =====================================================
  // TOGGLE AVAILABILITY
  // =====================================================

  const handleToggleAvailability = async (
    station
  ) => {
    try {
      await api.put(
        `/stations/${station.id}`,
        {
          name: station.name,
          location: station.location,
          charger: station.charger,
          power: station.power,
          price: station.price,
          image: station.image,
          available: !station.available,
          latitude: station.latitude,
          longitude: station.longitude,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        station.available
          ? "Station disabled"
          : "Station enabled"
      );

      await loadStations();
    } catch (error) {
      console.error(
        "Toggle availability error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update station"
      );
    }
  };

  // =====================================================
  // CALCULATE STATION STATISTICS
  // =====================================================

  const totalStations = stations.length;

  const activeStations = stations.filter(
    (station) => station.available
  ).length;

  const inactiveStations =
    totalStations - activeStations;

  const totalRevenue = Number(
    bookingStats.total_revenue || 0
  );

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">

        <div className="bg-white rounded-2xl shadow-lg p-10 text-center">

          <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-5"></div>

          <h2 className="text-xl font-bold text-gray-800">
            Loading Owner Dashboard...
          </h2>

          <p className="text-gray-500 mt-2">
            Fetching your stations and booking data.
          </p>

        </div>

      </div>
    );
  }

  // =====================================================
  // MAIN DASHBOARD
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">

      <div className="max-w-7xl mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

          <div>

            <p className="text-green-600 font-semibold mb-1">
              Owner Panel
            </p>

            <h1 className="text-4xl font-bold text-gray-900">
              Owner Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Manage your EV charging stations,
              bookings and revenue.
            </p>

          </div>

          <button
            onClick={() =>
              navigate("/owner/add-station")
            }
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold shadow-md transition"
          >
            <FaPlus />
            Add New Station
          </button>

        </div>

        {/* =================================================
            STATION + BOOKING STATISTICS
        ================================================= */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {/* TOTAL STATIONS */}

          <div className="bg-white rounded-2xl shadow-md p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-500">
                  Total Stations
                </p>

                <h2 className="text-3xl font-bold mt-2">
                  {totalStations}
                </h2>

              </div>

              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">

                <FaChargingStation className="text-blue-600 text-2xl" />

              </div>

            </div>

          </div>

          {/* ACTIVE STATIONS */}

          <div className="bg-white rounded-2xl shadow-md p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-500">
                  Active Stations
                </p>

                <h2 className="text-3xl font-bold mt-2 text-green-600">
                  {activeStations}
                </h2>

              </div>

              <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">

                <FaBolt className="text-green-600 text-2xl" />

              </div>

            </div>

          </div>

          {/* INACTIVE STATIONS */}

          <div className="bg-white rounded-2xl shadow-md p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-500">
                  Inactive Stations
                </p>

                <h2 className="text-3xl font-bold mt-2 text-red-500">
                  {inactiveStations}
                </h2>

              </div>

              <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center">

                <FaPowerOff className="text-red-500 text-2xl" />

              </div>

            </div>

          </div>

          {/* TOTAL BOOKINGS */}

          <div
            onClick={() =>
              navigate("/owner/bookings")
            }
            className="bg-white rounded-2xl shadow-md p-6 cursor-pointer hover:shadow-lg transition"
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-500">
                  Total Bookings
                </p>

                <h2 className="text-3xl font-bold mt-2 text-purple-600">
                  {bookingStats.total_bookings}
                </h2>

              </div>

              <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">

                <FaCalendarCheck className="text-purple-600 text-2xl" />

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            REVENUE / BOOKING STATISTICS
        ================================================= */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

          {/* TOTAL REVENUE */}

          <div className="bg-white rounded-2xl shadow-md p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-500">
                  Total Revenue
                </p>

                <h2 className="text-3xl font-bold text-green-600 mt-2">
                  ₹{totalRevenue.toFixed(2)}
                </h2>

                <p className="text-sm text-gray-400 mt-2">
                  From paid bookings
                </p>

              </div>

              <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">

                <FaMoneyBillWave className="text-green-600 text-2xl" />

              </div>

            </div>

          </div>

          {/* PAID BOOKINGS */}

          <div className="bg-white rounded-2xl shadow-md p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-500">
                  Paid Bookings
                </p>

                <h2 className="text-3xl font-bold text-blue-600 mt-2">
                  {bookingStats.paid_bookings}
                </h2>

                <p className="text-sm text-gray-400 mt-2">
                  Successfully paid
                </p>

              </div>

              <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">

                <FaCheckCircle className="text-blue-600 text-2xl" />

              </div>

            </div>

          </div>

          {/* CONFIRMED BOOKINGS */}

          <div className="bg-white rounded-2xl shadow-md p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-500">
                  Confirmed Bookings
                </p>

                <h2 className="text-3xl font-bold text-green-600 mt-2">
                  {bookingStats.confirmed_bookings}
                </h2>

                <p className="text-sm text-gray-400 mt-2">
                  Active reservations
                </p>

              </div>

              <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">

                <FaCalendarCheck className="text-green-600 text-2xl" />

              </div>

            </div>

          </div>

          {/* CANCELLED BOOKINGS */}

          <div className="bg-white rounded-2xl shadow-md p-6">

            <div className="flex items-center justify-between">

              <div>

                <p className="text-gray-500">
                  Cancelled Bookings
                </p>

                <h2 className="text-3xl font-bold text-red-500 mt-2">
                  {bookingStats.cancelled_bookings}
                </h2>

                <p className="text-sm text-gray-400 mt-2">
                  Cancelled reservations
                </p>

              </div>

              <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center">

                <FaTimesCircle className="text-red-500 text-2xl" />

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            OWNER MANAGEMENT
        ================================================= */}

        <div className="bg-white rounded-3xl shadow-md p-6 md:p-8 mb-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

            <div>

              <h2 className="text-2xl font-bold">
                Owner Management
              </h2>

              <p className="text-gray-500 mt-1">
                Manage your stations and monitor customer bookings.
              </p>

            </div>

            <div className="flex flex-wrap gap-3">

              <button
                onClick={() =>
                  navigate("/owner/my-stations")
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold"
              >
                My Stations
              </button>

              <button
                onClick={() =>
                  navigate("/owner/bookings")
                }
                className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-xl font-semibold"
              >
                View Bookings
              </button>

            </div>

          </div>

        </div>

        {/* =================================================
            MY CHARGING STATIONS
        ================================================= */}

        <div className="bg-white rounded-3xl shadow-md p-6 md:p-8">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">

            <div>

              <h2 className="text-2xl font-bold">
                My Charging Stations
              </h2>

              <p className="text-gray-500 mt-1">
                Stations owned and managed by you.
              </p>

            </div>

            <button
              onClick={() =>
                navigate("/owner/my-stations")
              }
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              View All →
            </button>

          </div>

          {/* =================================================
              NO STATIONS
          ================================================= */}

          {stations.length === 0 ? (

            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">

              <FaChargingStation className="mx-auto text-gray-400 text-5xl mb-4" />

              <h3 className="text-xl font-bold text-gray-700">
                No charging stations yet
              </h3>

              <p className="text-gray-500 mt-2 mb-6">
                Add your first charging station to start managing it.
              </p>

              <button
                onClick={() =>
                  navigate("/owner/add-station")
                }
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold"
              >
                Add Your First Station
              </button>

            </div>

          ) : (

            <div className="space-y-5">

              {stations
                .slice(0, 5)
                .map((station) => (

                  <div
                    key={station.id}
                    className="border rounded-2xl p-5 hover:shadow-md transition"
                  >

                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                      {/* STATION INFORMATION */}

                      <div className="flex items-start gap-4">

                        <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center shrink-0">

                          <FaChargingStation className="text-green-600 text-2xl" />

                        </div>

                        <div>

                          <div className="flex flex-wrap items-center gap-3">

                            <h3 className="text-xl font-bold">
                              {station.name}
                            </h3>

                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                station.available
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {station.available
                                ? "ACTIVE"
                                : "INACTIVE"}
                            </span>

                          </div>

                          <div className="flex items-center gap-2 text-gray-500 mt-2">

                            <FaMapMarkerAlt />

                            <span>
                              {station.location}
                            </span>

                          </div>

                          <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">

                            <span>
                              ⚡ {station.charger}
                            </span>

                            <span>
                              🔋 {station.power} kW
                            </span>

                            <span className="flex items-center gap-1">

                              <FaRupeeSign />

                              {station.price}/kWh

                            </span>

                          </div>

                        </div>

                      </div>

                      {/* ACTIONS */}

                      <div className="flex flex-wrap gap-2">

                        <button
                          onClick={() =>
                            handleToggleAvailability(
                              station
                            )
                          }
                          className={`px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-2 ${
                            station.available
                              ? "bg-orange-500 hover:bg-orange-600"
                              : "bg-green-600 hover:bg-green-700"
                          }`}
                        >

                          <FaPowerOff />

                          {station.available
                            ? "Disable"
                            : "Enable"}

                        </button>

                        <button
                          onClick={() =>
                            navigate(
                              `/owner/edit/${station.id}`
                            )
                          }
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                        >

                          <FaEdit />

                          Edit

                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              station.id
                            )
                          }
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                        >

                          <FaTrash />

                          Delete

                        </button>

                      </div>

                    </div>

                  </div>

                ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default OwnerDashboard;