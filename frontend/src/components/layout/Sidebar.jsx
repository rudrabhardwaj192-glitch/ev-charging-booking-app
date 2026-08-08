import {
  FaHome,
  FaChargingStation,
  FaCalendarAlt,
  FaHeart,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaBolt,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

const menu = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: <FaHome />,
  },
  {
    name: "Stations",
    path: "/stations",
    icon: <FaChargingStation />,
  },
  {
    name: "Bookings",
    path: "/dashboard/bookings",
    icon: <FaCalendarAlt />,
  },
  {
    name: "Favorites",
    path: "/dashboard/favorites",
    icon: <FaHeart />,
  },
  {
    name: "Profile",
    path: "/dashboard/profile",
    icon: <FaUser />,
  },
  {
    name: "Settings",
    path: "/settings",
    icon: <FaCog />,
  },
];

function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.4 }}
      className="w-72 bg-white shadow-xl border-r flex flex-col"
    >
      {/* Logo */}
      <div className="p-8 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-green-600 p-3 rounded-xl text-white">
            <FaBolt size={24} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              EV Charge
            </h1>

            <p className="text-gray-500 text-sm">
              Smart Charging
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6">
        {menu.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 mx-4 my-2 px-5 py-4 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-green-600 text-white shadow-lg"
                  : "text-gray-600 hover:bg-green-50 hover:text-green-600"
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>

            <span className="font-medium">
              {item.name}
            </span>
          </NavLink>
        ))}
      </div>

      {/* User Card */}
      <div className="p-5 border-t">
        <div className="bg-slate-100 rounded-xl p-4 flex items-center gap-3 mb-4">
          <img
            src="https://ui-avatars.com/api/?name=Rudra&background=16a34a&color=fff"
            alt="Profile"
            className="w-12 h-12 rounded-full"
          />

          <div>
            <h3 className="font-semibold">
              Rudra
            </h3>

            <p className="text-gray-500 text-sm">
              EV User
            </p>
          </div>
        </div>

        <button className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl py-3 flex justify-center items-center gap-3 transition">
          <FaSignOutAlt />
          Logout
        </button>
      </div>
    </motion.aside>
  );
}

export default Sidebar;