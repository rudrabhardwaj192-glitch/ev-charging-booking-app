function RecentBookings() {
  const bookings = [
    {
      id: 1,
      station: "Green Charge Hub",
      date: "03 Aug 2026",
      charger: "DC Fast",
      status: "Confirmed",
    },
    {
      id: 2,
      station: "EV Point",
      date: "05 Aug 2026",
      charger: "AC Charger",
      status: "Pending",
    },
    {
      id: 3,
      station: "FastVolt",
      date: "08 Aug 2026",
      charger: "Ultra Fast",
      status: "Completed",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-10">
      <h2 className="text-2xl font-bold mb-6">
        Recent Bookings
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full">

          <thead>
            <tr className="border-b text-left">
              <th className="py-3">Station</th>
              <th>Date</th>
              <th>Charger</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {bookings.map((booking) => (
              <tr
                key={booking.id}
                className="border-b hover:bg-gray-50"
              >
                <td className="py-4 font-medium">
                  {booking.station}
                </td>

                <td>{booking.date}</td>

                <td>{booking.charger}</td>

                <td>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </td>

                <td>
                  <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    View
                  </button>
                </td>
              </tr>
            ))}

          </tbody>

        </table>
      </div>
    </div>
  );
}

export default RecentBookings;