"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  ChevronDown,
  CircleCheck,
  ClipboardList,
  Eye,
  History,
  MapPin,
  UserRound,
} from "lucide-react";

import Table from "@/components/admin/table/Table";

import exportPDF from "@/utils/export/exportPDF";
import exportExcel from "@/utils/export/exportExcel";
import { formatDate } from "@/lib/formatDate";

export default function TeamsDetailPage() {
  const router = useRouter();
  const params = useParams();

  const ucmoId = params?.id;

  // ============================================================
  // State
  // ============================================================

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [campaigns, setCampaigns] = useState([]);

  const [currentCampaign, setCurrentCampaign] = useState(null);

  const [previousCampaigns, setPreviousCampaigns] = useState([]);

  const [selectedCampaign, setSelectedCampaign] = useState(null);

  const [campaignMode, setCampaignMode] = useState("current");

  const [ucmo, setUcmo] = useState(null);

  const [town, setTown] = useState(null);

  // ============================================================
  // Pagination
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
  // Campaign Display
  // ============================================================

  const formatCampaignName = (campaign) => {
    if (!campaign) {
      return "-";
    }

    const campaignName = campaign?.name || "Campaign";

    const month =
      campaign?.month !== undefined && campaign?.month !== null
        ? `Month ${campaign.month}`
        : "";

    const year =
      campaign?.year !== undefined && campaign?.year !== null
        ? String(campaign.year)
        : "";

    return [campaignName, month, year].filter(Boolean).join(" - ");
  };

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
      }
    } catch (error) {
      console.error("Load auth user error:", error);

      router.replace("/auth/login");
    }
  }, [router]);

  // ============================================================
  // Get Zerodose Summary
  // ============================================================

  const getZerodoseData = async () => {
    if (!ucmoId) {
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams({
        ucmo: String(ucmoId),
        page: String(pagination.page),
        limit: String(pagination.limit),
        search,
      });

      if (selectedCampaign?._id) {
        params.set("campaign", String(selectedCampaign._id));
      }

      const response = await fetch(
        `/api/users/town-zerodose-summary?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Failed to fetch zerodose summary.");
      }

      // ========================================================
      // UCMO / Town
      // ========================================================

      setUcmo(result?.ucmo || null);

      setTown(result?.town || null);

      // ========================================================
      // Campaigns
      // ========================================================

      setCampaigns(Array.isArray(result?.campaigns) ? result.campaigns : []);

      setCurrentCampaign(result?.currentCampaign || null);

      setPreviousCampaigns(
        Array.isArray(result?.previousCampaigns)
          ? result.previousCampaigns
          : [],
      );

      // ========================================================
      // Important:
      //
      // Backend automatically decides campaign if no campaign
      // was supplied.
      // ========================================================

      const apiSelectedCampaign = result?.selectedCampaign || null;

      if (
        apiSelectedCampaign &&
        String(apiSelectedCampaign._id) !== String(selectedCampaign?._id)
      ) {
        setSelectedCampaign(apiSelectedCampaign);

        // Determine UI mode
        if (
          result?.currentCampaign &&
          String(result.currentCampaign._id) === String(apiSelectedCampaign._id)
        ) {
          setCampaignMode("current");
        } else {
          setCampaignMode("previous");
        }
      }

      // ========================================================
      // Format Table Data
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

        recordedCount: Number(item?.recordedCount || 0),

        visitedCount: Number(item?.visitedCount || 0),

        coveredCount: Number(item?.coveredCount || 0),
      }));

      setUsers(formattedData);

      setPagination((previous) => ({
        ...previous,
        ...(result?.pagination || {}),
      }));
    } catch (error) {
      console.error("Get town zerodose summary error:", error);

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
    if (!ucmoId) {
      return;
    }

    const timer = setTimeout(() => {
      getZerodoseData();
    }, 300);

    return () => clearTimeout(timer);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ucmoId,
    pagination.page,
    pagination.limit,
    search,
    selectedCampaign?._id,
  ]);

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
  // Page Size
  // ============================================================

  const handlePageSizeChange = (limit) => {
    setPagination((previous) => ({
      ...previous,
      page: 1,
      limit,
    }));
  };

  // ============================================================
  // Current Campaign Click
  // ============================================================

  const handleCurrentCampaign = () => {
    if (!currentCampaign) {
      return;
    }

    setCampaignMode("current");

    setSelectedCampaign(currentCampaign);

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  };

  // ============================================================
  // Previous Campaign Click
  // ============================================================

  const handlePreviousCampaign = () => {
    setCampaignMode("previous");

    const latestPrevious = previousCampaigns?.[0] || null;

    setSelectedCampaign(latestPrevious);

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  };

  // ============================================================
  // Previous Campaign Selection
  // ============================================================

  const handlePreviousCampaignChange = (event) => {
    const campaignId = event.target.value;

    const campaign =
      previousCampaigns.find(
        (item) => String(item._id) === String(campaignId),
      ) || null;

    setCampaignMode("previous");

    setSelectedCampaign(campaign);

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));
  };

  // ============================================================
  // Active Campaign Label
  // ============================================================

  const campaignLabel = useMemo(() => {
    if (!selectedCampaign) {
      return "No Campaign";
    }

    return formatCampaignName(selectedCampaign);
  }, [selectedCampaign]);

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="space-y-5">
      {/* ======================================================
          Header
      ====================================================== */}

      <div className="border-border bg-background rounded-2xl border p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left */}
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => router.push("/townfp/teams")}
              className="border-border bg-surface text-text-secondary hover:border-primary hover:bg-primary-light hover:text-primary mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition"
            >
              <ArrowLeft size={19} />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <UserRound size={19} className="text-primary" />

                <h1 className="text-text text-xl font-bold">
                  {ucmo?.name || "UCMO"}
                </h1>
              </div>

              <p className="text-text-secondary mt-1 text-sm">
                {town?.name ? `Town: ${town.name}` : "UCMO Zerodose Summary"}
              </p>

              {selectedCampaign && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="bg-primary-light text-primary inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold">
                    <CalendarDays size={14} />

                    {campaignLabel}
                  </span>

                  <span className="text-text-secondary text-xs">
                    {formatDate(selectedCampaign.startDate)} -{" "}
                    {formatDate(selectedCampaign.endDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ==================================================
              Campaign Controls
          ================================================== */}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* Current */}
            <button
              type="button"
              onClick={handleCurrentCampaign}
              disabled={!currentCampaign}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
                campaignMode === "current"
                  ? "border-primary bg-primary text-white shadow-sm"
                  : "border-border bg-background text-text-secondary hover:border-primary hover:text-primary"
              } ${!currentCampaign ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <CircleCheck size={16} />
              Current Campaign
            </button>

            {/* Previous */}
            <button
              type="button"
              onClick={handlePreviousCampaign}
              disabled={previousCampaigns.length === 0}
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-semibold transition ${
                campaignMode === "previous"
                  ? "border-primary bg-primary text-white shadow-sm"
                  : "border-border bg-background text-text-secondary hover:border-primary hover:text-primary"
              } ${
                previousCampaigns.length === 0
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            >
              <History size={16} />
              Previous Campaign
            </button>

            {/* Previous Campaign Dropdown */}
            <div className="relative">
              <select
                value={
                  campaignMode === "previous" && selectedCampaign?._id
                    ? String(selectedCampaign._id)
                    : ""
                }
                onChange={handlePreviousCampaignChange}
                disabled={previousCampaigns.length === 0}
                className="border-border bg-background text-text focus:border-primary h-10 min-w-[210px] appearance-none rounded-xl border pr-9 pl-3 text-sm font-medium transition outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Previous Campaign</option>

                {previousCampaigns.map((campaign) => (
                  <option key={campaign._id} value={String(campaign._id)}>
                    {formatCampaignName(campaign)}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={16}
                className="text-text-secondary pointer-events-none absolute top-1/2 right-3 -translate-y-1/2"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          Campaign Info
      ====================================================== */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="border-border bg-background rounded-2xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <UserRound size={18} />
            </div>

            <div>
              <p className="text-text-secondary text-xs font-medium">UCMO</p>

              <p className="text-text text-sm font-bold">{ucmo?.name || "-"}</p>
            </div>
          </div>
        </div>

        <div className="border-border bg-background rounded-2xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <MapPin size={18} />
            </div>

            <div>
              <p className="text-text-secondary text-xs font-medium">Town</p>

              <p className="text-text text-sm font-bold">{town?.name || "-"}</p>
            </div>
          </div>
        </div>

        <div className="border-border bg-background rounded-2xl border p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <ClipboardList size={18} />
            </div>

            <div>
              <p className="text-text-secondary text-xs font-medium">
                Selected Campaign
              </p>

              <p className="text-text text-sm font-bold">{campaignLabel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          Supervisor Table
      ====================================================== */}

      <Table
        data={users}
        loading={loading}
        pageTitle="Supervisor Zerodose"
        pageDescription={`Supervisor-wise Zerodose summary for ${campaignLabel}.`}
        pageBreadcrumbs={[
          {
            label: "Teams",
            onClick: () => router.push("/townfp/teams"),
          },
          {
            label: ucmo?.name || "UCMO",
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

          recordedCount: "Recorded",

          visitedCount: "Visited",

          coveredCount: "Covered",
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
          "recordedCount",
          "visitedCount",
          "coveredCount",
        ]}

        // ====================================================
        // Export
        // ====================================================

        onExportPDF={exportPDF}
        onExportExcel={exportExcel}
      />
    </div>
  );
}
