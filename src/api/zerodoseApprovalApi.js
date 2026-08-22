import { api } from "./client";

// ============================================================
// Get Pending Zerodose Update Requests
// ============================================================

export const getPendingZerodoseUpdates = async () => {
  const response = await api.get("/zerodose/pendingZerodose");

  return response?.data;
};

// ============================================================
// Get Pending Zerodose Count
// ============================================================

export const getPendingZerodoseCount = async () => {
  const response = await api.get("/zerodose/pendingZerodose/count");

  return response?.data;
};

// ============================================================
// Get Single Pending Zerodose
// ============================================================

export const getPendingZerodoseById = async (zerodoseId) => {
  const response = await api.get(`/zerodose/pendingZerodose/${zerodoseId}`);

  return response?.data;
};

// ============================================================
// Approve / Reject Zerodose Update
// ============================================================

export const updateZerodoseApproval = async (zerodoseId, action) => {
  const response = await api.put(`/zerodose/pendingZerodose/${zerodoseId}`, {
    action,
  });

  return response?.data;
};
