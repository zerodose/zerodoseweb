import { api } from "./client";

// ============================================================
// Create
// ============================================================

export async function createDistrict(data) {
  const response = await api.post("/districts", data);

  return response.data;
}

// ============================================================
// Get districts
//
// Example:
//
// getDistricts({
//   page: 1,
//   limit: 10,
//   search: "lahore",
//   sortBy: "name",
//   sortOrder: "asc",
//   status: "active",
// })
// ============================================================

export async function getDistricts({
  page = 1,
  limit = 10,
  search = "",
  sortBy = "name",
  sortOrder = "asc",
  status = "active",
} = {}) {
  const response = await api.get("/districts", {
    params: {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      status,
    },
  });

  return response.data;
}

// ============================================================
// Get single district
// ============================================================

export async function getDistrict(id) {
  const response = await api.get(`/districts/${id}`);

  return response.data;
}

// ============================================================
// Update
// ============================================================

export async function updateDistrict(id, data) {
  const response = await api.patch(`/districts/${id}`, data);

  return response.data;
}

// ============================================================
// Soft delete
// ============================================================

export async function deleteDistrict(id) {
  const response = await api.delete(`/districts/${id}`);

  return response.data;
}

// ============================================================
// Permanent delete
// ============================================================

export async function permanentlyDeleteDistrict(id) {
  const response = await api.delete(`/districts/${id}?permanent=true`);

  return response.data;
}

// ============================================================
// Dropdown districts
// ============================================================

export const getDistrictDropdown = async () => {
  const response = await api.get("/districts/dropdown");
  return response.data;
};
