import { api } from "./client";

export const verifyEmail = async ({ email, code }) => {
  const response = await api.post("/auth/verify-email", {
    email,
    code,
  });

  return response.data;
};

export const resendVerification = async ({ email }) => {
  const response = await api.post("/auth/resend-verification", {
    email,
  });

  return response.data;
};

export async function loginUser(data) {
  const response = await api.post("/auth/login", data);

  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get("/auth/me");

  return response.data;
}

export async function logoutUser() {
  const response = await api.post("/auth/logout");

  return response.data;
}

export const forgotPassword = async (data) => {
  const response = await api.post("/auth/forgot-password", data);

  return response.data;
};

export const verifyForgotPassword = async (data) => {
  const response = await api.post("/auth/forgot-password/verify", data);

  return response.data;
};

export const resendForgotPasswordCode = async (data) => {
  const response = await api.post("/auth/forgot-password/resend", data);

  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post("/auth/forgot-password/reset", data);

  return response.data;
};
