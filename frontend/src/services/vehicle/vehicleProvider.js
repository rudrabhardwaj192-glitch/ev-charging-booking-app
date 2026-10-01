const demoVehicleProvider = require("./demoVehicleProvider");

const providers = {
  demo: demoVehicleProvider,
};

const getProvider = (providerName = "demo") => {
  const provider = providers[providerName];

  if (!provider) {
    throw new Error(
      `Vehicle provider "${providerName}" is not configured.`
    );
  }

  return provider;
};

const getVehicleTelemetry = async (
  vehicle,
  providerName = "demo"
) => {
  const provider = getProvider(providerName);

  return provider.getVehicleTelemetry(vehicle);
};

module.exports = {
  getProvider,
  getVehicleTelemetry,
};