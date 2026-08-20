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
  const response = await api.get("/users/pending-approvals", {
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
  const response = await api.get(`/users/pending-approvals/${id}`);

  return response.data;
}

// ============================================================
// Update User Approval
// ============================================================

export async function updateUserApproval(id, approvalStatus, approverId) {
  const response = await api.put(`/users/pending-approvals/${id}`, {
    approvalStatus,
    approverId,
  });

  return response.data;
}

// ============================================================
// Get Pending Approval Count
// ============================================================

export async function getPendingApprovalCount({
  designation = "",
  district = "",
  town = "",
  unionCouncil = "",
} = {}) {
  const response = await api.get("/users/pending-approvals/count", {
    params: {
      designation,
      district,
      town,
      unionCouncil,
    },
  });

  return response.data;
}
