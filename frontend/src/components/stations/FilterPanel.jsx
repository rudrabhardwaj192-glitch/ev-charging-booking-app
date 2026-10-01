import { useState } from "react";
import {
  FaFilter,
  FaBolt,
  FaRupeeSign,
  FaStar,
  FaCheckCircle,
  FaChevronDown,
} from "react-icons/fa";

function FilterPanel({
  filter,
  setFilter,
  advancedFilters,
  setAdvancedFilters,
}) {
  const [showAdvanced, setShowAdvanced] =
    useState(false);

  const updateFilter = (key, value) => {
    setAdvancedFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilter("all");

    setAdvancedFilters({
      chargerType: "all",
      minPower: 0,
      maxPrice: 100,
      minRating: 0,
      availableOnly: false,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">

      {/* =================================================
          BASIC FILTERS
      ================================================= */}

      <div className="flex flex-col lg:flex-row lg:items-center gap-4">

        <div className="flex items-center gap-2 font-bold text-gray-800">

          <FaFilter className="text-green-600" />

          <span>
            Filters
          </span>

        </div>

        <div className="flex flex-wrap gap-3">

          {/* ALL */}

          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-5 py-2.5 rounded-xl font-semibold transition ${
              filter === "all"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </button>

          {/* AVAILABLE */}

          <button
            type="button"
            onClick={() => setFilter("available")}
            className={`px-5 py-2.5 rounded-xl font-semibold transition ${
              filter === "available"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Available
          </button>

          {/* FAST */}

          <button
            type="button"
            onClick={() => setFilter("fast")}
            className={`px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition ${
              filter === "fast"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <FaBolt />
            Fast Charger
          </button>

          {/* AC */}

          <button
            type="button"
            onClick={() => setFilter("ac")}
            className={`px-5 py-2.5 rounded-xl font-semibold transition ${
              filter === "ac"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            AC Charger
          </button>

          {/* ADVANCED */}

          <button
            type="button"
            onClick={() =>
              setShowAdvanced(
                (previous) => !previous
              )
            }
            className="px-5 py-2.5 rounded-xl font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 flex items-center gap-2 transition"
          >
            Advanced

            <FaChevronDown
              className={`transition ${
                showAdvanced
                  ? "rotate-180"
                  : ""
              }`}
            />

          </button>

        </div>

      </div>

      {/* =================================================
          ADVANCED FILTERS
      ================================================= */}

      {showAdvanced && (

        <div className="mt-6 pt-6 border-t border-gray-200">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* CHARGER TYPE */}

            <div>

              <label className="block text-sm font-bold text-gray-700 mb-2">
                Charger Type
              </label>

              <select
                value={
                  advancedFilters.chargerType
                }
                onChange={(e) =>
                  updateFilter(
                    "chargerType",
                    e.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="all">
                  All Chargers
                </option>

                <option value="AC">
                  AC
                </option>

                <option value="DC">
                  DC
                </option>

                <option value="CCS">
                  CCS
                </option>

                <option value="CHAdeMO">
                  CHAdeMO
                </option>

              </select>

            </div>

            {/* MINIMUM POWER */}

            <div>

              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">

                <FaBolt className="text-yellow-500" />

                Minimum Power

              </label>

              <select
                value={
                  advancedFilters.minPower
                }
                onChange={(e) =>
                  updateFilter(
                    "minPower",
                    Number(e.target.value)
                  )
                }
                className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500"
              >

                <option value="0">
                  Any Power
                </option>

                <option value="7">
                  7+ kW
                </option>

                <option value="22">
                  22+ kW
                </option>

                <option value="50">
                  50+ kW
                </option>

                <option value="100">
                  100+ kW
                </option>

                <option value="150">
                  150+ kW
                </option>

              </select>

            </div>

            {/* MAX PRICE */}

            <div>

              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">

                <FaRupeeSign className="text-green-600" />

                Maximum Price / kWh

              </label>

              <select
                value={
                  advancedFilters.maxPrice
                }
                onChange={(e) =>
                  updateFilter(
                    "maxPrice",
                    Number(e.target.value)
                  )
                }
                className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500"
              >

                <option value="100">
                  Any Price
                </option>

                <option value="10">
                  Up to ₹10
                </option>

                <option value="15">
                  Up to ₹15
                </option>

                <option value="20">
                  Up to ₹20
                </option>

                <option value="30">
                  Up to ₹30
                </option>

                <option value="50">
                  Up to ₹50
                </option>

              </select>

            </div>

            {/* MINIMUM RATING */}

            <div>

              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">

                <FaStar className="text-yellow-500" />

                Minimum Rating

              </label>

              <select
                value={
                  advancedFilters.minRating
                }
                onChange={(e) =>
                  updateFilter(
                    "minRating",
                    Number(e.target.value)
                  )
                }
                className="w-full border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-green-500"
              >

                <option value="0">
                  Any Rating
                </option>

                <option value="3">
                  ⭐ 3+
                </option>

                <option value="3.5">
                  ⭐ 3.5+
                </option>

                <option value="4">
                  ⭐ 4+
                </option>

                <option value="4.5">
                  ⭐ 4.5+
                </option>

              </select>

            </div>

          </div>

          {/* AVAILABLE ONLY */}

          <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <label className="flex items-center gap-3 cursor-pointer">

              <input
                type="checkbox"
                checked={
                  advancedFilters.availableOnly
                }
                onChange={(e) =>
                  updateFilter(
                    "availableOnly",
                    e.target.checked
                  )
                }
                className="w-5 h-5 accent-green-600"
              />

              <span className="flex items-center gap-2 font-semibold text-gray-700">

                <FaCheckCircle className="text-green-600" />

                Available stations only

              </span>

            </label>

            {/* CLEAR */}

            <button
              type="button"
              onClick={clearFilters}
              className="px-5 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-semibold transition"
            >
              Clear Filters
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default FilterPanel;