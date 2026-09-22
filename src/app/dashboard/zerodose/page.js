// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";

// import Table from "@/components/admin/table/Table";
// import exportPDF from "@/utils/export/exportPDF";
// import exportExcel from "@/utils/export/exportExcel";
// import { getZerodoses } from "@/api/zerodoseApi";

// export default function ZerodosePage() {
//   const router = useRouter();

//   const [zerodoses, setZerodoses] = useState([]);
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

//   // ============================================================
//   // Get Zerodoses
//   // ============================================================

//   const getZerodoseData = async () => {
//     try {
//       setLoading(true);

//       const response = await getZerodoses({
//         page: pagination.page,
//         limit: pagination.limit,
//         search,
//       });

//       // ========================================================
//       // Format Zerodose Data
//       // Raw IDs hide karne hain aur names show karne hain
//       // ========================================================
//       const formattedZerodoses = (response.data || []).map((zerodose) => {
//         console.log("TEAM DATA:", {
//           teamNumber: zerodose.teamNumber,
//           teamLeader: zerodose.teamLeader,
//           teamMember: zerodose.teamMember,
//         });
//         return {
//           ...zerodose,

//           districtName: zerodose.district?.name || "-",
//           townName: zerodose.town?.name || "-",
//           unionCouncilName: zerodose.unionCouncil?.name || "-",

//           ucmoName: zerodose.ucmo?.name || "-",
//           supervisorName: zerodose.supervisor?.name || "-",
//           campaignName: zerodose.campaign
//             ? `${zerodose.campaign.name} ${zerodose.campaign.month} ${zerodose.campaign.year}`
//             : "-",

//           // team:
//           //   zerodose.teamNumber !== null && zerodose.teamNumber !== undefined
//           //     ? `Team ${zerodose.teamNumber}`
//           //     : "-",
//           team: zerodose.teamNumber || "-",
//           teamLeader: zerodose.teamLeader || "-",
//           teamMember: zerodose.teamMember || "-",
//           status: zerodose.vaccinationStatus || "-",
//         };
//       });

//       setZerodoses(formattedZerodoses);

//       setPagination((previous) => ({
//         ...previous,
//         ...(response.pagination || {}),
//       }));
//     } catch (error) {
//       console.error("Get zerodose error:", error);

//       setZerodoses([]);

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
//     const timer = setTimeout(() => {
//       getZerodoseData();
//     }, 400);

//     return () => clearTimeout(timer);
//   }, [pagination.page, pagination.limit, search]);

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
//   // UI
//   // ============================================================

//   return (
//     <Table
//       data={zerodoses}
//       loading={loading}
//       pageTitle="Zerodoses"
//       pageDescription="View and manage recorded zerodose."
//       pageBreadcrumbs={[
//         {
//           label: "Zerodoses",
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
//       // Column Titles
//       // ========================================================

//       columnTitles={{
//         childName: "Child Name",
//         fatherName: "Father Name",
//         age: "Age",
//         address: "Address",
//         contactNo: "Contact No",
//         districtName: "District",
//         townName: "Town",
//         unionCouncilName: "Union Council",
//         campaignName: "Campaign",
//         ucmoName: "UCMO",
//         supervisorName: "Supervisor",
//         team: "Team",
//         teamLeader: "Team Leader",
//         teamMember: "Team Member",

//         recordDate: "Record Date",
//         visitDate: "Visit Date",
//         coveredDate: "Covered Date",
//         status: "Status",
//       }}

//       // =====  // ========================================================
//       // Hidden Columns
//       // ========================================================

//       hiddenColumns={[
//         "_id",
//         "__v",

//         "campaign",
//         "district",
//         "town",
//         "unionCouncil",

//         "ucmo",
//         "supervisor",
//         "user",
//         "teamNumber",
//         "location",
//         "createdAt",
//         "updatedAt",
//       ]}

//       // ===================================================
//       // Columns
//       // ========================================================

//       columnOptions={[
//         "childName",
//         "fatherName",
//         "age",
//         "address",
//         "contactNo",

//         "districtName",
//         "townName",
//         "unionCouncilName",
//         "ucmoName",
//         "supervisorName",
//         "team",
//         "teamLeader",
//         "teamMember",
//         "campaignName",

