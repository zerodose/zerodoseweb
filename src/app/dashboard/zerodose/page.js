"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Table from "@/components/admin/table/Table";
import exportPDF from "@/utils/export/exportPDF";
import exportExcel from "@/utils/export/exportExcel";
import { getZerodoses } from "@/api/zerodoseApi";

export default function ZerodosePage() {
  const router = useRouter();

  const [zerodoses, setZerodoses] = useState([]);
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
  // Get Zerodose
  // ============================================================

  const getZerodoseData = async () => {
    try {
      setLoading(true);

      const response = await getZerodoses({
        page: pagination.page,
        limit: pagination.limit,
        search,
      });

      setZerodoses(response.data || []);

      setPagination((previous) => ({
        ...previous,
        ...(response.pagination || {}),
      }));
    } catch (error) {
      console.error("Get zerodose error:", error);

      setZerodoses([]);

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
      getZerodoseData();
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
      data={zerodoses}
      loading={loading}
      pageTitle="Zerodoses"
pageDescription="View and manage recorded zerodose."
      pageBreadcrumbs={[
        {
          label: "Zerodoses",
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
      hiddenColumns={[
        "_id",
        "__v",
        "districtId",
        "town",
        "unionCouncilId",
        "ucmo",
        "supervisor",
        "team",
        "location",
        "createdAt",
        "updatedAt",
      ]}
      columnTitles={{
        childName: "Child Name",
        fatherName: "Father Name",
        age: "Age",
        address: "Address",
        contactNo: "Contact No",
        recordDate: "Record Date",
        visitDate: "Visit Date",
        coveredDate: "Covered Date",
        status: "Status",
      }}
      columnOptions={[
        "childName",
        "fatherName",
        "age",
        "address",
        "contactNo",
        "recordDate",
        "visitDate",
        "coveredDate",
        "status",
      ]}
      dateColumns={["recordDate", "visitDate", "coveredDate"]}
      // ========================================================
      // Filters
      // ========================================================
      filterOptions={[
        {
          key: "status",
          label: "Status",
          type: "select",
          column: "status",
        },
        {
          key: "recordDate",
          label: "Record Date",
          type: "dateRange",
          column: "recordDate",
        },
        {
          key: "visitDate",
          label: "Visit Date",
          type: "dateRange",
          column: "visitDate",
        },
        {
          key: "coveredDate",
          label: "Covered Date",
          type: "dateRange",
          column: "coveredDate",
        },
      ]}
      // ========================================================
      // Row
      // ========================================================
      onRowClick={(zerodose) => {
        router.push(`/dashboard/zerodose/${zerodose._id}`);
      }}
      // ========================================================
      // Add
      // ========================================================
      addButton
      addButtonText="Add Zerodose"
      onAdd={() => router.push("/dashboard/zerodose/addzerodose")}
      // ========================================================
      // Export
      // ========================================================
      onExportPDF={exportPDF}
      onExportExcel={exportExcel}
    />
  );
}
