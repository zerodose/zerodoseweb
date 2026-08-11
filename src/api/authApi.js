import { api } from "./client";

// ============================================================
// Login
// ============================================================

export async function loginUser(data) {
  const response = await api.post("/auth/login", data);

  return response.data;
}

// ============================================================
// Current logged-in user
// ============================================================

export async function getCurrentUser() {
  const response = await api.get("/auth/me");

  return response.data;
}

// ============================================================
// Logout
// ============================================================

export async function logoutUser() {
  const response = await api.post("/auth/logout");

  return response.data;
}
