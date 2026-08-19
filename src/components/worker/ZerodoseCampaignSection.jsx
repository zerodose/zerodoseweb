// "use client";

// import { CalendarDays, MapPin, RefreshCw, Syringe, Users } from "lucide-react";

// export default function ZerodoseCampaignSection({
//   activeTab,
//   onTabChange,

//   currentZerodoses = [],
//   previousZerodoses = [],

//   loading = false,
//   onRefresh,

//   getStatus,
//   formatDate,
// }) {
//   const zerodoses =
//     activeTab === "current" ? currentZerodoses : previousZerodoses;

//   const title =
//     activeTab === "current"
//       ? "Current Campaign Zerodose"
//       : "Previous Campaign Zerodose";

//   const description =
//     activeTab === "current"
//       ? "Zerodose recorded by your team during the current campaign."
//       : "Zerodose recorded by your team during previous campaigns.";

//   return (
//     <section className="bg-surface border-border overflow-hidden rounded-2xl border shadow-sm">
//       {/* =========================================================
//           Tabs
//       ========================================================= */}

//       <div className="border-border border-b p-3 md:p-4">
//         <div className="grid grid-cols-2 gap-2">
//           {/* Current Campaign */}
//           <button
//             type="button"
//             onClick={() => onTabChange("current")}
//             className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
//               activeTab === "current"
//                 ? "bg-primary text-white shadow-sm"
//                 : "bg-background text-text-secondary border-border hover:text-primary hover:border-primary border"
//             }`}
//           >
//             <CalendarDays className="h-4 w-4 shrink-0" />

//             <span>Current Campaign</span>
//           </button>

//           {/* Previous Campaigns */}
//           <button
//             type="button"
//             onClick={() => onTabChange("previous")}
//             className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${
//               activeTab === "previous"
//                 ? "bg-primary text-white shadow-sm"
//                 : "bg-background text-text-secondary border-border hover:text-primary hover:border-primary border"
//             }`}
//           >
//             <CalendarDays className="h-4 w-4 shrink-0" />

//             <span>Previous Campaigns</span>
//           </button>
//         </div>
//       </div>

//       {/* =========================================================
//           Section Header
//       ========================================================= */}

//       <div className="border-border flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between md:p-5">
//         <div>
//           <div className="flex items-center gap-2">
//             <Users className="text-primary h-5 w-5" />

//             <h2 className="text-text text-lg font-semibold">{title}</h2>
//           </div>

//           <p className="text-text-secondary mt-1 text-sm">{description}</p>
//         </div>

//         <button
//           type="button"
//           onClick={onRefresh}
//           disabled={loading}
//           className="border-border text-text hover:bg-background flex w-fit items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
//         >
//           <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
//           Refresh
//         </button>
//       </div>

//       {/* =========================================================
//           Loading
//       ========================================================= */}

//       {loading ? (
//         <div className="space-y-3 p-4 md:p-5">
//           {[1, 2, 3].map((item) => (
//             <div
//               key={item}
//               className="bg-background h-20 animate-pulse rounded-xl"
//             />
//           ))}
//         </div>
//       ) : zerodoses.length === 0 ? (
//         /* =========================================================
//            Empty
//         ========================================================= */

//         <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
//           <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-2xl">
//             <Syringe className="h-7 w-7" />
//           </div>

//           <h3 className="text-text mt-4 font-semibold">No Zerodose Recorded</h3>

//           <p className="text-text-secondary mt-1 max-w-sm text-sm">
//             {activeTab === "current"
//               ? "Your team has not recorded any Zerodose during the current campaign yet."
//               : "No Zerodose records were found from previous campaigns."}
//           </p>
//         </div>
//       ) : (
//         <>
//           {/* =======================================================
//               Desktop Table
//           ======================================================= */}

//           <div className="hidden overflow-x-auto md:block">
//             <table className="w-full text-left">
//               <thead className="bg-background border-border border-b">
//                 <tr>
//                   <th className="text-text-secondary px-5 py-3 text-xs font-semibold uppercase">
//                     Child
//                   </th>

//                   <th className="text-text-secondary px-5 py-3 text-xs font-semibold uppercase">
//                     Father
//                   </th>

//                   <th className="text-text-secondary px-5 py-3 text-xs font-semibold uppercase">
//                     Age
//                   </th>

//                   <th className="text-text-secondary px-5 py-3 text-xs font-semibold uppercase">
//                     Status
//                   </th>

//                   <th className="text-text-secondary px-5 py-3 text-xs font-semibold uppercase">
//                     Record Date
//                   </th>

//                   <th className="text-text-secondary px-5 py-3 text-xs font-semibold uppercase">
//                     Visit Date
//                   </th>

//                   <th className="text-text-secondary px-5 py-3 text-xs font-semibold uppercase">
//                     Covered Date
//                   </th>
//                 </tr>
//               </thead>

//               <tbody className="divide-border divide-y">
//                 {zerodoses.map((item) => {
//                   const status = getStatus(item);

