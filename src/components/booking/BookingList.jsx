import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import BookingCard from "./BookingCard";

import {
  getMyBookings,
  cancelBooking,
} from "../../services/bookingService";

function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const token = localStorage.getItem("token");

  // ==========================================
  // Get User ID From JWT
  // ==========================================
  const getUserIdFromToken = () => {
    if (!token) {
      return null;
    }

    try {
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      return payload.id;
    } catch (error) {
      console.error(
        "Invalid token:",
        error
      );

      return null;
    }
  };

  // ==========================================
  // Load Bookings
  // ==========================================
  const loadBookings = async () => {
    try {
      setLoading(true);

      const userId =
        getUserIdFromToken();

      if (!userId) {
        toast.error(
          "User session not found. Please login again."
        );
        return;
      }

      const res = await getMyBookings(
        userId,
        token
      );

      setBookings(res.data || []);
    } catch (error) {
      console.error(
        "Failed to load bookings:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Load On Page Open
  // ==========================================
  useEffect(() => {
    loadBookings();
  }, []);

  // ==========================================
  // Cancel Booking
  // ==========================================
  const handleCancel = async (id) => {
    try {
      setCancellingId(id);

      await cancelBooking(
        id,
        token
      );

      toast.success(
        "Booking cancelled successfully."
      );

      await loadBookings();
    } catch (error) {
      console.error(
        "Cancel booking error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to cancel booking."
      );
    } finally {
      setCancellingId(null);
    }
  };

  // ==========================================
  // Loading
  // ==========================================
  if (loading) {
    return (
      <div className="bg-white rounded-xl p-10 text-center shadow-sm">
        <p className="text-gray-500">
          Loading your bookings...
        </p>
      </div>
    );
  }

  // ==========================================
  // No Bookings
  // ==========================================
  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-xl p-10 text-center shadow-sm">
        <h2 className="text-xl font-semibold">
          No Bookings Found
        </h2>

        <p className="text-gray-500 mt-2">
          You don't have any bookings yet.
        </p>
      </div>
    );
  }

  // ==========================================
  // Booking List
  // ==========================================
  return (
    <div className="space-y-6">

      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onCancel={handleCancel}
          cancelling={
            cancellingId === booking.id
          }
        />
      ))}

    </div>
  );
}

export default BookingList;