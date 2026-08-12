import { api } from "./client";

export const verifyEmail = async ({ email, code }) => {
  const response = await api.post("/auth/verify-email", {
    email,
    code,
  });

  return response.data;
};

export const resendVerification = async ( {email} ) => {
  const response = await api.post("/auth/resend-verification", {
    email,
  });

  return response.data;
};

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