//                   return (
//                     <tr
//                       key={item._id}
//                       className="hover:bg-background transition-colors"
//                     >
//                       <td className="text-text px-5 py-4 text-sm font-medium">
//                         {item.childName}
//                       </td>

//                       <td className="text-text-secondary px-5 py-4 text-sm">
//                         {item.fatherName}
//                       </td>

//                       <td className="text-text-secondary px-5 py-4 text-sm">
//                         {item.age}
//                       </td>

//                       <td className="px-5 py-4">
//                         <span
//                           className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
//                         >
//                           {status.label}
//                         </span>
//                       </td>

//                       <td className="text-text-secondary px-5 py-4 text-sm">
//                         {formatDate(item.recordDate)}
//                       </td>

//                       <td className="text-text-secondary px-5 py-4 text-sm">
//                         {formatDate(item.visitDate)}
//                       </td>

//                       <td className="text-text-secondary px-5 py-4 text-sm">
//                         {formatDate(item.coveredDate)}
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>

//           {/* =======================================================
//               Mobile Cards
//           ======================================================= */}

//           <div className="divide-border divide-y md:hidden">
//             {zerodoses.map((item) => {
//               const status = getStatus(item);

//               return (
//                 <div key={item._id} className="p-4">
//                   <div className="flex items-start justify-between gap-3">
//                     <div className="min-w-0">
//                       <h3 className="text-text truncate font-semibold">
//                         {item.childName}
//                       </h3>

//                       <p className="text-text-secondary mt-1 text-sm">
//                         Father: {item.fatherName}
//                       </p>
//                     </div>

//                     <span
//                       className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
//                     >
//                       {status.label}
//                     </span>
//                   </div>

//                   <div className="mt-4 grid grid-cols-2 gap-3">
//                     <div>
//                       <p className="text-text-secondary text-xs">Age</p>

//                       <p className="text-text mt-1 text-sm font-medium">
//                         {item.age}
//                       </p>
//                     </div>

//                     <div>
//                       <p className="text-text-secondary text-xs">Record Date</p>

//                       <p className="text-text mt-1 text-sm font-medium">
//                         {formatDate(item.recordDate)}
//                       </p>
//                     </div>

//                     <div>
//                       <p className="text-text-secondary text-xs">Visit Date</p>

//                       <p className="text-text mt-1 text-sm font-medium">
//                         {formatDate(item.visitDate)}
//                       </p>
//                     </div>

//                     <div>
//                       <p className="text-text-secondary text-xs">
//                         Covered Date
//                       </p>

//                       <p className="text-text mt-1 text-sm font-medium">
//                         {formatDate(item.coveredDate)}
//                       </p>
//                     </div>
//                   </div>

//                   {item.address && (
//                     <div className="border-border mt-4 flex items-start gap-2 border-t pt-3">
//                       <MapPin className="text-text-secondary mt-0.5 h-4 w-4 shrink-0" />

//                       <p className="text-text-secondary text-xs leading-5">
//                         {item.address}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </>
//       )}
//     </section>
//   );
// }

"use client";

