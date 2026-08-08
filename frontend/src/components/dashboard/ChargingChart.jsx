import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "Mon", sessions: 5 },
  { day: "Tue", sessions: 8 },
  { day: "Wed", sessions: 6 },
  { day: "Thu", sessions: 10 },
  { day: "Fri", sessions: 7 },
  { day: "Sat", sessions: 12 },
  { day: "Sun", sessions: 9 },
];

function ChargingChart() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mt-10">
      <h2 className="text-2xl font-bold mb-6">
        Charging Activity
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="4 4" />

          <XAxis dataKey="day" />

          <YAxis />

          <Tooltip />

          <Line
            type="monotone"
            dataKey="sessions"
            stroke="#16a34a"
            strokeWidth={4}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ChargingChart;