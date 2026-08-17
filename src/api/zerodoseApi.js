import { api } from "./client";

// =====================================================
// Get Zerodoses
// =====================================================

export const getZerodoses = async ({
  page = 1,
  limit = 10,
  search = "",

  campaign,

  district,
  town,
  unionCouncil,

  ucmo,
  supervisor,
  teamNumber,

  vaccinationStatus,
  clientStatus,

  recordDateFrom,
  recordDateTo,

  visitDateFrom,
  visitDateTo,

  coveredDateFrom,
  coveredDateTo,

  sortBy,
  sortOrder,
} = {}) => {
  const response = await api.get("/zerodose", {
    params: {
      page,
      limit,
      search,
      ...(campaign && { campaign }),
      ...(district && { district }),
      ...(town && { town }),
      ...(unionCouncil && {
        unionCouncil,
      }),

      ...(ucmo && { ucmo }),
      ...(supervisor && { supervisor }),
      ...(teamNumber && { teamNumber }),

      ...(vaccinationStatus && {
        vaccinationStatus,
      }),

      ...(clientStatus && {
        clientStatus,
      }),

      ...(recordDateFrom && {
        recordDateFrom,
      }),

      ...(recordDateTo && {
        recordDateTo,
      }),

      ...(visitDateFrom && {
        visitDateFrom,
      }),

      ...(visitDateTo && {
        visitDateTo,
      }),

      ...(coveredDateFrom && {
        coveredDateFrom,
      }),

      ...(coveredDateTo && {
        coveredDateTo,
      }),

      ...(sortBy && { sortBy }),
      ...(sortOrder && { sortOrder }),
    },
  });

  return response.data;
};

// =====================================================
// Get Single Zerodose
// =====================================================

export const getZerodose = async (id) => {
  const response = await api.get(`/zerodose/${id}`);

  return response.data;
};

// =====================================================
// Create Zerodose
// =====================================================

export const createZerodose = async (data) => {
  const response = await api.post("/zerodose", data);

  return response.data;
};

// =====================================================
// Update Zerodose
// =====================================================

export const updateZerodose = async (id, data) => {
  const response = await api.put(`/zerodose/${id}`, data);

  return response.data;
};

// =====================================================
// Delete Zerodose
// =====================================================

export const deleteZerodose = async (id) => {
  const response = await api.delete(`/zerodose/${id}`);

  return response.data;
};
