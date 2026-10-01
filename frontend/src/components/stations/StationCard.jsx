import {
  FaMapMarkerAlt,
  FaBolt,
  FaHeart,
  FaStar,
} from "react-icons/fa";

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  addFavorite,
} from "../../services/favoriteService";

function StationCard({ station }) {

  // =====================================================
  // ADD FAVORITE
  // =====================================================

  const handleFavorite = async () => {
    try {
      const token =
        localStorage.getItem("token");

      const userId =
        localStorage.getItem("userId");

      // -----------------------------------------------
      // LOGIN CHECK
      // -----------------------------------------------

      if (!token || !userId) {
        toast.error(
          "Please login to add favorites."
        );

        return;
      }

      // -----------------------------------------------
      // ADD FAVORITE
      // -----------------------------------------------

      await addFavorite({
        user_id: Number(userId),
        station_id: Number(station.id),
      });

      toast.success(
        "Added to Favorites ❤️"
      );

    } catch (error) {
      console.error(
        "Favorite error:",
        error
      );

      console.error(
        "Server response:",
        error.response?.data
      );

      // -----------------------------------------------
      // DUPLICATE FAVORITE
      // -----------------------------------------------

      if (
        error.response?.status === 409
      ) {
        toast.error(
          "Already in Favorites ❤️"
        );

        return;
      }

      toast.error(
        error.response?.data?.message ||
          "Unable to add favorite."
      );
    }
  };

  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.02,
      }}
      transition={{
        duration: 0.3,
      }}
      className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow"
    >

      {/* =================================================
          IMAGE
      ================================================= */}

      <div className="relative">

        <img
          src={station.image}
          alt={station.name}
          className="w-full h-56 object-cover"
        />

        {/* =================================================
            FAVORITE BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={handleFavorite}
          className="absolute top-4 left-4 bg-white p-3 rounded-full shadow hover:bg-red-50 transition"
          title="Add to Favorites"
        >
          <FaHeart className="text-gray-400 text-xl hover:text-red-500 transition" />
        </button>

        {/* =================================================
            AVAILABILITY
        ================================================= */}

        <span
          className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-semibold ${
            station.available
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {station.available
            ? "Available"
            : "Busy"}
        </span>

      </div>

      {/* =================================================
          CONTENT
      ================================================= */}

      <div className="p-6">

        {/* STATION NAME */}

        <h2 className="text-2xl font-bold text-gray-900">
          {station.name}
        </h2>

        {/* LOCATION */}

        <div className="flex items-center gap-2 mt-4 text-gray-600">

          <FaMapMarkerAlt className="text-green-600 flex-shrink-0" />

          <span>
            {station.location ||
              station.address ||
              "Location unavailable"}
          </span>

        </div>

        {/* RATING */}

        <div className="flex items-center gap-2 mt-3">

          <FaStar className="text-yellow-400" />

          <span className="font-semibold">
            {station.rating || 0}
          </span>

          <span className="text-gray-500">
            ({station.reviews || 0} reviews)
          </span>

        </div>

        {/* CHARGER */}

        <div className="flex items-center gap-2 mt-3 text-gray-600">

          <FaBolt className="text-green-600 flex-shrink-0" />

          <span>
            {station.charger ||
              station.charger_type ||
              "EV Charger"}

            {station.power
              ? ` • ${station.power} kW`
              : ""}
          </span>

        </div>

        {/* PRICE */}

        <div className="mt-6">

          <p className="text-gray-500 text-sm">
            Charging Price
          </p>

          <h3 className="text-2xl font-bold text-green-600">
            ₹{station.price || 0}
            <span className="text-sm font-normal text-gray-500">
              {" "}
              /kWh
            </span>
          </h3>

        </div>

        {/* BUTTON */}

        <Link
          to={`/stations/${station.id}`}
          className="block text-center mt-6 bg-green-600 text-white px-5 py-3 rounded-xl hover:bg-green-700 transition font-semibold"
        >
          View & Book
        </Link>

      </div>

    </motion.div>
  );
}

export default StationCard;