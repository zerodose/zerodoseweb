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

export const getDistrictCount = async (districtId, metrics, isActive) => {
  return getCount("district", districtId, metrics, isActive);
};

// =====================================================
// Town
// =====================================================

export const getTownCount = async (townId, metrics, isActive) => {
  return getCount("town", townId, metrics, isActive);
};

// =====================================================
// Union Council
// =====================================================

export const getUnionCouncilCount = async (
  unionCouncilId,
  metrics,
  isActive,
) => {
  return getCount("unionCouncil", unionCouncilId, metrics, isActive);
};