//         "recordDate",
//         "visitDate",
//         "coveredDate",
//         "status",
//       ]}

//       dateColumns={["recordDate", "visitDate", "coveredDate"]}

//       // ========================================================
//       // Filters
//       // ========================================================

//       filterOptions={[
//         {
//           key: "districtName",
//           label: "District",
//           type: "select",
//           column: "districtName",
//         },
//         {
//           key: "townName",
//           label: "Town",
//           type: "select",
//           column: "townName",
//         },
//         {
//           key: "unionCouncilName",
//           label: "Union Council",
//           type: "select",
//           column: "unionCouncilName",
//         },
//         {
//           key: "campaignName",
//           label: "Campaign Name",
//           type: "select",
//           column: "campaignName",
//         },
//         {
//           key: "status",
//           label: "Status",
//           type: "select",
//           column: "status",
//         },
//         {
//           key: "recordDate",
//           label: "Record Date",
//           type: "dateRange",
//           column: "recordDate",
//         },
//         {
//           key: "visitDate",
//           label: "Visit Date",
//           type: "dateRange",
//           column: "visitDate",
//         },
//         {
//           key: "coveredDate",
//           label: "Covered Date",
//           type: "dateRange",
//           column: "coveredDate",
//         },
//       ]}

//       // ========================================================
//       // Row
//       // ========================================================

//       onRowClick={(zerodose) => {
//         router.push(`/dashboard/zerodose/${zerodose._id}`);
//       }}

//       // ========================================================
//       // Add
//       // ========================================================

