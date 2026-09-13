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

  const [paymentStarted, setPaymentStarted] =
    useState(false);

  const token =
    localStorage.getItem("token");

  // ==================================================
  // TODAY
  // ==================================================

  const getToday = () => {
    return new Date()
      .toISOString()
      .split("T")[0];
  };

  // ==================================================
  // LOAD RAZORPAY
  // ==================================================

  const loadRazorpay = () => {
    return new Promise(
      (resolve) => {
        if (
          window.Razorpay
        ) {
          resolve(true);
          return;
        }

        const existingScript =
          document.getElementById(
            "razorpay-script"
          );

        if (
          existingScript
        ) {
          existingScript.onload =
            () =>
              resolve(true);

          existingScript.onerror =
            () =>
              resolve(false);

          return;
        }

        const script =
          document.createElement(
            "script"
          );

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
      }
    );
  };

  // ==================================================
  // VALIDATE DATE
  // ==================================================

  const validateDate = () => {
    if (!bookingDate) {
      toast.error(
        "Please select a booking date."
      );

      return false;
    }

    const today =
      getToday();

    if (
      bookingDate <
      today
    ) {
      toast.error(
        "Booking date cannot be in the past."
      );

      return false;
    }

    return true;
  };

  // ==================================================
  // VALIDATE TIME
  // ==================================================

  const validateTime = () => {
    if (
      !startTime ||
      !endTime
    ) {
      toast.error(
        "Please select start and end time."
      );

      return false;
    }

    if (
      endTime <=
      startTime
    ) {
      toast.error(
        "End time must be after start time."
      );

      return false;
    }

    // ----------------------------------------------
    // If booking is today, prevent past time.
    // ----------------------------------------------

    if (
      bookingDate ===
      getToday()
    ) {
      const now =
        new Date();

      const currentHours =
        String(
          now.getHours()
        ).padStart(2, "0");

      const currentMinutes =
        String(
          now.getMinutes()
        ).padStart(2, "0");

      const currentTime =
        `${currentHours}:${currentMinutes}`;

      if (
        startTime <=
        currentTime
      ) {
        toast.error(
          "Start time must be in the future."
        );

        return false;
      }
    }

    return true;
  };

  // ==================================================
  // HANDLE SUBMIT
  // ==================================================

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      // ----------------------------------------------
      // Station validation
      // ----------------------------------------------

      if (!stationId) {
        toast.error(
          "Charging station is missing."
        );

        return;
      }

      // ----------------------------------------------
      // Authentication
      // ----------------------------------------------

      if (!token) {
        toast.error(
          "Please login first."
        );

        navigate("/login");

        return;
      }

      // ----------------------------------------------
      // Date validation
      // ----------------------------------------------

      if (
        !validateDate()
      ) {
        return;
      }

      // ----------------------------------------------
      // Time validation
      // ----------------------------------------------

      if (
        !validateTime()
      ) {
        return;
      }

      try {
        setLoading(true);

        // ==================================================
        // LOAD RAZORPAY
        // ==================================================

        const razorpayLoaded =
          await loadRazorpay();

        if (
          !razorpayLoaded
        ) {
          toast.error(
            "Unable to load Razorpay. Please check your internet connection."
          );

          return;
        }

        // ==================================================
        // CREATE PAYMENT ORDER
        //
        // Backend will:
        //
        // 1. Check station
        // 2. Check availability
        // 3. Lock station
        // 4. Check overlapping bookings
        // 5. Create Pending booking
        // 6. Create Razorpay order
        // 7. Hold slot for 10 minutes
        // ==================================================

        toast.loading(
          "Reserving your charging slot...",
          {
            id:
              "booking-processing",
          }
        );

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
          response.data?.data;

        // ==================================================
        // VALIDATE RESPONSE
        // ==================================================

        if (
          !paymentData ||
          !paymentData.order_id ||
          !paymentData.amount ||
          !paymentData.key_id
        ) {
          throw new Error(
            "Invalid payment information received from server."
          );
        }

        const booking =
          paymentData.booking;

        toast.dismiss(
          "booking-processing"
        );

        // ==================================================
        // SHOW PAYMENT INFORMATION
        // ==================================================

        if (
          paymentData.pricing
        ) {
          const amount =
            paymentData
              .pricing
              .total_amount;

          toast.success(
            `Slot reserved temporarily. Payment amount: ₹${amount}`,
            {
              id:
                "booking-reserved",
              duration: 4000,
            }
          );
        }

        // ==================================================
        // RAZORPAY OPTIONS
        // ==================================================

        const options = {
          key:
            paymentData.key_id,

          amount:
            paymentData.amount,

          currency:
            paymentData.currency ||
            "INR",

          name:
            "EV Charging App",

          description:
            `Charging Slot - ${
              bookingDate
            } ${startTime}`,

          order_id:
            paymentData.order_id,

          // ----------------------------------------------
          // PAYMENT SUCCESS
          // ----------------------------------------------

          handler:
            async function (
              razorpayResponse
            ) {
              try {
                setLoading(
                  true
                );

                toast.loading(
                  "Verifying payment...",
                  {
                    id:
                      "payment-verification",
                  }
                );

                // ==========================================
                // VERIFY PAYMENT
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

                toast.dismiss(
                  "payment-verification"
                );

                if (
                  verifyResponse
                    .data
                    ?.success
                ) {
                  toast.success(
                    "Payment successful! Booking confirmed.",
                    {
                      duration: 5000,
                    }
                  );

                  // ========================================
                  // CLEAR FORM
                  // ========================================

                  setBookingDate(
                    ""
                  );

                  setStartTime(
                    ""
                  );

                  setEndTime(
                    ""
                  );

                  // ========================================
                  // GO TO BOOKINGS
                  // ========================================

                  setTimeout(
                    () => {
                      navigate(
                        "/dashboard/bookings"
                      );
                    },
                    1000
                  );
                } else {
                  toast.error(
                    verifyResponse
                      .data
                      ?.message ||
                      "Payment verification failed."
                  );
                }
              } catch (
                error
              ) {
                console.error(
                  "Payment verification error:",
                  error
                );

                toast.dismiss(
                  "payment-verification"
                );

                toast.error(
                  error.response
                    ?.data
                    ?.message ||
                    "Payment verification failed."
                );
              } finally {
                setLoading(
                  false
                );
                setPaymentStarted(
                  false
                );
              }
            },

          // ==================================================
          // PREFILL
          // ==================================================

          prefill: {
            name: "",
            email: "",
            contact: "",
          },

          // ==================================================
          // THEME
          // ==================================================

          theme: {
            color:
              "#16a34a",
          },

          // ==================================================
          // MODAL
          // ==================================================

          modal: {
            escape:
              false,

            ondismiss:
              function () {
                setLoading(
                  false
                );

                setPaymentStarted(
                  false
                );

                toast.error(
                  "Payment cancelled. Your temporary slot hold will expire after 10 minutes.",
                  {
                    duration: 6000,
                  }
                );
              },
          },
        };

        // ==================================================
        // CREATE RAZORPAY INSTANCE
        // ==================================================

        const razorpay =
          new window.Razorpay(
            options
          );

        // ==================================================
        // PAYMENT FAILED
        // ==================================================

        razorpay.on(
          "payment.failed",
          function (
            paymentError
          ) {
            console.error(
              "Razorpay payment failed:",
              paymentError
            );

            setLoading(
              false
            );

            setPaymentStarted(
              false
            );

            toast.error(
              paymentError
                ?.error
                ?.description ||
                "Payment failed. Your slot will remain temporarily reserved and will be released automatically after 10 minutes.",
              {
                duration: 7000,
              }
            );
          }
        );

        // ==================================================
        // OPEN RAZORPAY
        // ==================================================

        setPaymentStarted(
          true
        );

        razorpay.open();
      } catch (
        error
      ) {
        console.error(
          "Booking/payment error:",
          error
        );

        toast.dismiss(
          "booking-processing"
        );

        toast.error(
          error.response
            ?.data
            ?.message ||
            error.message ||
            "Unable to create booking."
        );

        setPaymentStarted(
          false
        );
      } finally {
        setLoading(
          false
        );
      }
    };

  // ==================================================
  // RENDER
  // ==================================================

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">

      <h2 className="text-2xl font-bold mb-2">
        Book Charging Slot
      </h2>

      <p className="text-gray-500 text-sm mb-6">
        Select your preferred date and charging
        time. Your slot will be temporarily held
        while payment is completed.
      </p>

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-6"
      >

        {/* ==========================================
            DATE
        ========================================== */}

        <div>
          <label className="block mb-2 font-semibold">
            Booking Date
          </label>

          <input
            type="date"
            value={
              bookingDate
            }
            onChange={(e) =>
              setBookingDate(
                e.target.value
              )
            }
            min={getToday()}
            disabled={
              loading
            }
            required
            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-100"
          />
        </div>

        {/* ==========================================
            START TIME
        ========================================== */}

        <div>
          <label className="block mb-2 font-semibold">
            Start Time
          </label>

          <input
            type="time"
            value={
              startTime
            }
            onChange={(e) =>
              setStartTime(
                e.target.value
              )
            }
            disabled={
              loading
            }
            required
            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-100"
          />
        </div>

        {/* ==========================================
            END TIME
        ========================================== */}

        <div>
          <label className="block mb-2 font-semibold">
            End Time
          </label>

          <input
            type="time"
            value={
              endTime
            }
            onChange={(e) =>
              setEndTime(
                e.target.value
              )
            }
            disabled={
              loading
            }
            required
            className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none disabled:bg-gray-100"
          />
        </div>

        {/* ==========================================
            PAYMENT HOLD INFO
        ========================================== */}

        <div className="bg-green-50 border border-green-200 rounded-xl p-4">

          <div className="flex gap-3">

            <div className="text-green-600 text-xl">
              🔒
            </div>

            <div>
              <p className="font-semibold text-green-800">
                Secure Slot Reservation
              </p>

              <p className="text-sm text-green-700 mt-1">
                Your selected slot is temporarily
                reserved while you complete payment.
                Unpaid reservations are automatically
                released after 10 minutes.
              </p>
            </div>

          </div>
        </div>

        {/* ==========================================
            SUBMIT
        ========================================== */}

        <button
          type="submit"
          disabled={
            loading ||
            paymentStarted
          }
          className={`w-full py-4 rounded-xl font-bold text-white transition ${
            loading ||
            paymentStarted
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {paymentStarted
            ? "Payment Window Open..."
            : loading
            ? "Processing..."
            : "Book & Pay"}
        </button>

      </form>
    </div>
  );
}

export default BookingForm;