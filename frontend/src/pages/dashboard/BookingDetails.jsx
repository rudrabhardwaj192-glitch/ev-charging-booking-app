import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../services/api";

import {
  FaArrowLeft,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaBolt,
  FaMoneyBillWave,
  FaCreditCard,
  FaCheckCircle,
  FaIdCard,
} from "react-icons/fa";

function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  // ==========================================
  // Load booking
  // ==========================================
  useEffect(() => {
    const loadBooking = async () => {
      try {
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await api.get(
          `/bookings/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setBooking(response.data.data);
      } catch (error) {
        console.error(error);

        toast.error(
          error.response?.data?.message ||
            "Unable to load booking."
        );
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [id, token, navigate]);

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

  // ==========================================
  // Loading
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold">
          Loading booking...
        </div>
      </div>
    );
  }

  // ==========================================
  // Not found
  // ==========================================
  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">
          Booking Not Found
        </h1>

        <button
          onClick={() =>
            navigate("/dashboard/bookings")
          }
          className="bg-blue-600 text-white px-6 py-3 rounded-xl"
        >
          Back to My Bookings
        </button>
      </div>
    );
  }

  const isPaid =
    booking.payment_status === "Paid";

  const isConfirmed =
    booking.status === "Confirmed";

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">

      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <button
          onClick={() =>
            navigate("/dashboard/bookings")
          }
          className="flex items-center gap-2 mb-8 text-gray-700 hover:text-black font-semibold"
        >
          <FaArrowLeft />
          Back to My Bookings
        </button>

        {/* Header */}
        <div className="bg-white rounded-3xl shadow-md p-8 mb-6">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <p className="text-gray-500 mb-2">
                Booking Details
              </p>

              <h1 className="text-3xl md:text-4xl font-bold">
                {booking.station_name}
              </h1>
            </div>

            <div className="flex gap-3">

              <span
                className={`px-5 py-2 rounded-full text-white font-semibold ${
                  isConfirmed
                    ? "bg-green-600"
                    : booking.status === "Cancelled"
                    ? "bg-red-600"
                    : "bg-yellow-500"
                }`}
              >
                {booking.status}
              </span>

              <span
                className={`px-5 py-2 rounded-full text-white font-semibold ${
                  isPaid
                    ? "bg-green-600"
                    : "bg-yellow-500"
                }`}
              >
                {booking.payment_status}
              </span>

            </div>

          </div>
        </div>

        {/* Main details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Station */}
          <div className="bg-white rounded-3xl shadow-md p-7">

            <h2 className="text-xl font-bold mb-6">
              Charging Station
            </h2>

            <div className="space-y-5">

              <div className="flex items-start gap-4">
                <FaMapMarkerAlt className="text-red-500 text-xl mt-1" />

                <div>
                  <p className="text-gray-500 text-sm">
                    Location
                  </p>

                  <p className="font-semibold">
                    {booking.location || "N/A"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <FaBolt className="text-yellow-500 text-xl mt-1" />

                <div>
                  <p className="text-gray-500 text-sm">
                    Charger
                  </p>

                  <p className="font-semibold">
                    {booking.charger || "EV Charger"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <FaBolt className="text-green-500 text-xl mt-1" />

                <div>
                  <p className="text-gray-500 text-sm">
                    Charging Power
                  </p>

                  <p className="font-semibold">
                    {booking.power
                      ? `${booking.power} kW`
                      : "N/A"}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white rounded-3xl shadow-md p-7">

            <h2 className="text-xl font-bold mb-6">
              Booking Schedule
            </h2>

            <div className="space-y-5">

              <div className="flex items-start gap-4">
                <FaCalendarAlt className="text-blue-600 text-xl mt-1" />

                <div>
                  <p className="text-gray-500 text-sm">
                    Booking Date
                  </p>

                  <p className="font-semibold">
                    {formatDate(
                      booking.booking_date
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <FaClock className="text-blue-600 text-xl mt-1" />

                <div>
                  <p className="text-gray-500 text-sm">
                    Start Time
                  </p>

                  <p className="font-semibold">
                    {formatTime(
                      booking.start_time
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <FaClock className="text-purple-600 text-xl mt-1" />

                <div>
                  <p className="text-gray-500 text-sm">
                    End Time
                  </p>

                  <p className="font-semibold">
                    {formatTime(
                      booking.end_time
                    )}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-3xl shadow-md p-7">

            <h2 className="text-xl font-bold mb-6">
              Payment Information
            </h2>

            <div className="space-y-5">

              <div className="flex items-start gap-4">
                <FaMoneyBillWave className="text-green-600 text-xl mt-1" />

                <div>
                  <p className="text-gray-500 text-sm">
                    Amount Paid
                  </p>

                  <p className="text-2xl font-bold text-green-600">
                    ₹
                    {booking.amount
                      ? Number(
                          booking.amount
                        ).toFixed(2)
                      : "0.00"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <FaCreditCard className="text-blue-600 text-xl mt-1" />

                <div>
                  <p className="text-gray-500 text-sm">
                    Payment Status
                  </p>

                  <p className="font-semibold">
                    {booking.payment_status}
                  </p>
                </div>
              </div>

              {booking.razorpay_payment_id && (
                <div className="flex items-start gap-4">
                  <FaCheckCircle className="text-green-600 text-xl mt-1" />

                  <div>
                    <p className="text-gray-500 text-sm">
                      Razorpay Payment ID
                    </p>

                    <p className="font-mono text-sm break-all">
                      {booking.razorpay_payment_id}
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Booking information */}
          <div className="bg-white rounded-3xl shadow-md p-7">

            <h2 className="text-xl font-bold mb-6">
              Booking Information
            </h2>

            <div className="space-y-5">

              <div className="flex items-start gap-4">
                <FaIdCard className="text-gray-600 text-xl mt-1" />

                <div>
                  <p className="text-gray-500 text-sm">
                    Booking ID
                  </p>

                  <p className="font-semibold">
                    #{booking.id}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <FaIdCard className="text-gray-600 text-xl mt-1" />

                <div>
                  <p className="text-gray-500 text-sm">
                    Station ID
                  </p>

                  <p className="font-semibold">
                    #{booking.station_id}
                  </p>
                </div>
              </div>

              {booking.razorpay_order_id && (
                <div className="flex items-start gap-4">
                  <FaCreditCard className="text-gray-600 text-xl mt-1" />

                  <div>
                    <p className="text-gray-500 text-sm">
                      Razorpay Order ID
                    </p>

                    <p className="font-mono text-sm break-all">
                      {booking.razorpay_order_id}
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Success message */}
        {isConfirmed && isPaid && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-3xl p-6 flex items-center gap-4">

            <FaCheckCircle className="text-green-600 text-3xl" />

            <div>
              <h3 className="font-bold text-green-800">
                Booking Confirmed
              </h3>

              <p className="text-green-700">
                Your payment has been successfully verified and your charging slot is reserved.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default BookingDetails;