//       addButton
//       addButtonText="Add Zerodose"
//       onAdd={() => router.push("/dashboard/zerodose/addzerodose")}

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
      // Raw IDs / objects hide karne hain aur names show karne hain
      // ========================================================

      const formattedZerodoses = (response.data || []).map((zerodose) => {
        console.log("TEAM DATA:", {
          teamNumber: zerodose.teamNumber,
          teamLeader: zerodose.teamLeader,
          teamMember: zerodose.teamMember,
        });

        return {
          ...zerodose,

          // ====================================================
          // Location / Hierarchy
          // ====================================================

          districtName: zerodose.district?.name || "-",
          townName: zerodose.town?.name || "-",
          unionCouncilName: zerodose.unionCouncil?.name || "-",

          // ====================================================
          // Campaign
          // ====================================================

          campaignName: zerodose.campaign
            ? `${zerodose.campaign.name} ${zerodose.campaign.month} ${zerodose.campaign.year}`
            : "-",

          // ====================================================
          // Users
          // ====================================================

          ucmoName: zerodose.ucmo?.name || "-",
          supervisorName: zerodose.supervisor?.name || "-",
          userName: zerodose.user?.name || "-",
          teamLeaderName: zerodose.teamLeader?.name || "-",
          teamMemberName: zerodose.teamMember?.name || "-",
          vaccinatorName: zerodose.vaccinator?.name || "-",

          // ====================================================
          // Team
          // ====================================================

          team:
            zerodose.teamNumber !== null && zerodose.teamNumber !== undefined
              ? zerodose.teamNumber
              : "-",

          // ====================================================
          // Supervisor
          // ====================================================

          supervisorCode:
            zerodose.supervisorCode !== null &&
            zerodose.supervisorCode !== undefined
              ? zerodose.supervisorCode
              : "-",

          // ====================================================
          // Child Data
          // ====================================================

          childName: zerodose.childName || "-",
          fatherName: zerodose.fatherName || "-",

          gender: zerodose.gender || "-",

          age:
            zerodose.age !== null && zerodose.age !== undefined
              ? zerodose.age
              : "-",

          houseNumber:
            zerodose.houseNumber !== null && zerodose.houseNumber !== undefined
              ? zerodose.houseNumber
              : "-",

          address: zerodose.address || "-",
          contactNo: zerodose.contactNo || "-",

          day:
            zerodose.day !== null && zerodose.day !== undefined
              ? zerodose.day
              : "-",

          // ====================================================
          // Location
          // ====================================================

          latitude:
            zerodose.location?.latitude !== null &&
            zerodose.location?.latitude !== undefined
              ? zerodose.location.latitude
              : "-",

          longitude:
            zerodose.location?.longitude !== null &&
            zerodose.location?.longitude !== undefined
              ? zerodose.location.longitude
              : "-",

          // ====================================================
          // QR Code
          // ====================================================

          qrCode: zerodose.qrCode || "-",

          // ====================================================
          // Vaccination
          // ====================================================

          status: zerodose.vaccinationStatus || "-",
          clientStatus: zerodose.clientStatus || "-",

          // ====================================================
          // Dates
          // ====================================================

          recordDate: zerodose.recordDate || null,
          visitDate: zerodose.visitDate || null,
          coveredDate: zerodose.coveredDate || null,
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
        campaignName: "Campaign",

        districtName: "District",
        townName: "Town",
        unionCouncilName: "Union Council",

        ucmoName: "UCMO",
        supervisorName: "Supervisor",
        supervisorCode: "Supervisor Code",

        userName: "Recorded By",

        team: "Team",
        teamLeaderName: "Team Leader",
        teamMemberName: "Team Member",

        vaccinatorName: "Vaccinator",

        houseNumber: "House Number",
        childName: "Child Name",
        fatherName: "Father Name",
        gender: "Gender",
        age: "Age",
        address: "Address",
        contactNo: "Contact No",
        day: "Day",

        latitude: "Latitude",
        longitude: "Longitude",

        qrCode: "QR Code",

        clientStatus: "Client Status",
        status: "Status",

        recordDate: "Record Date",
        visitDate: "Visit Date",
        coveredDate: "Covered Date",
      }}

      // ========================================================
      // Hidden Columns
      // Raw MongoDB IDs / internal fields / update-delete fields
      // ========================================================

      hiddenColumns={[
        "_id",
        "__v",

        // Raw references
        "campaign",
        "district",
        "town",
        "unionCouncil",

        "ucmo",
        "supervisor",
        "user",

        "teamNumber",
        "teamLeader",
        "teamMember",

        "vaccinator",

        // Raw nested location
        "location",

        // Internal timestamps
        "createdAt",
        "updatedAt",

        // ======================================================
        // Update Fields
        // ======================================================

        "updateRequested",
        "updateRequestedBy",
        "updateRequestedAt",
        "updateData",
        "updateApproved",
        "updateApprovedBy",
        "updateApprovedAt",

        // ======================================================
        // Delete Fields
        // ======================================================

        "deleteRequested",
        "deleteRequestedBy",
        "deleteRequestedAt",
        "deleteApproved",
        "deleteApprovedBy",
        "deleteApprovedAt",
      ]}

      // ========================================================
      // Columns
      // ========================================================

      columnOptions={[
        "campaignName",

        "districtName",
        "townName",
        "unionCouncilName",

        "supervisorName",
        "supervisorCode",

        "teamLeaderName",
        "teamMemberName",
        "team",
        "day",
        "recordDate",
        "ucmoName",
        "houseNumber",
        "childName",
        "fatherName",
        "age",
        "gender",
        "address",
        "contactNo",
        "coveredDate",
        "visitDate",
        "qrCode",
        "clientStatus",
        "status",
        "userName",
        "vaccinatorName",
        "latitude",
        "longitude",
      ]}

      dateColumns={["recordDate", "visitDate", "coveredDate"]}

      // ========================================================
      // Filters
      // ========================================================

      filterOptions={[
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
          key: "ucmoName",
          label: "UCMO",
          type: "select",
          column: "ucmoName",
        },
        {
          key: "supervisorName",
          label: "Supervisor",
          type: "select",
          column: "supervisorName",
        },
        {
          key: "supervisorCode",
          label: "Supervisor Code",
          type: "select",
          column: "supervisorCode",
        },
        {
          key: "team",
          label: "Team",
          type: "select",
          column: "team",
        },
        {
          key: "teamLeaderName",
          label: "Team Leader",
          type: "select",
          column: "teamLeaderName",
        },
        {
          key: "teamMemberName",
          label: "Team Member",
          type: "select",
          column: "teamMemberName",
        },
        {
          key: "vaccinatorName",
          label: "Vaccinator",
          type: "select",
          column: "vaccinatorName",
        },
        {
          key: "gender",
          label: "Gender",
          type: "select",
          column: "gender",
        },
        {
          key: "clientStatus",
          label: "Client Status",
          type: "select",
          column: "clientStatus",
        },
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
