"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Table from "@/components/admin/table/Table";
import exportPDF from "@/utils/export/exportPDF";
import exportExcel from "@/utils/export/exportExcel";

import { getUsers, updateUser } from "@/api/userApi";
import ApprovalPageHeader from "@/components/ui/ApprovalPageHeader";

export default function SupervisorDetailPage() {
  const router = useRouter();
  const [ucmoId, setUcmoId] = useState(null);
  // ============================================================
  // Tabs
  // ============================================================

  const [activeTab, setActiveTab] = useState("active");

  // ============================================================
  // Data
  // ============================================================

  const [staff, setStaff] = useState([]);
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

  useEffect(() => {
    try {
      const storedAuthUser = localStorage.getItem("authUser");

      if (!storedAuthUser) {
        console.error("UCMO authentication data not found.");
        return;
      }

      const parsedAuthUser = JSON.parse(storedAuthUser);

      if (!parsedAuthUser?.id) {
        console.error("UCMO ID not found in authentication data.");
        return;
      }

      setUcmoId(String(parsedAuthUser.id));
    } catch (error) {
      console.error("Get UCMO authentication error:", error);
    }
  }, []);

  // ============================================================
  // Get Staff
  // ============================================================

  const getUsersData = async () => {
    try {
      setLoading(true);

      const response = await getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search,
        ucmo: ucmoId,
        isActive: activeTab === "active",
      });

      const formattedStaff = (response.data || []).map((staff) => ({
        ...staff,

        districtName: staff.district?.name || "-",
        townName: staff.town?.name || "-",
        unionCouncilName: staff.unionCouncil?.name || "-",

        approvalStatus: staff.approvalStatus || "-",
      }));

      setStaff(formattedStaff);

      setPagination((previous) => ({
        ...previous,
        ...(response.pagination || {}),
      }));
    } catch (error) {
      console.error("Get staff error:", error);

      setStaff([]);

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
    if (!ucmoId) return;

    const timer = setTimeout(() => {
      getUsersData();
    }, 400);

    return () => clearTimeout(timer);
  }, [ucmoId, pagination.page, pagination.limit, search, activeTab]);

  // ============================================================
  // Tab Change
  // ============================================================

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    setSearch("");

    setPagination((previous) => ({
      ...previous,
      page: 1,
      total: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    }));
  };

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
    <div className="space-y-5">
      <ApprovalPageHeader
        title="Supervisor Details"
        description="Review and manage details."
        onBack={() => router.back()}
        onRefresh={() => getUsersData(true)}
      />
      {/* ========================================================
          Tabs
      ======================================================== */}

      <div className="border-border bg-background flex w-full gap-1 rounded-xl border p-1">
        <button
          type="button"
          onClick={() => handleTabChange("active")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "active"
              ? "bg-primary text-white shadow-sm"
              : "text-text-secondary hover:bg-surface hover:text-text"
          }`}
        >
          Current Staff
        </button>

        <button
          type="button"
          onClick={() => handleTabChange("inactive")}
          className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
            activeTab === "inactive"
              ? "bg-primary text-white shadow-sm"
              : "text-text-secondary hover:bg-surface hover:text-text"
          }`}
        >
          Left Staff
        </button>
      </div>

      {/* ========================================================
          Table
      ======================================================== */}

      <Table
        data={staff}
        loading={loading}
        pageTitle={activeTab === "active" ? "Current Staff" : "Left Staff"}
        pageDescription={
          activeTab === "active"
            ? "View and manage active Staff."
            : "View inactive Staff."
        }

        pageBreadcrumbs={false}

        serverPagination
        currentPage={pagination.page}
        totalItems={pagination.total}
        pageSize={pagination.limit}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={handleSearchChange}

        hiddenColumns={[
          "_id",
          "__v",
          "password",
          "emailVerified",
          "supervisor",
          "teamNumber",
          "workerRole",
          "createdAt",
          "updatedAt",
        ]}

        columnTitles={{
          name: "Name",
          email: "Email",
          contactNumber: "Contact",
          supervisorCode: "Supervisor Code",
          approvalStatus: "Approval Status",
          districtName: "District",
          townName: "Town",
          unionCouncilName: "Union Council",
          isActive: "Active",
        }}

        columnOptions={[
          "name",
          "email",
          "contactNumber",
          "supervisorCode",
          "approvalStatus",
          "districtName",
          "townName",
          "unionCouncilName",
          "isActive",
        ]}

        filterOptions={[
          {
            key: "designation",
            label: "Designation",
            type: "select",
            column: "designation",
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
            key: "isActive",
            label: "Active",
            type: "select",
            column: "isActive",
          },
        ]}

        onRowClick={(supervisor) => {
          router.push(`/ucmo/staff-details/${supervisor._id}`);
        }}

        onExportPDF={exportPDF}
        onExportExcel={exportExcel}
      />
    </div>
  );
}
