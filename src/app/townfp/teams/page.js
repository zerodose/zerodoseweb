// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// import Table from "@/components/admin/table/Table";

// import exportPDF from "@/utils/export/exportPDF";
// import exportExcel from "@/utils/export/exportExcel";

// export default function WorkersPage() {
//   const router = useRouter();

//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [search, setSearch] = useState("");
//   const [townId, setTownId] = useState("");

//   // ============================================================
//   // Server Pagination
//   // ============================================================

//   const [pagination, setPagination] = useState({
//     page: 1,
//     limit: 10,
//     total: 0,
//     totalPages: 1,
//     hasNextPage: false,
//     hasPreviousPage: false,
//   });

//   // ============================================================
//   // Get Current TownFP
//   // ============================================================

//   useEffect(() => {
//     try {
//       const storedUser = localStorage.getItem("authUser");

//       if (!storedUser) {
//         router.replace("/auth/login");
//         return;
//       }

//       const authUser = JSON.parse(storedUser);

//       if (String(authUser?.designation || "").toLowerCase() !== "townfp") {
//         router.replace("/dashboard");
//         return;
//       }

//       const currentTownId =
//         authUser?.town?._id || authUser?.town?.id || authUser?.town || "";

//       if (!currentTownId) {
//         console.error("Town focal person town ID not found.");
//         setLoading(false);
//         return;
//       }

//       setTownId(String(currentTownId));
//     } catch (error) {
//       console.error("Load auth user error:", error);

//       router.replace("/auth/login");
//     }
//   }, [router]);

//   // ============================================================
//   // Get Worker Summary
//   // ============================================================

//   const getWorkersData = async () => {
//     if (!townId) {
//       return;
//     }

//     try {
//       setLoading(true);

//       const params = new URLSearchParams({
//         town: townId,
//         page: String(pagination.page),
//         limit: String(pagination.limit),
//         search,
//       });

//       const response = await fetch(
//         `/api/users/town-worker-summary?${params.toString()}`,
//         {
//           method: "GET",
//           credentials: "include",
//         },
//       );

//       const result = await response.json();

//       if (!response.ok || !result?.success) {
//         throw new Error(result?.message || "Failed to fetch worker summary.");
//       }

//       // ========================================================
//       // Format Data
//       // ========================================================

//       const formattedData = (result?.data || []).map((item) => ({
//         ...item,

//         districtName: item?.district?.name || "-",

//         townName: item?.town?.name || "-",

//         unionCouncilName: item?.unionCouncil?.name || "-",

//         unionCouncilCode: item?.unionCouncil?.code || "-",

//         ucmoName: item?.ucmo?.name || "-",

//         workersCount: Number(item?.workersCount || 0),

//         teamsCount: Number(item?.teamsCount || 0),
//       }));

//       setUsers(formattedData);

//       setPagination((previous) => ({
//         ...previous,
//         ...(result?.pagination || {}),
//       }));
//     } catch (error) {
//       console.error("Get town worker summary error:", error);

//       setUsers([]);

//       setPagination((previous) => ({
//         ...previous,
//         total: 0,
//         totalPages: 1,
//         hasNextPage: false,
//         hasPreviousPage: false,
//       }));
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ============================================================
//   // Load Data
//   // ============================================================

//   useEffect(() => {
//     if (!townId) {
//       return;
//     }

//     const timer = setTimeout(() => {
//       getWorkersData();
//     }, 400);

//     return () => clearTimeout(timer);
//   }, [townId, pagination.page, pagination.limit, search]);

//   // ============================================================
//   // Search
//   // ============================================================

//   const handleSearchChange = (value) => {
//     setSearch(value);

//     setPagination((previous) => ({
//       ...previous,
//       page: 1,
//     }));
//   };

//   // ============================================================
//   // Page Change
//   // ============================================================

//   const handlePageChange = (page) => {
//     setPagination((previous) => ({
//       ...previous,
//       page,
//     }));
//   };

//   // ============================================================
//   // Page Size Change
//   // ============================================================

//   const handlePageSizeChange = (limit) => {
//     setPagination((previous) => ({
//       ...previous,
//       page: 1,
//       limit,
//     }));
//   };

//   // ============================================================
//   // Render
//   // ============================================================

//   return (
//     <Table
//       data={users}
//       loading={loading}
//       pageTitle="Teams"
//       pageDescription="View worker counts by Union Council and UCMO."
//       pageBreadcrumbs={[
//         {
//           label: "Teams",
//         },
//       ]}

//       // ========================================================
//       // Server Pagination
//       // ========================================================

//       serverPagination
//       currentPage={pagination.page}
//       totalItems={pagination.total}
//       pageSize={pagination.limit}
//       totalPages={pagination.totalPages}
//       onPageChange={handlePageChange}
//       onPageSizeChange={handlePageSizeChange}
//       onSearchChange={handleSearchChange}

//       // ========================================================
//       // Hidden Columns
//       // ========================================================

