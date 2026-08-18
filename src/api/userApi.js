import { api } from "./client";

// ============================================================
// Create User
// ============================================================

export async function createUser(data) {
  const response = await api.post("/users", data);

  return response.data;
}

// ============================================================
// Get Users
//
// Example:
//
// getUsers({
//   page: 1,
//   limit: 10,
//   search: "Abdullah",
//   sortBy: "name",
//   sortOrder: "asc",
//   status: "active",
//   designation: "supervisor",
//   district: "district",
//   town: "town",
//   unionCouncil: "unionCouncil",
// })
// ============================================================

export async function getUsers({
  page = 1,
  limit = 10,
  search = "",
  sortBy = "name",
  sortOrder = "asc",
  status = "active",
  designation = "",
  district = "",
  town = "",
  unionCouncil = "",
  supervisor = "",
    isActive,
} = {}) {
  const response = await api.get("/users", {
    params: {
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      status,
      designation,
      district,
      town,
      unionCouncil,
      supervisor,
        isActive,
    },
  });

  return response.data;
}

// ============================================================
// Get Single User
// ============================================================

export async function getUser(id) {
  const response = await api.get(`/users/${id}`);

  return response.data;
}

// ============================================================
// Update User
// ============================================================

export async function updateUser(id, data) {
  const response = await api.put(`/users/${id}`, data);

  return response.data;
}

// ============================================================
// Soft Delete User
// ============================================================

export async function deleteUser(id) {
  const response = await api.delete(`/users/${id}`);

  return response.data;
}

// ============================================================
// Permanent Delete User
// ============================================================

export async function permanentlyDeleteUser(id) {
  const response = await api.delete(`/users/${id}?permanent=true`);

  return response.data;
}

// ============================================================
// Transfer Workers
// ============================================================

export async function transferWorkers(data) {
  const response = await api.patch("/users/transfer-workers", data);

  return response.data;
}
