// "use client";

// import { useMemo, useState } from "react";
// import { CheckCircle2, Eye, FileText, MapPin, Search } from "lucide-react";
// import { formatDate } from "@/lib/formatDate";

// export default function ZerodoseDetailsTable({ data = [] }) {
//   const [search, setSearch] = useState("");

//   const getStatus = (item) => {
//     if (item?.vaccinationStatus) {
//       return item.vaccinationStatus;
//     }

//     if (item?.coveredDate) {
//       return "covered";
//     }

//     if (item?.visitDate) {
//       return "visited";
//     }

//     return "recorded";
//   };

//   const getCampaignDay = (item, status = "recorded") => {
//     const startDate = item?.campaign?.startDate;
//     const endDate = item?.campaign?.endDate;

//     if (!startDate) return "-";

//     const normalizedStatus = String(status || "recorded").toLowerCase();

//     const date =
//       normalizedStatus === "covered"
//         ? item?.coveredDate
//         : normalizedStatus === "visited"
//           ? item?.visitDate
//           : item?.recordDate;

//     if (!date) return "-";

//     const getDateOnly = (value) => {
//       const parsed = new Date(value);

//       if (Number.isNaN(parsed.getTime())) {
//         return null;
//       }

//       return new Date(
//         parsed.getFullYear(),
//         parsed.getMonth(),
//         parsed.getDate(),
//       );
//     };

//     const start = getDateOnly(startDate);
//     const current = getDateOnly(date);
//     const end = endDate ? getDateOnly(endDate) : null;

//     if (!start || !current) return "-";

//     const difference = Math.floor(
//       (current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
//     );

//     const campaignDay = difference + 1;

//     if (campaignDay < 1) {
//       return "-";
//     }

//     if (end) {
//       const totalCampaignDays =
//         Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
//         1;

//       if (totalCampaignDays > 0) {
//         return Math.min(campaignDay, totalCampaignDays);
//       }
//     }

//     return campaignDay;
//   };
//   const filteredData = useMemo(() => {
//     const query = search.trim().toLowerCase();

//     if (!query) {
//       return data;
//     }

//     return data.filter((item) => {
//       const values = [
//         item?.childName,
//         item?.fatherName,
//         item?.contactNo,
//         item?.address,
//         item?.vaccinationStatus,
//         item?.teamNumber,
//       ];

//       return values.some((value) =>
//         String(value || "")
//           .toLowerCase()
//           .includes(query),
//       );
//     });
//   }, [data, search]);

//   // ============================================================
//   // EMPTY
//   // ============================================================

//   if (!data.length) {
//     return (
//       <div className="border-border bg-surface rounded-xl border p-6 text-center">
//         <p className="text-text text-sm font-medium">
//           No Zerodose records found.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div>
//       {/* ======================================================
//           SEARCH
//       ====================================================== */}

//       <div className="mb-3">
//         <div className="relative">
//           <Search
//             size={17}
//             className="text-text-secondary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
//           />

//           <input
//             type="text"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search child, father, contact..."
//             className="border-border bg-surface text-text placeholder:text-text-secondary focus:border-primary focus:ring-primary/10 w-full rounded-xl border py-2.5 pr-3 pl-10 text-sm transition outline-none focus:ring-4"
//           />
//         </div>
//       </div>

//       {/* ======================================================
//           DESKTOP TABLE
//       ====================================================== */}

//       <div className="border-border hidden overflow-hidden rounded-xl border md:block">
//         <div className="overflow-x-auto">
//           <table className="w-full min-w-[1050px] border-collapse">
//             <thead>
//               <tr className="bg-surface border-border border-b">
//                 <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
//                   #
//                 </th>

//                 <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
//                   Child
//                 </th>

//                 <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
//                   Father
//                 </th>

//                 <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
//                   Age
//                 </th>

//                 <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
//                   Contact
//                 </th>

//                 <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
//                   Status
//                 </th>

//                 <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
//                   Record Date
//                 </th>

//                 <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
//                   Visit Date
//                 </th>

//                 <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
//                   Covered Date
//                 </th>

