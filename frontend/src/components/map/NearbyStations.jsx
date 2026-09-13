import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaLocationArrow,
  FaMapMarkerAlt,
  FaBolt,
  FaRupeeSign,
  FaStar,
  FaChargingStation,
  FaRoute,
  FaExclamationTriangle,
} from "react-icons/fa";

// =====================================================
// CALCULATE DISTANCE
// Haversine Formula
// =====================================================

function calculateDistance(
  lat1,
  lon1,
  lat2,
  lon2
) {
  const R = 6371;

  const dLat =
    ((lat2 - lat1) * Math.PI) / 180;

  const dLon =
    ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) *
      Math.sin(dLat / 2) +
    Math.cos(
      (lat1 * Math.PI) / 180
    ) *
      Math.cos(
        (lat2 * Math.PI) / 180
      ) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c =
    2 *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );

  return R * c;
}

// =====================================================
// COMPONENT
// =====================================================

function NearbyStations({
  stations = [],
}) {
  const navigate = useNavigate();

  const [location, setLocation] =
    useState(null);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [locationError, setLocationError] =
    useState("");

  const [radius, setRadius] =
    useState(25);

  // =====================================================
  // GET USER LOCATION
  // =====================================================

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError(
        "Your browser does not support location services."
      );

      return;
    }

    setLocationLoading(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude:
            position.coords.latitude,

          longitude:
            position.coords.longitude,
        });

        setLocationLoading(false);
      },

      (error) => {
        console.error(
          "Location error:",
          error
        );

        let message =
          "Unable to get your location.";

        if (
          error.code ===
          error.PERMISSION_DENIED
        ) {
          message =
            "Location permission was denied. Please allow location access.";
        }

        if (
          error.code ===
          error.POSITION_UNAVAILABLE
        ) {
          message =
            "Your location is currently unavailable.";
        }

        if (
          error.code ===
          error.TIMEOUT
        ) {
          message =
            "Location request timed out.";
        }

        setLocationError(message);
        setLocationLoading(false);
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  };

  // =====================================================
  // AUTOMATIC LOCATION REQUEST
  // =====================================================

  useEffect(() => {
    getUserLocation();
  }, []);

  // =====================================================
  // ALL STATIONS WITH DISTANCE
  // =====================================================

  const stationsWithDistance = useMemo(() => {
    if (!location) {
      return [];
    }

    return stations
      .filter(
        (station) =>
          station.latitude !== null &&
          station.latitude !== undefined &&
          station.longitude !== null &&
          station.longitude !== undefined &&
          Number.isFinite(
            Number(station.latitude)
          ) &&
          Number.isFinite(
            Number(station.longitude)
          )
      )
      .map((station) => {
        const distance =
          calculateDistance(
            location.latitude,
            location.longitude,
            Number(station.latitude),
            Number(station.longitude)
          );

        return {
          ...station,
          distance,
        };
      })
      .sort(
        (a, b) =>
          a.distance - b.distance
      );
  }, [stations, location]);

  // =====================================================
  // STATIONS INSIDE SELECTED RADIUS
  // =====================================================

  const nearbyStations = useMemo(() => {
    return stationsWithDistance.filter(
      (station) =>
        station.distance <= radius
    );
  }, [
    stationsWithDistance,
    radius,
  ]);

  // =====================================================
  // NEAREST STATION
  // Used as fallback when radius has no result
  // =====================================================

  const nearestStation =
    stationsWithDistance.length > 0
      ? stationsWithDistance[0]
      : null;

  // =====================================================
  // GOOGLE MAPS DIRECTIONS
  // =====================================================

  const openNavigation = (
    station
  ) => {
    if (
      station.latitude === null ||
      station.longitude === null ||
      station.latitude === undefined ||
      station.longitude === undefined
    ) {
      return;
    }

    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&destination=${station.latitude},${station.longitude}`;

    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // =====================================================
  // FORMAT DISTANCE
  // =====================================================

  const formatDistance = (
    distance
  ) => {
    if (distance < 1) {
      return `${Math.round(
        distance * 1000
      )} m`;
    }

    return `${distance.toFixed(1)} km`;
  };

  // =====================================================
  // STATION CARD
  // =====================================================

  const StationCard = ({
    station,
    fallback = false,
  }) => {
    return (
      <div
        className={`border rounded-2xl p-5 transition ${
          fallback
            ? "border-orange-200 bg-orange-50"
            : "border-gray-200 bg-white hover:shadow-md"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

          {/* =================================================
              STATION INFORMATION
          ================================================= */}

          <div className="flex gap-4">

            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${
                station.available
                  ? "bg-green-100"
                  : "bg-red-100"
              }`}
            >
              <FaChargingStation
                className={`text-2xl ${
                  station.available
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              />
            </div>

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <h4 className="text-xl font-bold text-gray-900">
                  {station.name}
                </h4>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    station.available
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {station.available
                    ? "Available"
                    : "Unavailable"}
                </span>

              </div>

              {/* LOCATION */}

              <div className="flex items-center gap-2 text-gray-500 mt-2">

                <FaMapMarkerAlt className="text-red-500" />

                <span>
                  {station.location}
                </span>

              </div>

              {/* DETAILS */}

              <div className="flex flex-wrap items-center gap-4 mt-3">

                {/* DISTANCE */}

                <span className="flex items-center gap-1.5 font-bold text-blue-600">

                  <FaLocationArrow />

                  {formatDistance(
                    station.distance
                  )}

                </span>

                {/* POWER */}

                <span className="flex items-center gap-1.5 text-gray-600">

                  <FaBolt className="text-yellow-500" />

                  {station.power} kW

                </span>

                {/* CHARGER */}

                <span className="text-gray-600">
                  {station.charger}
                </span>

                {/* PRICE */}

                <span className="flex items-center gap-1 text-green-600 font-semibold">

                  <FaRupeeSign />

                  {station.price}/kWh

                </span>

                {/* RATING */}

                <span className="flex items-center gap-1 text-yellow-500">

                  <FaStar />

                  {Number(
                    station.rating || 0
                  ).toFixed(1)}

                </span>

              </div>

            </div>

          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="flex flex-col sm:flex-row gap-3 lg:min-w-[300px]">

            <button
              type="button"
              onClick={() =>
                openNavigation(
                  station
                )
              }
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition"
            >
              <FaRoute />
              Directions
            </button>

            <button
              type="button"
              disabled={
                !station.available
              }
              onClick={() =>
                navigate(
                  `/stations/${station.id}`
                )
              }
              className={`flex-1 px-5 py-3 rounded-xl font-bold transition ${
                station.available
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              {station.available
                ? "View & Book"
                : "Unavailable"}
            </button>

          </div>

        </div>
      </div>
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        <div>

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">

              <FaLocationArrow className="text-green-600 text-xl" />

            </div>

            <div>

              <h2 className="text-2xl font-bold text-gray-900">
                Charging Stations Near You
              </h2>

              <p className="text-gray-500 mt-1">
                Find the closest EV charging station.
              </p>

            </div>

          </div>

        </div>

        {/* =================================================
            CONTROLS
        ================================================= */}

        <div className="flex flex-col sm:flex-row gap-3">

          <select
            value={radius}
            onChange={(e) =>
              setRadius(
                Number(e.target.value)
              )
            }
            className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="5">
              Within 5 km
            </option>

            <option value="10">
              Within 10 km
            </option>

            <option value="25">
              Within 25 km
            </option>

            <option value="50">
              Within 50 km
            </option>

            <option value="100">
              Within 100 km
            </option>
          </select>

          <button
            type="button"
            onClick={getUserLocation}
            disabled={locationLoading}
            className={`px-5 py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition ${
              locationLoading
                ? "bg-gray-400"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            <FaLocationArrow />

            {locationLoading
              ? "Finding..."
              : "Use My Location"}
          </button>

        </div>

      </div>

      {/* =================================================
          LOCATION ERROR
      ================================================= */}

      {locationError && (
        <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4">

          <p className="text-red-600 font-semibold">
            {locationError}
          </p>

          <button
            type="button"
            onClick={getUserLocation}
            className="mt-3 text-sm font-bold text-red-700 underline"
          >
            Try Again
          </button>

        </div>
      )}

      {/* =================================================
          LOCATION DETECTED
      ================================================= */}

      {location && (
        <div className="mt-6">

          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

            <div className="flex items-center gap-2">

              <FaLocationArrow className="text-green-600" />

              <span className="text-green-800 font-semibold">
                Your location detected
              </span>

            </div>

            <span className="text-sm text-green-700">
              Searching within {radius} km
            </span>

          </div>

          {/* =================================================
              STATIONS FOUND
          ================================================= */}

          {nearbyStations.length > 0 && (

            <div className="mt-6 space-y-4">

              <div className="flex items-center justify-between">

                <h3 className="text-lg font-bold text-gray-800">
                  {nearbyStations.length} Station
                  {nearbyStations.length !== 1
                    ? "s"
                    : ""}{" "}
                  Nearby
                </h3>

                <span className="text-sm text-gray-500">
                  Nearest first
                </span>

              </div>

              {nearbyStations.map(
                (station) => (
                  <StationCard
                    key={station.id}
                    station={station}
                  />
                )
              )}

            </div>
          )}

          {/* =================================================
              NO STATIONS IN RADIUS
          ================================================= */}

          {nearbyStations.length === 0 &&
            nearestStation && (

              <div className="mt-6">

                {/* WARNING */}

                <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">

                  <div className="flex items-start gap-3">

                    <FaExclamationTriangle className="text-orange-500 text-xl mt-1" />

                    <div>

                      <h3 className="font-bold text-orange-800">
                        No stations within {radius} km
                      </h3>

                      <p className="text-orange-700 mt-1">
                        We found the nearest available station instead.
                      </p>

                    </div>

                  </div>

                </div>

                {/* NEAREST */}

                <div className="mt-4">

                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    Nearest Charging Station
                  </h3>

                  <StationCard
                    station={
                      nearestStation
                    }
                    fallback
                  />

                </div>

                {/* QUICK RADIUS */}

                <div className="mt-4 flex flex-wrap gap-2">

                  <span className="text-sm text-gray-500 mr-2 py-2">
                    Search farther:
                  </span>

                  {[25, 50, 100]
                    .filter(
                      (value) =>
                        value !== radius
                    )
                    .map(
                      (value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setRadius(
                              value
                            )
                          }
                          className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-semibold"
                        >
                          Within {value} km
                        </button>
                      )
                    )}

                </div>

              </div>
            )}

          {/* =================================================
              NO COORDINATE DATA
          ================================================= */}

          {stationsWithDistance.length ===
            0 && (

            <div className="mt-6 bg-gray-50 rounded-xl p-10 text-center">

              <FaChargingStation className="text-gray-300 text-5xl mx-auto mb-4" />

              <h3 className="text-xl font-bold text-gray-700">
                No station location data available
              </h3>

              <p className="text-gray-500 mt-2">
                Charging stations need latitude and longitude coordinates.
              </p>

            </div>

          )}

        </div>
      )}

    </section>
  );
}

export default NearbyStations;