import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  FaCar,
  FaBatteryFull,
  FaBolt,
  FaPlug,
  FaRoad,
  FaIdCard,
  FaSave,
  FaArrowLeft,
} from "react-icons/fa";

import DashboardLayout from "../../components/layout/DashboardLayout";

import { addVehicle } from "../../services/vehicleService";

function AddVehicle() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    registration_number: "",
    battery_capacity: "",
    current_battery: "100",
    estimated_range: "",
    connector_type: "",
    max_charging_power: "",
  });

  // ======================================================
  // HANDLE INPUT
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ======================================================
  // SUBMIT
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.brand.trim()) {
      toast.error("Please enter vehicle brand.");
      return;
    }

    if (!formData.model.trim()) {
      toast.error("Please enter vehicle model.");
      return;
    }

    const battery = Number(
      formData.current_battery
    );

    if (
      Number.isNaN(battery) ||
      battery < 0 ||
      battery > 100
    ) {
      toast.error(
        "Battery percentage must be between 0 and 100."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        brand: formData.brand.trim(),

        model: formData.model.trim(),

        year: formData.year
          ? Number(formData.year)
          : null,

        registration_number:
          formData.registration_number.trim() ||
          null,

        battery_capacity:
          formData.battery_capacity
            ? Number(formData.battery_capacity)
            : null,

        current_battery: battery,

        estimated_range:
          formData.estimated_range
            ? Number(formData.estimated_range)
            : null,

        connector_type:
          formData.connector_type ||
          null,

        max_charging_power:
          formData.max_charging_power
            ? Number(
                formData.max_charging_power
              )
            : null,
      };

      await addVehicle(payload);

      toast.success(
        "Vehicle added successfully! 🚗"
      );

      navigate("/dashboard/vehicle");

    } catch (error) {
      console.error(
        "Add vehicle error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Unable to add vehicle."
      );

    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // CANCEL
  // ======================================================

  const handleCancel = () => {
    navigate("/dashboard/vehicle");
  };

  return (
    <DashboardLayout>

      <div className="max-w-5xl mx-auto">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex items-center gap-4 mb-8">

          <button
            type="button"
            onClick={handleCancel}
            className="w-11 h-11 rounded-xl bg-white shadow flex items-center justify-center text-gray-600 hover:bg-gray-100 transition"
          >
            <FaArrowLeft />
          </button>

          <div>

            <h1 className="text-4xl font-bold text-gray-900">
              Add Your EV
            </h1>

            <p className="text-gray-500 mt-1">
              Add your electric vehicle to enable
              smart charging features.
            </p>

          </div>

        </div>

        {/* ==================================================
            FORM CARD
        ================================================== */}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl shadow-lg overflow-hidden"
        >

          {/* ==================================================
              VEHICLE INFORMATION
          ================================================== */}

          <div className="p-8 border-b">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">

                <FaCar className="text-green-600 text-xl" />

              </div>

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Vehicle Information
                </h2>

                <p className="text-gray-500 text-sm">
                  Basic information about your EV
                </p>

              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* BRAND */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vehicle Brand *
                </label>

                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g. Tata"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />

              </div>

              {/* MODEL */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Vehicle Model *
                </label>

                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g. Nexon EV"
                  required
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />

              </div>

              {/* YEAR */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Manufacturing Year
                </label>

                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="e.g. 2025"
                  min="2000"
                  max="2035"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                />

              </div>

              {/* REGISTRATION */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Registration Number
                </label>

                <div className="relative">

                  <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                  <input
                    type="text"
                    name="registration_number"
                    value={
                      formData.registration_number
                    }
                    onChange={handleChange}
                    placeholder="e.g. JH01AB1234"
                    className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 uppercase focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                </div>

              </div>

            </div>

          </div>

          {/* ==================================================
              BATTERY INFORMATION
          ================================================== */}

          <div className="p-8 border-b">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">

                <FaBatteryFull className="text-green-600 text-xl" />

              </div>

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Battery Information
                </h2>

                <p className="text-gray-500 text-sm">
                  This information powers our smart
                  charging recommendations.
                </p>

              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* BATTERY CAPACITY */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Battery Capacity
                </label>

                <div className="relative">

                  <input
                    type="number"
                    name="battery_capacity"
                    value={
                      formData.battery_capacity
                    }
                    onChange={handleChange}
                    placeholder="40.5"
                    min="1"
                    step="0.1"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-16 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    kWh
                  </span>

                </div>

              </div>

              {/* CURRENT BATTERY */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Battery *
                </label>

                <div className="relative">

                  <input
                    type="number"
                    name="current_battery"
                    value={
                      formData.current_battery
                    }
                    onChange={handleChange}
                    min="0"
                    max="100"
                    step="1"
                    required
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                    %
                  </span>

                </div>

              </div>

              {/* ESTIMATED RANGE */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Estimated Range
                </label>

                <div className="relative">

                  <input
                    type="number"
                    name="estimated_range"
                    value={
                      formData.estimated_range
                    }
                    onChange={handleChange}
                    placeholder="280"
                    min="0"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                  <FaRoad className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />

                </div>

              </div>

            </div>

          </div>

          {/* ==================================================
              CHARGING INFORMATION
          ================================================== */}

          <div className="p-8">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">

                <FaPlug className="text-green-600 text-xl" />

              </div>

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Charging Information
                </h2>

                <p className="text-gray-500 text-sm">
                  Tell us about your EV charging
                  configuration.
                </p>

              </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* CONNECTOR */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Connector Type
                </label>

                <select
                  name="connector_type"
                  value={
                    formData.connector_type
                  }
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                >

                  <option value="">
                    Select connector
                  </option>

                  <option value="CCS2">
                    CCS2
                  </option>

                  <option value="Type 2">
                    Type 2
                  </option>

                  <option value="CHAdeMO">
                    CHAdeMO
                  </option>

                  <option value="GB/T">
                    GB/T
                  </option>

                  <option value="Type 1">
                    Type 1
                  </option>

                </select>

              </div>

              {/* MAX POWER */}

              <div>

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Maximum Charging Power
                </label>

                <div className="relative">

                  <input
                    type="number"
                    name="max_charging_power"
                    value={
                      formData.max_charging_power
                    }
                    onChange={handleChange}
                    placeholder="50"
                    min="1"
                    step="0.1"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                  <FaBolt className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />

                </div>

              </div>

            </div>

          </div>

          {/* ==================================================
              FOOTER ACTIONS
          ================================================== */}

          <div className="bg-gray-50 px-8 py-6 flex flex-col sm:flex-row justify-end gap-3">

            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 font-semibold hover:bg-gray-100 transition disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-7 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >

              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave />
                  Save My EV
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </DashboardLayout>
  );
}

export default AddVehicle;