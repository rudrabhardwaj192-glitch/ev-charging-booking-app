import { FaBell, FaSearch } from "react-icons/fa";

function Navbar() {
  return (
    <div className="bg-white shadow-md px-8 py-5 flex justify-between items-center">

      {/* Left Side */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Welcome back, Rudra 👋
        </p>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">

        {/* Search Box */}
        <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2">
          <FaSearch className="text-gray-500 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none"
          />
        </div>

        {/* Notification */}
        <button className="relative">
          <FaBell className="text-2xl text-gray-600" />

          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            3
          </span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3">
          <img
            src="https://ui-avatars.com/api/?name=Rudra&background=16a34a&color=fff"
            alt="Profile"
            className="w-11 h-11 rounded-full"
          />

          <div>
            <h3 className="font-semibold">Rudra</h3>
            <p className="text-sm text-gray-500">User</p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Navbar;