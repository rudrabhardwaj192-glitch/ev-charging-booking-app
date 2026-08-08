function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-10 mt-20">
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex flex-col md:flex-row justify-between items-center">

          <div>
            <h2 className="text-2xl font-bold text-green-400">
              ⚡ EV Charge
            </h2>

            <p className="text-gray-400 mt-2">
              Smart EV Charging Platform
            </p>
          </div>

          <div className="mt-6 md:mt-0 flex gap-8">

            <a href="/" className="hover:text-green-400">
              Home
            </a>

            <a href="/stations" className="hover:text-green-400">
              Stations
            </a>

            <a href="/login" className="hover:text-green-400">
              Login
            </a>

          </div>

        </div>

        <hr className="my-8 border-gray-700" />

        <p className="text-center text-gray-500">
          © 2026 EV Charge. All rights reserved.
        </p>

      </div>
    </footer>
  );
}

export default Footer;