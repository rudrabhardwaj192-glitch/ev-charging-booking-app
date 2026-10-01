import { motion } from "framer-motion";

function StatCard({
  title,
  value,
  icon,
  color,
  increase,
}) {
  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.03,
      }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-xl p-6 border border-gray-100"
    >
      <div className="flex justify-between items-center">

        <div>

          <p className="text-gray-500 text-sm">
            {title}
          </p>

          <h2 className="text-4xl font-bold mt-3">
            {value}
          </h2>

          <p className="text-green-600 text-sm mt-3">
            ▲ {increase}% this month
          </p>

        </div>

        <div
          className={`${color} w-16 h-16 rounded-2xl flex justify-center items-center text-white text-3xl shadow-lg`}
        >
          {icon}
        </div>

      </div>
    </motion.div>
  );
}

export default StatCard;