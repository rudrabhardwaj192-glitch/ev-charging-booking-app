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
  removeFavorite,
} from "../../services/favoriteService";

function StationCard({ station }) {
  const handleFavorite = async () => {
    try {
      await addFavorite({
        user_id: 1, // Temporary (JWT later)
        station_id: station.id,
      });

      toast.success("Added to Favorites ❤️");
    } catch (err) {
      console.log(err);

      toast.error("Already in Favorites");
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl"
    >
      <div className="relative">
        <img
          src={station.image}
          alt={station.name}
          className="w-full h-56 object-cover"
        />

        <button
          onClick={handleFavorite}
          className="absolute top-4 right-4 bg-white p-3 rounded-full shadow hover:bg-red-50"
        >
          <FaHeart className="text-red-500 text-xl" />
        </button>

        <span
          className={`absolute bottom-4 left-4 px-4 py-2 rounded-full text-sm font-semibold ${
            station.available
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {station.available ? "Available" : "Busy"}
        </span>
      </div>

      <div className="p-6">

        <h2 className="text-2xl font-bold">
          {station.name}
        </h2>

        <div className="flex items-center gap-2 mt-3">
          <FaStar className="text-yellow-400" />

          <span>{station.rating}</span>

          <span className="text-gray-500">
            ({station.reviews})
          </span>
        </div>

        <div className="flex items-center gap-2 mt-4 text-gray-600">
          <FaMapMarkerAlt className="text-red-500" />
          {station.location}
        </div>

        <div className="flex items-center gap-2 mt-3 text-gray-600">
          <FaBolt className="text-green-600" />
          {station.charger} • {station.power} kW
        </div>

        <div className="flex justify-between items-center mt-6">

          <div>
            <p className="text-gray-500 text-sm">
              Price
            </p>

            <h3 className="text-2xl font-bold text-green-600">
              ₹{station.price}
            </h3>
          </div>

          <Link
            to={`/stations/${station.id}`}
            className="bg-green-600 text-white px-5 py-3 rounded-xl hover:bg-green-700"
          >
            View Details
          </Link>

        </div>

      </div>
    </motion.div>
  );
}

export default StationCard;