//                 <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
//                   Address
//                 </th>
//                 <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
//                   Location
//                 </th>
//               </tr>
//             </thead>

//             <tbody>
//               {filteredData.map((item, index) => {
//                 const status = getStatus(item);

//                 return (
//                   <tr
//                     key={item?._id || item?.id || `${item?.childName}-${index}`}
//                     className="border-border hover:bg-surface border-b last:border-b-0"
//                   >
//                     <td className="text-text px-4 py-3 text-sm font-medium">
//                       {index + 1}
//                     </td>

//                     <td className="text-text px-4 py-3 text-sm font-semibold">
//                       {item?.childName || "-"}
//                     </td>

//                     <td className="text-text px-4 py-3 text-sm">
//                       {item?.fatherName || "-"}
//                     </td>

//                     <td className="text-text px-4 py-3 text-sm">
//                       {item?.age ?? "-"}
//                     </td>

//                     <td className="text-text px-4 py-3 text-sm">
//                       {item?.contactNo || "-"}
//                     </td>

//                     <td className="px-4 py-3">
//                       <div className="flex items-center gap-2">
//                         <StatusBadge status={status} />

//                         {item?.houseNumber && (
//                           <span className="text-text-secondary text-xs font-medium">
//                             House No. {item.houseNumber}
//                           </span>
//                         )}
//                       </div>
//                     </td>

//                     <td className="text-text px-4 py-3 text-sm">
//                       {formatDate(item?.recordDate)}
//                     </td>

//                     <td className="text-text px-4 py-3 text-sm">
//                       {formatDate(item?.visitDate)}
//                     </td>

//                     <td className="text-text px-4 py-3 text-sm">
//                       {formatDate(item?.coveredDate)}
//                     </td>

//                     <td className="text-text-secondary max-w-[220px] px-4 py-3 text-sm">
//                       <span className="block truncate">
//                         {item?.address || "-"}
//                       </span>
//                     </td>
//                     <td className="text-text-secondary max-w-[220px] px-4 py-3 text-sm">
//                       <span className="block truncate">
//                         {item?.location?.latitude != null &&
//                         item?.location?.longitude != null
//                           ? `${item.location.latitude}, ${item.location.longitude}`
//                           : "-"}
//                       </span>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>

//         {filteredData.length === 0 && (
//           <div className="bg-surface p-6 text-center">
//             <p className="text-text text-sm font-medium">
//               No matching records found.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* ======================================================
//           MOBILE CARDS
//       ====================================================== */}

//       <div className="space-y-3 md:hidden">
//         {filteredData.map((item, index) => {
//           const status = getStatus(item);

//           return (
//             <div
//               key={item?._id || item?.id || `${item?.childName}-${index}`}
//               className="border-border rounded-xl border bg-white p-4"
//             >
//               {/* Header */}
//               <div className="mb-3 flex items-start justify-between gap-3">
//                 <div className="flex min-w-0 items-center gap-3">
//                   <div className="bg-primary/10 text-primary flex shrink-0 items-center justify-center rounded-lg">
//                     {/* <Syringe size={17} /> */}
//                     {item?.houseNumber && (
//                       <span className="border-border bg-surface text-text inline-flex h-9 items-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold">
//                         <span className="mr-1">H -</span>
//                         {item.houseNumber}
//                       </span>
//                     )}
//                   </div>
//                   <div className="min-w-0 flex-1">
//                     <div className="flex flex-wrap items-center gap-2">
//                       <h3 className="text-text truncate text-base font-semibold capitalize">
//                         {item.childName}
//                       </h3>

//                       <StatusBadge status={status} />
//                     </div>

//                     <p className="text-text-secondary text-xs">
//                       Record-{index + 1}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="shrink-0 text-right">
//                   <p className="text-text-secondary text-xs">Campaign Day</p>

//                   <p className="text-text mt-1 text-sm font-semibold">
//                     Day {getCampaignDay(item, status)}
//                   </p>
//                 </div>

//                 {/* <StatusBadge status={status} /> */}
//               </div>
//               {/* Details */}
//               <div className="grid grid-cols-2 gap-3">
//                 <Detail label="Father" value={item?.fatherName} />

