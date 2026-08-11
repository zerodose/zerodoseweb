import { api } from "./client";

// =======================================================
// ===== // Verify Email // ==============================
// ============================== 
// export async function verifyEmail(data) {
//   const response = await api.post("/auth/verify-email", data);
//   return response.data;
// }

// // =======================================================
// // ===== // Resend Verification Code // ==============================
// // ============================== 
// // 

// export async function resendVerificationCode(data) {
//   const response = await api.post("/auth/resend-verification-code", data,);
//   return response.data;
// }

export const verifyEmail = async ({ email, code }) => {
  const response = await api.post("/auth/verify-email", {
    email,
    code,
  });

  return response.data;
};

export const resendVerificationCode = async ({ email }) => {
  const response = await api.post("/auth/resend-verification-code", {
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
