import { api } from "./client";

// ============================================================
// Get all districts
// ============================================================

export const getDistricts = async (params = {}) => {
  const response = await api.get("/districts", {
    params,
  });

  return response.data;
};

// ============================================================
// Get single district
// ============================================================

export const getDistrict = async (id) => {
  const response = await api.get(`/districts/${id}`);

  return response.data;
};

// ============================================================
// Create district
// ============================================================

export const createDistrict = async (data) => {
  const response = await api.post("/districts", data);

  return response.data;
};

// ============================================================
// Update district
// ============================================================

export const updateDistrict = async (id, data) => {
  const response = await api.patch(`/districts/${id}`, data);

  return response.data;
};

// ============================================================
// Soft delete
// ============================================================

export const deleteDistrict = async (id) => {
  const response = await api.delete(`/districts/${id}`);

  return response.data;
};

// ============================================================
// Permanent delete
// ============================================================

export const permanentlyDeleteDistrict = async (id) => {
  const response = await api.delete(`/districts/${id}?permanent=true`);

  return response.data;
};

// ============================================================
// Dropdown districts
// ============================================================

export const getDistrictDropdown = async () => {
  const response = await api.get("/districts/dropdown");

  return response.data;
};
