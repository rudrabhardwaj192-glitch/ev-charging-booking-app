import { useEffect, useState } from "react";

import DashboardLayout from "../../components/layout/DashboardLayout";
import SearchBar from "../../components/stations/SearchBar";
import FilterPanel from "../../components/stations/FilterPanel";
import StationGrid from "../../components/stations/StationGrid";

import StationMap from "../../components/map/StationMap";
import NearbyStations from "../../components/map/NearbyStations";

import api from "../../services/api";
import toast from "react-hot-toast";

// ======================================================
// STATION LIST
// ======================================================
//
// Combines:
//
// 1. Application stations from PostgreSQL
// 2. External EV stations from OpenStreetMap
//
// The combined data is passed to:
//
// - StationMap
// - NearbyStations
// - StationGrid
//
// ======================================================

function StationList() {
  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("all");

  const [stations, setStations] = useState([]);

  const [loadingStations, setLoadingStations] =
    useState(true);

  const [locationLoading, setLocationLoading] =
    useState(false);

  const [userLocation, setUserLocation] =
    useState(null);

  // ====================================================
  // ADVANCED FILTERS
  // ====================================================

  const [advancedFilters, setAdvancedFilters] =
    useState({
      chargerType: "all",
      minPower: 0,
      maxPrice: 100,
      minRating: 0,
      availableOnly: false,
    });

  // ====================================================
  // OSM SEARCH RADIUS
  // ====================================================
  //
  // 200 km = 200000 meters
  //
  // We use a larger discovery radius because the OSM
  // data around the current Gwalior location is sparse.
  //
  // IMPORTANT:
  // The application still calculates the actual distance
  // of every station and displays that distance.
  //
  // ====================================================

  const OSM_SEARCH_RADIUS = 200000;

  // ====================================================
  // GET USER LOCATION
  // ====================================================

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(
          new Error(
            "Geolocation is not supported by this browser."
          )
        );

        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },

        (error) => {
          reject(error);
        },

        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  };

  // ====================================================
  // LOAD REAL OSM STATIONS
  // ====================================================

  const loadRealStations = async (
    latitude,
    longitude
  ) => {
    try {
      console.log(
        "🌍 Loading OSM stations...",
        {
          latitude,
          longitude,
          radius: OSM_SEARCH_RADIUS,
        }
      );

      const response = await api.get(
        "/stations/nearby",
        {
          params: {
            latitude,
            longitude,

            // IMPORTANT:
            // 200000 meters = 200 km
            radius: OSM_SEARCH_RADIUS,
          },
        }
      );

      const realStations =
        response.data?.data || [];

      console.log(
        `🌍 OSM stations received: ${realStations.length}`
      );

      console.table(realStations);

      return realStations;
    } catch (error) {
      console.error(
        "Real station loading error:",
        error
      );

      return [];
    }
  };

  // ====================================================
  // LOAD DATABASE STATIONS
  // ====================================================

  const loadDatabaseStations = async () => {
    try {
      const response =
        await api.get("/stations");

      const databaseStations =
        response.data?.data || [];

      console.log(
        `⚡ Application stations received: ${databaseStations.length}`
      );

      return databaseStations;
    } catch (error) {
      console.error(
        "Database station loading error:",
        error
      );

      throw error;
    }
  };

  // ====================================================
  // NORMALIZE EXTERNAL STATIONS
  // ====================================================

  const normalizeExternalStation = (
    station
  ) => {
    const externalId =
      station.external_id ||
      `osm_${station.osm_type}_${station.id}`;

    return {
      ...station,

      // Unique external ID
      id: externalId,

      external_id: externalId,

      // Identify external station
      is_external: true,

      source:
        station.source ||
        "OpenStreetMap",

      source_type:
        station.source_type ||
        "osm",

      // OSM stations cannot be booked
      // through our PostgreSQL booking system.
      bookable: false,

      // OSM does not guarantee live availability.
      available:
        station.available ?? null,

      live_availability:
        station.live_availability ??
        false,

      // Do not invent price.
      price:
        station.price ?? null,

      rating:
        station.rating ?? null,

      reviews:
        station.reviews ?? null,

      image:
        station.image || null,

      charger:
        station.charger ||
        station.charger_type ||
        "EV Charger",

      charger_type:
        station.charger_type ||
        station.charger ||
        "EV Charger",

      connectors:
        Array.isArray(
          station.connectors
        )
          ? station.connectors
          : [],

      power:
        station.power ?? null,

      location:
        station.location ||
        "Location available on map",

      latitude:
        Number(station.latitude),

      longitude:
        Number(station.longitude),

      distance_km:
        station.distance_km ??
        null,
    };
  };

  // ====================================================
  // COMBINE STATIONS
  // ====================================================

  const combineStations = (
    databaseStations,
    externalStations
  ) => {
    // ------------------------------------------------
    // Normalize OSM stations
    // ------------------------------------------------

    const normalizedExternal =
      externalStations
        .map(normalizeExternalStation)
        .filter(
          (station) =>
            Number.isFinite(
              station.latitude
            ) &&
            Number.isFinite(
              station.longitude
            )
        );

    // ------------------------------------------------
    // Remove duplicate OSM stations
    // ------------------------------------------------

    const externalMap = new Map();

    normalizedExternal.forEach(
      (station) => {
        const key =
          station.external_id ||
          station.id;

        if (!externalMap.has(key)) {
          externalMap.set(
            key,
            station
          );
        }
      }
    );

    const uniqueExternal =
      Array.from(
        externalMap.values()
      );

    // ------------------------------------------------
    // Remove accidental duplicates between
    // database and external stations.
    //
    // Database stations have numeric IDs.
    // OSM stations have osm_* IDs.
    // ------------------------------------------------

    const databaseIds = new Set(
      databaseStations.map(
        (station) =>
          String(station.id)
      )
    );

    const filteredExternal =
      uniqueExternal.filter(
        (station) =>
          !databaseIds.has(
            String(station.id)
          )
      );

    console.log(
      "📊 Station combination:",
      {
        database:
          databaseStations.length,

        external:
          filteredExternal.length,

        total:
          databaseStations.length +
          filteredExternal.length,
      }
    );

    return [
      ...databaseStations,
      ...filteredExternal,
    ];
  };

  // ====================================================
  // LOAD EVERYTHING
  // ====================================================

  useEffect(() => {
    let mounted = true;

    const loadStations = async () => {
      try {
        setLoadingStations(true);

        // ============================================
        // DATABASE STATIONS
        // ============================================

        const databaseStations =
          await loadDatabaseStations();

        if (!mounted) {
          return;
        }

        // ============================================
        // GET GPS
        // ============================================

        setLocationLoading(true);

        let location = null;

        try {
          location =
            await getUserLocation();

          if (mounted) {
            setUserLocation(location);

            console.log(
              "📍 User location:",
              location
            );
          }
        } catch (locationError) {
          console.warn(
            "Unable to get user location:",
            locationError
          );
        } finally {
          if (mounted) {
            setLocationLoading(false);
          }
        }

        // ============================================
        // LOAD OSM STATIONS
        // ============================================

        let externalStations = [];

        if (location) {
          externalStations =
            await loadRealStations(
              location.latitude,
              location.longitude
            );
        }

        if (!mounted) {
          return;
        }

        // ============================================
        // COMBINE
        // ============================================

        const combined =
          combineStations(
            databaseStations,
            externalStations
          );

        console.log(
          "🚗 Final combined stations:",
          combined
        );

        setStations(combined);
      } catch (error) {
        console.error(
          "Station loading error:",
          error
        );

        if (mounted) {
          toast.error(
            error.response?.data
              ?.message ||
              "Unable to load charging stations."
          );

          setStations([]);
        }
      } finally {
        if (mounted) {
          setLoadingStations(false);
        }
      }
    };

    loadStations();

    return () => {
      mounted = false;
    };
  }, []);

  // ====================================================
  // DATABASE STATIONS
  // ====================================================

  const databaseStations =
    stations.filter(
      (station) =>
        !station.is_external
    );

  // ====================================================
  // EXTERNAL STATIONS
  // ====================================================

  const externalStations =
    stations.filter(
      (station) =>
        station.is_external
    );

  // ====================================================
  // TOTAL STATIONS
  // ====================================================

  const totalStations =
    stations.length;

  // ====================================================
  // UI
  // ====================================================

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* =================================================
            HEADER
        ================================================= */}

        <div>
          <h1 className="text-4xl font-bold text-gray-900">
            Charging Stations
          </h1>

          <p className="text-gray-500 mt-2">
            Find charging stations near your location.
          </p>

          {/* Location status */}

          {locationLoading && (
            <p className="text-sm text-blue-600 mt-2">
              📍 Detecting your location...
            </p>
          )}

          {!locationLoading &&
            userLocation && (
              <p className="text-sm text-green-600 mt-2">
                📍 Location detected. External EV stations loaded.
              </p>
            )}

          {!locationLoading &&
            !userLocation && (
              <p className="text-sm text-gray-500 mt-2">
                📍 Location unavailable. Showing application stations.
              </p>
            )}
        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <SearchBar
          search={search}
          setSearch={setSearch}
        />

        {/* =================================================
            FILTER
        ================================================= */}

        <FilterPanel
          filter={filter}
          setFilter={setFilter}
          advancedFilters={
            advancedFilters
          }
          setAdvancedFilters={
            setAdvancedFilters
          }
        />

        {/* =================================================
            STATION SOURCE SUMMARY
        ================================================= */}

        {!loadingStations && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Application stations */}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-green-100 flex items-center justify-center text-green-700">
                  ⚡
                </div>

                <div>
                  <p className="font-bold text-gray-900">
                    Application Stations
                  </p>

                  <p className="text-sm text-gray-500">
                    {databaseStations.length} station
                    {databaseStations.length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>

              </div>
            </div>

            {/* OSM stations */}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                  🌍
                </div>

                <div>
                  <p className="font-bold text-gray-900">
                    OSM Stations
                  </p>

                  <p className="text-sm text-gray-500">
                    {externalStations.length} station
                    {externalStations.length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>

              </div>
            </div>

            {/* Total */}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-3">

                <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                  ⚡
                </div>

                <div>
                  <p className="font-bold text-gray-900">
                    Total Stations
                  </p>

                  <p className="text-sm text-gray-500">
                    {totalStations} station
                    {totalStations !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* =================================================
            MAP
        ================================================= */}

        <section>
          <div className="w-full h-[450px] rounded-2xl overflow-hidden shadow-lg border border-gray-200">

            <StationMap
              stations={stations}
            />

          </div>
        </section>

        {/* =================================================
            NEARBY STATIONS
        ================================================= */}

        {stations.length > 0 && (
          <section>
            <NearbyStations
              stations={stations}
            />
          </section>
        )}

        {/* =================================================
            STATION GRID
        ================================================= */}

        <section>

          <div className="mb-6">

            <h2 className="text-3xl font-bold text-gray-900">
              Charging Stations
            </h2>

            <p className="text-gray-500 mt-1">
              Explore application stations and
              external EV charging locations.
            </p>

          </div>

          <StationGrid
            stations={stations}
            loading={loadingStations}
            search={search}
            filter={filter}
            advancedFilters={
              advancedFilters
            }
            setAdvancedFilters={
              setAdvancedFilters
            }
          />

        </section>

      </div>
    </DashboardLayout>
  );
}

export default StationList;