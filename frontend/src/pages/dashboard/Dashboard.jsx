import {
  FaBolt,
  FaCalendarCheck,
  FaMapMarkerAlt,
  FaHeart,
} from "react-icons/fa";

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold">
          Welcome Back 👋
        </h1>

        <p className="text-gray-500 mt-2">
          Here's your EV charging overview.
        </p>

        {/* Stats */}

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6 mt-10">

          <div className="bg-white rounded-2xl shadow p-6">
            <FaBolt className="text-4xl text-green-600" />
            <h2 className="text-3xl font-bold mt-4">12</h2>
            <p>Total Bookings</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <FaCalendarCheck className="text-4xl text-blue-600" />
            <h2 className="text-3xl font-bold mt-4">2</h2>
            <p>Upcoming</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <FaHeart className="text-4xl text-red-500" />
            <h2 className="text-3xl font-bold mt-4">5</h2>
            <p>Favorites</p>
          </div>

          <div className="bg-white rounded-2xl shadow p-6">
            <FaMapMarkerAlt className="text-4xl text-yellow-500" />
            <h2 className="text-3xl font-bold mt-4">18</h2>
            <p>Nearby Stations</p>
          </div>

        </div>

        {/* Upcoming Booking */}

        <div className="bg-white rounded-2xl shadow p-8 mt-10">

          <h2 className="text-2xl font-bold mb-6">
            Upcoming Booking
          </h2>

          <div className="border rounded-xl p-6">

            <h3 className="text-xl font-bold">
              Green Charge Hub
            </h3>

            <p className="text-gray-500 mt-2">
              Ranchi
            </p>

            <p className="mt-4">
              📅 Tomorrow
            </p>

            <p>
              ⏰ 10:00 AM - 11:00 AM
            </p>

          </div>

        </div>

        {/* Recent Activity */}

        <div className="bg-white rounded-2xl shadow p-8 mt-10">

          <h2 className="text-2xl font-bold mb-6">
            Recent Activity
          </h2>

          <ul className="space-y-4">

            <li>
              ✅ Booked Green Charge Hub
            </li>

            <li>
              ❤️ Added FastVolt Station to favorites
            </li>

            <li>
              ⚡ Completed charging session
            </li>

          </ul>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;