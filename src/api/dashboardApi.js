import { api } from "./client";

// =====================================================
// Global Dashboard Count
// =====================================================

export const getGlobalCount = async (metrics, isActive) => {
  const response = await api.get("/dashboard/global-counts", {
    params: {
      metrics,
      ...(isActive !== undefined && { isActive }),
    },
  });

  return response.data;
};

// =====================================================
// Generic Specific Count
// =====================================================

export const getCount = async (type, id, metrics, isActive) => {
  const response = await api.get("/dashboard/counts", {
    params: {
      type,
      id,
      metrics,
      ...(isActive !== undefined && { isActive }),
    },
  });

  return response.data;
};

// =====================================================
// District
// =====================================================

export const getDistrictCount = async (district, metrics, isActive) => {
  return getCount("district", district, metrics, isActive);
};

// =====================================================
// Town
// =====================================================

export const getTownCount = async (town, metrics, isActive) => {
  return getCount("town", town, metrics, isActive);
};

// =====================================================
// Union Council
// =====================================================

export const getUnionCouncilCount = async (unionCouncil, metrics, isActive) => {
  return getCount("unionCouncil", unionCouncil, metrics, isActive);
};

export const getSupervisorUnionCouncilCount = async (
  supervisorId,
  unionCouncil,
  metrics,
) => {
  const response = await api.get("/dashboard/counts", {
    params: {
      type: "unionCouncil",
      id: unionCouncil,
      supervisorId,
      metrics,
    },
  });

  return response.data;
};

export const getCampaignTrend = async () => {
  return api.get("/dashboard/campaign-trend");
};

// =====================================================
// UCMO Supervisor Count
// =====================================================

export const getUCMOSupervisorCount = async (
  ucmoId,
  townId,
  metrics = "supervisors",
) => {
  const response = await api.get("/dashboard/counts", {
    params: {
      type: "town",
      id: townId,
      ucmoId,
      metrics,
      isActive: true,
      approvalStatus: "approved",
    },
  });

  return response.data;
};

// =====================================================
// Town Supervisor Summary
// =====================================================

export const getTownSupervisorSummary = async (params = {}) => {
  const response = await api.get(
    "/users/town-supervisor-summary",
    {
      params,
    },
  );

  return response.data;
};

// =====================================================
// Town Zerodose Summary
// =====================================================

export const getTownZerodoseSummary = async (params = {}) => {
  const response = await api.get(
    "/users/town-zerodose-summary",
    {
      params,
    },
  );

  return response.data;
};