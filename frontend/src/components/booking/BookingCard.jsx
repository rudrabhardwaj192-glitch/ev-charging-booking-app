import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaTrash,
  FaEye,
  FaBolt,
  FaMoneyBillWave,
} from "react-icons/fa";

function BookingCard({ booking, onCancel }) {

  // ==========================================
  // Format date
  // ==========================================
  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // Format time
  // ==========================================
  const formatTime = (time) => {
    if (!time) return "N/A";

    const parts = time.split(":");

    if (parts.length < 2) {
      return time;
    }

    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    const date = new Date();

    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);

    return date.toLocaleTimeString(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }
    );
  };

  const isConfirmed =
    booking.status === "Confirmed";

  const isCancelled =
    booking.status === "Cancelled";

  const isPaid =
    booking.payment_status === "Paid";

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 border">

      <div className="flex flex-col lg:flex-row justify-between gap-6">

        {/* ============================= */}
        {/* Booking Information */}
        {/* ============================= */}

        <div className="flex-1">

          <div className="flex items-center gap-3 mb-4">

            <h2 className="text-2xl font-bold">
              {booking.station_name ||
                "Charging Station"}
            </h2>

            {isConfirmed && isPaid && (
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
                PAID
              </span>
            )}

          </div>

          {/* Location */}
          <div className="flex items-center gap-3 mt-3 text-gray-600">
            <FaMapMarkerAlt className="text-red-500" />

            <span>
              {booking.location ||
                "Location unavailable"}
            </span>
          </div>

          {/* Date */}
          <div className="flex items-center gap-3 mt-3 text-gray-600">
            <FaCalendarAlt className="text-green-600" />

            <span>
              {formatDate(
                booking.booking_date
              )}
            </span>
          </div>

          {/* Time */}
          <div className="flex items-center gap-3 mt-3 text-gray-600">
            <FaClock className="text-blue-600" />

            <span>
              {formatTime(
                booking.start_time
              )}{" "}
              -{" "}
              {formatTime(
                booking.end_time
              )}
            </span>
          </div>

          {/* Charger */}
          {booking.charger && (
            <div className="flex items-center gap-3 mt-3 text-gray-600">
              <FaBolt className="text-yellow-500" />

              <span>
                {booking.charger}
                {booking.power
                  ? ` • ${booking.power} kW`
                  : ""}
              </span>
            </div>
          )}

          {/* Amount */}
          {booking.amount !== null &&
            booking.amount !== undefined && (
              <div className="flex items-center gap-3 mt-4 font-semibold text-green-700">
                <FaMoneyBillWave />

                <span>
                  Amount: ₹
                  {Number(
                    booking.amount
                  ).toFixed(2)}
                </span>
              </div>
            )}

          {/* Status */}
          <div className="flex flex-wrap gap-3 mt-5">

            <span
              className={`px-4 py-2 rounded-full text-white font-semibold ${
                isConfirmed
                  ? "bg-green-600"
                  : isCancelled
                  ? "bg-red-500"
                  : "bg-yellow-500"
              }`}
            >
              Booking: {booking.status}
            </span>

            <span
              className={`px-4 py-2 rounded-full text-white font-semibold ${
                isPaid
                  ? "bg-green-600"
                  : isCancelled
                  ? "bg-gray-500"
                  : "bg-yellow-500"
              }`}
            >
              Payment:{" "}
              {booking.payment_status ||
                "Pending"}
            </span>

          </div>

        </div>

        {/* ============================= */}
        {/* Buttons */}
        {/* ============================= */}

        <div className="flex flex-col gap-3 lg:w-40">

          {/* View */}
          <button
            onClick={() =>
              window.location.href =
                `/dashboard/bookings/${booking.id}`
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition"
          >
            <FaEye />
            View
          </button>

          {/* Cancel */}
          {!isCancelled && (
            <button
              onClick={() =>
                onCancel(booking.id)
              }
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold transition"
            >
              <FaTrash />
              Cancel
            </button>
          )}

        </div>

      </div>

    </div>
  );
}

export default BookingCard;