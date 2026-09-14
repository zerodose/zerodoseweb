"use client";

import { useMemo, useState } from "react";

export default function useCampaignFilter({ campaigns = [], data = [] } = {}) {
  // ============================================================
  // SAFE ID
  // ============================================================

  const getId = (value) => {
    if (!value) {
      return null;
    }

    if (typeof value === "object") {
      return value._id?.toString() || value.id?.toString() || null;
    }

    return value.toString();
  };

  // ============================================================
  // SELECTION
  // ============================================================

  const [selection, setSelection] = useState(null);

  // ============================================================
  // UNIQUE CAMPAIGNS
  // ============================================================

  const uniqueCampaigns = useMemo(() => {
    const map = new Map();

    campaigns.forEach((campaign) => {
      const campaignId = getId(campaign);

      if (!campaignId) {
        return;
      }

      if (!map.has(campaignId)) {
        map.set(campaignId, campaign);
      }
    });

    return Array.from(map.values());
  }, [campaigns]);

  // ============================================================
  // SORTED CAMPAIGNS
  // ============================================================

  const sortedCampaigns = useMemo(() => {
    return [...uniqueCampaigns].sort((a, b) => {
      const dateA = new Date(a?.startDate || 0).getTime();
      const dateB = new Date(b?.startDate || 0).getTime();

      return dateB - dateA;
    });
  }, [uniqueCampaigns]);

  // ============================================================
  // LATEST CAMPAIGN
  // ============================================================

  const latestCampaignSelection = useMemo(() => {
    if (!sortedCampaigns.length) {
      return {
        year: "",
        month: "",
        campaignId: "",
      };
    }

    const campaign = sortedCampaigns[0];
    const campaignId = getId(campaign);

    if (!campaignId) {
      return {
        year: "",
        month: "",
        campaignId: "",
      };
    }

    return {
      year:
        campaign?.year !== null && campaign?.year !== undefined
          ? String(campaign.year)
          : "",

      month:
        campaign?.month !== null && campaign?.month !== undefined
          ? String(campaign.month)
          : "",

      campaignId,
    };
  }, [sortedCampaigns]);

  // ============================================================
  // ACTIVE SELECTION
  // ============================================================

  const activeSelection = selection || latestCampaignSelection;

  const selectedYear = activeSelection.year || "";
  const selectedMonth = activeSelection.month || "";
  const selectedCampaignId = activeSelection.campaignId || "";

  // ============================================================
  // YEAR OPTIONS
  // ============================================================

  const years = useMemo(() => {
    return [
      ...new Set(
        uniqueCampaigns
          .map((campaign) => campaign?.year)
          .filter((year) => year !== null && year !== undefined && year !== ""),
      ),
    ].sort((a, b) => Number(b) - Number(a));
  }, [uniqueCampaigns]);

  const yearOptions = useMemo(() => {
    return years.map((year) => ({
      value: String(year),
      label: String(year),
    }));
  }, [years]);

  // ============================================================
  // MONTH OPTIONS
  // ============================================================

  const months = useMemo(() => {
    if (!selectedYear) {
      return [];
    }

    return [
      ...new Set(
        uniqueCampaigns
          .filter((campaign) => String(campaign?.year) === String(selectedYear))
          .map((campaign) => campaign?.month)
          .filter(
            (month) => month !== null && month !== undefined && month !== "",
          ),
      ),
    ].sort((a, b) => Number(b) - Number(a));
  }, [uniqueCampaigns, selectedYear]);

  const getMonthLabel = (month) => {
    const monthNumber = Number(month);

    if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12) {
      return String(month);
    }

    return new Date(2000, monthNumber - 1, 1).toLocaleString("en-US", {
      month: "long",
    });
  };

  const monthOptions = useMemo(() => {
    return months.map((month) => ({
      value: String(month),
      label: getMonthLabel(month),
    }));
  }, [months]);

  // ============================================================
  // CAMPAIGN OPTIONS
  // ============================================================

  const campaignOptions = useMemo(() => {
    if (!selectedYear || !selectedMonth) {
      return [];
    }

    return uniqueCampaigns
      .filter(
        (campaign) =>
          String(campaign?.year) === String(selectedYear) &&
          String(campaign?.month) === String(selectedMonth),
      )
      .sort((a, b) => {
        const dateA = new Date(a?.startDate || 0).getTime();

        const dateB = new Date(b?.startDate || 0).getTime();

        return dateB - dateA;
      });
  }, [uniqueCampaigns, selectedYear, selectedMonth]);

  const campaignSelectOptions = useMemo(() => {
    return campaignOptions
      .map((campaign) => {
        const campaignId = getId(campaign);

        if (!campaignId) {
          return null;
        }

        return {
          value: campaignId,
          label: campaign?.name || "Unnamed Campaign",
        };
      })
      .filter(Boolean);
  }, [campaignOptions]);

  // ============================================================
  // SELECTED CAMPAIGN
  // ============================================================

  const selectedCampaign = useMemo(() => {
    if (!selectedCampaignId) {
      return null;
    }

    return (
      uniqueCampaigns.find(
        (campaign) => String(getId(campaign)) === String(selectedCampaignId),
      ) || null
    );
  }, [uniqueCampaigns, selectedCampaignId]);

  // ============================================================
  // SELECTED RAW DATA
  // ============================================================

  const selectedRawData = useMemo(() => {
    if (!selectedCampaignId) {
      return [];
    }

    return data.filter((item) => {
      const campaignId = getId(
        item?.campaign || item?.campaignId || item?.campaign?._id,
      );

      return campaignId && String(campaignId) === String(selectedCampaignId);
    });
  }, [data, selectedCampaignId]);

  // ============================================================
  // YEAR CHANGE
  // ============================================================

  const handleYearChange = (value) => {
    const normalizedYear = value ? String(value) : "";

    if (!normalizedYear) {
      setSelection({
        year: "",
        month: "",
        campaignId: "",
      });

      return;
    }

    const campaignsOfYear = uniqueCampaigns
      .filter((campaign) => String(campaign?.year) === normalizedYear)
      .sort((a, b) => {
        const dateA = new Date(a?.startDate || 0).getTime();

        const dateB = new Date(b?.startDate || 0).getTime();

        return dateB - dateA;
      });

    const firstCampaign = campaignsOfYear[0];

    if (!firstCampaign) {
      setSelection({
        year: normalizedYear,
        month: "",
        campaignId: "",
      });

      return;
    }

    setSelection({
      year: normalizedYear,

      month:
        firstCampaign?.month !== null && firstCampaign?.month !== undefined
          ? String(firstCampaign.month)
          : "",

      campaignId: getId(firstCampaign) || "",
    });
  };

  // ============================================================
  // MONTH CHANGE
  // ============================================================

  const handleMonthChange = (value) => {
    const normalizedMonth = value ? String(value) : "";

    if (!normalizedMonth) {
      setSelection({
        year: selectedYear,
        month: "",
        campaignId: "",
      });

      return;
    }

    const campaignsOfMonth = uniqueCampaigns
      .filter(
        (campaign) =>
          String(campaign?.year) === String(selectedYear) &&
          String(campaign?.month) === normalizedMonth,
      )
      .sort((a, b) => {
        const dateA = new Date(a?.startDate || 0).getTime();

        const dateB = new Date(b?.startDate || 0).getTime();

        return dateB - dateA;
      });

    const latestCampaign = campaignsOfMonth[0];

    setSelection({
      year: selectedYear,
      month: normalizedMonth,
      campaignId: getId(latestCampaign) || "",
    });
  };

  // ============================================================
  // CAMPAIGN CHANGE
  // ============================================================

  const handleCampaignChange = (value) => {
    const normalizedCampaignId = value ? String(value) : "";

    const campaign = uniqueCampaigns.find(
      (item) => String(getId(item)) === normalizedCampaignId,
    );

    setSelection({
      year:
        campaign?.year !== null && campaign?.year !== undefined
          ? String(campaign.year)
          : selectedYear,

      month:
        campaign?.month !== null && campaign?.month !== undefined
          ? String(campaign.month)
          : selectedMonth,

      campaignId: normalizedCampaignId,
    });
  };

  // ============================================================
  // RESET
  // ============================================================

  const resetFilter = () => {
    setSelection(null);
  };

  // ============================================================
  // RETURN
  // ============================================================

  return {
    selection,
    activeSelection,

    selectedYear,
    selectedMonth,
    selectedCampaignId,
    selectedCampaign,

    uniqueCampaigns,
    sortedCampaigns,

    years,
    months,

    yearOptions,
    monthOptions,

    campaignOptions,
    campaignSelectOptions,

    selectedRawData,

    getId,
    getMonthLabel,

    handleYearChange,
    handleMonthChange,
    handleCampaignChange,

    resetFilter,
  };
}
