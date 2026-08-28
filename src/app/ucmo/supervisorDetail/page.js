"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Table from "@/components/admin/table/Table";
import exportPDF from "@/utils/export/exportPDF";
import exportExcel from "@/utils/export/exportExcel";

import { getUsers, updateUser } from "@/api/userApi";
import ClientPageHeader from "@/components/ui/ClientPageHeader";

export default function SupervisorDetailPage() {
  const router = useRouter();

  // ============================================================
  // Tabs
  // ============================================================

  const [activeTab, setActiveTab] = useState("active");

  // ============================================================
  // Data
  // ============================================================

  const [supervisors, setSupervisors] = useState([]);
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
  // Get Supervisors
  // ============================================================

  const getSupervisorsData = async () => {
    try {
      setLoading(true);

      const response = await getUsers({
        page: pagination.page,
        limit: pagination.limit,
        search,
        designation: "supervisor",
        isActive: activeTab === "active",
      });

      const formattedSupervisors = (response.data || []).map((supervisor) => ({
        ...supervisor,

        districtName: supervisor.district?.name || "-",
        townName: supervisor.town?.name || "-",
        unionCouncilName: supervisor.unionCouncil?.name || "-",

        approvalStatus: supervisor.approvalStatus || "-",
      }));

      setSupervisors(formattedSupervisors);

      setPagination((previous) => ({
        ...previous,
        ...(response.pagination || {}),
      }));
    } catch (error) {
      console.error("Get supervisors error:", error);

      setSupervisors([]);

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
      getSupervisorsData();
    }, 400);

    return () => clearTimeout(timer);
  }, [pagination.page, pagination.limit, search, activeTab]);

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

  const handleToggleActive = async (user) => {
    try {
      await updateUser(user._id, {
        isActive: !user.isActive,
      });

      await getSupervisorsData();
    } catch (error) {
      console.error("Update supervisor status error:", error);
    }
  };

  return (
    <div className="space-y-5">
     
      <ClientPageHeader
        title="Supervisor Details"
        description="Review and manage details."
        onBack={() => router.back()}
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
          Current Supervisors
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
          Left Supervisors
        </button>
      </div>

      {/* ========================================================
          Table
      ======================================================== */}

      <Table
        data={supervisors}
        loading={loading}
        pageTitle={
          activeTab === "active" ? "Current Supervisors" : "Left Supervisors"
        }
        pageDescription={
          activeTab === "active"
            ? "View and manage active supervisors."
            : "View inactive supervisors."
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

        rowActions={[
          {
            label: (user) => (user.isActive ? "Deactivate" : "Activate"),
            onClick: handleToggleActive,
          },
        ]}

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

        onRowClick={(supervisor) => {
          router.push(`/ucmo/supervisorDetail/${supervisor._id}`);
        }}

        onExportPDF={exportPDF}
        onExportExcel={exportExcel}
      />
    </div>
  );
}
