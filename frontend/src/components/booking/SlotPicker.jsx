import { useEffect, useMemo, useState } from "react";
import { FaBolt, FaCheckCircle, FaClock } from "react-icons/fa";
import api from "../../services/api";

function SlotPicker({
  stationId,
  bookingDate,
  startTime,
  endTime,
  setStartTime,
  setEndTime,
}) {
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // GENERATE HOURLY SLOTS
  // =====================================================

  const slots = useMemo(() => {
    const result = [];

    for (let hour = 0; hour < 24; hour++) {
      const startHour = String(hour).padStart(2, "0");
      const endHour = String(
        (hour + 1) % 24
      ).padStart(2, "0");

      result.push({
        start: `${startHour}:00`,
        end: `${endHour}:00`,
      });
    }

    return result;
  }, []);

  // =====================================================
  // LOAD BOOKED SLOTS
  // =====================================================

  useEffect(() => {
    if (!stationId || !bookingDate) {
      setBookedSlots([]);
      return;
    }

    const loadBookedSlots = async () => {
      try {
        setLoading(true);
        setError("");

        const token =
          localStorage.getItem("token");

        const response = await api.get(
          `/bookings/slots/${stationId}`,
          {
            params: {
              date: bookingDate,
            },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data?.success) {
          setBookedSlots(
            response.data.data || []
          );
        } else {
          setBookedSlots([]);
        }
      } catch (err) {
        console.error(
          "Failed to load booked slots:",
          err
        );

        setError(
          err.response?.data?.message ||
            "Unable to load slot availability."
        );
      } finally {
        setLoading(false);
      }
    };

    loadBookedSlots();
  }, [stationId, bookingDate]);

  // =====================================================
  // CHECK WHETHER SLOT IS BOOKED
  // =====================================================

  const isSlotBooked = (slot) => {
    return bookedSlots.some((booking) => {
      const bookingStart =
        String(booking.start_time).slice(0, 5);

      const bookingEnd =
        String(booking.end_time).slice(0, 5);

      return (
        bookingStart < slot.end &&
        bookingEnd > slot.start
      );
    });
  };

  // =====================================================
  // SELECT SLOT
  // =====================================================

  const selectSlot = (slot) => {
    if (isSlotBooked(slot)) {
      return;
    }

    setStartTime(slot.start);
    setEndTime(slot.end);
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (time) => {
    const [hours, minutes] =
      time.split(":").map(Number);

    const date = new Date();

    date.setHours(hours);
    date.setMinutes(minutes);

    return date.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="mt-6">

      {/* HEADER */}

      <div className="flex items-center justify-between mb-4">

        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Select Charging Slot
          </h3>

          <p className="text-gray-500 mt-1">
            Choose an available one-hour slot.
          </p>
        </div>

        <FaClock className="text-green-600 text-2xl" />

      </div>

      {/* NO DATE */}

      {!bookingDate && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-700">
          Please select a booking date first.
        </div>
      )}

      {/* LOADING */}

      {bookingDate && loading && (
        <div className="bg-gray-50 rounded-xl p-6 text-center">
          <div className="animate-pulse text-gray-500">
            Checking slot availability...
          </div>
        </div>
      )}

      {/* ERROR */}

      {bookingDate && !loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
          {error}
        </div>
      )}

      {/* SLOTS */}

      {bookingDate &&
        !loading &&
        !error && (
          <div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">

              {slots.map((slot) => {
                const booked =
                  isSlotBooked(slot);

                const selected =
                  startTime === slot.start &&
                  endTime === slot.end;

                return (
                  <button
                    key={slot.start}
                    type="button"
                    disabled={booked}
                    onClick={() =>
                      selectSlot(slot)
                    }
                    className={`
                      relative
                      p-4
                      rounded-xl
                      border-2
                      text-left
                      transition
                      ${
                        booked
                          ? "bg-red-50 border-red-200 text-red-400 cursor-not-allowed"
                          : selected
                          ? "bg-green-600 border-green-600 text-white shadow-lg"
                          : "bg-white border-green-200 text-gray-800 hover:border-green-500 hover:bg-green-50"
                      }
                    `}
                  >

                    {/* SELECTED */}

                    {selected && (
                      <FaCheckCircle
                        className="absolute top-3 right-3"
                      />
                    )}

                    {/* TIME */}

                    <div className="font-bold text-lg">
                      {formatTime(
                        slot.start
                      )}
                    </div>

                    <div
                      className={`text-sm mt-1 ${
                        selected
                          ? "text-green-100"
                          : booked
                          ? "text-red-400"
                          : "text-gray-500"
                      }`}
                    >
                      {formatTime(
                        slot.end
                      )}
                    </div>

                    {/* STATUS */}

                    <div
                      className={`text-xs font-bold mt-3 ${
                        selected
                          ? "text-white"
                          : booked
                          ? "text-red-500"
                          : "text-green-600"
                      }`}
                    >
                      {booked
                        ? "BOOKED"
                        : selected
                        ? "SELECTED"
                        : "AVAILABLE"}
                    </div>

                  </button>
                );
              })}

            </div>

            {/* LEGEND */}

            <div className="flex flex-wrap gap-5 mt-5 text-sm">

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-600">
                  Available
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-gray-600">
                  Booked
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-600">
                  Selected
                </span>
              </div>

            </div>

            {/* SELECTED SLOT */}

            {startTime && endTime && (
              <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-4">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <FaBolt className="text-green-600" />
                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      Selected Charging Slot
                    </p>

                    <p className="font-bold text-green-700">
                      {formatTime(startTime)}
                      {" - "}
                      {formatTime(endTime)}
                    </p>

                  </div>

                </div>

              </div>
            )}

          </div>
        )}

    </div>
  );
}

export default SlotPicker;