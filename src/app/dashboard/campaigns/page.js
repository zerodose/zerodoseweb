"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Table from "@/components/admin/table/Table";
import exportPDF from "@/utils/export/exportPDF";
import exportExcel from "@/utils/export/exportExcel";
import { getCampaigns } from "@/api/campaignApi";

export default function CampaignsPage() {
  const router = useRouter();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
  // Get Campaigns
  // ============================================================

  const getCampaignsData = async () => {
    try {
      setLoading(true);

      const response = await getCampaigns({
        page: pagination.page,
        limit: pagination.limit,
        search,
      });

      setCampaigns(response.data || []);

      setPagination((previous) => ({
        ...previous,
        ...(response.pagination || {}),
      }));
    } catch (error) {
      console.error("Get campaigns error:", error);

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
  // Load Data
  // ============================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      getCampaignsData();
    }, 400);

    return () => clearTimeout(timer);
  }, [pagination.page, pagination.limit, search]);

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

  return (
    <Table
      data={campaigns}
      loading={loading}
      pageTitle="Campaigns"
      pageDescription="Create, manage, and monitor campaigns."
      pageBreadcrumbs={[
        {
          label: "Campaigns",
        },
      ]}

      // ========================================================
      // Server Pagination
      // ========================================================

      serverPagination
      currentPage={pagination.page}
      totalItems={pagination.total}
      pageSize={pagination.limit}
      totalPages={pagination.totalPages}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onSearchChange={handleSearchChange}

      // ========================================================
      // Columns
      // ========================================================

      hiddenColumns={["_id", "__v", "createdAt", "updatedAt"]}
      dateColumns={["startDate", "endDate"]}

      columnTitles={{
        name: "Campaign",
        year: "Year",
        month: "Month",
        startDate: "Start Date",
        endDate: "End Date",
        campaignStatus: "Status",
      }}

      columnOptions={[
        "name",
        "year",
        "month",
        "startDate",
        "endDate",
        "campaignStatus",
      ]}

      // ========================================================
      // Filters
      // ========================================================

      filterOptions={[
        {
          key: "name",
          label: "Campaign",
          type: "select",
          column: "name",
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

      // ========================================================
      // Row
      // ========================================================

      onRowClick={(campaign) => {
        router.push(`/dashboard/campaigns/${campaign._id}`);
      }}

      // ========================================================
      // Add
      // ========================================================

      addButton
      addButtonText="Add Campaign"
      onAdd={() => router.push("/dashboard/campaigns/addCampaign")}

      // ========================================================
      // Export
      // ========================================================

      onExportPDF={exportPDF}
      onExportExcel={exportExcel}
    />
  );
}
