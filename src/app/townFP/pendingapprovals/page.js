"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Table from "@/components/admin/table/Table";
import { getPendingUserApprovals } from "@/api/userApprovalsApi";

export default function PendingApprovalsPage() {
  const router = useRouter();

  const [users, setUsers] = useState([]);
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

      // Designations are lowercase
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
  // Get Pending UCMO Approvals
  // ============================================================

  const getPendingApprovalsData = async () => {
    if (!townId) {
      return;
    }

    try {
      setLoading(true);

      const response = await getPendingUserApprovals({
        page: pagination.page,
        limit: pagination.limit,
        search,

        // ========================================================
        // TownFP approves UCMO
        // ========================================================

        designation: "ucmo",

        // Only UCMOs belonging to logged-in TownFP's town
        town: townId,
      });

      const formattedUsers = (response?.data || []).map((user) => ({
        ...user,

        districtName: user?.district?.name || "-",
        townName: user?.town?.name || "-",
        unionCouncilName: user?.unionCouncil?.name || "-",

        approvalStatus: user?.approvalStatus || "pending",
      }));

      setUsers(formattedUsers);

      setPagination((previous) => ({
        ...previous,
        ...(response?.pagination || {}),
      }));
    } catch (error) {
      console.error("Get pending UCMO approvals error:", error);

      setUsers([]);

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
      getPendingApprovalsData();
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
      data={users}
      loading={loading}
      pageTitle="Pending Approvals"
      pageDescription="Review and manage pending UCMO approvals."
      pageBreadcrumbs={[
        {
          label: "Pending Approvals",
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
        "password",
        "emailVerified",
        "supervisorCode",
        "supervisor",
        "workerRole",
        "town",
        "unionCouncil",
        "createdAt",
        "updatedAt",
        "isActive",
        "approvalStatus",
      ]}

      // ========================================================
      // Column Titles
      // ========================================================

      columnTitles={{
        name: "Name",
        email: "Email",
        contactNumber: "Contact",
        designation: "Designation",
        districtName: "District",
        townName: "Town",
        unionCouncilName: "Union Council",
      }}

      // ========================================================
      // Columns
      // ========================================================

      columnOptions={[
        "name",
        "email",
        "contactNumber",
        "designation",
        "districtName",
        "townName",
        "unionCouncilName",
      ]}

      // ========================================================
      // Row
      // ========================================================

      onRowClick={(user) => {
        router.push(`/townfp/pendingapprovals/${user._id}`);
      }}
    />
  );
}
