import api from "./api";

// ======================================================
// GET MY VEHICLES
// ======================================================

export const getMyVehicles = async () => {
  const token = localStorage.getItem("token");

  const response = await api.get(
    "/vehicles",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// ======================================================
// GET SINGLE VEHICLE
// ======================================================

export const getVehicle = async (vehicleId) => {
  const token = localStorage.getItem("token");

  const response = await api.get(
    `/vehicles/${vehicleId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// ======================================================
// ADD VEHICLE
// ======================================================

export const addVehicle = async (data) => {
  const token = localStorage.getItem("token");

  const response = await api.post(
    "/vehicles",
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// ======================================================
// UPDATE VEHICLE
// ======================================================

export const updateVehicle = async (
  vehicleId,
  data
) => {
  const token = localStorage.getItem("token");

  const response = await api.put(
    `/vehicles/${vehicleId}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// ======================================================
// UPDATE BATTERY
// ======================================================

export const updateBattery = async (
  vehicleId,
  data
) => {
  const token = localStorage.getItem("token");

  const response = await api.put(
    `/vehicles/${vehicleId}/battery`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// ======================================================
// DELETE VEHICLE
// ======================================================

export const deleteVehicle = async (
  vehicleId
) => {
  const token = localStorage.getItem("token");

  const response = await api.delete(
    `/vehicles/${vehicleId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};