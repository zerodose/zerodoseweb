// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// import Table from "@/components/admin/table/Table";
// import exportPDF from "@/utils/export/exportPDF";
// import exportExcel from "@/utils/export/exportExcel";
// import { getUsers, getUserFilterOptions } from "@/api/userApi";
// import ApprovalPageHeader from "@/components/ui/ApprovalPageHeader";

// export default function SupervisorDetailPage() {
//   const router = useRouter();
//   const [ucmoId, setUcmoId] = useState(null);
//   // ============================================================
//   // Tabs
//   // ============================================================

//   const [activeTab, setActiveTab] = useState("active");

//   // ============================================================
//   // Data
//   // ============================================================

//   const [staff, setStaff] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [search, setSearch] = useState("");

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

//   useEffect(() => {
//     try {
//       const storedAuthUser = localStorage.getItem("authUser");

//       if (!storedAuthUser) {
//         console.error("UCMO authentication data not found.");
//         return;
//       }

//       const parsedAuthUser = JSON.parse(storedAuthUser);

//       if (!parsedAuthUser?.id) {
//         console.error("UCMO ID not found in authentication data.");
//         return;
//       }

//       setUcmoId(String(parsedAuthUser.id));
//     } catch (error) {
//       console.error("Get UCMO authentication error:", error);
//     }
//   }, []);

//   // ============================================================
//   // Get Staff
//   // ============================================================

//   const getUsersData = async () => {
//     try {
//       setLoading(true);

//       const response = await getUsers({
//         page: pagination.page,
//         limit: pagination.limit,
//         search,
//         ucmo: ucmoId,
//         isActive: activeTab === "active",
//       });

//       const formattedStaff = (response.data || []).map((staff) => ({
//         ...staff,

//         districtName: staff.district?.name || "-",
//         townName: staff.town?.name || "-",
//         unionCouncilName: staff.unionCouncil?.name || "-",

//         approvalStatus: staff.approvalStatus || "-",
//       }));

//       setStaff(formattedStaff);

//       setPagination((previous) => ({
//         ...previous,
//         ...(response.pagination || {}),
//       }));
//     } catch (error) {
//       console.error("Get staff error:", error);

//       setStaff([]);

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
//     if (!ucmoId) return;

//     const timer = setTimeout(() => {
//       getUsersData();
//     }, 400);

//     return () => clearTimeout(timer);
//   }, [ucmoId, pagination.page, pagination.limit, search, activeTab]);

//   // ============================================================
//   // Tab Change
//   // ============================================================

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);

//     setSearch("");

//     setPagination((previous) => ({
//       ...previous,
//       page: 1,
//       total: 0,
//       totalPages: 1,
//       hasNextPage: false,
//       hasPreviousPage: false,
//     }));
//   };

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

//   return (
//     <div className="space-y-5">
//       <ApprovalPageHeader
//         title="Supervisor Details"
//         description="Review and manage details."
//         onBack={() => router.back()}
//         onRefresh={() => getUsersData(true)}
//       />
//       {/* ========================================================
//           Tabs
//       ======================================================== */}

//       <div className="border-border bg-background flex w-full gap-1 rounded-xl border p-1">
//         <button
//           type="button"
//           onClick={() => handleTabChange("active")}
//           className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
//             activeTab === "active"
//               ? "bg-primary text-white shadow-sm"
//               : "text-text-secondary hover:bg-surface hover:text-text"
//           }`}
//         >
//           Current Staff
//         </button>

//         <button
//           type="button"
//           onClick={() => handleTabChange("inactive")}
//           className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
//             activeTab === "inactive"
//               ? "bg-primary text-white shadow-sm"
//               : "text-text-secondary hover:bg-surface hover:text-text"
//           }`}
//         >
//           Left Staff
//         </button>
//       </div>

//       {/* ========================================================
//           Table
//       ======================================================== */}

//       <Table
//         data={staff}
//         loading={loading}
//         pageTitle={activeTab === "active" ? "Current Staff" : "Left Staff"}
//         pageDescription={
//           activeTab === "active"
//             ? "View and manage active Staff."
//             : "View inactive Staff."
//         }

//         pageBreadcrumbs={false}

//         serverPagination
//         currentPage={pagination.page}
//         totalItems={pagination.total}
//         pageSize={pagination.limit}
//         totalPages={pagination.totalPages}
//         onPageChange={handlePageChange}
//         onPageSizeChange={handlePageSizeChange}
//         onSearchChange={handleSearchChange}

//         hiddenColumns={[
//           "_id",
//           "__v",
//           "password",
//           "emailVerified",
//           "supervisor",
//           "teamNumber",
//           "workerRole",
//           "createdAt",
//           "updatedAt",
//         ]}

//         columnTitles={{
//           name: "Name",
//           email: "Email",
//           contactNumber: "Contact",
//           supervisorCode: "Supervisor Code",
//           approvalStatus: "Approval Status",
//           districtName: "District",
//           townName: "Town",
//           unionCouncilName: "Union Council",
//           isActive: "Active",
//         }}

//         columnOptions={[
//           "name",
//           "email",
//           "contactNumber",
//           "designation",
//           "supervisorCode",
//           "approvalStatus",
//           "districtName",
//           "townName",
//           "unionCouncilName",
//           "isActive",
//         ]}

//         filterOptions={[
//           {
//             key: "designation",
//             label: "Designation",
//             type: "select",
//             column: "designation",
//           },
//           {
//             key: "districtName",
//             label: "District",
//             type: "select",
//             column: "districtName",
//           },
//           {
//             key: "townName",
//             label: "Town",
//             type: "select",
//             column: "townName",
//           },
//           {
//             key: "unionCouncilName",
//             label: "Union Council",
//             type: "select",
//             column: "unionCouncilName",
//           },
//           {
//             key: "isActive",
//             label: "Active",
//             type: "select",
//             column: "isActive",
//           },
//         ]}

