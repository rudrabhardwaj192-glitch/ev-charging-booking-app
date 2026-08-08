import { Link, useNavigate } from "react-router-dom";
import { FaBolt } from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-bold text-green-600"
        >
          <FaBolt />
          EV Charge
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="hover:text-green-600 transition"
          >
            Home
          </Link>

          <Link
            to="/stations"
            className="hover:text-green-600 transition"
          >
            Stations
          </Link>

          {token ? (
            <>
              <Link
                to="/dashboard"
                className="hover:text-green-600 transition"
              >
                Dashboard
              </Link>

              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hover:text-green-600 transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;