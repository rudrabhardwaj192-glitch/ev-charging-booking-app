function Testimonials() {
  return (
    <section className="py-20 bg-gray-100">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center mb-10">
          What Our Users Say
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-white rounded-xl shadow p-6">
            ⭐⭐⭐⭐⭐
            <p className="mt-4">
              Finding charging stations has never been easier.
            </p>
            <h3 className="mt-5 font-bold">
              Rahul
            </h3>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            ⭐⭐⭐⭐⭐
            <p className="mt-4">
              The booking system is very smooth.
            </p>
            <h3 className="mt-5 font-bold">
              Sneha
            </h3>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            ⭐⭐⭐⭐⭐
            <p className="mt-4">
              Best EV charging platform I've used.
            </p>
            <h3 className="mt-5 font-bold">
              Amit
            </h3>
          </div>

        </div>

      </div>
    </section>
  );
}

export default Testimonials;