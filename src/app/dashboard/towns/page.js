"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Table from "@/components/admin/table/Table";
import exportPDF from "@/utils/export/exportPDF";
import exportExcel from "@/utils/export/exportExcel";
import { getTowns } from "@/api/townApi";

export default function TownsPage() {
  const router = useRouter();

  const [towns, setTowns] = useState([]);
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
  // Get Towns
  // ============================================================

  const getTownsData = async () => {
    try {
      setLoading(true);

      const response = await getTowns({
        page: pagination.page,
        limit: pagination.limit,
        search,
      });

      setTowns(response.data || []);

      setPagination((previous) => ({
        ...previous,
        ...(response.pagination || {}),
      }));
    } catch (error) {
      console.error("Get towns error:", error);

      setTowns([]);

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
      getTownsData();
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
      data={towns}
      loading={loading}

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

      hiddenColumns={["_id", "__v", "createdAt", "updatedAt", "district"]}
      columnTitles={{
        name: "Town",
        districtName: "District",
        isActive: "Active",
      }}
      columnOptions={["name", "districtName", "isActive"]}

      // ========================================================
      // Filters
      // ========================================================

      filterOptions={[
        {
          key: "name",
          label: "Town",
          type: "select",
          column: "name",
        },
        {
          key: "districtName",
          label: "District",
          type: "select",
          column: "districtName",
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

      onRowClick={(town) => {
        router.push(`/dashboard/towns/${town._id}`);
      }}

      // ========================================================
      // Add
      // ========================================================

      addButton
      addButtonText="Add Town"
      onAdd={() => router.push("/dashboard/towns/addTown")}

      // ========================================================
      // Export
      // ========================================================

      onExportPDF={exportPDF}
      onExportExcel={exportExcel}
    />
  );
}
