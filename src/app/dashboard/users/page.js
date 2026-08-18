  "use client";

  import { useEffect, useState } from "react";
  import { useRouter } from "next/navigation";

  import Table from "@/components/admin/table/Table";
  import exportPDF from "@/utils/export/exportPDF";
  import exportExcel from "@/utils/export/exportExcel";

  import { getUsers } from "@/api/userApi";

  export default function UsersPage() {
    const router = useRouter();

    const [users, setUsers] = useState([]);
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
    // Get Users
    // ============================================================

    const getUsersData = async () => {
      try {
        setLoading(true);

        const response = await getUsers({
          page: pagination.page,
          limit: pagination.limit,
          search,
        });

        const formattedUsers = (response.data || []).map((user) => ({
          ...user,

          districtName: user.district?.name || "-",
          townName: user.town?.name || "-",
          unionCouncilName: user.unionCouncil?.name || "-",
          supervisorName: user.supervisor?.name || "-",
        }));

        setUsers(formattedUsers);

        setPagination((previous) => ({
          ...previous,
          ...(response.pagination || {}),
        }));
      } catch (error) {
        console.error("Get users error:", error);

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
      const timer = setTimeout(() => {
        getUsersData();
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
        data={users}
        loading={loading}
        pageTitle="Users"
        pageDescription="View and manage all users."
        pageBreadcrumbs={[
          {
            label: "Users",
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
          "createdAt",
          "updatedAt",
          // "district",
          // "town",
          // "unionCouncil",
        ]}

        // ========================================================
        // Column Titles
        // ========================================================

        columnTitles={{
          name: "Name",
          email: "Email",
          contactNumber: "Contact",
          designation: "Designation",
           teamNumber: "Team Number",
          supervisorName: "Supervisor",
          districtName: "District",
          townName: "Town",
          unionCouncilName: "Union Council",
          isActive: "Active",
        }}

        // ========================================================
        // Columns
        // ========================================================

        columnOptions={[
          "name",
          "email",
          "contactNumber",
          "designation",
           "teamNumber",
          "supervisorName",
          "districtName",
          "townName",
          "unionCouncilName",
          "isActive",
        ]}

        // ========================================================
        // Filters
        // ========================================================

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

        // ========================================================
        // Row
        // ========================================================

        onRowClick={(user) => {
          router.push(`/dashboard/users/${user._id}`);
        }}

        // ========================================================
        // Add
        // ========================================================

        addButton
        addButtonText="Add User"
        onAdd={() => router.push("/dashboard/users/addUser")}

        // ========================================================
        // Export
        // ========================================================

        onExportPDF={exportPDF}
        onExportExcel={exportExcel}
      />
    );
  }
