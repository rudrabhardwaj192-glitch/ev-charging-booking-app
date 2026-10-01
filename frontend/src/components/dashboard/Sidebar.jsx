import {
  FaHome,
  FaChargingStation,
  FaCalendarAlt,
  FaHeart,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";

const menu = [
  { icon: <FaHome />, text: "Dashboard" },
  { icon: <FaChargingStation />, text: "Stations" },
  { icon: <FaCalendarAlt />, text: "Bookings" },
  { icon: <FaHeart />, text: "Favorites" },
  { icon: <FaUser />, text: "Profile" },
];

function Sidebar() {
  return (
    <div className="w-64 bg-green-600 text-white min-h-screen shadow-lg">

      <div className="text-3xl font-bold p-6">
        ⚡ EV Charge
      </div>

      <div className="mt-8">

        {menu.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4 px-6 py-4 hover:bg-green-700 cursor-pointer transition"
          >
            {item.icon}
            <span>{item.text}</span>
          </div>
        ))}

        <div className="flex items-center gap-4 px-6 py-4 hover:bg-red-600 cursor-pointer mt-10">
          <FaSignOutAlt />
          Logout
        </div>

      </div>
    </div>
  );
}

export default Sidebar;