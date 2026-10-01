import { useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {
  FaBolt,
  FaMapMarkerAlt,
  FaStar,
  FaRupeeSign,
  FaChargingStation,
  FaHeart,
  FaRoute,
  FaGlobe,
} from "react-icons/fa";

import toast from "react-hot-toast";

import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../../services/favoriteService";

// ======================================================
// STATION GRID
// ======================================================
//
// Receives stations from StationList.
//
// Supports:
//
// - PostgreSQL stations
// - Real external OSM stations
//
// External stations:
// - cannot be favorited
// - cannot be booked
// - don't show fake pricing
// - don't show fake availability
//
// ======================================================

function StationGrid({
  stations = [],
  loading = false,
  search,
  filter,
  advancedFilters,
}) {
  const navigate =
    useNavigate();

  // ====================================================
  // FAVORITES
  // ====================================================

  const [favoriteIds, setFavoriteIds] =
    useState([]);

  const [favoriteLoading, setFavoriteLoading] =
    useState(null);

  // ====================================================
  // GET USER
  // ====================================================

  const getCurrentUser = () => {
    try {
      return JSON.parse(
        localStorage.getItem(
          "user"
        ) || "null"
      );
    } catch (error) {
      console.error(
        "Unable to read user:",
        error
      );

      return null;
    }
  };

  // ====================================================
  // LOAD FAVORITES
  // ====================================================
  //
  // Only database stations can be favorites.
  //
  // ====================================================

  const loadFavorites =
    async () => {
      const token =
        localStorage.getItem(
          "token"
        );

      const user =
        getCurrentUser();

      if (
        !token ||
        !user?.id
      ) {
        setFavoriteIds([]);
        return;
      }

      try {
        const response =
          await getFavorites(
            user.id
          );

        const favorites =
          response?.data ||
          [];

        const ids =
          favorites.map(
            (favorite) =>
              Number(
                favorite.station_id
              )
          );

        setFavoriteIds(
          ids
        );
      } catch (error) {
        console.error(
          "Favorite loading error:",
          error
        );
      }
    };

  // ====================================================
  // TOGGLE FAVORITE
  // ====================================================

  const handleFavorite =
    async (
      station
    ) => {
      // External stations cannot
      // be stored in our favorites
      if (
        station.is_external
      ) {
        toast(
          "External stations cannot be added to application favorites yet."
        );

        return;
      }

      const token =
        localStorage.getItem(
          "token"
        );

      const user =
        getCurrentUser();

      if (
        !token ||
        !user?.id
      ) {
        toast.error(
          "Please login to save favorites."
        );

        navigate(
          "/login"
        );

        return;
      }

      try {
        setFavoriteLoading(
          station.id
        );

        const isFavorite =
          favoriteIds.includes(
            Number(
              station.id
            )
          );

        if (isFavorite) {
          await removeFavorite(
            {
              user_id:
                user.id,

              station_id:
                station.id,
            }
          );

          setFavoriteIds(
            (previous) =>
              previous.filter(
                (id) =>
                  Number(id) !==
                  Number(
                    station.id
                  )
              )
          );

          toast.success(
            "Removed from Favorites."
          );
        } else {
          await addFavorite(
            {
              user_id:
                user.id,

              station_id:
                station.id,
            }
          );

          setFavoriteIds(
            (previous) => [
              ...previous,
              Number(
                station.id
              ),
            ]
          );

          toast.success(
            "Added to Favorites."
          );
        }
      } catch (error) {
        console.error(
          "Favorite error:",
          error
        );

        toast.error(
          error.response
            ?.data?.message ||
            "Unable to update favorite."
        );
      } finally {
        setFavoriteLoading(
          null
        );
      }
    };

  // ====================================================
  // LOAD FAVORITES ONCE
  // ====================================================

  useState(() => {
    loadFavorites();
  });

  // ====================================================
  // FILTER
  // ====================================================

  const filteredStations =
    useMemo(() => {
      return stations.filter(
        (station) => {

          // ============================================
          // SEARCH
          // ============================================

          const searchText =
            String(
              search || ""
            )
              .toLowerCase()
              .trim();

          const matchesSearch =
            !searchText ||
            String(
              station.name ||
                ""
            )
              .toLowerCase()
              .includes(
                searchText
              ) ||
            String(
              station.location ||
                ""
            )
              .toLowerCase()
              .includes(
                searchText
              ) ||
            String(
              station.charger ||
                ""
            )
              .toLowerCase()
              .includes(
                searchText
              ) ||
            String(
              station.operator ||
                ""
            )
              .toLowerCase()
              .includes(
                searchText
              );

          if (
            !matchesSearch
          ) {
            return false;
          }

          // ============================================
          // EXTERNAL STATION
          // ============================================

          const isExternal =
            station.is_external;

          const chargerText =
            String(
              station.charger ||
                ""
            ).toLowerCase();

          // ============================================
          // BASIC FILTER
          // ============================================

          if (
            filter ===
              "available" &&
            !isExternal &&
            !station.available
          ) {
            return false;
          }

          if (
            filter ===
              "fast" &&
            Number(
              station.power || 0
            ) < 50
          ) {
            return false;
          }

          if (
            filter === "ac" &&
            !chargerText.includes(
              "ac"
            )
          ) {
            return false;
          }

          // ============================================
          // ADVANCED FILTERS
          // ============================================

          if (
            advancedFilters
          ) {
            const chargerType =
              advancedFilters.chargerType;

            if (
              chargerType &&
              chargerType !==
                "all" &&
              !chargerText.includes(
                String(
                  chargerType
                ).toLowerCase()
              )
            ) {
              return false;
            }

            const minPower =
              Number(
                advancedFilters.minPower ||
                  0
              );

            if (
              Number(
                station.power || 0
              ) <
              minPower
            ) {
              return false;
            }

            // Only apply price filtering
            // where price is actually known.
            if (
              station.price !==
                null &&
              station.price !==
                undefined
            ) {
              const maxPrice =
                Number(
                  advancedFilters.maxPrice ||
                    100
                );

              if (
                Number(
                  station.price
                ) >
                maxPrice
              ) {
                return false;
              }
            }

            // Only apply rating filter
            // where rating exists.
            if (
              station.rating !==
                null &&
              station.rating !==
                undefined
            ) {
              const minRating =
                Number(
                  advancedFilters.minRating ||
                    0
                );

              if (
                Number(
                  station.rating
                ) <
                minRating
              ) {
                return false;
              }
            }

            // External station availability
            // is unknown, so don't classify
            // unknown as unavailable.
            if (
              advancedFilters.availableOnly &&
              !isExternal &&
              !station.available
            ) {
              return false;
            }
          }

          return true;
        }
      );
    }, [
      stations,
      search,
      filter,
      advancedFilters,
    ]);

  // ====================================================
  // OPEN NAVIGATION
  // ====================================================

  const openNavigation =
    (station) => {
      const latitude =
        Number(
          station.latitude
        );

      const longitude =
        Number(
          station.longitude
        );

      if (
        !Number.isFinite(
          latitude
        ) ||
        !Number.isFinite(
          longitude
        )
      ) {
        toast.error(
          "Location coordinates are unavailable."
        );

        return;
      }

      const url =
        `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

      window.open(
        url,
        "_blank",
        "noopener,noreferrer"
      );
    };

  // ====================================================
  // LOADING
  // ====================================================

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-10 text-center">

        <div className="w-10 h-10 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />

        <p className="text-gray-500">
          Loading charging stations...
        </p>

      </div>
    );
  }

  // ====================================================
  // NO RESULTS
  // ====================================================

  if (
    filteredStations.length ===
    0
  ) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-12 text-center">

        <FaChargingStation className="text-gray-300 text-6xl mx-auto mb-5" />

        <h3 className="text-2xl font-bold text-gray-700">
          No Charging Stations Found
        </h3>

        <p className="text-gray-500 mt-2">
          Try changing your search or filters.
        </p>

      </div>
    );
  }

  // ====================================================
  // GRID
  // ====================================================

  return (
    <div>

      {/* RESULT COUNT */}

      <div className="mb-5 flex items-center justify-between">

        <p className="text-gray-500">

          Showing{" "}

          <span className="font-bold text-gray-800">
            {filteredStations.length}
          </span>{" "}

          charging station
          {filteredStations.length !==
          1
            ? "s"
            : ""}

        </p>

      </div>

      {/* GRID */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {filteredStations.map(
          (station) => {

            const isExternal =
              station.is_external;

            const isFavorite =
              !isExternal &&
              favoriteIds.includes(
                Number(
                  station.id
                )
              );

            const isFavoriteLoading =
              Number(
                favoriteLoading
              ) ===
              Number(
                station.id
              );

            return (
              <div
                key={
                  station.id
                }
                className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition"
              >

                {/* ======================================
                    IMAGE / HEADER
                ====================================== */}

                <div className="relative h-48 bg-gray-100">

                  {station.image ? (
                    <img
                      src={
                        station.image
                      }
                      alt={
                        station.name
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">

                      {isExternal ? (
                        <FaGlobe className="text-blue-300 text-6xl" />
                      ) : (
                        <FaChargingStation className="text-gray-300 text-6xl" />
                      )}

                    </div>
                  )}

                  {/* SOURCE BADGE */}

                  <div
                    className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold ${
                      isExternal
                        ? "bg-blue-600 text-white"
                        : "bg-green-600 text-white"
                    }`}
                  >
                    {isExternal
                      ? "Real External"
                      : "Our Station"}
                  </div>

                  {/* FAVORITE */}

                  {!isExternal && (
                    <button
                      type="button"
                      onClick={() =>
                        handleFavorite(
                          station
                        )
                      }
                      disabled={
                        isFavoriteLoading
                      }
                      aria-label={
                        isFavorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                      className="absolute top-4 left-4 w-11 h-11 rounded-full flex items-center justify-center shadow-lg bg-white hover:bg-red-50 transition"
                    >
                      <FaHeart
                        className={`text-xl ${
                          isFavorite
                            ? "text-red-500"
                            : "text-gray-400"
                        }`}
                      />
                    </button>
                  )}

                  {/* AVAILABILITY */}

                  {!isExternal && (
                    <div
                      className={`absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-xs font-bold ${
                        station.available
                          ? "bg-green-600 text-white"
                          : "bg-red-600 text-white"
                      }`}
                    >
                      {station.available
                        ? "Available"
                        : "Unavailable"}
                    </div>
                  )}

                  {isExternal && (
                    <div className="absolute bottom-4 left-4 bg-gray-900/80 text-white px-3 py-1.5 rounded-full text-xs font-semibold">
                      Availability unknown
                    </div>
                  )}

                </div>

                {/* ======================================
                    CONTENT
                ====================================== */}

                <div className="p-5">

                  {/* NAME */}

                  <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                    {station.name ||
                      "EV Charging Station"}
                  </h3>

                  {/* SOURCE */}

                  {isExternal && (
                    <div className="flex items-center gap-2 mt-2 text-blue-600 text-sm font-semibold">

                      <FaGlobe />

                      <span>
                        OpenStreetMap
                      </span>

                    </div>
                  )}

                  {/* LOCATION */}

                  <div className="flex items-start gap-2 mt-3 text-gray-500">

                    <FaMapMarkerAlt className="mt-1 text-green-600 shrink-0" />

                    <span className="text-sm line-clamp-2">
                      {station.location ||
                        "Location unavailable"}
                    </span>

                  </div>

                  {/* DISTANCE */}

                  {station.distance_km !==
                    null &&
                    station.distance_km !==
                      undefined && (
                      <div className="flex items-center gap-2 mt-3 text-sm font-semibold text-blue-600">
                        📍{" "}
                        {
                          station.distance_km
                        }{" "}
                        km away
                      </div>
                    )}

                  {/* OPERATOR */}

                  {station.operator && (
                    <p className="text-sm text-gray-500 mt-2">
                      Operator:{" "}
                      <span className="font-semibold text-gray-700">
                        {
                          station.operator
                        }
                      </span>
                    </p>
                  )}

                  {/* RATING */}

                  {!isExternal &&
                    (
                      <div className="flex items-center gap-2 mt-3">

                        <div className="flex items-center gap-1 text-yellow-500">

                          <FaStar />

                          <span className="font-bold">
                            {Number(
                              station.rating ||
                                0
                            ).toFixed(
                              1
                            )}
                          </span>

                        </div>

                        <span className="text-sm text-gray-400">
                          (
                          {station.reviews ||
                            0}{" "}
                          reviews)
                        </span>

                      </div>
                    )}

                  {/* DETAILS */}

                  <div className="grid grid-cols-2 gap-3 mt-5">

                    <div className="bg-gray-50 rounded-xl p-3">

                      <p className="text-xs text-gray-400">
                        Charger
                      </p>

                      <p className="font-bold text-gray-800 mt-1">
                        {station.charger ||
                          "Not specified"}
                      </p>

                    </div>

                    <div className="bg-gray-50 rounded-xl p-3">

                      <p className="text-xs text-gray-400">
                        Power
                      </p>

                      <p className="font-bold text-gray-800 mt-1">

                        {station.power !==
                          null &&
                        station.power !==
                          undefined
                          ? `${station.power} kW`
                          : "Not specified"}

                      </p>

                    </div>

                  </div>

                  {/* CONNECTORS */}

                  {Array.isArray(
                    station.connectors
                  ) &&
                    station.connectors
                      .length >
                      0 && (
                      <div className="mt-4">

                        <p className="text-xs text-gray-400 mb-2">
                          Connectors
                        </p>

                        <div className="flex flex-wrap gap-2">

                          {station.connectors
                            .slice(
                              0,
                              4
                            )
                            .map(
                              (
                                connector
                              ) => (
                                <span
                                  key={
                                    connector
                                  }
                                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold"
                                >
                                  {
                                    connector
                                  }
                                </span>
                              )
                            )}

                        </div>

                      </div>
                    )}

                  {/* PRICE */}

                  {station.price !==
                    null &&
                    station.price !==
                      undefined ? (
                    <div className="flex items-center justify-between mt-5">

                      <div>

                        <p className="text-xs text-gray-400">
                          Charging Price
                        </p>

                        <div className="flex items-center gap-1 mt-1">

                          <FaRupeeSign className="text-green-600" />

                          <span className="text-xl font-bold text-green-600">
                            {
                              station.price
                            }
                          </span>

                          <span className="text-sm text-gray-500">
                            /kWh
                          </span>

                        </div>

                      </div>

                    </div>
                  ) : (
                    <div className="mt-5 bg-gray-50 rounded-xl p-3">

                      <p className="text-xs text-gray-400">
                        Charging Price
                      </p>

                      <p className="font-semibold text-gray-600 mt-1">
                        Not available
                      </p>

                    </div>
                  )}

                  {/* ====================================
                      ACTIONS
                  ==================================== */}

                  {isExternal ? (
                    <button
                      type="button"
                      onClick={() =>
                        openNavigation(
                          station
                        )
                      }
                      className="w-full mt-5 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center justify-center gap-2"
                    >
                      <FaRoute />

                      Navigate to Station
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        navigate(
                          `/stations/${station.id}`
                        )
                      }
                      disabled={
                        !station.available
                      }
                      className={`w-full mt-5 py-3 rounded-xl font-bold transition ${
                        station.available
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {station.available
                        ? "View & Book"
                        : "Currently Unavailable"}
                    </button>
                  )}

                </div>

              </div>
            );
          }
        )}

      </div>
    </div>
  );
}

export default StationGrid;