//       hiddenColumns={["_id", "__v", "district", "town", "unionCouncil", "ucmo"]}

//       // ========================================================
//       // Column Titles
//       // ========================================================

//       columnTitles={{
//         districtName: "District",
//         townName: "Town",
//         unionCouncilName: "Union Council",
//         unionCouncilCode: "UC Code",
//         ucmoName: "UCMO",
//         teamsCount: "Teams Count",
//         workersCount: "Workers Count",
//       }}

//       // ========================================================
//       // Columns
//       // ========================================================

//       columnOptions={[
//         "districtName",
//         "townName",
//         "unionCouncilName",
//         "unionCouncilCode",
//         "ucmoName",
//         "teamsCount",
//         "workersCount",
//       ]}

//       // ========================================================
//       // UCMO Detail / Workers
//       // ========================================================

//       filterOptions={[
//         {
//           key: "town",
//           label: "Towns",
//           type: "select",
//           column: "townName",
//         },
//         {
//           key: "unioncouncil",
//           label: "Union Councils",
//           type: "select",
//           column: "unionCouncilName",
//         },
//       ]}
//       onRowClick={(user) => {
//         router.push(`/townfp/teams/${user._id}`);
//       }}

//       // ========================================================
//       // Export
//       // ========================================================

//       onExportPDF={exportPDF}
//       onExportExcel={exportExcel}
//     />
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Table from "@/components/admin/table/Table";

import exportPDF from "@/utils/export/exportPDF";
import exportExcel from "@/utils/export/exportExcel";

export default function WorkersPage() {
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

      if (
        String(authUser?.designation || "").toLowerCase() !== "townfp"
      ) {
        router.replace("/dashboard");
        return;
      }

      const currentTownId =
        authUser?.town?._id ||
        authUser?.town?.id ||
        authUser?.town ||
        "";

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
  // Get Workers
  // ============================================================

  const getWorkersData = async () => {
    if (!townId) {
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams({
        designation: "worker",
        town: townId,
        page: String(pagination.page),
        limit: String(pagination.limit),
        search,
        isActive: "true",
      });

      const response = await fetch(
        `/api/users?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(
          result?.message || "Failed to fetch workers.",
        );
      }

      // ========================================================
      // Format Worker Data
      // ========================================================

      const formattedData = (result?.data || []).map((worker) => ({
        ...worker,

        districtName:
          worker?.district?.name || "-",

        townName:
          worker?.town?.name || "-",

        unionCouncilName:
          worker?.unionCouncil?.name || "-",

        unionCouncilCode:
          worker?.unionCouncil?.code || "-",

        ucmoName:
          worker?.ucmo?.name || "-",

        supervisorName:
          worker?.supervisor?.name || "-",

        workerRole:
          worker?.workerRole === "teamLeader"
            ? "Team Leader"
            : worker?.workerRole === "teamMember"
              ? "Team Member"
              : worker?.workerRole || "-",

        teamNumber:
          worker?.teamNumber ?? "-",
      }));

      setUsers(formattedData);

      setPagination((previous) => ({
        ...previous,
        ...(result?.pagination || {}),
      }));
    } catch (error) {
      console.error("Get workers error:", error);

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
      getWorkersData();
    }, 400);

    return () => clearTimeout(timer);
  }, [
    townId,
    pagination.page,
    pagination.limit,
    search,
  ]);

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
      pageTitle="Workers"
      pageDescription="View all active workers in your town."
      pageBreadcrumbs={[
        {
          label: "Workers",
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
        "district",
        "town",
        "unionCouncil",
        "supervisor",
        "ucmo",
        "approvedBy",
        "isActive",
        "approvalStatus",
        "designation",
        "createdAt",
        "updatedAt",
        "expiresAt",
      ]}

      // ========================================================
      // Column Titles
      // ========================================================

      columnTitles={{
        name: "Worker Name",
        email: "Email",
        contactNumber: "Contact Number",
        districtName: "District",
        townName: "Town",
        unionCouncilName: "Union Council",
        unionCouncilCode: "UC Code",
        ucmoName: "UCMO",
        supervisorName: "Supervisor",
        workerRole: "Worker Role",
        teamNumber: "Team No.",
      }}

      // ========================================================
      // Columns
      // ========================================================

      columnOptions={[
        "name",
        "email",
        "contactNumber",
        "districtName",
        "townName",
        "unionCouncilName",
        "unionCouncilCode",
        "ucmoName",
        "supervisorName",
        "workerRole",
        "teamNumber",
      ]}

      // ========================================================
      // Filters
      // ========================================================

      filterOptions={[
        {
          key: "unioncouncil",
          label: "Union Councils",
          type: "select",
          column: "unionCouncilName",
        },
      ]}

      // ========================================================
      // Worker Detail
      // ========================================================

      onRowClick={(worker) => {
        router.push(`/townfp/workers/${worker._id}`);
      }}

      // ========================================================
      // Export
      // ========================================================

      onExportPDF={exportPDF}
      onExportExcel={exportExcel}
    />
  );
}
