import { Link } from "react-router-dom";
import { FaBolt, FaMapMarkerAlt } from "react-icons/fa";

function Hero() {
  return (
    <section className="bg-gradient-to-r from-green-700 to-green-500 text-white">
      <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-10 items-center">
        {/* Left */}
        <div>
          <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
            ⚡ Smart EV Charging Platform
          </span>

          <h1 className="text-5xl md:text-6xl font-bold mt-6 leading-tight">
            Charge Your EV
            <br />
            Anywhere,
            <span className="text-yellow-300"> Anytime.</span>
          </h1>

          <p className="mt-6 text-lg text-green-100">
            Find nearby charging stations, book charging slots in advance,
            monitor your bookings, and enjoy a seamless EV charging
            experience.
          </p>

          <div className="flex gap-4 mt-10">
            <Link
              to="/stations"
              className="bg-white text-green-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition"
            >
              <FaMapMarkerAlt className="inline mr-2" />
              Explore Stations
            </Link>

            <Link
              to="/register"
              className="border border-white px-6 py-3 rounded-xl hover:bg-white hover:text-green-700 transition"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Right */}
        <div className="flex justify-center">
          <img
            src="https://placehold.co/600x450?text=EV+Charging"
            alt="EV Charging"
            className="rounded-3xl shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}

export default Hero;