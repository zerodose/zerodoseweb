import { api } from "./client";

// Get all towns
export const getTowns = async (params = {}) => {
  const response = await api.get("/towns", {
    params,
  });

  return response.data;
};

// Get single town
export const getTown = async (id) => {
  const response = await api.get(`/towns/${id}`);

  return response.data;
};

// Create town
export const createTown = async (data) => {
  const response = await api.post("/towns", data);

  return response.data;
};

// Update single town
export const updateTown = async (id, data) => {
  const response = await api.put(`/towns/${id}`, data);

  return response.data;
};

// Soft delete
export const deleteTown = async (id) => {
  const response = await api.delete(`/towns/${id}`);

  return response.data;
};

// Permanent delete
export const permanentlyDeleteTown = async (id) => {
  const response = await api.delete(`/towns/${id}?permanent=true`);

  return response.data;
};

// export const getTownDropdown = async (district) => {
//   const response = await api.get(`/towns/dropdown?district=${district}`);

//   return response.data;
// };

export const getTownDropdown = async (districtId) => {
  const response = await api.get("/towns/dropdown", {
    params: {
      districtId,
    },
  });

  return response.data;
};
