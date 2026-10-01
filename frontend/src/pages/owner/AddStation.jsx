import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
  FaCar,
  FaBatteryFull,
  FaBolt,
  FaPlug,
  FaRoad,
  FaEdit,
  FaTrash,
  FaBell,
  FaMapMarkerAlt,
  FaTimes,
  FaSave,
} from "react-icons/fa";

import DashboardLayout from "../../components/layout/DashboardLayout";

import {
  getMyVehicles,
  deleteVehicle,
  updateBattery,
} from "../../services/vehicleService";

function MyVehicle() {
  const [vehicles, setVehicles] = useState([]);

  const [loading, setLoading] = useState(true);

  // Battery modal
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
  // LOAD VEHICLES
  // =====================================================

  const loadVehicles = async () => {
    try {
      setLoading(true);

      const response =
        await getMyVehicles();

      setVehicles(
        response.data || []
      );
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
  // BROWSER NOTIFICATION
  // =====================================================

  const sendLowBatteryNotification = async (
    vehicle,
    batteryPercentage
  ) => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window)
    ) {
      return;
    }

    try {
      let permission =
        Notification.permission;

      // Ask permission after user action
      if (permission === "default") {
        permission =
          await Notification.requestPermission();
      }

      if (permission !== "granted") {
        return;
      }

      new Notification(
        "🔋 Low EV Battery",
        {
          body: `${vehicle.brand} ${vehicle.model} battery is at ${batteryPercentage}%. Find a nearby charging station.`,
          icon: "/favicon.ico",
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
  // OPEN BATTERY MODAL
  // =====================================================

  const openBatteryModal = (vehicle) => {
    setSelectedVehicle(vehicle);

    setBattery(
      String(
        vehicle.current_battery ?? 100
      )
    );

    setEstimatedRange(
      vehicle.estimated_range !== null &&
        vehicle.estimated_range !== undefined
        ? String(vehicle.estimated_range)
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
  // UPDATE BATTERY
  // =====================================================

  const handleBatteryUpdate = async (e) => {
    e.preventDefault();

    if (!selectedVehicle) {
      return;
    }

    const batteryValue =
      Number(battery);

    const rangeValue =
      estimatedRange === ""
        ? null
        : Number(estimatedRange);

    // Validate battery
    if (
      Number.isNaN(batteryValue) ||
      batteryValue < 0 ||
      batteryValue > 100
    ) {
      toast.error(
        "Battery must be between 0% and 100%."
      );

      return;
    }

    // Validate range
    if (
      rangeValue !== null &&
      (Number.isNaN(rangeValue) ||
        rangeValue < 0)
    ) {
      toast.error(
        "Please enter a valid estimated range."
      );

      return;
    }

    try {
      setUpdatingBattery(true);

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

      // Update card immediately
      setVehicles((previous) =>
        previous.map((vehicle) =>
          vehicle.id ===
          selectedVehicle.id
            ? updatedVehicle
            : vehicle
        )
      );

      // Close modal
      setShowBatteryModal(false);

      setSelectedVehicle(null);

      toast.success(
        "Battery updated successfully 🔋"
      );

      // =================================================
      // LOW BATTERY DETECTION
      // =================================================

      if (batteryValue <= 20) {
        toast(
          "🔋 Your EV battery is low. Charging is recommended.",
          {
            duration: 6000,
            icon: "⚠️",
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
        error.response?.data?.message ||
          "Unable to update battery."
      );
    } finally {
      setUpdatingBattery(false);
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
        error.response?.data?.message ||
          "Unable to delete vehicle."
      );
    }
  };

  // =====================================================
  // BATTERY COLOR
  // =====================================================

  const getBatteryColor = (
    batteryPercentage
  ) => {
    if (batteryPercentage <= 20) {
      return "bg-red-500";
    }

    if (batteryPercentage <= 40) {
      return "bg-yellow-500";
    }

    return "bg-green-500";
  };

  // =====================================================
  // BATTERY STATUS
  // =====================================================

  const getBatteryStatus = (
    batteryPercentage
  ) => {
    if (batteryPercentage <= 10) {
      return "Critical";
    }

    if (batteryPercentage <= 20) {
      return "Low";
    }

    if (batteryPercentage <= 40) {
      return "Moderate";
    }

    return "Good";
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[400px]">

          <div className="flex flex-col items-center gap-4">

            <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />

            <p className="text-gray-500">
              Loading your EV...
            </p>

          </div>

        </div>
      </DashboardLayout>
    );
  }

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
            <span className="text-xl">
              +
            </span>

            Add Vehicle
          </Link>

        </div>

        {/* =================================================
            NO VEHICLE
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
              +
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

              const currentBattery =
                Number(
                  vehicle.current_battery
                ) || 0;

              const batteryStatus =
                getBatteryStatus(
                  currentBattery
                );

              const isLowBattery =
                currentBattery <= 20;

              return (

                <div
                  key={vehicle.id}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden"
                >

                  {/* =================================================
                      VEHICLE HEADER
                  ================================================= */}

                  <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white">

                    <div className="flex items-center justify-between">

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

                  </div>

                  {/* =================================================
                      VEHICLE CONTENT
                  ================================================= */}

                  <div className="p-6">

                    {/* =================================================
                        LOW BATTERY ALERT
                    ================================================= */}

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
                                {currentBattery}%
                              </strong>
                              . Charging is recommended.

                            </p>

                            <Link
                              to="/stations"
                              className="inline-flex items-center gap-2 mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition"
                            >

                              <FaMapMarkerAlt />

                              Find Nearby Stations

                            </Link>

                          </div>

                        </div>

                      </div>

                    )}

                    {/* =================================================
                        BATTERY
                    ================================================= */}

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
                            {currentBattery}%
                          </span>

                          <p
                            className={`text-xs font-semibold ${
                              isLowBattery
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {batteryStatus}
                          </p>

                        </div>

                      </div>

                      {/* BATTERY BAR */}

                      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">

                        <div
                          className={`h-full transition-all duration-500 ${getBatteryColor(
                            currentBattery
                          )}`}
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                currentBattery
                              )
                            )}%`,
                          }}
                        />

                      </div>

                      {/* UPDATE BUTTON */}

                      <button
                        type="button"
                        onClick={() =>
                          openBatteryModal(
                            vehicle
                          )
                        }
                        className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold transition"
                      >
                        🔋 Update Battery
                      </button>

                    </div>

                    {/* =================================================
                        VEHICLE DETAILS
                    ================================================= */}

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

                      {/* CAPACITY */}

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

                      {/* MAX CHARGING */}

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

                    {/* =================================================
                        REGISTRATION
                    ================================================= */}

                    {vehicle.registration_number && (

                      <div className="mt-5 p-4 bg-gray-50 rounded-2xl">

                        <p className="text-sm text-gray-500">
                          Registration Number
                        </p>

                        <p className="font-bold mt-1 uppercase">
                          {vehicle.registration_number}
                        </p>

                      </div>

                    )}

                    {/* =================================================
                        ACTIONS
                    ================================================= */}

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

      </div>

      {/* =====================================================
          BATTERY UPDATE MODAL
      ===================================================== */}

      {showBatteryModal &&
        selectedVehicle && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl">

              {/* MODAL HEADER */}

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
                  onClick={closeBatteryModal}
                  disabled={updatingBattery}
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
                      value={battery}
                      onChange={(e) =>
                        setBattery(
                          e.target.value
                        )
                      }
                      min="0"
                      max="100"
                      step="1"
                      required
                      autoFocus
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
                      value={estimatedRange}
                      onChange={(e) =>
                        setEstimatedRange(
                          e.target.value
                        )
                      }
                      min="0"
                      step="0.1"
                      placeholder="e.g. 280"
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-14 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                      km
                    </span>

                  </div>

                </div>

                {/* LOW BATTERY PREVIEW */}

                {Number(battery) <= 20 &&
                  battery !== "" && (

                    <div className="bg-red-50 border border-red-200 rounded-xl p-4">

                      <div className="flex gap-3">

                        <FaBell className="text-red-600 mt-1" />

                        <div>

                          <p className="font-bold text-red-700">
                            Low battery alert will trigger
                          </p>

                          <p className="text-red-600 text-sm mt-1">
                            Your EV will be marked as
                            needing charging.
                          </p>

                        </div>

                      </div>

                    </div>

                  )}

                {/* ACTIONS */}

                <div className="flex gap-3">

                  <button
                    type="button"
                    onClick={closeBatteryModal}
                    disabled={updatingBattery}
                    className="flex-1 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={updatingBattery}
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