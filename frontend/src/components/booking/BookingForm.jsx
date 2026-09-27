import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import api from "../../services/api";

function BookingForm({ stationId }) {
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

  // ==================================================
  // Load Razorpay script
  // ==================================================
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (
        document.getElementById(
          "razorpay-script"
        )
      ) {
        resolve(true);
        return;
      }

      const script =
        document.createElement("script");

      script.id =
        "razorpay-script";

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () =>
        resolve(true);

      script.onerror = () =>
        resolve(false);

      document.body.appendChild(
        script
      );
    });
  };

  // ==================================================
  // Submit
  // ==================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !bookingDate ||
      !startTime ||
      !endTime
    ) {
      toast.error(
        "Please fill all fields."
      );

      return;
    }

    if (
      endTime <= startTime
    ) {
      toast.error(
        "End time must be after start time."
      );

      return;
    }

    if (!token) {
      toast.error(
        "Please login first."
      );

      navigate("/login");

      return;
    }

    try {
      setLoading(true);

      // ==================================================
      // Load Razorpay
      // ==================================================
      const razorpayLoaded =
        await loadRazorpay();

      if (!razorpayLoaded) {
        toast.error(
          "Unable to load Razorpay."
        );

        return;
      }

      // ==================================================
      // Create Razorpay order
      // ==================================================
      const response =
        await api.post(
          "/payments/create-order",
          {
            station_id:
              stationId,

            booking_date:
              bookingDate,

            start_time:
              startTime,

            end_time:
              endTime,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      const paymentData =
        response.data.data;

      // ==================================================
      // Razorpay checkout
      // ==================================================
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
          "EV Charging Slot",

        order_id:
          paymentData.order_id,

        handler:
          async function (
            razorpayResponse
          ) {
            try {
              // ==========================================
              // Verify payment
              // ==========================================
              const verifyResponse =
                await api.post(
                  "/payments/verify",
                  {
                    razorpay_order_id:
                      razorpayResponse.razorpay_order_id,

                    razorpay_payment_id:
                      razorpayResponse.razorpay_payment_id,

                    razorpay_signature:
                      razorpayResponse.razorpay_signature,
                  },
                  {
                    headers: {
                      Authorization:
                        `Bearer ${token}`,
                    },
                  }
                );

              if (
                verifyResponse.data
                  .success
              ) {
                toast.success(
                  "Payment successful! Booking confirmed."
                );

                setBookingDate(
                  ""
                );

                setStartTime(
                  ""
                );

                setEndTime(
                  ""
                );

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
            }
          },

        prefill: {
          name: "",
          email: "",
          contact: "",
        },

        theme: {
          color: "#16a34a",
        },

        modal: {
          ondismiss:
            function () {
              toast.error(
                "Payment cancelled. Your slot will be released after 10 minutes."
              );
            },
        },
      };

      const razorpay =
        new window.Razorpay(
          options
        );

      razorpay.on(
        "payment.failed",
        function () {
          toast.error(
            "Payment failed. Please try again."
          );
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "Booking/payment error:",
        error
      );

      toast.error(
        error.response?.data
          ?.message ||
          "Unable to create booking."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">

      <h2 className="text-2xl font-bold mb-6">
        Book Charging Slot
      </h2>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >

        {/* Date */}
        <div>
          <label className="block mb-2 font-semibold">
            Booking Date
          </label>

          <input
            type="date"
            value={bookingDate}
            onChange={(e) =>
              setBookingDate(
                e.target.value
              )
            }
            min={
              new Date()
                .toISOString()
                .split("T")[0]
            }
            required
            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Start */}
        <div>
          <label className="block mb-2 font-semibold">
            Start Time
          </label>

          <input
            type="time"
            value={startTime}
            onChange={(e) =>
              setStartTime(
                e.target.value
              )
            }
            required
            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* End */}
        <div>
          <label className="block mb-2 font-semibold">
            End Time
          </label>

          <input
            type="time"
            value={endTime}
            onChange={(e) =>
              setEndTime(
                e.target.value
              )
            }
            required
            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold text-white transition ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading
            ? "Processing..."
            : "Book & Pay"}
        </button>

      </form>
    </div>
  );
}

export default BookingForm;