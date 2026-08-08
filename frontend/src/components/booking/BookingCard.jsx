import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaTrash,
  FaEye,
} from "react-icons/fa";

function BookingCard({ booking, onCancel }) {
  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition p-6 border">

      <div className="flex justify-between items-start">

        <div>
          <h2 className="text-2xl font-bold">
            {booking.station_name}
          </h2>

          <div className="flex items-center gap-2 mt-3 text-gray-600">
            <FaMapMarkerAlt />
            <span>{booking.location}</span>
          </div>

          <div className="flex items-center gap-2 mt-2 text-gray-600">
            <FaCalendarAlt />
            <span>{booking.booking_date}</span>
          </div>

          <div className="flex items-center gap-2 mt-2 text-gray-600">
            <FaClock />
            <span>
              {booking.start_time} - {booking.end_time}
            </span>
          </div>

          <div className="mt-4">
            <span
              className={`px-4 py-2 rounded-full text-white ${
                booking.status === "Cancelled"
                  ? "bg-red-500"
                  : "bg-green-600"
              }`}
            >
              {booking.status}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaEye />
            View
          </button>

          <button
            onClick={() => onCancel(booking.id)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaTrash />
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
}

export default BookingCard;