import {
  CalendarDays,
  MapPin,
  RefreshCw,
  Syringe,
  Users,
  User,
  Baby,
  Clock3,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ZerodoseCampaignSection({
  activeTab,
  onTabChange,

  currentZerodoses = [],
  previousZerodoses = [],

  loading = false,
  onRefresh,

  getStatus,
  formatDate,
}) {
  const router = useRouter();
  const zerodoses =
    activeTab === "current" ? currentZerodoses : previousZerodoses;

  const title =
    activeTab === "current"
      ? "Current Campaign Zerodose"
      : "Previous Campaign Zerodose";

  const description =
    activeTab === "current"
      ? "Zerodose recorded by your team during the current campaign."
      : "Zerodose recorded by your team during previous campaigns.";

  return (
    <section className="bg-surface border-border overflow-hidden rounded-2xl border shadow-sm">
      {/* =========================================================
          Tabs
      ========================================================= */}

      <div className="border-border border-b p-3 md:p-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onTabChange("current")}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              activeTab === "current"
                ? "bg-primary text-white shadow-sm"
                : "bg-background text-text-secondary border-border hover:border-primary hover:text-primary border"
            }`}
          >
            <CalendarDays className="h-4 w-4 shrink-0" />

            <span>Current Campaign</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("previous")}
            className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              activeTab === "previous"
                ? "bg-primary text-white shadow-sm"
                : "bg-background text-text-secondary border-border hover:border-primary hover:text-primary border"
            }`}
          >
            <CalendarDays className="h-4 w-4 shrink-0" />

            <span>Previous Campaigns</span>
          </button>
        </div>
      </div>

      {/* =========================================================
          Section Header
      ========================================================= */}

      <div className="border-border flex items-center justify-between gap-3 border-b bg-white p-4 md:p-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Users className="text-text-secondary h-5 w-5 shrink-0" />

            <h2 className="text-text text-lg font-semibold">{title}</h2>
          </div>

          <p className="text-text-secondary mt-1 text-sm">{description}</p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="border-border bg-primary hover:bg-primary-dark flex w-fit shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* =========================================================
          Loading
      ========================================================= */}

      {loading ? (
        <div className="space-y-3 p-4 md:p-5">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="border-border bg-background h-24 animate-pulse rounded-xl border"
            />
          ))}
        </div>
      ) : zerodoses.length === 0 ? (
        /* =========================================================
           Empty
        ========================================================= */

        <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
          <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-2xl">
            <Syringe className="h-7 w-7" />
          </div>

          <h3 className="text-text mt-4 font-semibold">No Zerodose Recorded</h3>

          <p className="text-text-secondary mt-1 max-w-sm text-sm">
            {activeTab === "current"
              ? "Your team has not recorded any Zerodose during the current campaign yet."
              : "No Zerodose records were found from previous campaigns."}
          </p>
        </div>
      ) : (
        /* =========================================================
           Zerodose Cards
        ========================================================= */

        <div className="space-y-3 p-3 md:space-y-4 md:p-5">
          {zerodoses.map((item, index) => {
            const status = getStatus(item);

            return (
              <div
                key={item._id}
                onClick={() => router.push(`/worker/${item._id}`)}
                className="bg-background border-border hover:border-primary cursor-pointer rounded-xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:p-5"
              >
                {/* =================================================
                    Card Header
                ================================================= */}

                <div className="flex items-start gap-3">
                  {/* Number / Icon */}

                  <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                    <Syringe className="h-5 w-5" />
                  </div>

                  {/* Child */}

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-text truncate text-base font-semibold">
                        {item.childName}
                      </h3>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <p className="text-text-secondary mt-1 text-xs">
                      Zerodose #{index + 1}
                    </p>
                  </div>
                </div>

                {/* =================================================
                    Child Information
                ================================================= */}

                <div className="border-border mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-4 md:grid-cols-4">
                  {/* Father */}

                  <div className="min-w-0">
                    <div className="text-text-secondary flex items-center gap-1.5 text-xs">
                      <User className="h-3.5 w-3.5 shrink-0" />

                      <span>Father</span>
                    </div>

                    <p className="text-text mt-1 truncate text-sm font-medium">
                      {item.fatherName || "-"}
                    </p>
                  </div>

                  {/* Age */}

                  <div>
                    <div className="text-text-secondary flex items-center gap-1.5 text-xs">
                      <Baby className="h-3.5 w-3.5 shrink-0" />

                      <span>Age</span>
                    </div>

                    <p className="text-text mt-1 text-sm font-medium">
                      {item.age ?? "-"} months
                    </p>
                  </div>

                  {/* Record Date */}

                  <div>
                    <div className="text-text-secondary flex items-center gap-1.5 text-xs">
                      <Clock3 className="h-3.5 w-3.5 shrink-0" />

                      <span>Recorded</span>
                    </div>

                    <p className="text-text mt-1 text-sm font-medium">
                      {formatDate(item.recordDate)}
                    </p>
                  </div>

                  {/* Visit Date */}

                  <div>
                    <div className="text-text-secondary flex items-center gap-1.5 text-xs">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />

                      <span>Visit</span>
                    </div>

                    <p className="text-text mt-1 text-sm font-medium">
                      {formatDate(item.visitDate)}
                    </p>
                  </div>
                </div>

                {/* =================================================
                    Covered Date
                ================================================= */}

                <div className="border-border mt-3 grid grid-cols-2 gap-3 border-t pt-3 md:hidden">
                  <div>
                    <p className="text-text-secondary text-xs">Covered Date</p>

                    <p className="text-text mt-1 text-sm font-medium">
                      {formatDate(item.coveredDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-text-secondary text-xs">Campaign Day</p>

                    <p className="text-text mt-1 text-sm font-medium">
                      Day {item.day ?? "-"}
                    </p>
                  </div>
                </div>

                {/* =================================================
                    Desktop Extra Information
                ================================================= */}

                <div className="border-border mt-4 hidden grid-cols-2 gap-4 border-t pt-4 md:grid md:grid-cols-3">
                  <div>
                    <p className="text-text-secondary text-xs">Covered Date</p>

                    <p className="text-text mt-1 text-sm font-medium">
                      {formatDate(item.coveredDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-text-secondary text-xs">Campaign Day</p>

                    <p className="text-text mt-1 text-sm font-medium">
                      Day {item.day ?? "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-text-secondary text-xs">Contact</p>

                    <p className="text-text mt-1 text-sm font-medium">
                      {item.contactNo || "-"}
                    </p>
                  </div>
                </div>

                {/* =================================================
                    Address
                ================================================= */}

                {item.address && (
                  <div className="border-border mt-4 flex items-start gap-2 border-t pt-3">
                    <MapPin className="text-text-secondary mt-0.5 h-4 w-4 shrink-0" />

                    <p className="text-text-secondary text-xs leading-5">
                      {item.address}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
