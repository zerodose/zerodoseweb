import { api } from "./client";

// =====================================================
// GET ALL CAMPAIGNS
// =====================================================

export const getCampaigns = async (params = {}) => {
  const response = await api.get("/campaigns", {
    params,
  });

  return response.data;
};

// =====================================================
// GET SINGLE CAMPAIGN
// =====================================================

export const getCampaign = async (id) => {
  const response = await api.get(`/campaigns/${id}`);

  return response.data;
};

// =====================================================
// ADD CAMPAIGN
// =====================================================

export const createCampaign = async (data) => {
  const response = await api.post("/campaigns", data);

  return response.data;
};

// =====================================================
// UPDATE CAMPAIGN
// =====================================================

export const updateCampaign = async (id, data) => {
  const response = await api.put(`/campaigns/${id}`, data);

  return response.data;
};

// =====================================================
// DELETE CAMPAIGN
// =====================================================

export const deleteCampaign = async (id) => {
  const response = await api.delete(`/campaigns/${id}`);

  return response.data;
};
