import { api } from "./client";

export const getCampaigns = async (params = {}) => {
  const response = await api.get("/campaigns", {
    params,
  });

  return response.data;
};

export const getCampaignFilter = async () => {
  const response = await api.get("/campaigns/filter");
  const data = response?.data;
  if (!data?.success) {
    throw new Error(data?.message || "Failed to fetch campaigns");
  }
  return Array.isArray(data?.data) ? data.data : [];
};

export const getCampaign = async (id) => {
  const response = await api.get(`/campaigns/${id}`);

  return response.data;
};

export const createCampaign = async (data) => {
  const response = await api.post("/campaigns", data);

  return response.data;
};

export const updateCampaign = async (id, data) => {
  const response = await api.put(`/campaigns/${id}`, data);

  return response.data;
};

export const deleteCampaign = async (id) => {
  const response = await api.delete(`/campaigns/${id}`);

  return response.data;
};

export const getCurrentCampaign = async () => {
  const response = await api.get("/campaigns/current");

  return response.data;
};
