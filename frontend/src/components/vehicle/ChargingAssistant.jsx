import {
  FaRobot,
  FaBatteryQuarter,
  FaMapMarkerAlt,
  FaBolt,
  FaStar,
  FaRupeeSign,
  FaCheckCircle,
} from "react-icons/fa";

function ChargingAssistant({
  vehicle,
  recommendation,
  onBook,
}) {
  if (!vehicle || !recommendation) {
    return null;
  }

  const station =
    recommendation.station || recommendation;

  const battery =
    Number(vehicle.current_battery ?? 0);

  const distance =
    Number(station.distance_km ?? station.distance ?? 0);

  const power =
    Number(station.power ?? 0);

  const price =
    Number(station.price ?? 0);

  const rating =
    Number(station.rating ?? 0);

  const compatible =
    station.compatible !== false;

  // ============================================
  // Generate explanation
  // ============================================

  const reasons = [];

  if (compatible) {
    reasons.push("compatible with your vehicle");
  }

  if (station.available) {
    reasons.push("currently available");
  }

  if (distance > 0 && distance <= 5) {
    reasons.push("close to your current location");
  }

  if (power >= 50) {
    reasons.push("offers fast charging");
  }

  if (rating >= 4) {
    reasons.push("has a good user rating");
  }

  const explanation =
    reasons.length > 0
      ? reasons.join(", ")
      : "selected based on your vehicle and current location.";

  return (
    <div className="mt-8 overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-green-50 shadow-lg">

      {/* ========================================
          HEADER
      ======================================== */}

      <div className="flex items-center gap-4 border-b border-blue-100 bg-white/70 p-6">

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md">
          <FaRobot className="text-2xl" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            AI Charging Assistant
          </h2>

          <p className="text-sm text-gray-600">
            Personalized recommendation for your EV
          </p>
        </div>

      </div>

      {/* ========================================
          BATTERY STATUS
      ======================================== */}

      <div className="grid gap-4 p-6 md:grid-cols-3">

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <FaBatteryQuarter />
            <span className="text-sm">
              Battery
            </span>
          </div>

          <p className="mt-2 text-2xl font-bold text-red-600">
            {battery}%
          </p>

          <p className="text-xs text-gray-500">
            Charging recommended
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <FaMapMarkerAlt />
            <span className="text-sm">
              Distance
            </span>
          </div>

          <p className="mt-2 text-2xl font-bold text-gray-900">
            {distance > 0
              ? `${distance} km`
              : "Nearby"}
          </p>

          <p className="text-xs text-gray-500">
            From your current location
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <FaBolt />
            <span className="text-sm">
              Charging Power
            </span>
          </div>

          <p className="mt-2 text-2xl font-bold text-green-600">
            {power > 0
              ? `${power} kW`
              : "Available"}
          </p>

          <p className="text-xs text-gray-500">
            Station capability
          </p>
        </div>

      </div>

      {/* ========================================
          RECOMMENDATION
      ======================================== */}

      <div className="px-6 pb-6">

        <div className="rounded-3xl bg-white p-6 shadow-md">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                  ⭐ BEST RECOMMENDATION
                </span>

                {compatible && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                    <FaCheckCircle />
                    Compatible
                  </span>
                )}
              </div>

              <h3 className="text-2xl font-bold text-gray-900">
                {station.name}
              </h3>

              <div className="mt-2 flex items-center gap-2 text-gray-600">
                <FaMapMarkerAlt />
                <span>
                  {station.location ||
                    "Charging station"}
                </span>
              </div>

            </div>

            <div className="text-left md:text-right">

              <p className="text-sm text-gray-500">
                AI Recommendation Score
              </p>

              <p className="text-4xl font-extrabold text-blue-600">
                {station.score ??
                  station.smartScore ??
                  "--"}
              </p>

            </div>

          </div>

          {/* ====================================
              STATION DETAILS
          ==================================== */}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">
                Charger
              </p>

              <p className="mt-1 font-semibold">
                {station.charger ||
                  "EV Charger"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">
                Power
              </p>

              <p className="mt-1 font-semibold">
                {power > 0
                  ? `${power} kW`
                  : "N/A"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">
                Price
              </p>

              <p className="mt-1 flex items-center gap-1 font-semibold">
                <FaRupeeSign />
                {price > 0
                  ? `${price}/kWh`
                  : "N/A"}
              </p>
            </div>

            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs text-gray-500">
                Rating
              </p>

              <p className="mt-1 flex items-center gap-1 font-semibold">
                <FaStar className="text-yellow-500" />
                {rating > 0
                  ? rating
                  : "New"}
              </p>
            </div>

          </div>

          {/* ====================================
              AI EXPLANATION
          ==================================== */}

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-5">

            <div className="flex gap-3">

              <FaRobot className="mt-1 text-xl text-blue-600" />

              <div>

                <h4 className="font-bold text-gray-900">
                  Why I recommend this station
                </h4>

                <p className="mt-1 text-sm leading-6 text-gray-700">
                  Your battery is at{" "}
                  <strong>
                    {battery}%
                  </strong>
                  . I selected{" "}
                  <strong>
                    {station.name}
                  </strong>{" "}
                  because it is{" "}
                  {explanation}.
                </p>

              </div>

            </div>

          </div>

          {/* ====================================
              BOOK BUTTON
          ==================================== */}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">

            <button
              type="button"
              onClick={() => onBook?.(station)}
              className="flex-1 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg"
            >
              ⚡ Book This Station
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ChargingAssistant;