// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// import Table from "@/components/admin/table/Table";

// import exportPDF from "@/utils/export/exportPDF";
// import exportExcel from "@/utils/export/exportExcel";
// import { getTownSupervisorSummary } from "@/api/dashboardApi";

// export default function SupervisorsPage() {
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
//   // Get Supervisor Summary
//   // ============================================================

//   const getSupervisorsData = async () => {
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

//       const data = await getTownSupervisorSummary({
//         supervisorId,
//         townId,
//       });
  
//       const result = await response.json();

//       if (!response.ok || !result?.success) {
//         throw new Error(
//           result?.message || "Failed to fetch supervisor summary.",
//         );
//       }

//       const formattedData = (result?.data || []).map((item) => ({
//         ...item,

//         districtName: item?.district?.name || "-",
//         townName: item?.town?.name || "-",

//         unionCouncilName: item?.unionCouncil?.name || "-",

//         unionCouncilCode: item?.unionCouncil?.code || "-",

//         ucmoName: item?.ucmo?.name || "-",

//         supervisorsCount: Number(item?.supervisorsCount || 0),
//       }));

//       setUsers(formattedData);

//       setPagination((previous) => ({
//         ...previous,
//         ...(result?.pagination || {}),
//       }));
//     } catch (error) {
//       console.error("Get town supervisor summary error:", error);

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
//       getSupervisorsData();
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
//       pageTitle="Supervisors"
//       pageDescription="View supervisor counts by Union Council and UCMO."
//       pageBreadcrumbs={[
//         {
//           label: "Supervisors",
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
//         supervisorsCount: "Supervisors Count",
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
//         "supervisorsCount",
//       ]}

//       // ========================================================
//       // No Individual Supervisor Route
//       // ========================================================

//       onRowClick={(user) => {
//         router.push(`/townfp/supervisors/${user._id}`);
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

export default function SupervisorsPage() {
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
  // Get Supervisors
  // ============================================================

  const getSupervisorsData = async () => {
    if (!townId) {
      return;
    }

    try {
      setLoading(true);

      const params = new URLSearchParams({
        designation: "supervisor",
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
          result?.message || "Failed to fetch supervisors.",
        );
      }

      // ========================================================
      // Format Supervisor Data
      // ========================================================

      const formattedData = (result?.data || []).map((supervisor) => ({
        ...supervisor,

        districtName:
          supervisor?.district?.name || "-",

        townName:
          supervisor?.town?.name || "-",

        unionCouncilName:
          supervisor?.unionCouncil?.name || "-",

        unionCouncilCode:
          supervisor?.unionCouncil?.code || "-",

        ucmoName:
          supervisor?.ucmo?.name || "-",

        supervisorCode:
          supervisor?.supervisorCode || "-",
      }));

      setUsers(formattedData);

      setPagination((previous) => ({
        ...previous,
        ...(result?.pagination || {}),
      }));
    } catch (error) {
      console.error("Get town supervisors error:", error);

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
      getSupervisorsData();
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
      pageTitle="Supervisors"
      pageDescription="View all active supervisors in your town."
      pageBreadcrumbs={[
        {
          label: "Supervisors",
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
        name: "Supervisor Name",
        email: "Email",
        contactNumber: "Contact Number",
        supervisorCode: "Supervisor Code",
        districtName: "District",
        townName: "Town",
        unionCouncilName: "Union Council",
        unionCouncilCode: "UC Code",
        ucmoName: "UCMO",
      }}

      // ========================================================
      // Columns
      // ========================================================

      columnOptions={[
        "name",
        "email",
        "contactNumber",
        "supervisorCode",
        "districtName",
        "townName",
        "unionCouncilName",
        "unionCouncilCode",
        "ucmoName",
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
      // Supervisor Detail
      // ========================================================

      onRowClick={(supervisor) => {
        router.push(`/townfp/supervisors/${supervisor._id}`);
      }}

      // ========================================================
      // Export
      // ========================================================

      onExportPDF={exportPDF}
      onExportExcel={exportExcel}
    />
  );
}