import { api } from "./client";

// ============================================================
// Get Pending Zerodose Update Requests
// ============================================================
// Returns only pending Zerodose update requests belonging to
// the specified supervisor.
//
// Supervisor ID is sent to the backend so that the backend can
// verify/filter requests against the supervisor's assigned
// workers.
// ============================================================

export const getPendingZerodoseUpdates = async (supervisorId) => {
  const response = await api.get("/zerodose/pendingZerodose", {
    params: {
      supervisorId,
    },
  });

  return response?.data;
};

// ============================================================
// Get Pending Zerodose Count
// ============================================================
// Returns pending update request count for the specified
// supervisor.
// ============================================================

export const getPendingZerodoseCount = async (supervisorId) => {
  const response = await api.get("/zerodose/pendingZerodose/count", {
    params: {
      supervisorId,
    },
  });

  return response?.data;
};

// ============================================================
// Get Single Pending Zerodose
// ============================================================
// The backend must verify that this Zerodose belongs to a
// worker assigned to the specified supervisor.
// ============================================================

export const getPendingZerodoseById = async (zerodoseId, supervisorId) => {
  const response = await api.get(`/zerodose/pendingZerodose/${zerodoseId}`, {
    params: {
      supervisorId,
    },
  });

  return response?.data;
};

// ============================================================
// Approve / Reject Zerodose Update
// ============================================================
// Supervisor ID is also sent here so the backend can verify
// that the requesting supervisor is authorized to approve or
// reject this worker's Zerodose update request.
// ============================================================

export const updateZerodoseApproval = async (
  zerodoseId,
  action,
  supervisorId,
) => {
  const response = await api.put(`/zerodose/${zerodoseId}`, {
    action,
    supervisorId,
  });

  return response?.data;
};

export const deletePendingZerodose = async (pendingId) => {
  const response = await api.delete(`/zerodose/worker/${pendingId}`);

  return response?.data;
};
