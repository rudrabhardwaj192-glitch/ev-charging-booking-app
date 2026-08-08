import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  FaMapMarkerAlt,
  FaBolt,
  FaStar,
} from "react-icons/fa";

import api from "../../services/api";

import DashboardLayout from "../../components/layout/DashboardLayout";
import BookingCalendar from "../../components/booking/BookingCalendar";
import StationMap from "../../components/map/StationMap";

function StationDetails() {
  const { id } = useParams();

  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD STATION
  // ==========================================
  useEffect(() => {
    loadStation();
  }, [id]);

  const loadStation = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/stations/${id}`
      );

      /*
       * Your backend returns:
       *
       * {
       *   success: true,
       *   data: {...}
       * }
       *
       * So use response.data.data.
       *
       * The fallback keeps this compatible if
       * another response format is returned.
       */
      const stationData =
        response.data?.data ||
        response.data;

      setStation(stationData);

    } catch (error) {
      console.error(
        "Failed to load station:",
        error
      );

      setStation(null);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <p className="text-xl text-gray-500">
            Loading Station...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // ==========================================
  // NOT FOUND
  // ==========================================
  if (!station) {
    return (
      <DashboardLayout>
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">

            <h1 className="text-3xl font-bold">
              Station Not Found
            </h1>

            <p className="text-gray-500 mt-2">
              The charging station could not be found.
            </p>

          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      <div className="space-y-8">

        {/* ======================================
            STATION INFORMATION
        ====================================== */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">

          {/* Station Image */}
          {station.image ? (
            <img
              src={station.image}
              alt={station.name}
              className="w-full h-96 object-cover"
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">
                No Station Image
              </span>
            </div>
          )}

          {/* Information */}
          <div className="p-8">

            {/* Name */}
            <h1 className="text-4xl font-bold">
              {station.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-4">

              <FaStar className="text-yellow-500" />

              <span className="font-semibold">
                {station.rating || 0}
              </span>

              <span className="text-gray-500">
                ({station.reviews || 0} Reviews)
              </span>

            </div>

            {/* Location */}
            <div className="flex items-center gap-2 mt-5 text-gray-600">

              <FaMapMarkerAlt className="text-red-500" />

              <span>
                {station.location}
              </span>

            </div>

            {/* Charger */}
            <div className="flex items-center gap-2 mt-3 text-gray-600">

              <FaBolt className="text-green-600" />

              <span>
                {station.charger}
              </span>

              <span>•</span>

              <span>
                {station.power} kW
              </span>

            </div>

            {/* Price + Status */}
            <div className="mt-8 flex flex-wrap gap-10">

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

              {/* Status */}
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

        {/* ======================================
            BOOKING CALENDAR
        ====================================== */}
        <BookingCalendar
          stationId={station.id}
        />

        {/* ======================================
            STATION LOCATION
        ====================================== */}
        <div className="bg-white rounded-3xl shadow-lg p-8">

          <h2 className="text-2xl font-bold mb-5">
            Station Location
          </h2>

          {station.latitude &&
          station.longitude ? (
            <StationMap
              stations={[station]}
            />
          ) : (
            <div className="h-96 rounded-xl bg-gray-200 flex items-center justify-center">

              <div className="text-center">

                <FaMapMarkerAlt className="text-4xl text-red-500 mx-auto mb-3" />

                <p className="text-gray-500">
                  Location coordinates are not
                  available for this station.
                </p>

              </div>

            </div>
          )}

        </div>

        {/* ======================================
            STATION DETAILS
        ====================================== */}
        <div className="bg-white rounded-3xl shadow-lg p-8">

          <h2 className="text-2xl font-bold mb-6">
            Station Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            <div className="border rounded-xl p-4">
              <p className="text-gray-500">
                Charger Type
              </p>

              <p className="font-semibold mt-1">
                {station.charger}
              </p>
            </div>

            <div className="border rounded-xl p-4">
              <p className="text-gray-500">
                Charging Power
              </p>

              <p className="font-semibold mt-1">
                {station.power} kW
              </p>
            </div>

            <div className="border rounded-xl p-4">
              <p className="text-gray-500">
                Price
              </p>

              <p className="font-semibold mt-1">
                ₹{station.price} /kWh
              </p>
            </div>

            <div className="border rounded-xl p-4">
              <p className="text-gray-500">
                Availability
              </p>

              <p
                className={`font-semibold mt-1 ${
                  station.available
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {station.available
                  ? "Available Now"
                  : "Currently Busy"}
              </p>
            </div>

          </div>

        </div>

      </div>

    </DashboardLayout>
  );
}

export default StationDetails;