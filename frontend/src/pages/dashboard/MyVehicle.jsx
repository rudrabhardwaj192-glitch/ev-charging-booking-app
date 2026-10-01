import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  FaCar,
  FaBatteryFull,
  FaBolt,
  FaPlug,
  FaRoad,
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaSave,
  FaBell,
  FaMapMarkerAlt,
  FaStar,
  FaChargingStation,
  FaRupeeSign,
  FaLocationArrow,
} from "react-icons/fa";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  getMyVehicles,
  deleteVehicle,
  updateBattery,
} from "../../services/vehicleService";

import api from "../../services/api";

function MyVehicle() {
  const navigate = useNavigate();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  // =====================================================
  // BATTERY MODAL
  // =====================================================

  const [showBatteryModal, setShowBatteryModal] =
    useState(false);

  const [selectedVehicle, setSelectedVehicle] =
    useState(null);

  const [battery, setBattery] = useState("");

  const [estimatedRange, setEstimatedRange] =
    useState("");

  const [updatingBattery, setUpdatingBattery] =
    useState(false);

  // =====================================================
  // NEARBY STATIONS
  // =====================================================

  const [nearbyStations, setNearbyStations] =
    useState([]);

  const [loadingStations, setLoadingStations] =
    useState(false);

  const [locationError, setLocationError] =
    useState("");

  const [userLocation, setUserLocation] =
    useState(null);

  // =====================================================
  // AUTOMATIC BATTERY MONITORING (DEMO MODE)
  // =====================================================

  const [monitoringEnabled, setMonitoringEnabled] =
    useState(() => {
      try {
        return localStorage.getItem(
          "ev_battery_monitoring"
        ) === "true";
      } catch {
        return false;
      }
    });

  const [monitoringVehicleId, setMonitoringVehicleId] =
    useState(null);

  const [monitoringBusy, setMonitoringBusy] =
    useState(false);

  const [lastBatterySync, setLastBatterySync] =
    useState(null);

  const lowBatteryAlertedRef = useRef({});

  // =====================================================
  // LOAD VEHICLES
  // =====================================================

  const loadVehicles = async () => {
    try {
      setLoading(true);

      const response = await getMyVehicles();

      setVehicles(response.data || []);
    } catch (error) {
      console.error(
        "Vehicle loading error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to load your EV."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  // =====================================================
  // AUTOMATIC BATTERY MONITORING ENGINE
  // =====================================================

  useEffect(() => {
    if (!monitoringEnabled || !monitoringVehicleId) {
      return undefined;
    }

    const intervalId = setInterval(async () => {
      const vehicle = vehicles.find(
        (item) => item.id === monitoringVehicleId
      );

      if (!vehicle || monitoringBusy) {
        return;
      }

      const currentBattery =
        Number(vehicle.current_battery);

      if (!Number.isFinite(currentBattery)) {
        return;
      }

      if (currentBattery <= 0) {
        setMonitoringEnabled(false);
        setMonitoringVehicleId(null);

        try {
          localStorage.setItem(
            "ev_battery_monitoring",
            "false"
          );
        } catch {}

        toast.error(
          "🔋 Battery simulation reached 0%. Monitoring stopped.",
          { id: "battery-monitor-stopped" }
        );
        return;
      }

      try {
        setMonitoringBusy(true);

        // DEMO MODE:
        // Simulate approximately 1% battery usage every 30 seconds.
        const nextBattery = Math.max(
          0,
          Math.round(currentBattery - 1)
        );

        let nextRange = null;

        const oldRange =
          Number(vehicle.estimated_range);

        if (Number.isFinite(oldRange)) {
          nextRange = Number(
            (
              oldRange *
              (nextBattery /
                Math.max(currentBattery, 1))
            ).toFixed(1)
          );
        }

        const response = await updateBattery(
          vehicle.id,
          {
            current_battery: nextBattery,
            estimated_range: nextRange,
          }
        );

        const updatedVehicle = response.data;

        setVehicles((previous) =>
          previous.map((item) =>
            item.id === vehicle.id
              ? updatedVehicle
              : item
          )
        );

        setLastBatterySync(new Date());

        if (
          nextBattery <= 20 &&
          !lowBatteryAlertedRef.current[vehicle.id]
        ) {
          lowBatteryAlertedRef.current[vehicle.id] =
            true;

          toast(
            "⚠️ Automatic monitoring detected low battery. Finding charging stations...",
            {
              id: "automatic-low-battery",
              duration: 7000,
            }
          );

          await sendLowBatteryNotification(
            updatedVehicle,
            nextBattery
          );

          // Automatically start the existing station
          // recommendation workflow.
          findNearbyStations(updatedVehicle);
        }

        if (nextBattery > 20) {
          lowBatteryAlertedRef.current[vehicle.id] =
            false;
        }
      } catch (error) {
        console.error(
          "Automatic battery monitoring error:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "Automatic battery update failed.",
          { id: "automatic-battery-error" }
        );
      } finally {
        setMonitoringBusy(false);
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [
    monitoringEnabled,
    monitoringVehicleId,
    vehicles,
    monitoringBusy,
  ]);

  // =====================================================
  // TOGGLE AUTOMATIC BATTERY MONITORING
  // =====================================================

  const toggleBatteryMonitoring = (vehicle) => {
    const newValue = !(
      monitoringEnabled &&
      monitoringVehicleId === vehicle.id
    );

    setMonitoringEnabled(newValue);

    if (newValue) {
      setMonitoringVehicleId(vehicle.id);

      try {
        localStorage.setItem(
          "ev_battery_monitoring",
          "true"
        );
      } catch {}

      toast.success(
        `Automatic monitoring enabled for ${vehicle.brand} ${vehicle.model}.`,
        { id: "battery-monitor-enabled" }
      );
    } else {
      setMonitoringVehicleId(null);

      try {
        localStorage.setItem(
          "ev_battery_monitoring",
          "false"
        );
      } catch {}

      toast.success(
        "Automatic battery monitoring stopped.",
        { id: "battery-monitor-disabled" }
      );
    }
  };

  // =====================================================
  // DISTANCE CALCULATOR
  // =====================================================

  const calculateDistance = (
    lat1,
    lon1,
    lat2,
    lon2
  ) => {
    const earthRadius = 6371;

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

    return earthRadius * c;
  };

  // =====================================================
  // SMART STATION SCORE
  // =====================================================

  const calculateSmartScore = (
    station,
    distance,
    vehicle
  ) => {
    let score = 0;

    if (distance <= 2) score += 30;
    else if (distance <= 5) score += 25;
    else if (distance <= 10) score += 20;
    else if (distance <= 20) score += 10;
    else score += 5;

    const isAvailable =
      station.available === true ||
      station.available === "true" ||
      Number(station.available) > 0;

    if (isAvailable) score += 20;

    const stationPower = Number(station.power) || 0;
    const vehicleMaxPower = Number(vehicle.max_charging_power) || 0;

    if (stationPower > 0 && vehicleMaxPower > 0) {
      const usablePower = Math.min(stationPower, vehicleMaxPower);
      if (usablePower >= 100) score += 15;
      else if (usablePower >= 50) score += 12;
      else if (usablePower >= 22) score += 8;
      else score += 4;
    } else if (stationPower >= 50) {
      score += 12;
    } else if (stationPower > 0) {
      score += 6;
    }

    const price = Number(station.price) || 0;
    if (price > 0) {
      if (price <= 12) score += 10;
      else if (price <= 16) score += 8;
      else if (price <= 20) score += 6;
      else if (price <= 25) score += 4;
      else score += 2;
    }

    const rating = Number(station.rating) || 0;
    if (rating >= 4.5) score += 10;
    else if (rating >= 4) score += 8;
    else if (rating >= 3.5) score += 6;
    else if (rating >= 3) score += 4;
    else if (rating > 0) score += 2;

    const range = Number(vehicle.estimated_range) || 0;
    if (range > 0) {
      if (distance <= range * 0.2) score += 10;
      else if (distance <= range * 0.4) score += 8;
      else if (distance <= range * 0.6) score += 5;
      else if (distance <= range * 0.8) score += 2;
    }

    const vehicleConnector =
      String(vehicle.connector_type || "").toLowerCase();
    const stationCharger =
      String(station.charger || "").toLowerCase();

    if (
      vehicleConnector &&
      stationCharger &&
      stationCharger.includes(vehicleConnector)
    ) {
      score += 5;
    } else if (!vehicleConnector) {
      score += 3;
    }

    return Math.min(Math.round(score), 100);
  };

  // =====================================================
  // FIND NEARBY STATIONS
  // =====================================================

  const findNearbyStations = (vehicle) => {
    if (!navigator.geolocation) {
      toast.error(
        "Your browser does not support location."
      );

      return;
    }

    setLoadingStations(true);
    setLocationError("");
    setNearbyStations([]);

    toast.loading(
      "Getting your location...",
      {
        id: "location-loading",
      }
    );

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude =
            position.coords.latitude;

          const longitude =
            position.coords.longitude;

          setUserLocation({
            latitude,
            longitude,
          });

          toast.success(
            "Location detected 📍",
            {
              id: "location-loading",
              duration: 3000,
            }
          );

          // ==============================================
          // GET REAL STATIONS
          // ==============================================

          const response =
            await api.get("/stations");

          const stations =
            response.data?.data || [];

          // ==============================================
          // VEHICLE RANGE
          // ==============================================

          const vehicleRange =
            Number(
              vehicle.estimated_range
            ) || 0;

          // ==============================================
          // CALCULATE DISTANCES
          // ==============================================

          const stationsWithDistance =
            stations
              .map((station) => {
                const stationLat = Number(station.latitude);
                const stationLng = Number(station.longitude);

                if (
                  !Number.isFinite(stationLat) ||
                  !Number.isFinite(stationLng)
                ) {
                  return null;
                }

                const distance = calculateDistance(
                  latitude,
                  longitude,
                  stationLat,
                  stationLng
                );

                const roundedDistance = Number(distance.toFixed(1));

                const smartScore = calculateSmartScore(
                  station,
                  roundedDistance,
                  vehicle
                );

                return {
                  ...station,
                  distance: roundedDistance,
                  smartScore,
                };
              })
              .filter(Boolean);

          // ==============================================
          // SORT
          // ==============================================

          stationsWithDistance.sort(
            (a, b) => {
              if (b.smartScore !== a.smartScore) {
                return b.smartScore - a.smartScore;
              }

              if (a.available && !b.available) return -1;
              if (!a.available && b.available) return 1;

              return a.distance - b.distance;
            }
          );

          // ==============================================
          // RANGE FILTER
          // ==============================================

          let recommended =
            stationsWithDistance;

          if (vehicleRange > 0) {
            const withinRange =
              stationsWithDistance.filter(
                (station) =>
                  station.distance <=
                  vehicleRange
              );

            if (
              withinRange.length > 0
            ) {
              recommended =
                withinRange;
            }
          }

          // ==============================================
          // TOP 5
          // ==============================================

          const topStations =
            recommended.slice(0, 5);

          setNearbyStations(
            topStations
          );

          // ==============================================
          // SUCCESS TOAST
          // IMPORTANT: FIXES DUPLICATES
          // ==============================================

          if (
            topStations.length === 0
          ) {
            toast.error(
              "No charging stations found nearby.",
              {
                id: "nearby-stations-result",
                duration: 5000,
              }
            );
          } else {
            toast.success(
              `${topStations.length} nearby stations found.`,
              {
                id: "nearby-stations-result",
                duration: 4000,
              }
            );
          }
        } catch (error) {
          console.error(
            "Nearby station error:",
            error
          );

          setLocationError(
            "Unable to find nearby charging stations."
          );

          toast.error(
            error.response?.data?.message ||
              "Unable to load charging stations.",
            {
              id: "nearby-stations-error",
            }
          );
        } finally {
          setLoadingStations(false);
        }
      },

      (error) => {
        console.error(
          "Location error:",
          error
        );

        setLoadingStations(false);

        toast.dismiss(
          "location-loading"
        );

        if (error.code === 1) {
          setLocationError(
            "Location permission was denied. Please allow location access."
          );

          toast.error(
            "Please allow location access.",
            {
              id: "location-permission-error",
            }
          );
        } else if (error.code === 2) {
          setLocationError(
            "Your location could not be detected."
          );

          toast.error(
            "Unable to detect your location.",
            {
              id: "location-detection-error",
            }
          );
        } else {
          setLocationError(
            "Location request timed out."
          );

          toast.error(
            "Location request timed out.",
            {
              id: "location-timeout-error",
            }
          );
        }
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  // =====================================================
  // OPEN BATTERY MODAL
  // =====================================================

  const openBatteryModal = (
    vehicle
  ) => {
    setSelectedVehicle(vehicle);

    setBattery(
      String(
        vehicle.current_battery ?? 100
      )
    );

    setEstimatedRange(
      vehicle.estimated_range !==
        null &&
      vehicle.estimated_range !==
        undefined
        ? String(
            vehicle.estimated_range
          )
        : ""
    );

    setShowBatteryModal(true);
  };

  // =====================================================
  // CLOSE BATTERY MODAL
  // =====================================================

  const closeBatteryModal = () => {
    if (updatingBattery) {
      return;
    }

    setShowBatteryModal(false);

    setSelectedVehicle(null);

    setBattery("");

    setEstimatedRange("");
  };

  // =====================================================
  // LOW BATTERY NOTIFICATION
  // =====================================================

  const sendLowBatteryNotification =
    async (
      vehicle,
      batteryPercentage
    ) => {
      if (
        typeof window ===
          "undefined" ||
        !("Notification" in window)
      ) {
        return;
      }

      try {
        let permission =
          Notification.permission;

        if (
          permission ===
          "default"
        ) {
          permission =
            await Notification.requestPermission();
        }

        if (
          permission !==
          "granted"
        ) {
          return;
        }

        new Notification(
          "🔋 Low EV Battery",
          {
            body:
              `${vehicle.brand} ${vehicle.model} ` +
              `battery is at ${batteryPercentage}%. ` +
              `Find a nearby charging station.`,
          }
        );
      } catch (error) {
        console.error(
          "Notification error:",
          error
        );
      }
    };

  // =====================================================
  // UPDATE BATTERY
  // =====================================================

  const handleBatteryUpdate =
    async (e) => {
      e.preventDefault();

      if (!selectedVehicle) {
        return;
      }

      const batteryValue =
        Number(battery);

      const rangeValue =
        estimatedRange === ""
          ? null
          : Number(
              estimatedRange
            );

      // ==============================================
      // BATTERY VALIDATION
      // ==============================================

      if (
        Number.isNaN(
          batteryValue
        ) ||
        batteryValue < 0 ||
        batteryValue > 100
      ) {
        toast.error(
          "Battery must be between 0% and 100%."
        );

        return;
      }

      // ==============================================
      // RANGE VALIDATION
      // ==============================================

      if (
        rangeValue !== null &&
        (
          Number.isNaN(
            rangeValue
          ) ||
          rangeValue < 0
        )
      ) {
        toast.error(
          "Please enter a valid estimated range."
        );

        return;
      }

      try {
        setUpdatingBattery(
          true
        );

        const response =
          await updateBattery(
            selectedVehicle.id,
            {
              current_battery:
                batteryValue,

              estimated_range:
                rangeValue,
            }
          );

        const updatedVehicle =
          response.data;

        // ==============================================
        // UPDATE UI
        // ==============================================

        setVehicles(
          (previous) =>
            previous.map(
              (vehicle) =>
                vehicle.id ===
                selectedVehicle.id
                  ? updatedVehicle
                  : vehicle
            )
        );

        // ==============================================
        // CLOSE MODAL
        // ==============================================

        setShowBatteryModal(
          false
        );

        setSelectedVehicle(
          null
        );

        setBattery("");

        setEstimatedRange("");

        toast.success(
          "Battery updated successfully 🔋",
          {
            id: "battery-updated",
          }
        );

        // ==============================================
        // LOW BATTERY
        // ==============================================

        if (batteryValue > 20) {
          lowBatteryAlertedRef.current[
            updatedVehicle.id
          ] = false;
        }

        if (
          batteryValue <= 20
        ) {
          toast(
            "⚠️ Low battery! Find a nearby charging station.",
            {
              id: "low-battery-warning",
              duration: 6000,
            }
          );

          await sendLowBatteryNotification(
            updatedVehicle,
            batteryValue
          );
        }
      } catch (error) {
        console.error(
          "Battery update error:",
          error
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Unable to update battery.",
          {
            id: "battery-update-error",
          }
        );
      } finally {
        setUpdatingBattery(
          false
        );
      }
    };

  // =====================================================
  // DELETE VEHICLE
  // =====================================================

  const handleDelete = async (
    vehicleId
  ) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this vehicle?"
      );

    if (!confirmed) {
      return;
    }

    try {
      await deleteVehicle(
        vehicleId
      );

      toast.success(
        "Vehicle deleted successfully."
      );

      await loadVehicles();
    } catch (error) {
      console.error(
        "Delete vehicle error:",
        error
      );

      toast.error(
        error.response?.data
          ?.message ||
          "Unable to delete vehicle."
      );
    }
  };

  // =====================================================
  // BATTERY COLOR
  // =====================================================

  const getBatteryColor = (
    battery
  ) => {
    if (battery <= 10) {
      return "bg-red-500";
    }

    if (battery <= 20) {
      return "bg-orange-500";
    }

    if (battery <= 40) {
      return "bg-yellow-500";
    }

    return "bg-green-500";
  };

  // =====================================================
  // BATTERY STATUS
  // =====================================================

  const getBatteryStatus = (
    battery
  ) => {
    if (battery <= 10) {
      return "Critical";
    }

    if (battery <= 20) {
      return "Low";
    }

    if (battery <= 40) {
      return "Moderate";
    }

    return "Good";
  };

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">

            <div className="w-10 h-10 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin" />

            <p className="text-gray-500">
              Loading your EV...
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
            <h1 className="text-4xl font-bold text-gray-900">
              My EV
            </h1>

            <p className="text-gray-500 mt-2">
              Manage your electric vehicle and
              monitor its battery.
            </p>
          </div>

          <Link
            to="/dashboard/vehicle/add"
            className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition"
          >
            <FaPlus />
            Add Vehicle
          </Link>

        </div>

        {/* =================================================
            NO VEHICLES
        ================================================= */}

        {vehicles.length === 0 && (

          <div className="bg-white rounded-3xl shadow-lg p-10 text-center">

            <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
              <FaCar className="text-4xl text-green-600" />
            </div>

            <h2 className="text-2xl font-bold mt-6">
              No EV Added Yet
            </h2>

            <p className="text-gray-500 mt-2">
              Add your electric vehicle to
              unlock smart charging features.
            </p>

            <Link
              to="/dashboard/vehicle/add"
              className="inline-flex items-center gap-2 mt-6 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition"
            >
              <FaPlus />
              Add My EV
            </Link>

          </div>
        )}

        {/* =================================================
            VEHICLES
        ================================================= */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {vehicles.map(
            (vehicle) => {

              const battery =
                Number(
                  vehicle.current_battery
                ) || 0;

              const isLowBattery =
                battery <= 20;

              return (

                <div
                  key={vehicle.id}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden"
                >

                  {/* =========================================
                      VEHICLE HEADER
                  ========================================= */}

                  <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white">

                    <div className="flex items-center gap-4">

                      <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                        <FaCar className="text-3xl" />
                      </div>

                      <div>

                        <h2 className="text-2xl font-bold">
                          {vehicle.brand}{" "}
                          {vehicle.model}
                        </h2>

                        {vehicle.year && (
                          <p className="text-green-100">
                            {vehicle.year}
                          </p>
                        )}

                      </div>

                    </div>

                  </div>

                  {/* =========================================
                      CONTENT
                  ========================================= */}

                  <div className="p-6">

                    {/* =======================================
                        LOW BATTERY ALERT
                    ======================================= */}

                    {isLowBattery && (

                      <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-5">

                        <div className="flex gap-4">

                          <div className="w-11 h-11 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">

                            <FaBell className="text-red-600" />

                          </div>

                          <div className="flex-1">

                            <h3 className="font-bold text-red-700 text-lg">
                              🔋 Low Battery Alert
                            </h3>

                            <p className="text-red-600 text-sm mt-1">
                              Your EV battery is at{" "}
                              <strong>
                                {battery}%
                              </strong>
                              . Charging is recommended.
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                findNearbyStations(
                                  vehicle
                                )
                              }
                              disabled={
                                loadingStations
                              }
                              className="inline-flex items-center gap-2 mt-3 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
                            >

                              <FaMapMarkerAlt />

                              {loadingStations
                                ? "Finding Stations..."
                                : "Find Nearby Stations"}

                            </button>

                          </div>

                        </div>

                      </div>
                    )}

                    {/* =======================================
                        AUTOMATIC BATTERY MONITORING
                    ======================================= */}

                    <div className="mb-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <FaBolt className="text-blue-600" />
                          </div>

                          <div>
                            <h3 className="font-bold text-blue-800 text-lg">
                              Automatic Battery Monitoring
                            </h3>

                            <p className="text-blue-700 text-sm mt-1">
                              Demo mode simulates battery usage and
                              automatically detects low battery.
                            </p>

                            {monitoringEnabled &&
                              monitoringVehicleId ===
                                vehicle.id && (
                                <p className="text-xs text-blue-600 mt-2 font-semibold">
                                  {monitoringBusy
                                    ? "Syncing battery..."
                                    : lastBatterySync
                                    ? `Last sync: ${lastBatterySync.toLocaleTimeString()}`
                                    : "Monitoring is active"}
                                </p>
                              )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            toggleBatteryMonitoring(vehicle)
                          }
                          className={`relative inline-flex items-center h-8 w-14 rounded-full transition ${
                            monitoringEnabled &&
                            monitoringVehicleId === vehicle.id
                              ? "bg-green-600"
                              : "bg-gray-300"
                          }`}
                          aria-label="Toggle automatic battery monitoring"
                        >
                          <span
                            className={`inline-block w-6 h-6 bg-white rounded-full shadow transform transition ${
                              monitoringEnabled &&
                              monitoringVehicleId === vehicle.id
                                ? "translate-x-7"
                                : "translate-x-1"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-white rounded-xl p-3">
                          <p className="text-xs text-gray-500">
                            Current Battery
                          </p>
                          <p className="font-bold text-gray-900 mt-1">
                            {battery}%
                          </p>
                        </div>

                        <div className="bg-white rounded-xl p-3">
                          <p className="text-xs text-gray-500">
                            Low Battery Trigger
                          </p>
                          <p className="font-bold text-red-600 mt-1">
                            ≤ 20%
                          </p>
                        </div>

                        <div className="bg-white rounded-xl p-3">
                          <p className="text-xs text-gray-500">
                            Mode
                          </p>
                          <p className="font-bold text-gray-900 mt-1">
                            {monitoringEnabled &&
                            monitoringVehicleId === vehicle.id
                              ? "Active"
                              : "Off"}
                          </p>
                        </div>
                      </div>

                      {monitoringEnabled &&
                        monitoringVehicleId === vehicle.id && (
                          <div className="mt-4 rounded-xl bg-white border border-blue-100 p-3 text-sm text-gray-600">
                            <strong>Demo:</strong> battery decreases by
                            approximately 1% every 30 seconds. At 20%,
                            the app alerts you and automatically searches
                            for charging stations.
                          </div>
                        )}
                    </div>

                    {/* =======================================
                        BATTERY
                    ======================================= */}

                    <div
                      className={`border rounded-2xl p-5 ${
                        isLowBattery
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                    >

                      <div className="flex justify-between items-center mb-3">

                        <div className="flex items-center gap-2">

                          <FaBatteryFull
                            className={
                              isLowBattery
                                ? "text-red-600"
                                : "text-green-600"
                            }
                          />

                          <span className="font-semibold">
                            Current Battery
                          </span>

                        </div>

                        <div className="text-right">

                          <span className="text-2xl font-bold">
                            {battery}%
                          </span>

                          <p
                            className={`text-xs font-semibold ${
                              isLowBattery
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {getBatteryStatus(
                              battery
                            )}
                          </p>

                        </div>

                      </div>

                      {/* BATTERY BAR */}

                      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">

                        <div
                          className={`h-full transition-all duration-500 ${getBatteryColor(
                            battery
                          )}`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                battery
                              )
                            )}%`,
                          }}
                        />

                      </div>

                      {/* UPDATE BATTERY */}

                      <button
                        type="button"
                        onClick={() =>
                          openBatteryModal(
                            vehicle
                          )
                        }
                        className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2"
                      >

                        <FaBatteryFull />

                        Update Battery

                      </button>

                    </div>

                    {/* =======================================
                        VEHICLE DETAILS
                    ======================================= */}

                    <div className="grid grid-cols-2 gap-4 mt-5">

                      {/* RANGE */}

                      <div className="bg-gray-50 rounded-2xl p-4">

                        <FaRoad className="text-green-600 mb-2" />

                        <p className="text-sm text-gray-500">
                          Estimated Range
                        </p>

                        <p className="text-xl font-bold">
                          {vehicle.estimated_range ??
                            "--"}{" "}
                          km
                        </p>

                      </div>

                      {/* BATTERY CAPACITY */}

                      <div className="bg-gray-50 rounded-2xl p-4">

                        <FaBolt className="text-green-600 mb-2" />

                        <p className="text-sm text-gray-500">
                          Battery Capacity
                        </p>

                        <p className="text-xl font-bold">
                          {vehicle.battery_capacity ??
                            "--"}{" "}
                          kWh
                        </p>

                      </div>

                      {/* CONNECTOR */}

                      <div className="bg-gray-50 rounded-2xl p-4">

                        <FaPlug className="text-green-600 mb-2" />

                        <p className="text-sm text-gray-500">
                          Connector
                        </p>

                        <p className="text-xl font-bold">
                          {vehicle.connector_type ||
                            "--"}
                        </p>

                      </div>

                      {/* MAX POWER */}

                      <div className="bg-gray-50 rounded-2xl p-4">

                        <FaBolt className="text-green-600 mb-2" />

                        <p className="text-sm text-gray-500">
                          Max Charging
                        </p>

                        <p className="text-xl font-bold">
                          {vehicle.max_charging_power ??
                            "--"}{" "}
                          kW
                        </p>

                      </div>

                    </div>

                    {/* =======================================
                        REGISTRATION
                    ======================================= */}

                    {vehicle.registration_number && (

                      <div className="mt-5 p-4 bg-gray-50 rounded-2xl">

                        <p className="text-sm text-gray-500">
                          Registration Number
                        </p>

                        <p className="font-bold mt-1 uppercase">
                          {
                            vehicle.registration_number
                          }
                        </p>

                      </div>
                    )}

                    {/* =======================================
                        ACTIONS
                    ======================================= */}

                    <div className="flex gap-3 mt-6">

                      <button
                        type="button"
                        onClick={() =>
                          openBatteryModal(
                            vehicle
                          )
                        }
                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition"
                      >

                        <FaBatteryFull />

                        Update Battery

                      </button>

                      <Link
                        to={`/dashboard/vehicle/edit/${vehicle.id}`}
                        className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-5 py-3 rounded-xl font-semibold transition"
                      >

                        <FaEdit />

                        Edit

                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            vehicle.id
                          )
                        }
                        className="px-5 flex items-center justify-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-xl font-semibold transition"
                      >

                        <FaTrash />

                      </button>

                    </div>

                  </div>

                </div>
              );
            }
          )}

        </div>

        {/* =====================================================
            NEARBY STATIONS
        ===================================================== */}

        {nearbyStations.length > 0 && (

          <div className="bg-white rounded-3xl shadow-lg p-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">

              <div className="flex items-center gap-3">

                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">

                  <FaChargingStation className="text-green-600 text-xl" />

                </div>

                <div>

                  <h2 className="text-2xl font-bold text-gray-900">
                    Nearby Charging Stations
                  </h2>

                  <p className="text-gray-500 text-sm">
                    Recommended based on your current location
                  </p>

                </div>

              </div>

              {userLocation && (

                <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">

                  <FaLocationArrow />

                  Location detected

                </div>

              )}

            </div>

            {/* STATION LIST */}

            <div className="space-y-4">

              {nearbyStations.map(
                (station, index) => (

                  <div
                    key={station.id}
                    className={`border rounded-2xl p-5 ${
                      index === 0
                        ? "border-green-400 bg-green-50"
                        : "border-gray-200"
                    }`}
                  >

                    <div className="flex flex-col lg:flex-row lg:items-center gap-5">

                      {/* ICON */}

                      <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">

                        <FaChargingStation className="text-green-600 text-2xl" />

                      </div>

                      {/* INFORMATION */}

                      <div className="flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-xl font-bold text-gray-900">
                            {station.name}
                          </h3>

                          {index === 0 && (
                            <span className="px-3 py-1 rounded-full bg-green-600 text-white text-xs font-bold">
                              🏆 Best For You
                            </span>
                          )}

                          {station.smartScore !== undefined && (
                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                              🤖 {station.smartScore}/100
                            </span>
                          )}

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
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

                        <div className="flex items-start gap-2 mt-2 text-gray-500">

                          <FaMapMarkerAlt className="text-green-600 mt-1 flex-shrink-0" />

                          <span className="text-sm">
                            {station.location}
                          </span>

                        </div>

                        {/* DETAILS */}

                        <div className="flex flex-wrap items-center gap-5 mt-3">

                          {/* DISTANCE */}

                          <div className="flex items-center gap-2">

                            <FaMapMarkerAlt className="text-green-600" />

                            <span className="font-bold">
                              {station.distance} km
                            </span>

                          </div>

                          {/* POWER */}

                          <div className="flex items-center gap-2">

                            <FaBolt className="text-green-600" />

                            <span>
                              {station.power} kW
                            </span>

                          </div>

                          {/* RATING */}

                          <div className="flex items-center gap-2">

                            <FaStar className="text-yellow-500" />

                            <span>
                              {Number(
                                station.rating ||
                                  0
                              ).toFixed(1)}
                            </span>

                          </div>

                          {/* PRICE */}

                          <div className="flex items-center gap-1">

                            <FaRupeeSign className="text-green-600" />

                            <span className="font-semibold">
                              {station.price}
                            </span>

                            <span className="text-gray-500 text-sm">
                              /kWh
                            </span>

                          </div>

                          {station.smartScore !== undefined && (
                            <div className="flex items-center gap-2">
                              <span className="text-blue-600 font-semibold">
                                Smart Score:
                              </span>
                              <span className="font-bold">
                                {station.smartScore}/100
                              </span>
                            </div>
                          )}

                        </div>

                      </div>

                      {/* BOOK */}

                      <div className="lg:w-36">

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
                          className={`w-full py-3 rounded-xl font-bold transition ${
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
                )
              )}

            </div>

          </div>
        )}

        {/* =====================================================
            LOCATION ERROR
        ===================================================== */}

        {locationError && (

          <div className="bg-red-50 border border-red-200 rounded-2xl p-5">

            <div className="flex items-start gap-3">

              <FaMapMarkerAlt className="text-red-600 mt-1" />

              <div>

                <p className="font-semibold text-red-700">
                  Location Problem
                </p>

                <p className="text-red-600 text-sm mt-1">
                  {locationError}
                </p>

              </div>

            </div>

          </div>
        )}

      </div>

      {/* =====================================================
          BATTERY MODAL
      ===================================================== */}

      {showBatteryModal &&
        selectedVehicle && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">

              {/* HEADER */}

              <div className="flex items-center justify-between p-6 border-b">

                <div>

                  <h2 className="text-2xl font-bold text-gray-900">
                    Update Battery
                  </h2>

                  <p className="text-gray-500 text-sm mt-1">

                    {selectedVehicle.brand}{" "}
                    {selectedVehicle.model}

                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    closeBatteryModal
                  }
                  disabled={
                    updatingBattery
                  }
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
                >

                  <FaTimes />

                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={
                  handleBatteryUpdate
                }
                className="p-6 space-y-6"
              >

                {/* BATTERY */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Battery
                  </label>

                  <div className="relative">

                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={battery}
                      onChange={(e) =>
                        setBattery(
                          e.target.value
                        )
                      }
                      required
                      className="w-full border border-gray-300 rounded-xl px-4 py-4 pr-12 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                      %
                    </span>

                  </div>

                </div>

                {/* RANGE */}

                <div>

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Estimated Range
                  </label>

                  <div className="relative">

                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={
                        estimatedRange
                      }
                      onChange={(e) =>
                        setEstimatedRange(
                          e.target.value
                        )
                      }
                      placeholder="e.g. 250"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-14 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      km
                    </span>

                  </div>

                </div>

                {/* LOW BATTERY PREVIEW */}

                {Number(battery) <=
                  20 &&
                  battery !== "" && (

                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">

                      <div className="flex gap-3">

                        <FaBell className="text-red-600 mt-1" />

                        <div>

                          <p className="font-bold text-red-700">
                            Low Battery Alert
                          </p>

                          <p className="text-red-600 text-sm mt-1">
                            Your EV is at{" "}
                            <strong>
                              {battery}%
                            </strong>
                            . Saving this value
                            will trigger the low
                            battery warning.
                          </p>

                        </div>

                      </div>

                    </div>
                  )}

                {/* BUTTONS */}

                <div className="flex gap-3">

                  <button
                    type="button"
                    onClick={
                      closeBatteryModal
                    }
                    disabled={
                      updatingBattery
                    }
                    className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={
                      updatingBattery
                    }
                    className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >

                    {updatingBattery ? (

                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />

                        Updating...
                      </>

                    ) : (

                      <>
                        <FaSave />

                        Save Battery
                      </>

                    )}

                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

    </DashboardLayout>
  );
}

export default MyVehicle;