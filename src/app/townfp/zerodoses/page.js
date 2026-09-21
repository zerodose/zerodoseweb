"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Table from "@/components/admin/table/Table";

import { getCampaigns } from "@/api/campaignApi";
import exportPDF from "@/utils/export/exportPDF";
import exportExcel from "@/utils/export/exportExcel";

export default function ZerodosesPage() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [townId, setTownId] = useState("");

  // ============================================================
  // Campaigns
  // ============================================================

  const [campaigns, setCampaigns] = useState([]);

  const [currentCampaign, setCurrentCampaign] = useState(null);

  const [selectedCampaignId, setSelectedCampaignId] = useState("");

  const [campaignMode, setCampaignMode] = useState("current");

  // ============================================================
  // Server Pagination
  // ============================================================

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // ============================================================
  // Get Current TownFP
  // ============================================================

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("authUser");

      if (!storedUser) {
        router.replace("/auth/login");
        return;
      }

      const authUser = JSON.parse(storedUser);

      if (String(authUser?.designation || "").toLowerCase() !== "townfp") {
        router.replace("/dashboard");
        return;
      }

      const currentTownId =
        authUser?.town?._id || authUser?.town?.id || authUser?.town || "";

      if (!currentTownId) {
        console.error("Town focal person town ID not found.");
        setLoading(false);
        return;
      }

      setTownId(String(currentTownId));
    } catch (error) {
      console.error("Load auth user error:", error);

      router.replace("/auth/login");
    }
  }, [router]);

  // ============================================================
  // Load Campaigns
  // ============================================================

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const response = await getCampaigns();

        const data = Array.isArray(response?.data) ? response.data : [];

        const normalized = data
          .filter((campaign) => campaign?._id)
          .sort((a, b) => {
            const dateA = new Date(a?.startDate || a?.createdAt || 0).getTime();

            const dateB = new Date(b?.startDate || b?.createdAt || 0).getTime();

            return dateB - dateA;
          });

        setCampaigns(normalized);

        // ========================================================
        // Find Current Campaign
        // ========================================================

        const activeCampaign = normalized.find(
          (campaign) =>
            String(campaign?.campaignStatus || "").toLowerCase() ===
              "current" ||
            String(campaign?.campaignStatus || "").toLowerCase() === "active",
        );

        if (activeCampaign) {
          setCurrentCampaign(activeCampaign);
          setSelectedCampaignId(activeCampaign._id);
          setCampaignMode("current");

          return;
        }

        // ========================================================
        // No Current Campaign
        // Automatically use latest campaign
        // ========================================================

        const latestCampaign = normalized[0];

        if (latestCampaign) {
          setCurrentCampaign(latestCampaign);
          setSelectedCampaignId(latestCampaign._id);
          setCampaignMode("previous");
        }
      } catch (error) {
        console.error("Get campaigns error:", error);
      }
    };

    loadCampaigns();
  }, []);

  // ============================================================
  // Current / Previous Campaign Selection
  // ============================================================

  const handleCampaignModeChange = (mode) => {
    setCampaignMode(mode);

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));

    if (mode === "current") {
      if (currentCampaign?._id) {
        setSelectedCampaignId(currentCampaign._id);
      }

      return;
    }

    // ==========================================================
    // Previous Campaign
    // ==========================================================

    const previousCampaign = campaigns.find(
      (campaign) => String(campaign?._id) !== String(currentCampaign?._id),
    );

    if (previousCampaign?._id) {
      setSelectedCampaignId(previousCampaign._id);
    }
  };

  // ============================================================
  // Previous Campaign Select
  // ============================================================

  const handlePreviousCampaignChange = (event) => {
    setSelectedCampaignId(event.target.value);

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  };

  // ============================================================
  // Get Zerodose Summary
  // ============================================================

  const getZerodoseData = async () => {
    if (!townId || !selectedCampaignId) {
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams({
        town: townId,
        campaign: selectedCampaignId,
        page: String(pagination.page),
        limit: String(pagination.limit),
        search,
      });

      const response = await fetch(
        `/api/users/town-zerodose-summary?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Failed to fetch Zerodose summary.");
      }

      // ========================================================
      // Format Data
      // ========================================================

      const formattedData = (result?.data || []).map((item) => ({
        ...item,

        districtName: item?.district?.name || "-",

        townName: item?.town?.name || "-",

        unionCouncilName: item?.unionCouncil?.name || "-",

        unionCouncilCode: item?.unionCouncil?.code || "-",

        ucmoName: item?.ucmo?.name || "-",

        supervisorName: item?.supervisor?.name || "-",

        supervisorCode: item?.supervisor?.supervisorCode || "-",

        recorded: Number(item?.recorded || 0),

        visited: Number(item?.visited || 0),

        covered: Number(item?.covered || 0),
      }));

      setUsers(formattedData);

      setPagination((previous) => ({
        ...previous,
        ...(result?.pagination || {}),
      }));
    } catch (error) {
      console.error("Get town Zerodose summary error:", error);

      setUsers([]);

      setPagination((previous) => ({
        ...previous,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      }));
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // Load Data
  // ============================================================

  useEffect(() => {
    if (!townId || !selectedCampaignId) {
      return;
    }

    const timer = setTimeout(() => {
      getZerodoseData();
    }, 400);

    return () => clearTimeout(timer);
  }, [townId, selectedCampaignId, pagination.page, pagination.limit, search]);

  // ============================================================
  // Search
  // ============================================================

  const handleSearchChange = (value) => {
    setSearch(value);

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  };

  // ============================================================
  // Page Change
  // ============================================================

  const handlePageChange = (page) => {
    setPagination((previous) => ({
      ...previous,
      page,
    }));
  };

  // ============================================================
  // Page Size Change
  // ============================================================

  const handlePageSizeChange = (limit) => {
    setPagination((previous) => ({
      ...previous,
      page: 1,
      limit,
    }));
  };

  // ============================================================
  // Previous Campaigns
  // ============================================================

  const previousCampaigns = campaigns.filter(
    (campaign) => String(campaign?._id) !== String(currentCampaign?._id),
  );

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="w-full">
     

      {/* ======================================================
          Table
      ====================================================== */}

      <Table
        data={users}
        loading={loading}
        pageTitle="Zerodose"
        pageDescription="View Zerodose counts by UCMO and Supervisor."
        pageBreadcrumbs={[
          {
            label: "Zerodose",
          },
        ]}

        // ====================================================
        // Server Pagination
        // ====================================================

        serverPagination
        currentPage={pagination.page}
        totalItems={pagination.total}
        pageSize={pagination.limit}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={handleSearchChange}

        // ====================================================
        // Hidden Columns
        // ====================================================

        hiddenColumns={[
          "_id",
          "__v",
          "district",
          "town",
          "unionCouncil",
          "ucmo",
          "supervisor",
          "campaign",
        ]}

        // ====================================================
        // Column Titles
        // ====================================================

        columnTitles={{
          districtName: "District",
          townName: "Town",
          unionCouncilName: "Union Council",
          unionCouncilCode: "UC Code",
          ucmoName: "UCMO",
          supervisorName: "Supervisor",
          supervisorCode: "Supervisor Code",
          recorded: "Recorded",
          visited: "Visited",
          covered: "Covered",
        }}

        // ====================================================
        // Columns
        // ====================================================

        columnOptions={[
          "districtName",
          "townName",
          "unionCouncilName",
          "unionCouncilCode",
          "ucmoName",
          "supervisorName",
          "supervisorCode",
          "recorded",
          "visited",
          "covered",
        ]}

        // ====================================================
        // Row
        // ====================================================

        onRowClick={(user) => {
          router.push(`/townfp/zerodoses/${user._id}`);
        }}

        // ====================================================
        // Export
        // ====================================================

        onExportPDF={exportPDF}
        onExportExcel={exportExcel}
      />
    </div>
  );
}
