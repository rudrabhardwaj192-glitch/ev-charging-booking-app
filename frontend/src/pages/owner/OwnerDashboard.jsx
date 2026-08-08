import OwnerLayout from "../../components/owner/OwnerLayout";

function OwnerDashboard() {
  return (
    <OwnerLayout>

      <h1 className="text-4xl font-bold mb-8">
        Owner Dashboard
      </h1>

      <div className="grid lg:grid-cols-4 gap-6">

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-3xl font-bold">3</h2>
          <p>Total Stations</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-3xl font-bold">57</h2>
          <p>Total Bookings</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-3xl font-bold">₹12,580</h2>
          <p>Total Revenue</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-3xl font-bold">4.8★</h2>
          <p>Average Rating</p>
        </div>

      </div>

    </OwnerLayout>
  );
}

export default OwnerDashboard;