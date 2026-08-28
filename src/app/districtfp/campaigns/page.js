"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, History } from "lucide-react";
import Table from "@/components/admin/table/Table";
import exportPDF from "@/utils/export/exportPDF";
import exportExcel from "@/utils/export/exportExcel";
import { getCampaigns } from "@/api/campaignApi";

export default function districtfpCampaignsPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("current");

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // ============================================================
  // Load Campaigns
  // ============================================================

  const getCampaignsData = async () => {
    try {
      setLoading(true);

      const response = await getCampaigns({
        page: pagination.page,
        limit: pagination.limit,
        search,
      });

      let data = response?.data || [];

      // Current / Previous filtering
      if (activeTab === "current") {
        data = data.filter((campaign) => campaign.campaignStatus === "current");
      } else {
        data = data.filter(
          (campaign) => campaign.campaignStatus === "previous",
        );
      }

      setCampaigns(data);

      setPagination((previous) => ({
        ...previous,
        total: data.length,
        totalPages: Math.max(1, Math.ceil(data.length / previous.limit)),
        hasNextPage: previous.page < Math.ceil(data.length / previous.limit),
        hasPreviousPage: previous.page > 1,
      }));
    } catch (error) {
      console.error("Get district FP campaigns error:", error);

      setCampaigns([]);

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
  // Fetch
  // ============================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      getCampaignsData();
    }, 400);

    return () => clearTimeout(timer);
  }, [pagination.page, pagination.limit, search, activeTab]);

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
  // Pagination
  // ============================================================

  const handlePageChange = (page) => {
    setPagination((previous) => ({
      ...previous,
      page,
    }));
  };

  const handlePageSizeChange = (limit) => {
    setPagination((previous) => ({
      ...previous,
      page: 1,
      limit,
    }));
  };

  // ============================================================
  // Tab Change
  // ============================================================

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    setPagination((previous) => ({
      ...previous,
      page: 1,
    }));

    setSearch("");
  };

  return (
    <div className="w-full">
      {/* ========================================================
          Page Header
      ======================================================== */}

      <div className="mb-5">
        <h1 className="text-text text-xl font-bold sm:text-2xl">Campaigns</h1>

        <p className="text-text-secondary mt-1 text-sm">
          View current and previous campaigns.
        </p>
      </div>

      {/* ========================================================
          Tabs
      ======================================================== */}

      <div className="border-border bg-background mb-5 flex w-full items-center gap-1 rounded-2xl border p-1.5 shadow-sm sm:w-fit">
        <button
          type="button"
          onClick={() => handleTabChange("current")}
          className={`flex min-w-[180px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
            activeTab === "current"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-text-secondary hover:bg-surface hover:text-text"
          }`}
        >
          <Activity size={17} />

          <span>Current Campaigns</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("previous")}
          className={`flex min-w-[180px] items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${
            activeTab === "previous"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-text-secondary hover:bg-surface hover:text-text"
          }`}
        >
          <History size={17} />

          <span>Previous Campaigns</span>
        </button>
      </div>

      {/* ========================================================
          Campaign Table
      ======================================================== */}

      <Table
        data={campaigns}
        loading={loading}
        pageTitle={
          activeTab === "current" ? "Current Campaigns" : "Previous Campaigns"
        }
        pageDescription={
          activeTab === "current"
            ? "View the currently active campaign."
            : "View campaigns from previous campaign periods."
        }
        pageBreadcrumbs={[
          {
            label: "Campaigns",
          },
          {
            label: activeTab === "current" ? "Current" : "Previous",
          },
        ]}
        serverPagination
        currentPage={pagination.page}
        totalItems={pagination.total}
        pageSize={pagination.limit}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={handleSearchChange}
        hiddenColumns={["_id", "__v", "createdAt", "updatedAt"]}
        dateColumns={["startDate", "endDate"]}
        columnTitles={{
          name: "Campaign",
          scope: "Scope",
          year: "Year",
          month: "Month",
          startDate: "Start Date",
          endDate: "End Date",
          campaignStatus: "Status",
        }}
        columnOptions={[
          "name",
          "scope",
          "year",
          "month",
          "startDate",
          "endDate",
          "campaignStatus",
        ]}
        filterOptions={[
          {
            key: "name",
            label: "Campaign",
            type: "select",
            column: "name",
          },
          {
            key: "scope",
            label: "Scope",
            type: "select",
            column: "scope",
          },
          {
            key: "year",
            label: "Year",
            type: "select",
            column: "year",
          },
          {
            key: "month",
            label: "Month",
            type: "select",
            column: "month",
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            column: "campaignStatus",
          },
          {
            key: "dateRange",
            label: "Start Date",
            type: "dateRange",
            column: "startDate",
          },
        ]}
        onRowClick={(campaign) => {
          router.push(`/districtfp/campaigns/${campaign._id}`);
        }}
        onExportPDF={exportPDF}
        onExportExcel={exportExcel}
      />
    </div>
  );
}
