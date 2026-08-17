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
  // Get Zerodoses
  // ============================================================

  const getZerodoseData = async () => {
    try {
      setLoading(true);

      const response = await getZerodoses({
        page: pagination.page,
        limit: pagination.limit,
        search,
      });

      // ========================================================
      // Format Zerodose Data
      // Raw IDs hide karne hain aur names show karne hain
      // ========================================================
      const formattedZerodoses = (response.data || []).map((zerodose) => {
        return {
          ...zerodose,

          districtName: zerodose.district?.name || "-",
          townName: zerodose.town?.name || "-",
          unionCouncilName: zerodose.unionCouncil?.name || "-",

          ucmoName: zerodose.ucmo?.name || "-",
          supervisorName: zerodose.supervisor?.name || "-",
          campaignName: zerodose.campaign
            ? `${zerodose.campaign.name} ${zerodose.campaign.month} ${zerodose.campaign.year}`
            : "-",

          // team:
          //   zerodose.teamNumber !== null && zerodose.teamNumber !== undefined
          //     ? `Team ${zerodose.teamNumber}`
          //     : "-",
          team: zerodose.teamNumber || "-",

          status: zerodose.vaccinationStatus || "-",
        };
      });

      setZerodoses(formattedZerodoses);

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

  // ============================================================
  // UI
  // ============================================================

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
      // Column Titles
      // ========================================================

      columnTitles={{
        childName: "Child Name",
        fatherName: "Father Name",
        age: "Age",
        address: "Address",
        contactNo: "Contact No",

        districtName: "District",
        townName: "Town",
        unionCouncilName: "Union Council",
        campaignName: "Campaign",
        ucmoName: "UCMO",
        supervisorName: "Supervisor",
        team: "Team",

        recordDate: "Record Date",
        visitDate: "Visit Date",
        coveredDate: "Covered Date",
        status: "Status",
      }}

      // =====  // ========================================================
      // Hidden Columns
      // ========================================================

      hiddenColumns={[
        "_id",
        "__v",

        "campaign",
        "district",
        "town",
        "unionCouncil",

        "ucmo",
        "supervisor",
        "user",
        "teamNumber",

        "location",
        "createdAt",
        "updatedAt",
      ]}

      // ===================================================
      // Columns
      // ========================================================

      columnOptions={[
        "childName",
        "fatherName",
        "age",
        "address",
        "contactNo",

        "districtName",
        "townName",
        "unionCouncilName",
        "ucmoName",
        "supervisorName",
        "team",
        "campaignName",

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
          key: "unionCouncilName",
          label: "Union Council",
          type: "select",
          column: "unionCouncilName",
        },
        {
          key: "campaignName",
          label: "Campaign Name",
          type: "select",
          column: "campaignName",
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
