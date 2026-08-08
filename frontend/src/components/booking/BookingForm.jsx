import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createBooking } from "../../services/bookingService";

function BookingForm({ stationId }) {
  const navigate = useNavigate();

  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!bookingDate || !startTime || !endTime) {
      toast.error("Please fill all fields");
      return;
    }

    if (endTime <= startTime) {
      toast.error("End time must be after start time");
      return;
    }

    try {
      setLoading(true);

      const booking = {
        user_id: 1, // Temporary (replace with JWT user later)
        station_id: stationId,
        booking_date: bookingDate,
        start_time: startTime,
        end_time: endTime,
      };

      const res = await createBooking(booking, token);

      toast.success(
        res.message || "Booking created successfully!"
      );

      setBookingDate("");
      setStartTime("");
      setEndTime("");

      setTimeout(() => {
        navigate("/dashboard/bookings");
      }, 1000);

    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Booking failed!"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">
        Book Charging Slot
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div>
          <label className="block mb-2 font-semibold">
            Booking Date
          </label>

          <input
            type="date"
            value={bookingDate}
            onChange={(e) =>
              setBookingDate(e.target.value)
            }
            min={new Date().toISOString().split("T")[0]}
            required
            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Start Time
          </label>

          <input
            type="time"
            value={startTime}
            onChange={(e) =>
              setStartTime(e.target.value)
            }
            required
            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            End Time
          </label>

          <input
            type="time"
            value={endTime}
            onChange={(e) =>
              setEndTime(e.target.value)
            }
            required
            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Booking..." : "Book Charging Slot"}
        </button>
      </form>
    </div>
  );
}

export default BookingForm;