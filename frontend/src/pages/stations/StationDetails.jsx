import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaBolt,
  FaStar,
  FaClock,
} from "react-icons/fa";

import api from "../../services/api";
import BookingForm from "../../components/booking/BookingForm";

function StationDetails() {
  const { id } = useParams();

  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);

  const slots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "02:00 PM",
    "03:00 PM",
  ];

  // ==========================================
  // Load Station
  // ==========================================
  useEffect(() => {
    loadStation();
  }, [id]);

  const loadStation = async () => {
    try {
      const res = await api.get(`/stations/${id}`);

      // Your backend returns:
      // { success: true, data: station }

      setStation(res.data.data);
    } catch (err) {
      console.error("Failed to load station:", err);
      setStation(null);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Loading
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl font-semibold">
          Loading Station...
        </p>
      </div>
    );
  }

  // ==========================================
  // Station Not Found
  // ==========================================
  if (!station) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl font-bold text-red-600">
          Station Not Found
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* ========================================
          STATION INFORMATION
      ======================================== */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden">

        {/* Station Image */}
        <img
          src={station.image}
          alt={station.name}
          className="w-full h-96 object-cover"
        />

        <div className="p-8">

          {/* Station Name */}
          <h1 className="text-4xl font-bold">
            {station.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-4 text-yellow-500">
            <FaStar />

            <span>
              {station.rating || 0}
            </span>

            <span className="text-gray-500">
              ({station.reviews || 0} Reviews)
            </span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 mt-4 text-gray-600">
            <FaMapMarkerAlt className="text-red-500" />

            <span>
              {station.location}
            </span>
          </div>

          {/* Charger */}
          <div className="flex items-center gap-2 mt-3 text-gray-600">
            <FaBolt className="text-green-600" />

            <span>
              {station.charger} • {station.power} kW
            </span>
          </div>

          {/* Price + Status */}
          <div className="mt-6 flex flex-wrap gap-10">

            {/* Price */}
            <div>
              <p className="text-gray-500">
                Price
              </p>

              <h2 className="text-3xl font-bold text-green-600">
                ₹{station.price}

                <span className="text-base text-gray-500">
                  {" "}
                  /kWh
                </span>
              </h2>
            </div>

            {/* Availability */}
            <div>
              <p className="text-gray-500 mb-2">
                Status
              </p>

              <span
                className={`inline-block px-4 py-2 rounded-full font-semibold ${
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

          </div>

        </div>
      </div>

      {/* ========================================
          AVAILABLE SLOTS
      ======================================== */}
      <div className="bg-white rounded-3xl shadow-lg p-8 mt-8">

        <h2 className="text-2xl font-bold mb-6">
          <FaClock className="inline mr-2 text-green-600" />

          Available Slots
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">

          {slots.map((slot) => (
            <button
              key={slot}
              type="button"
              className="border border-green-600 py-3 rounded-xl hover:bg-green-600 hover:text-white transition"
            >
              {slot}
            </button>
          ))}

        </div>
      </div>

      {/* ========================================
          STATION LOCATION
      ======================================== */}
      <div className="bg-white rounded-3xl shadow-lg p-8 mt-8">

        <h2 className="text-2xl font-bold mb-5">
          Station Location
        </h2>

        <div className="h-96 rounded-xl bg-gray-200 flex items-center justify-center">
          <p className="text-gray-500">
            OpenStreetMap Coming Soon
          </p>
        </div>

      </div>

      {/* ========================================
          BOOKING + RAZORPAY
      ======================================== */}
      <div className="mt-8">

        <BookingForm
          stationId={station.id}
          stationPrice={station.price}
        />

      </div>

    </div>
  );
}

export default StationDetails;