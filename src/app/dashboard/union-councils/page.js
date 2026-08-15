"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Table from "@/components/admin/table/Table";
import exportPDF from "@/utils/export/exportPDF";
import exportExcel from "@/utils/export/exportExcel";
import { getUnionCouncils } from "@/api/unionCouncilApi";

export default function UnionCouncilsPage() {
  const router = useRouter();

  const [unionCouncils, setUnionCouncils] = useState([]);
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
  // Get Union Councils
  // ============================================================

  const getUnionCouncilsData = async () => {
    try {
      setLoading(true);

      const response = await getUnionCouncils({
        page: pagination.page,
        limit: pagination.limit,
        search,
      });

      setUnionCouncils(response.data || []);

      setPagination((previous) => ({
        ...previous,
        ...(response.pagination || {}),
      }));
    } catch (error) {
      console.error("Get union councils error:", error);

      setUnionCouncils([]);

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
      getUnionCouncilsData();
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
      data={unionCouncils}
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
      hiddenColumns={[
        "_id",
        "__v",
        "createdAt",
        "updatedAt",
        "district",
        "town",
      ]}
      columnTitles={{
        name: "Union Council",
        code: "Code",
        townName: "Town",
        districtName: "District",
        isActive: "Active",
      }}
      columnOptions={["code", "name",  "townName", "districtName", "isActive"]}
      // ========================================================
      // Filters
      // ========================================================
      filterOptions={[
        {
          key: "name",
          label: "Union Council",
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
          key: "townName",
          label: "Town",
          type: "select",
          column: "townName",
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
      onRowClick={(unionCouncil) => {
        router.push(`/dashboard/unionCouncils/${unionCouncil._id}`);
      }}
      // ========================================================
      // Add
      // ========================================================
      addButton
      addButtonText="Add Union Council"
      onAdd={() => router.push("/dashboard/unionCouncils/addUnionCouncil")}
      // ========================================================
      // Export
      // ========================================================
      onExportPDF={exportPDF}
      onExportExcel={exportExcel}
    />
  );
}
