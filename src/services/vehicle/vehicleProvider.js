// ======================================================
// VEHICLE PROVIDER
// ======================================================
//
// This file is the abstraction layer between EV Charge
// and external vehicle/telematics providers.
//
// Today:
//     Demo provider
//
// Future:
//     OEM APIs
//     Telematics providers
//     Vehicle-data platforms
//
// The rest of the application will NOT need to know
// where the vehicle data comes from.
// ======================================================

const demoVehicleProvider = require("./demoVehicleProvider");

// ======================================================
// AVAILABLE PROVIDERS
// ======================================================

const providers = {
  demo: demoVehicleProvider,
};

// ======================================================
// GET PROVIDER
// ======================================================

const getProvider = (
  providerName = "demo"
) => {
  const provider =
    providers[providerName];

  if (!provider) {
    throw new Error(
      `Vehicle provider "${providerName}" is not configured.`
    );
  }

  return provider;
};

// ======================================================
// GET VEHICLE TELEMETRY
// ======================================================

const getVehicleTelemetry = async (
  vehicle,
  providerName = "demo"
) => {
  const provider =
    getProvider(providerName);

  return provider.getVehicleTelemetry(
    vehicle
  );
};

// ======================================================
// EXPORT
// ======================================================

module.exports = {
  getProvider,
  getVehicleTelemetry,
};