//                 <Detail label="Age" value={item?.age} />

//                 <Detail label="Contact" value={item?.contactNo} />

//                 <Detail
//                   label="Record Date"
//                   value={formatDate(item?.recordDate)}
//                 />

//                 <Detail
//                   label="Visit Date"
//                   value={formatDate(item?.visitDate)}
//                 />

//                 <Detail
//                   label="Covered Date"
//                   value={formatDate(item?.coveredDate)}
//                 />
//               </div>
//               {/* Address + Location */}
//               <div className="border-border mt-3 grid grid-cols-2 gap-4 border-t pt-3">
//                 {/* Address */}
//                 <div className="min-w-0">
//                   <p className="text-text-secondary text-[11px]">Address</p>

//                   <p className="text-text mt-0.5 text-xs">
//                     {item?.address || "-"}
//                   </p>
//                 </div>

//                 {/* Zerodose Location */}
//                 <div className="min-w-0">
//                   <p className="text-text-secondary text-[11px]">Location</p>

//                   <div className="mt-0.5 flex items-center gap-1.5">
//                     <span className="text-text text-xs">Zerodose Location</span>

//                     {item?.location?.latitude != null &&
//                       item?.location?.longitude != null && (
//                         <a
//                           href={`https://www.google.com/maps?q=${item.location.latitude},${item.location.longitude}`}
//                           target="_blank"
//                           rel="noopener noreferrer"
//                           aria-label="Open Zerodose location in Google Maps"
//                         >
//                           <MapPin
//                             size={15}
//                             className="text-primary hover:text-primary-dark transition-colors"
//                           />
//                         </a>
//                       )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           );
//         })}

//         {filteredData.length === 0 && (
//           <div className="border-border bg-surface rounded-xl border p-6 text-center">
//             <p className="text-text text-sm font-medium">
//               No matching records found.
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// // ============================================================
// // DETAIL
// // ============================================================

// function Detail({ label, value }) {
//   return (
//     <div className="min-w-0">
//       <p className="text-text-secondary text-[11px]">{label}</p>

//       <p className="text-text mt-0.5 truncate text-xs font-medium">
//         {value || "-"}
//       </p>
//     </div>
//   );
// }

// // ============================================================
// // STATUS
// // ============================================================

// function StatusBadge({ status }) {
//   const normalizedStatus = String(status || "recorded").toLowerCase();

//   if (normalizedStatus === "covered") {
//     return (
//       <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-600">
//         <CheckCircle2 size={12} />
//         Covered
//       </span>
//     );
//   }

//   if (normalizedStatus === "visited") {
//     return (
//       <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
//         <Eye size={12} />
//         Visited
//       </span>
//     );
//   }

//   return (
//     <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold">
//       <FileText size={12} />
//       Recorded
//     </span>
//   );
// }

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Eye, FileText, MapPin, Search } from "lucide-react";
import { formatDate } from "@/lib/formatDate";

