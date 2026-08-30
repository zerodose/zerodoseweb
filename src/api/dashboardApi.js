// import { api } from "./client";

// // =====================================================
// // Global Dashboard Count
// // =====================================================

// // export const getGlobalCount = async (metrics, isActive) => {
// //   const response = await api.get("/dashboard/global-counts", {
// //     params: {
// //       metrics,
// //       ...(isActive !== undefined && { isActive }),
// //     },
// //   });

// //   return response.data;
// // };
// export const getGlobalCount = async (metrics, filters = {}) => {
//   const response = await api.get("/dashboard/global-counts", {
//     params: {
//       metrics,
//       ...filters,
//     },
//   });

//   return response.data;
// };

// // =====================================================
// // Generic Specific Count
// // =====================================================

// export const getCount = async (type, id, metrics, isActive) => {
//   const response = await api.get("/dashboard/counts", {
//     params: {
//       type,
//       id,
//       metrics,
//       ...(isActive !== undefined && { isActive }),
//     },
//   });

//   return response.data;
// };

// // =====================================================
// // District
// // =====================================================

// export const getDistrictCount = async (district, metrics, isActive) => {
//   return getCount("district", district, metrics, isActive);
// };

// // =====================================================
// // Town
// // =====================================================

// export const getTownCount = async (town, metrics, isActive) => {
//   return getCount("town", town, metrics, isActive);
// };

// // =====================================================
// // Union Council
// // =====================================================

// export const getUnionCouncilCount = async (unionCouncil, metrics, isActive) => {
//   return getCount("unionCouncil", unionCouncil, metrics, isActive);
// };

// export const getSupervisorUnionCouncilCount = async (
//   supervisorId,
//   unionCouncil,
//   metrics,
// ) => {
//   const response = await api.get("/dashboard/counts", {
//     params: {
//       type: "unionCouncil",
//       id: unionCouncil,
//       supervisorId,
//       metrics,
//     },
//   });

//   return response.data;
// };

// export const getCampaignTrend = async (filters = {}) => {
//   return api.get("/dashboard/campaign-trend", {
//     params: filters,
//   });
// };

// // =====================================================
// // UCMO Supervisor Count
// // =====================================================

// export const getUCMOSupervisorCount = async (
//   ucmoId,
//   townId,
//   metrics = "supervisors",
// ) => {
//   const response = await api.get("/dashboard/counts", {
//     params: {
//       type: "town",
//       id: townId,
//       ucmoId,
//       metrics,
//       isActive: true,
//       approvalStatus: "approved",
//     },
//   });

//   return response.data;
// };

// // =====================================================
// // Town Supervisor Summary
// // =====================================================

// export const getTownSupervisorSummary = async (params = {}) => {
//   const response = await api.get("/users/town-supervisor-summary", {
//     params,
//   });

//   return response.data;
// };

// // =====================================================
// // Town Zerodose Summary
// // =====================================================

// export const getTownZerodoseSummary = async (params = {}) => {
//   const response = await api.get("/users/town-zerodose-summary", {
//     params,
//   });

//   return response.data;
// };

import { api } from "./client";

// =====================================================
// Global Dashboard Count
// =====================================================

export const getGlobalCount = async (metrics, filters = {}) => {
  const response = await api.get("/dashboard/global-counts", {
    params: {
      metrics,
      ...filters,
    },
  });

  return response.data;
};

// =====================================================
// Generic Specific Count
// Backend:
// /api/dashboard/counts
//
// Required:
// type
// id
// metrics
// =====================================================

export const getCount = async (
  type,
  id,
  metrics,
  isActive,
  extraParams = {},
) => {
  const response = await api.get("/dashboard/counts", {
    params: {
      type,
      id,
      metrics,
      ...(isActive !== undefined && {
        isActive,
      }),
      ...extraParams,
    },
  });

  return response.data;
};

// =====================================================
// District Count
// =====================================================

export const getDistrictCount = async (districtId, metrics, isActive) => {
  return getCount("district", districtId, metrics, isActive);
};

// =====================================================
// Town Count
// =====================================================

export const getTownCount = async (townId, metrics, isActive) => {
  return getCount("town", townId, metrics, isActive);
};

// =====================================================
// Union Council Count
// =====================================================

export const getUnionCouncilCount = async (
  unionCouncilId,
  metrics,
  isActive,
) => {
  return getCount("unionCouncil", unionCouncilId, metrics, isActive);
};

// =====================================================
// Supervisor + Union Council Count
// =====================================================

export const getSupervisorUnionCouncilCount = async (
  supervisorId,
  unionCouncilId,
  metrics,
) => {
  return getCount("unionCouncil", unionCouncilId, metrics, undefined, {
    supervisorId,
  });
};

// =====================================================
// Campaign Trend
// =====================================================

export const getCampaignTrend = async (filters = {}) => {
  const response = await api.get("/dashboard/campaign-trend", {
    params: filters,
  });

  return response.data;
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
  const response = await api.get("/users/town-supervisor-summary", {
    params,
  });

  return response.data;
};

// =====================================================
// Town Zerodose Summary
// =====================================================

export const getTownZerodoseSummary = async (params = {}) => {
  const response = await api.get("/users/town-zerodose-summary", {
    params,
  });

  return response.data;
};

// =====================================================
// // UCMO Summary //
//  =====================================================

export const getUCMOSummary = async (ucmoId) => {
  const response = await api.get("/dashboard/ucmo-summary", {
    params: { ucmoId },
  });
  return response.data;
};

export const getTownSummary = async (townId) => {
  const response = await api.get("/dashboard/town-summary", {
    params: { townId },
  });

  return response.data;
};

export const getDistrictSummary = async (districtId) => {
  const response = await api.get("/dashboard/district-summary", {
    params: { districtId },
  });
  return response.data;
};

export const getSupervisorTeamSummary = async () => {
  const response = await api.get("/zerodose");

  return response.data;
};