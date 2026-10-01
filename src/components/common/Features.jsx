function Features() {
  const features = [
    {
      title: "Fast Charging",
      description: "Charge your EV quickly with high-speed charging stations.",
    },
    {
      title: "Live Availability",
      description: "Check station availability in real time before booking.",
    },
    {
      title: "Easy Booking",
      description: "Reserve your charging slot in just a few clicks.",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-4xl font-bold text-center mb-12">
          Why Choose EV Charge?
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-gray-100 rounded-2xl p-8 shadow hover:shadow-lg transition"
            >
              <h3 className="text-2xl font-bold text-green-600">
                {feature.title}
              </h3>

              <p className="mt-4 text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Features;