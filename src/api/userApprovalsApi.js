import { api } from "./client";

// ============================================================
// Get Pending User Approvals
// ============================================================

export async function getPendingUserApprovals({
  page = 1,
  limit = 10,
  search = "",
  designation = "",
  district = "",
  town = "",
  unionCouncil = "",
} = {}) {
  const response = await api.get("/users/pendingapprovals", {
    params: {
      page,
      limit,
      search,
      designation,
      district,
      town,
      unionCouncil,
    },
  });

  return response.data;
}

// ============================================================
// Get Pending Approval User
// ============================================================

export async function getPendingApprovalUser(id) {
  const response = await api.get(`/users/pendingapprovals/${id}`);

  return response.data;
}

// ============================================================
// Update User Approval
// ============================================================

export async function updateUserApproval(
  id,
  approvalStatus,
  approverId,
  supervisorCode = null,
) {
  const response = await api.put(`/users/pendingapprovals/${id}`, {
    approvalStatus,
    approverId,
    supervisorCode,
  });

  return response.data;
}

// ============================================================
// Get Pending Approval Count
// ============================================================

export async function getPendingApprovalCount({
  userId,
  designation,
  district = "",
  town = "",
  unionCouncil = "",
} = {}) {
  const response = await api.get("/users/pendingapprovals/count", {
    params: {
      userId,
      designation,
      district,
      town,
      unionCouncil,
    },
  });

  return response.data;
}