//         onRowClick={(supervisor) => {
//           router.push(`/ucmo/staff-details/${supervisor._id}`);
//         }}

//         onExportPDF={exportPDF}
//         onExportExcel={exportExcel}
//       />
//     </div>
//   );
// }

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Table from "@/components/admin/table/Table";
import exportPDF from "@/utils/export/exportPDF";
import exportExcel from "@/utils/export/exportExcel";
import { getUsers, getUserFilterOptions } from "@/api/userApi";
import ApprovalPageHeader from "@/components/ui/ApprovalPageHeader";

export default function StaffDetailPage() {
  const router = useRouter();

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
  // Filter Options
  // ============================================================

  const [filterOptions, setFilterOptions] = useState({
    designation: [],
    district: [],
    town: [],
    unionCouncil: [],
    supervisor: [],
  });

  const [filtersLoading, setFiltersLoading] = useState(true);

  // ============================================================
  // Selected Filters
  // ============================================================

  const [selectedFilters, setSelectedFilters] = useState({});

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
  // Get Filter Options
  // ============================================================

  const getFilterOptionsData = async () => {
    try {
      setFiltersLoading(true);

      const response = await getUserFilterOptions();
      console.log("Filter data==>", response)
      setFilterOptions({
        designation: response?.filters?.designation || [],
        district: response?.filters?.district || [],
        town: response?.filters?.town || [],
        unionCouncil: response?.filters?.unionCouncil || [],
        supervisor: response?.filters?.supervisor || [],
      });
    } catch (error) {
      console.error("Get user filter options error:", error);

      setFilterOptions({
        designation: [],
        district: [],
        town: [],
        unionCouncil: [],
        supervisor: [],
      });
    } finally {
      setFiltersLoading(false);
    }
  };

  // ============================================================
  // Load Filter Options
  // ============================================================

  useEffect(() => {
    getFilterOptionsData();
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

        // Backend authenticated user se scope determine karega.
        // Frontend se UCMO ID send nahi karni.

        isActive: activeTab === "active",

        designation:
          selectedFilters.designation?.length === 1
            ? selectedFilters.designation[0]
            : "",

        district:
          selectedFilters.district?.length === 1
            ? selectedFilters.district[0]
            : "",

        town: selectedFilters.town?.length === 1 ? selectedFilters.town[0] : "",

        unionCouncil:
          selectedFilters.unionCouncil?.length === 1
            ? selectedFilters.unionCouncil[0]
            : "",
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
  // Load Staff Data
  // ============================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      getUsersData();
    }, 400);

    return () => clearTimeout(timer);
  }, [pagination.page, pagination.limit, search, activeTab, selectedFilters]);

  // ============================================================
  // Tab Change
  // ============================================================

  const handleTabChange = (tab) => {
    setActiveTab(tab);

    setSearch("");

    setSelectedFilters({});

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
  // Filter Change
  // ============================================================

  const handleFilterChange = (filters) => {
    setSelectedFilters(filters);

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
  // Refresh
  // ============================================================

  const handleRefresh = () => {
    getUsersData();
    getFilterOptionsData();
  };

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="space-y-5">
      <ApprovalPageHeader
        title="Supervisor Details"
        description="Review and manage details."
        onBack={() => router.back()}
        onRefresh={handleRefresh}
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

        // ========================================================
        // Server Pagination + Filtering
        // ========================================================

        serverPagination
        serverFiltering

        currentPage={pagination.page}
        totalItems={pagination.total}
        pageSize={pagination.limit}
        totalPages={pagination.totalPages}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}

        // ========================================================
        // Server Search + Filters
        // ========================================================

        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        filtersLoading={filtersLoading}

        // ========================================================
        // Hidden Columns
        // ========================================================

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

        // ========================================================
        // Column Titles
        // ========================================================

        columnTitles={{
          name: "Name",
          email: "Email",
          contactNumber: "Contact",
          designation: "Designation",
          supervisorCode: "Supervisor Code",
          approvalStatus: "Approval Status",
          districtName: "District",
          townName: "Town",
          unionCouncilName: "Union Council",
          isActive: "Active",
        }}

        // ========================================================
        // Visible Columns
        // ========================================================

        columnOptions={[
          "name",
          "email",
          "contactNumber",
          "designation",
          "supervisorCode",
          "approvalStatus",
          "districtName",
          "townName",
          "unionCouncilName",
          "isActive",
        ]}

        // ========================================================
        // Server Filter Options
        // ========================================================

        filterOptions={[
          {
            key: "designation",
            label: "Designation",
            type: "select",
            column: "designation",
            options: filterOptions.designation,
          },
          {
            key: "district",
            label: "District",
            type: "select",
            column: "districtName",
            options: filterOptions.district,
          },
          {
            key: "town",
            label: "Town",
            type: "select",
            column: "townName",
            options: filterOptions.town,
          },
          {
            key: "unionCouncil",
            label: "Union Council",
            type: "select",
            column: "unionCouncilName",
            options: filterOptions.unionCouncil,
          },
        ]}

        // ========================================================
        // Row Click
        // ========================================================

        onRowClick={(supervisor) => {
          router.push(`/ucmo/staff-details/${supervisor._id}`);
        }}

        // ========================================================
        // Export
        // ========================================================

        onExportPDF={exportPDF}
        onExportExcel={exportExcel}
      />
    </div>
  );
}
