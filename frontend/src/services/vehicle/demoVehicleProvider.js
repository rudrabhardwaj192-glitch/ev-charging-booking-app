const getVehicleTelemetry = async (vehicle) => {
  if (!vehicle) {
    throw new Error("Vehicle data is required.");
  }

  const batteryPercentage =
    Number(vehicle.current_battery);

  const estimatedRange =
    Number(vehicle.estimated_range);

  const batteryCapacity =
    Number(vehicle.battery_capacity);

  return {
    provider: "demo",

    vehicleId: vehicle.id,

    timestamp: new Date().toISOString(),

    batteryPercentage:
      Number.isFinite(batteryPercentage)
        ? batteryPercentage
        : null,

    estimatedRange:
      Number.isFinite(estimatedRange)
        ? estimatedRange
        : null,

    batteryCapacity:
      Number.isFinite(batteryCapacity)
        ? batteryCapacity
        : null,

    charging: false,

    chargingPower: 0,

    latitude: null,

    longitude: null,

    connectionStatus: "demo",

    dataSource: "EV Charge Demo Provider",
  };
};

module.exports = {
  getVehicleTelemetry,
};