import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";
import SlotPicker from "./SlotPicker";

function BookingForm({
  stationId,
  stationPrice = 100,
}) {
  const navigate = useNavigate();

  const [bookingDate, setBookingDate] =
    useState("");

  const [startTime, setStartTime] =
    useState("");

  const [endTime, setEndTime] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const token =
    localStorage.getItem("token");

  // =====================================================
  // DISPLAY PRICE
  // =====================================================

  const amount =
    Number(stationPrice) || 100;

  // =====================================================
  // LOAD RAZORPAY
  // =====================================================

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      // Already loaded
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script =
        document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        resolve(true);
      };

      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  // =====================================================
  // BOOK + PAYMENT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ===================================================
    // LOGIN CHECK
    // ===================================================

    if (!token) {
      toast.error(
        "Please login first."
      );

      navigate("/login");

      return;
    }

    // ===================================================
    // VALIDATION
    // ===================================================

    if (!bookingDate) {
      toast.error(
        "Please select a booking date."
      );

      return;
    }

    if (!startTime || !endTime) {
      toast.error(
        "Please select an available charging slot."
      );

      return;
    }

    if (endTime <= startTime) {
      toast.error(
        "End time must be after start time."
      );

      return;
    }

    try {
      setLoading(true);

      // =================================================
      // LOAD RAZORPAY
      // =================================================

      const loaded =
        await loadRazorpay();

      if (!loaded) {
        toast.error(
          "Razorpay could not be loaded."
        );

        setLoading(false);

        return;
      }

      // =================================================
      // CREATE PAYMENT ORDER
      // =================================================

      const orderResponse =
        await api.post(
          "/payments/create-order",
          {
            station_id: stationId,

            booking_date:
              bookingDate,

            start_time:
              startTime,

            end_time:
              endTime,

            // Backend calculates
            // the actual amount.
            amount: amount,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const paymentData =
        orderResponse.data.data;

      // =================================================
      // RAZORPAY OPTIONS
      // =================================================

      const options = {
        key:
          paymentData.key_id,

        amount:
          paymentData.amount,

        currency:
          paymentData.currency,

        name:
          "EV Charging App",

        description:
          "EV Charging Station Booking",

        order_id:
          paymentData.order_id,

        prefill: {
          name: "",
          email: "",
          contact: "",
        },

        notes: {
          station_id:
            String(stationId),

          booking_date:
            bookingDate,

          start_time:
            startTime,

          end_time:
            endTime,
        },

        theme: {
          color:
            "#16a34a",
        },

        // =================================================
        // PAYMENT SUCCESS
        // =================================================

        handler:
          async function (response) {
            try {
              // ===========================================
              // VERIFY PAYMENT
              // ===========================================

              const verifyResponse =
                await api.post(
                  "/payments/verify",
                  {
                    razorpay_order_id:
                      response.razorpay_order_id,

                    razorpay_payment_id:
                      response.razorpay_payment_id,

                    razorpay_signature:
                      response.razorpay_signature,
                  },
                  {
                    headers: {
                      Authorization:
                        `Bearer ${token}`,
                    },
                  }
                );

              // ===========================================
              // VERIFICATION SUCCESS
              // ===========================================

              if (
                verifyResponse.data
                  .success
              ) {
                toast.success(
                  "Payment successful! Booking confirmed."
                );

                // Clear form

                setBookingDate("");

                setStartTime("");

                setEndTime("");

                // Go to bookings

                setTimeout(() => {
                  navigate(
                    "/dashboard/bookings"
                  );
                }, 1000);
              }
            } catch (error) {
              console.error(
                "Payment verification error:",
                error
              );

              toast.error(
                error.response?.data
                  ?.message ||
                  "Payment verification failed."
              );

              setLoading(false);
            }
          },

        // =================================================
        // PAYMENT MODAL CLOSED
        // =================================================

        modal: {
          ondismiss:
            function () {
              setLoading(false);

              toast.error(
                "Payment cancelled."
              );
            },
        },
      };

      // =================================================
      // CREATE RAZORPAY INSTANCE
      // =================================================

      const razorpay =
        new window.Razorpay(
          options
        );

      // =================================================
      // PAYMENT FAILED
      // =================================================

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Payment failed:",
            response.error
          );

          toast.error(
            response.error
              ?.description ||
              "Payment failed."
          );

          setLoading(false);
        }
      );

      // =================================================
      // OPEN PAYMENT WINDOW
      // =================================================

      razorpay.open();
    } catch (error) {
      console.error(
        "Payment error:",
        error
      );

      toast.error(
        error.response?.data
          ?.message ||
          "Unable to start payment."
      );

      setLoading(false);
    }
  };

  // =====================================================
  // FORMAT SELECTED TIME
  // =====================================================

  const formatTime = (time) => {
    if (!time) {
      return "";
    }

    const [hours, minutes] =
      time.split(":").map(Number);

    const date =
      new Date();

    date.setHours(
      hours,
      minutes,
      0,
      0
    );

    return date.toLocaleTimeString(
      [],
      {
        hour: "numeric",
        minute: "2-digit",
      }
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="mb-6">

        <h2 className="text-2xl font-bold text-gray-900">
          Book & Pay
        </h2>

        <p className="text-gray-500 mt-1">
          Select your charging date and available slot.
        </p>

      </div>

      {/* =================================================
          PRICE
      ================================================= */}

      <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-5">

        <p className="text-gray-500">
          Booking Amount
        </p>

        <p className="text-3xl font-bold text-green-600">
          ₹{amount}
        </p>

        <p className="text-sm text-gray-500 mt-1">
          Final amount is calculated by the server.
        </p>

      </div>

      {/* =================================================
          FORM
      ================================================= */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* =================================================
            DATE
        ================================================= */}

        <div>

          <label className="block mb-2 font-semibold text-gray-800">
            Booking Date
          </label>

          <input
            type="date"
            value={bookingDate}
            onChange={(e) => {
              setBookingDate(
                e.target.value
              );

              // Reset previously
              // selected slot

              setStartTime("");

              setEndTime("");
            }}
            min={
              new Date()
                .toISOString()
                .split("T")[0]
            }
            required
            className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
          />

        </div>

        {/* =================================================
            LIVE SLOT PICKER
        ================================================= */}

        <SlotPicker
          stationId={stationId}
          bookingDate={bookingDate}
          startTime={startTime}
          endTime={endTime}
          setStartTime={setStartTime}
          setEndTime={setEndTime}
        />

        {/* =================================================
            SELECTED SLOT SUMMARY
        ================================================= */}

        {startTime &&
          endTime && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">

              <p className="text-sm text-gray-500">
                Your Selected Slot
              </p>

              <p className="text-xl font-bold text-blue-700 mt-1">
                {formatTime(startTime)}
                {" - "}
                {formatTime(endTime)}
              </p>

            </div>
          )}

        {/* =================================================
            PAY BUTTON
        ================================================= */}

        <button
          type="submit"
          disabled={
            loading ||
            !bookingDate ||
            !startTime ||
            !endTime
          }
          className={`w-full py-4 rounded-xl font-bold text-white transition ${
            loading ||
            !bookingDate ||
            !startTime ||
            !endTime
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading
            ? "Opening Payment..."
            : startTime &&
              endTime
            ? `Pay ₹${amount} & Book`
            : "Select a Slot to Continue"}
        </button>

      </form>

    </div>
  );
}

export default BookingForm;