import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaPlusCircle,
  FaChargingStation,
} from "react-icons/fa";

function OwnerSidebar() {
  const location = useLocation();

  const menu = [
    {
      name: "Dashboard",
      path: "/owner",
      icon: <FaHome />,
    },
    {
      name: "Add Station",
      path: "/owner/add-station",
      icon: <FaPlusCircle />,
    },
    {
      name: "My Stations",
      path: "/owner/my-stations",
      icon: <FaChargingStation />,
    },
  ];

  return (
    <div className="w-64 min-h-screen bg-green-700 text-white">

      <div className="p-6 text-2xl font-bold border-b border-green-500">
        EV Owner
      </div>

      <div className="mt-6">

        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-6 py-4 hover:bg-green-600 transition ${
              location.pathname === item.path
                ? "bg-green-800"
                : ""
            }`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}

      </div>

    </div>
  );
}

export default OwnerSidebar;