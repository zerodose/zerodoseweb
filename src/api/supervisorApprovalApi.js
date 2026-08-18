import { api } from "./client";

export async function getPendingSupervisorApprovals(unionCouncil) {
  const params = new URLSearchParams();

  if (unionCouncil) {
    params.set("unionCouncil", unionCouncil);
  }

  const query = params.toString();

  const response = await api.get(
    `/users/supervisor-approvals${query ? `?${query}` : ""}`,
  );

  return response.data;
}

export async function updateSupervisorApproval(id, approvalStatus) {
  const response = await api.patch(`/users/supervisor-approvals/${id}`, {
    approvalStatus,
  });

  return response.data;
}
