import BookingList from "../../components/booking/BookingList";

function MyBookings() {
  return (
    <div className="min-h-screen bg-gray-100">

      <div className="max-w-7xl mx-auto p-8">

        <h1 className="text-4xl font-bold mb-8">
          My Bookings
        </h1>

        <BookingList />

      </div>

    </div>
  );
}

export default MyBookings;