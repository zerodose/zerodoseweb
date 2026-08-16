"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Table from "@/components/admin/table/Table";
import exportPDF from "@/utils/export/exportPDF";
import exportExcel from "@/utils/export/exportExcel";
import { getDistricts } from "@/api/districtApi";

export default function DistrictsPage() {
  const router = useRouter();

  const [districts, setDistricts] = useState([]);
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
  // Get Districts
  // ============================================================

  const getDistrictsData = async () => {
    try {
      setLoading(true);

      const response = await getDistricts({
        page: pagination.page,
        limit: pagination.limit,
        search,
      });

      setDistricts(response.data || []);

      setPagination((previous) => ({
        ...previous,
        ...(response.pagination || {}),
      }));
    } catch (error) {
      console.error("Get districts error:", error);

      setDistricts([]);

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
      getDistrictsData();
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
      data={districts}
      loading={loading}
      pageTitle="Districts"
      pageDescription="View and manage all districts."
      pageBreadcrumbs={[
        {
          label: "Districts",
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
      columnTitles={{
        name: "District",
        code: "Code",
        isActive: "Active",
      }}
      columnOptions={["name", "code", "isActive"]}

      // ========================================================
      // Filters
      // ========================================================

      filterOptions={[
        {
          key: "code",
          label: "Code",
          type: "select",
          column: "code",
        },
        {
          key: "name",
          label: "District",
          type: "select",
          column: "name",
        },
        {
          key: "isActive",
          label: "IsActive",
          type: "select",
          column: "isActive",
        },
      ]}

      // ========================================================
      // Row
      // ========================================================

      onRowClick={(district) => {
        router.push(`/dashboard/districts/${district._id}`);
      }}

      // ========================================================
      // Add
      // ========================================================

      addButton
      addButtonText="Add District"
      onAdd={() => router.push("/dashboard/districts/addDistrict")}

      // ========================================================
      // Export
      // ========================================================

      onExportPDF={exportPDF}
      onExportExcel={exportExcel}
    />
  );
}
