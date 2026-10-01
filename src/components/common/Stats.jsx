function Stats() {
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">

        <div className="bg-white shadow-lg rounded-xl p-6 text-center">
          <h2 className="text-3xl font-bold text-green-600">500+</h2>
          <p>Stations</p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 text-center">
          <h2 className="text-3xl font-bold text-green-600">10K+</h2>
          <p>Users</p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 text-center">
          <h2 className="text-3xl font-bold text-green-600">50K+</h2>
          <p>Bookings</p>
        </div>

        <div className="bg-white shadow-lg rounded-xl p-6 text-center">
          <h2 className="text-3xl font-bold text-green-600">4.9★</h2>
          <p>Rating</p>
        </div>

      </div>
    </section>
  );
}

export default Stats;