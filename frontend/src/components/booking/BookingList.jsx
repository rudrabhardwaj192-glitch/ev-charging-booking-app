import { useEffect, useState } from "react";
import BookingCard from "./BookingCard";
import {
  getMyBookings,
  cancelBooking,
} from "../../services/bookingService";

function BookingList() {

  const [bookings, setBookings] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const res = await getMyBookings(1, token);

      setBookings(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCancel = async (id) => {
    try {
      await cancelBooking(id, token);

      loadBookings();
    } catch (err) {
      console.log(err);
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="bg-white rounded-xl p-10 text-center">
        No Bookings Found
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {bookings.map((booking) => (
        <BookingCard
          key={booking.id}
          booking={booking}
          onCancel={handleCancel}
        />
      ))}

    </div>
  );
}

export default BookingList;