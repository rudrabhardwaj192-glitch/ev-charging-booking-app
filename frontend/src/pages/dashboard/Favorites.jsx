import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  FaHeart,
  FaMapMarkerAlt,
  FaBolt,
  FaStar,
  FaRupeeSign,
  FaChargingStation,
  FaTrash,
} from "react-icons/fa";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  getFavorites,
  removeFavorite,
} from "../../services/favoriteService";

function Favorites() {
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  // =====================================================
  // GET CURRENT USER
  // =====================================================

  const getCurrentUser = () => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "null"
      );
    } catch (error) {
      console.error(
        "Unable to read user:",
        error
      );

      return null;
    }
  };

  // =====================================================
  // LOAD FAVORITES
  // =====================================================

  const loadFavorites = async () => {
    const token =
      localStorage.getItem("token");

    const user = getCurrentUser();

    if (!token || !user?.id) {
      toast.error(
        "Please login to view favorites."
      );

      navigate("/login");
      return;
    }

    try {
      setLoading(true);

      const response =
        await getFavorites(user.id);

      setFavorites(
        response?.data || []
      );
    } catch (error) {
      console.error(
        "Favorites loading error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to load favorites."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD ON PAGE OPEN
  // =====================================================

  useEffect(() => {
    loadFavorites();
  }, []);

  // =====================================================
  // REMOVE FAVORITE
  // =====================================================

  const handleRemove = async (
    stationId
  ) => {
    const user = getCurrentUser();

    if (!user?.id) {
      toast.error(
        "Please login again."
      );

      navigate("/login");
      return;
    }

    try {
      setRemovingId(stationId);

      await removeFavorite({
        user_id: user.id,
        station_id: stationId,
      });

      setFavorites((previous) =>
        previous.filter(
          (station) =>
            Number(station.station_id) !==
            Number(stationId)
        )
      );

      toast.success(
        "Removed from Favorites."
      );
    } catch (error) {
      console.error(
        "Remove favorite error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to remove favorite."
      );
    } finally {
      setRemovingId(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[500px] flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4"></div>

            <p className="text-gray-500">
              Loading your favorites...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <DashboardLayout>
      <div className="space-y-8">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center">
                <FaHeart className="text-red-500 text-xl" />
              </div>

              <div>
                <h1 className="text-4xl font-bold text-gray-900">
                  My Favorites
                </h1>

                <p className="text-gray-500 mt-1">
                  Charging stations you saved.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() =>
              navigate("/stations")
            }
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition"
          >
            Find Charging Stations
          </button>

        </div>

        {/* =================================================
            COUNT
        ================================================= */}

        {favorites.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
            <p className="text-gray-500">
              You have{" "}
              <span className="font-bold text-gray-900">
                {favorites.length}
              </span>{" "}
              favorite charging station
              {favorites.length !== 1
                ? "s"
                : ""}.
            </p>
          </div>
        )}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {favorites.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-14 text-center">

            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaHeart className="text-red-400 text-4xl" />
            </div>

            <h2 className="text-2xl font-bold text-gray-900">
              No Favorite Stations
            </h2>

            <p className="text-gray-500 mt-2 max-w-md mx-auto">
              You haven't saved any charging
              stations yet. Add stations to
              favorites so you can find them
              quickly later.
            </p>

            <button
              onClick={() =>
                navigate("/stations")
              }
              className="mt-7 bg-green-600 hover:bg-green-700 text-white px-7 py-3 rounded-xl font-bold transition"
            >
              Explore Charging Stations
            </button>

          </div>
        ) : (

          /* =================================================
             FAVORITES GRID
          ================================================= */

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {favorites.map((station) => (

              <div
                key={station.id}
                className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition"
              >

                {/* =================================================
                    TOP
                ================================================= */}

                <div className="relative h-32 bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">

                  <FaChargingStation className="text-green-500 text-6xl opacity-80" />

                  {/* Favorite */}
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full shadow flex items-center justify-center">
                    <FaHeart className="text-red-500" />
                  </div>

                </div>

                {/* =================================================
                    CONTENT
                ================================================= */}

                <div className="p-6">

                  {/* Station Name */}

                  <h2 className="text-xl font-bold text-gray-900 line-clamp-1">
                    {station.name}
                  </h2>

                  {/* Location */}

                  <div className="flex items-start gap-2 mt-3 text-gray-500">

                    <FaMapMarkerAlt className="text-green-600 mt-1 shrink-0" />

                    <span className="text-sm line-clamp-2">
                      {station.location ||
                        station.address ||
                        "Location unavailable"}
                    </span>

                  </div>

                  {/* Rating */}

                  {station.rating !==
                    undefined && (
                    <div className="flex items-center gap-2 mt-3">

                      <FaStar className="text-yellow-400" />

                      <span className="font-bold">
                        {Number(
                          station.rating || 0
                        ).toFixed(1)}
                      </span>

                      {station.reviews !==
                        undefined && (
                        <span className="text-sm text-gray-400">
                          (
                          {
                            station.reviews
                          }{" "}
                          reviews)
                        </span>
                      )}

                    </div>
                  )}

                  {/* Charger */}

                  <div className="flex items-center gap-2 mt-4 text-gray-600">

                    <FaBolt className="text-green-600" />

                    <span className="text-sm font-medium">
                      {station.charger ||
                        station.charger_type ||
                        "EV Charger"}
                    </span>

                    {station.power && (
                      <>
                        <span className="text-gray-300">
                          •
                        </span>

                        <span className="text-sm">
                          {station.power} kW
                        </span>
                      </>
                    )}

                  </div>

                  {/* Price */}

                  {station.price && (
                    <div className="flex items-center gap-1 mt-4">

                      <FaRupeeSign className="text-green-600" />

                      <span className="text-xl font-bold text-green-600">
                        {station.price}
                      </span>

                      <span className="text-sm text-gray-500">
                        /kWh
                      </span>

                    </div>
                  )}

                  {/* =================================================
                      BUTTONS
                  ================================================= */}

                  <div className="grid grid-cols-2 gap-3 mt-6">

                    {/* View */}

                    <button
                      onClick={() =>
                        navigate(
                          `/stations/${station.station_id}`
                        )
                      }
                      className="bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition"
                    >
                      View & Book
                    </button>

                    {/* Remove */}

                    <button
                      onClick={() =>
                        handleRemove(
                          station.station_id
                        )
                      }
                      disabled={
                        Number(
                          removingId
                        ) ===
                        Number(
                          station.station_id
                        )
                      }
                      className={`py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 ${
                        Number(
                          removingId
                        ) ===
                        Number(
                          station.station_id
                        )
                          ? "bg-gray-200 text-gray-400"
                          : "bg-red-50 text-red-600 hover:bg-red-100"
                      }`}
                    >
                      <FaTrash />

                      {Number(
                        removingId
                      ) ===
                      Number(
                        station.station_id
                      )
                        ? "Removing..."
                        : "Remove"}
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default Favorites;