export default function ZerodoseDetailsTable({ data = [] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const getStatus = (item) => {
    if (item?.vaccinationStatus) {
      return item.vaccinationStatus;
    }

    if (item?.coveredDate) {
      return "covered";
    }

    if (item?.visitDate) {
      return "visited";
    }

    return "recorded";
  };

  const getCampaignDay = (item, status = "recorded") => {
    const startDate = item?.campaign?.startDate;
    const endDate = item?.campaign?.endDate;

    if (!startDate) return "-";

    const normalizedStatus = String(status || "recorded").toLowerCase();

    const date =
      normalizedStatus === "covered"
        ? item?.coveredDate
        : normalizedStatus === "visited"
          ? item?.visitDate
          : item?.recordDate;

    if (!date) return "-";

    const getDateOnly = (value) => {
      const parsed = new Date(value);

      if (Number.isNaN(parsed.getTime())) {
        return null;
      }

      return new Date(
        parsed.getFullYear(),
        parsed.getMonth(),
        parsed.getDate(),
      );
    };

    const start = getDateOnly(startDate);
    const current = getDateOnly(date);
    const end = endDate ? getDateOnly(endDate) : null;

    if (!start || !current) return "-";

    const difference = Math.floor(
      (current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );

    const campaignDay = difference + 1;

    if (campaignDay < 1) {
      return "-";
    }

    if (end) {
      const totalCampaignDays =
        Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1;

      if (totalCampaignDays > 0) {
        return Math.min(campaignDay, totalCampaignDays);
      }
    }

    return campaignDay;
  };

  // ============================================================
  // OPEN SINGLE ZERODOSE
  // ============================================================

  const openZerodose = (item) => {
    const id = item?._id || item?.id;

    if (!id) {
      return;
    }

    let authUser = null;

    try {
      authUser = JSON.parse(localStorage.getItem("authUser") || "null");
    } catch {
      authUser = null;
    }

    const designation = String(authUser?.designation || "")
      .trim()
      .toLowerCase();

    if (!designation) {
      return;
    }

    router.push(`/${designation}/zerodose/${id}`);
  };

  // ============================================================
  // SEARCH
  // ============================================================

  const filteredData = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return data;
    }

    return data.filter((item) => {
      const values = [
        item?.childName,
        item?.fatherName,
        item?.contactNo,
        item?.address,
        item?.vaccinationStatus,
        item?.teamNumber,
      ];

      return values.some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      );
    });
  }, [data, search]);

  // ============================================================
  // EMPTY
  // ============================================================

  if (!data.length) {
    return (
      <div className="border-border bg-surface rounded-xl border p-6 text-center">
        <p className="text-text text-sm font-medium">
          No Zerodose records found.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* ======================================================
          SEARCH
      ====================================================== */}

      <div className="mb-3">
        <div className="relative">
          <Search
            size={17}
            className="text-text-secondary pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search child, father, contact..."
            className="border-border bg-surface text-text placeholder:text-text-secondary focus:border-primary focus:ring-primary/10 w-full rounded-xl border py-2.5 pr-3 pl-10 text-sm transition outline-none focus:ring-4"
          />
        </div>
      </div>

      {/* ======================================================
          DESKTOP TABLE
      ====================================================== */}

      <div className="border-border hidden overflow-hidden rounded-xl border md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] border-collapse">
            <thead>
              <tr className="bg-surface border-border border-b">
                <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
                  #
                </th>

                <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
                  Child
                </th>

                <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
                  Father
                </th>

                <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
                  Age
                </th>

                <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
                  Contact
                </th>

                <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
                  Status
                </th>

                <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
                  Record Date
                </th>

                <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
                  Visit Date
                </th>

                <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
                  Covered Date
                </th>

                <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
                  Address
                </th>

                <th className="text-text-secondary px-4 py-3 text-left text-xs font-semibold">
                  Location
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredData.map((item, index) => {
                const status = getStatus(item);

                return (
                  <tr
                    key={item?._id || item?.id || `${item?.childName}-${index}`}
                    onClick={() => openZerodose(item)}
                    className="border-border hover:bg-surface cursor-pointer border-b transition-colors last:border-b-0"
                  >
                    <td className="text-text px-4 py-3 text-sm font-medium">
                      {index + 1}
                    </td>

                    <td className="text-text px-4 py-3 text-sm font-semibold">
                      {item?.childName || "-"}
                    </td>

                    <td className="text-text px-4 py-3 text-sm">
                      {item?.fatherName || "-"}
                    </td>

                    <td className="text-text px-4 py-3 text-sm">
                      {item?.age ?? "-"}
                    </td>

                    <td className="text-text px-4 py-3 text-sm">
                      {item?.contactNo || "-"}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={status} />

                        {item?.houseNumber && (
                          <span className="text-text-secondary text-xs font-medium">
                            House No. {item.houseNumber}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="text-text px-4 py-3 text-sm">
                      {formatDate(item?.recordDate)}
                    </td>

                    <td className="text-text px-4 py-3 text-sm">
                      {formatDate(item?.visitDate)}
                    </td>

                    <td className="text-text px-4 py-3 text-sm">
                      {formatDate(item?.coveredDate)}
                    </td>

                    <td className="text-text-secondary max-w-[220px] px-4 py-3 text-sm">
                      <span className="block truncate">
                        {item?.address || "-"}
                      </span>
                    </td>

                    <td className="text-text-secondary max-w-[220px] px-4 py-3 text-sm">
                      <span className="block truncate">
                        {item?.location?.latitude != null &&
                        item?.location?.longitude != null
                          ? `${item.location.latitude}, ${item.location.longitude}`
                          : "-"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="bg-surface p-6 text-center">
            <p className="text-text text-sm font-medium">
              No matching records found.
            </p>
          </div>
        )}
      </div>

      {/* ======================================================
          MOBILE CARDS
      ====================================================== */}

      <div className="space-y-3 md:hidden">
        {filteredData.map((item, index) => {
          const status = getStatus(item);

          return (
            <div
              key={item?._id || item?.id || `${item?.childName}-${index}`}
              onClick={() => openZerodose(item)}
              className="border-border hover:bg-surface cursor-pointer rounded-xl border bg-white p-4 transition-colors"
            >
              {/* Header */}

              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="bg-primary/10 text-primary flex shrink-0 items-center justify-center rounded-lg">
                    {item?.houseNumber && (
                      <span className="border-border bg-surface text-text inline-flex h-9 items-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold">
                        <span className="mr-1">H -</span>
                        {item.houseNumber}
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-text truncate text-base font-semibold capitalize">
                        {item.childName}
                      </h3>

                      {/* <StatusBadge status={status} /> */}
                    </div>

                    <p className="text-text-secondary text-xs">
                      Record-{index + 1}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-text-secondary text-xs">Campaign Day</p>

                  <p className="text-text mt-1 text-sm font-semibold">
                    Day {getCampaignDay(item, status)}
                  </p>
                </div>
              </div>

              {/* Details */}

              <div className="grid grid-cols-2 gap-3">
                <Detail label="Father" value={item?.fatherName} />

                <Detail label="Age" value={item?.age} />

                <Detail label="Contact" value={item?.contactNo} />

                <Detail
                  label="Record Date"
                  value={formatDate(item?.recordDate)}
                />

                <Detail
                  label="Visit Date"
                  value={formatDate(item?.visitDate)}
                />

                <Detail
                  label="Covered Date"
                  value={formatDate(item?.coveredDate)}
                />
              </div>

              {/* Address + Location */}

              <div className="border-border mt-3 grid grid-cols-2 gap-4 border-t pt-3">
                {/* Address */}

                <div className="min-w-0">
                  <p className="text-text-secondary text-[11px]">Address</p>

                  <p className="text-text mt-0.5 text-xs">
                    {item?.address || "-"}
                  </p>
                </div>

                {/* Zerodose Location */}

                <div className="min-w-0">
                  <p className="text-text-secondary text-[11px]">Location</p>

                  <div className="mt-0.5 flex items-center gap-1.5">
                    <span className="text-text text-xs">Zerodose Location</span>

                    {item?.location?.latitude != null &&
                      item?.location?.longitude != null && (
                        <a
                          href={`https://www.google.com/maps?q=${item.location.latitude},${item.location.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Open Zerodose location in Google Maps"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MapPin
                            size={15}
                            className="text-primary hover:text-primary-dark transition-colors"
                          />
                        </a>
                      )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredData.length === 0 && (
          <div className="border-border bg-surface rounded-xl border p-6 text-center">
            <p className="text-text text-sm font-medium">
              No matching records found.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// DETAIL
// ============================================================

function Detail({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-text-secondary text-[11px]">{label}</p>

      <p className="text-text mt-0.5 truncate text-xs font-medium">
        {value || "-"}
      </p>
    </div>
  );
}

// ============================================================
// STATUS
// ============================================================

function StatusBadge({ status }) {
  const normalizedStatus = String(status || "recorded").toLowerCase();

  if (normalizedStatus === "covered") {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-600">
        <CheckCircle2 size={12} />
        Covered
      </span>
    );
  }

  if (normalizedStatus === "visited") {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-600">
        <Eye size={12} />
        Visited
      </span>
    );
  }

  return (
    <span className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold">
      <FileText size={12} />
      Recorded
    </span>
  );
}
