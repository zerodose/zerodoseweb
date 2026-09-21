"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Table from "@/components/admin/table/Table";
import { getUnionCouncils } from "@/api/unionCouncilApi";
import exportPDF from "@/utils/export/exportPDF";
import exportExcel from "@/utils/export/exportExcel";

export default function UnionCouncilsPage() {
  const router = useRouter();

  const [unionCouncils, setUnionCouncils] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [townId, setTownId] = useState("");

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
  // Get Union Councils
  // ============================================================

  const getUnionCouncilsData = async () => {
    if (!townId) {
      return;
    }

    try {
      setLoading(true);

      const response = await getUnionCouncils({
        page: pagination.page,
        limit: pagination.limit,
        search,

        // Only Union Councils belonging to
        // logged-in TownFP's town
        town: townId,

        // Only active Union Councils
        isActive: true,
      });

      const formattedUnionCouncils = (response?.data || []).map(
        (unionCouncil) => ({
          ...unionCouncil,

          districtName: unionCouncil?.district?.name || "-",

          townName: unionCouncil?.town?.name || "-",
        }),
      );

      setUnionCouncils(formattedUnionCouncils);

      setPagination((previous) => ({
        ...previous,
        ...(response?.pagination || {}),
      }));
    } catch (error) {
      console.error("Get Union Councils error:", error);

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
    if (!townId) {
      return;
    }

    const timer = setTimeout(() => {
      getUnionCouncilsData();
    }, 400);

    return () => clearTimeout(timer);
  }, [townId, pagination.page, pagination.limit, search]);

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
  // Render
  // ============================================================

  return (
    <Table
      data={unionCouncils}
      loading={loading}
      pageTitle="Union Councils"
      pageDescription="View and manage active Union Councils in your town."
      pageBreadcrumbs={[
        {
          label: "Union Councils",
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
      // Hidden Columns
      // ========================================================

      hiddenColumns={[
        "_id",
        "__v",
        "district",
        "town",
        "isActive",
        "createdAt",
        "updatedAt",
      ]}

      // ========================================================
      // Column Titles
      // ========================================================

      columnTitles={{
        name: "Union Council",
        districtName: "District",
        townName: "Town",
        code: "UC Code",
      }}

      // ========================================================
      // Columns
      // ========================================================

      columnOptions={[ "code","name", "townName" , "districtName" ]}

      filterOptions={[
        {
          key: "town",
          label: "Towns",
          type: "select",
          column: "townName",
        },
      ]}

      // ========================================================
      // Row
      // ========================================================

      onRowClick={(unionCouncil) => {
        router.push(`/townfp/unioncouncils/${unionCouncil._id}`);
      }}

      // ========================================================
      // Export
      // ========================================================

      onExportPDF={exportPDF}
      onExportExcel={exportExcel}
    />
  );
}
