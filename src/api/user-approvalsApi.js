import { api } from "./client";

export async function getPendingUserApprovals(unionCouncil, designation) {
  const params = new URLSearchParams();

  if (unionCouncil) {
    params.set("unionCouncil", unionCouncil);
  }

  if (designation) {
    params.set("designation", designation);
  }

  const query = params.toString();

  const response = await api.get(
    `/users/pending-approvals${query ? `?${query}` : ""}`,
  );

  return response.data;
}

export async function updateUserApproval(id, approvalStatus) {
  const response = await api.patch(`/users/pending-approvals/${id}`, {
    approvalStatus,
  });

  return response.data;
}