import { api } from "./client";

// Get all Union Councils
export const getUnionCouncils = async (params = {}) => {
  const response = await api.get("/unioncouncils", {
    params,
  });

  return response.data;
};

// Get single Union Council
export const getUnionCouncil = async (id) => {
  const response = await api.get(`/unioncouncils/${id}`);

  return response.data;
};

// Create Union Council
export const createUnionCouncil = async (data) => {
  const response = await api.post("/unioncouncils", data);

  return response.data;
};

// Update single Union Council
export const updateUnionCouncil = async (id, data) => {
  const response = await api.put(`/unioncouncils/${id}`, data);

  return response.data;
};

// Soft delete
export const deleteUnionCouncil = async (id) => {
  const response = await api.delete(`/unioncouncils/${id}`);

  return response.data;
};

// Permanent delete
export const permanentlyDeleteUnionCouncil = async (id) => {
  const response = await api.delete(`/unioncouncils/${id}?permanent=true`);

  return response.data;
};

// Dropdown
export const getUnionCouncilDropdown = async (townId) => {
  const response = await api.get("/unioncouncils/dropdown", {
    params: {
      townId,
    },
  });

  return response.data;
};
