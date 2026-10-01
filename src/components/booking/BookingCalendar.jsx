import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

const TIME_SLOTS = [
  {
    start: "09:00",
    end: "10:00",
    label: "9:00 AM - 10:00 AM",
  },
  {
    start: "10:00",
    end: "11:00",
    label: "10:00 AM - 11:00 AM",
  },
  {
    start: "11:00",
    end: "12:00",
    label: "11:00 AM - 12:00 PM",
  },
  {
    start: "12:00",
    end: "13:00",
    label: "12:00 PM - 1:00 PM",
  },
  {
    start: "13:00",
    end: "14:00",
    label: "1:00 PM - 2:00 PM",
  },
  {
    start: "14:00",
    end: "15:00",
    label: "2:00 PM - 3:00 PM",
  },
  {
    start: "15:00",
    end: "16:00",
    label: "3:00 PM - 4:00 PM",
  },
  {
    start: "16:00",
    end: "17:00",
    label: "4:00 PM - 5:00 PM",
  },
  {
    start: "17:00",
    end: "18:00",
    label: "5:00 PM - 6:00 PM",
  },
  {
    start: "18:00",
    end: "19:00",
    label: "6:00 PM - 7:00 PM",
  },
  {
    start: "19:00",
    end: "20:00",
    label: "7:00 PM - 8:00 PM",
  },
  {
    start: "20:00",
    end: "21:00",
    label: "8:00 PM - 9:00 PM",
  },
];

function getToday() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");
  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function BookingCalendar({ stationId }) {
  const [date, setDate] = useState(getToday());

  const [bookedSlots, setBookedSlots] =
    useState([]);

  const [selectedSlot, setSelectedSlot] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [booking, setBooking] =
    useState(false);

  // ==========================================
  // LOAD BOOKED SLOTS
  // ==========================================
  useEffect(() => {
    if (!stationId || !date) {
      return;
    }

    loadBookedSlots();
  }, [stationId, date]);

  // ==========================================
  // GET BOOKED SLOTS
  // ==========================================
  const loadBookedSlots = async () => {
    try {
      setLoading(true);

      setSelectedSlot(null);

      const token =
        localStorage.getItem("token");

      if (!token) {
        toast.error(
          "Please login to view booking slots."
        );

        setBookedSlots([]);

        return;
      }

      const response = await api.get(
        `/bookings/slots/${stationId}`,
        {
          params: {
            date: date,
          },

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookedSlots(
        response.data?.data || []
      );
    } catch (error) {
      console.error(
        "Failed to load slots:",
        error
      );

      setBookedSlots([]);

      toast.error(
        error.response?.data?.message ||
          "Failed to load booking slots."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // CHECK WHETHER SLOT IS BOOKED
  // ==========================================
  const isSlotBooked = (slot) => {
    return bookedSlots.some((booking) => {
      if (
        booking.status?.toLowerCase() ===
        "cancelled"
      ) {
        return false;
      }

      const bookingStart =
        String(booking.start_time).slice(0, 5);

      const bookingEnd =
        String(booking.end_time).slice(0, 5);

      return (
        slot.start < bookingEnd &&
        slot.end > bookingStart
      );
    });
  };

  // ==========================================
  // SELECT SLOT
  // ==========================================
  const handleSelectSlot = (slot) => {
    if (isSlotBooked(slot)) {
      return;
    }

    setSelectedSlot(slot);
  };

  // ==========================================
  // BOOK SLOT
  // ==========================================
  const handleBook = async () => {
    if (!selectedSlot) {
      toast.error(
        "Please select an available time slot."
      );

      return;
    }

    const token =
      localStorage.getItem("token");

    if (!token) {
      toast.error(
        "Please login before booking."
      );

      return;
    }

    try {
      setBooking(true);

      await api.post(
        "/bookings",
        {
          station_id: Number(stationId),
          booking_date: date,
          start_time: selectedSlot.start,
          end_time: selectedSlot.end,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(
        "Booking created successfully!"
      );

      setSelectedSlot(null);

      // Reload availability immediately
      await loadBookedSlots();
    } catch (error) {
      console.error(
        "Booking failed:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to create booking."
      );

      // Refresh slots in case another user
      // booked the slot at the same time.
      await loadBookedSlots();
    } finally {
      setBooking(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">

      {/* Header */}
      <div className="mb-6">

        <h2 className="text-2xl font-bold">
          📅 Book Charging Slot
        </h2>

        <p className="text-gray-500 mt-1">
          Select a date and an available
          charging time.
        </p>

      </div>

      {/* Date Selection */}
      <div className="mb-8">

        <label
          htmlFor="booking-date"
          className="block font-semibold mb-2"
        >
          Select Date
        </label>

        <input
          id="booking-date"
          type="date"
          value={date}
          min={getToday()}
          onChange={(e) => {
            setDate(e.target.value);
            setSelectedSlot(null);
          }}
          className="border border-gray-300 rounded-lg px-4 py-3 w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-green-500"
        />

      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-6">
          <p className="text-gray-500">
            Checking available slots...
          </p>
        </div>
      )}

      {/* Time Slots */}
      {!loading && (
        <div>

          <h3 className="font-semibold text-lg mb-4">
            Available Time Slots
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {TIME_SLOTS.map((slot) => {
              const booked =
                isSlotBooked(slot);

              const selected =
                selectedSlot?.start ===
                slot.start;

              return (
                <button
                  key={slot.start}
                  type="button"
                  disabled={
                    booked || booking
                  }
                  onClick={() =>
                    handleSelectSlot(slot)
                  }
                  className={`
                    w-full
                    p-4
                    rounded-xl
                    border
                    text-left
                    transition
                    duration-200

                    ${
                      booked
                        ? "bg-red-50 border-red-300 text-red-500 cursor-not-allowed"
                        : selected
                        ? "bg-green-600 border-green-600 text-white"
                        : "bg-green-50 border-green-300 text-green-800 hover:bg-green-100"
                    }
                  `}
                >

                  <div className="font-semibold">
                    {slot.label}
                  </div>

                  <div className="text-sm mt-1">

                    {booked
                      ? "❌ Booked"
                      : selected
                      ? "✓ Selected"
                      : "✓ Available"}

                  </div>

                </button>
              );
            })}

          </div>

        </div>
      )}

      {/* Selected Slot */}
      {selectedSlot && (
        <div className="mt-8 border-t pt-6">

          <div className="bg-green-50 border border-green-200 rounded-xl p-5">

            <p className="text-gray-600">
              Selected Date
            </p>

            <p className="font-semibold mb-4">
              {date}
            </p>

            <p className="text-gray-600">
              Selected Time
            </p>

            <p className="font-semibold">
              {selectedSlot.label}
            </p>

          </div>

          {/* Book Button */}
          <button
            type="button"
            disabled={booking}
            onClick={handleBook}
            className="mt-5 w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-xl font-semibold transition"
          >
            {booking
              ? "Booking..."
              : "Book This Slot"}
          </button>

        </div>
      )}

      {/* No Slot Selected */}
      {!selectedSlot && !loading && (
        <div className="mt-6 text-center text-gray-500">
          Select an available slot to continue.
        </div>
      )}

    </div>
  );
}

export default BookingCalendar;