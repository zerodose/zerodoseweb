// "use client";

// import {
//   CalendarDays,
//   MapPin,
//   RefreshCw,
//   Syringe,
//   Users,
//   User,
//   Baby,
//   Clock3,
// } from "lucide-react";
// import { useRouter } from "next/navigation";

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
//   const router = useRouter();
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
//           <button
//             type="button"
//             onClick={() => onTabChange("current")}
//             className={`group relative flex min-w-0 items-center rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
//               activeTab === "current"
//                 ? "bg-primary text-white shadow-sm"
//                 : "bg-background text-text-secondary border-border hover:border-primary hover:text-primary border"
//             }`}
//           >
//             <span className="min-w-0 truncate pr-10">Current Campaign</span>

//             <CalendarDays
//               className={`pointer-events-none absolute right-2 bottom-1 h-9 w-9 shrink-0 ${
//                 activeTab === "current"
//                   ? "text-white/20"
//                   : "text-primary/15 group-hover:text-primary/20"
//               }`}
//             />
//           </button>

//           <button
//             type="button"
//             onClick={() => onTabChange("previous")}
//             className={`group relative flex min-w-0 items-center rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
//               activeTab === "previous"
//                 ? "bg-primary text-white shadow-sm"
//                 : "bg-background text-text-secondary border-border hover:border-primary hover:text-primary border"
//             }`}
//           >
//             <span className="min-w-0 truncate pr-10">Previous Campaigns</span>

//             <CalendarDays
//               className={`pointer-events-none absolute right-2 bottom-1 h-9 w-9 shrink-0 ${
//                 activeTab === "previous"
//                   ? "text-white/20"
//                   : "text-primary/15 group-hover:text-primary/20"
//               }`}
//             />
//           </button>
//         </div>
//       </div>

//       {/* =========================================================
//           Section Header
//       ========================================================= */}

//       <div className="border-border flex flex-col border-b bg-white p-4 md:p-5">
//         {/* Heading + Refresh */}
//         <div className="flex w-full items-center justify-between gap-3">
//           <div className="flex min-w-0 items-center gap-2">
//             <Users className="text-text-secondary h-5 w-5 shrink-0" />

//             <h2 className="text-text truncate text-lg font-semibold">
//               {title}
//             </h2>
//           </div>

//           <button
//             type="button"
//             onClick={onRefresh}
//             disabled={loading}
//             className="border-border bg-primary hover:bg-primary-dark flex w-fit shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
//             Refresh
//           </button>
//         </div>

//         {/* Description - full width */}
//         <p className="text-text-secondary mt-2 w-full text-sm leading-relaxed">
//           {description}
//         </p>
//       </div>

//       {/* =========================================================
//           Loading
//       ========================================================= */}

//       {loading ? (
//         <div className="space-y-3 p-4 md:p-5">
//           {[1, 2, 3].map((item) => (
//             <div
//               key={item}
//               className="border-border bg-background h-24 animate-pulse rounded-xl border"
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
//         /* =========================================================
//            Zerodose Cards
//         ========================================================= */

//         <div className="space-y-3 p-3 md:space-y-4 md:p-5">
//           {zerodoses.map((item, index) => {
//             const status = getStatus(item);

//             return (
//               <div
//                 key={item._id}
//                 onClick={() => router.push(`/worker/${item._id}`)}
//                 className="bg-background border-border hover:border-primary cursor-pointer rounded-xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:p-5"
//               >
//                 {/* =================================================
//                     Card Header
//                 ================================================= */}

//                 <div className="flex items-start gap-3">
//                   {/* Number / Icon */}

//                   <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
//                     <Syringe className="h-5 w-5" />
//                   </div>

//                   {/* Child */}

//                   <div className="min-w-0 flex-1">
//                     <div className="flex flex-wrap items-center gap-2">
//                       <h3 className="text-text truncate text-base font-semibold">
//                         {item.childName}
//                       </h3>

//                       <span
//                         className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${status.className}`}
//                       >
//                         {status.label}
//                       </span>
//                     </div>

//                     <p className="text-text-secondary mt-1 text-xs">
//                       Zerodose #{index + 1}
//                     </p>
//                   </div>
//                 </div>

//                 {/* =================================================
//                     Child Information
//                 ================================================= */}

//                 <div className="border-border mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-4 md:grid-cols-4">
//                   {/* Father */}

//                   <div className="min-w-0">
//                     <div className="text-text-secondary flex items-center gap-1.5 text-xs">
//                       <User className="h-3.5 w-3.5 shrink-0" />

//                       <span>Father</span>
//                     </div>

//                     <p className="text-text mt-1 truncate text-sm font-medium">
//                       {item.fatherName || "-"}
//                     </p>
//                   </div>

//                   {/* Age */}

//                   <div>
//                     <div className="text-text-secondary flex items-center gap-1.5 text-xs">
//                       <Baby className="h-3.5 w-3.5 shrink-0" />

//                       <span>Age</span>
//                     </div>

//                     <p className="text-text mt-1 text-sm font-medium">
//                       {item.age ?? "-"} months
//                     </p>
//                   </div>

//                   {/* Record Date */}

//                   <div>
//                     <div className="text-text-secondary flex items-center gap-1.5 text-xs">
//                       <Clock3 className="h-3.5 w-3.5 shrink-0" />

//                       <span>Recorded</span>
//                     </div>

//                     <p className="text-text mt-1 text-sm font-medium">
//                       {formatDate(item.recordDate)}
//                     </p>
//                   </div>

//                   {/* Visit Date */}

//                   <div>
//                     <div className="text-text-secondary flex items-center gap-1.5 text-xs">
//                       <CalendarDays className="h-3.5 w-3.5 shrink-0" />

//                       <span>Visit</span>
//                     </div>

//                     <p className="text-text mt-1 text-sm font-medium">
//                       {formatDate(item.visitDate)}
//                     </p>
//                   </div>
//                 </div>

//                 {/* =================================================
//                     Covered Date
//                 ================================================= */}

//                 <div className="border-border mt-3 grid grid-cols-2 gap-3 border-t pt-3 md:hidden">
//                   <div>
//                     <p className="text-text-secondary text-xs">Covered Date</p>

//                     <p className="text-text mt-1 text-sm font-medium">
//                       {formatDate(item.coveredDate)}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-text-secondary text-xs">Campaign Day</p>

//                     <p className="text-text mt-1 text-sm font-medium">
//                       Day {item.day ?? "-"}
//                     </p>
//                   </div>
//                 </div>

//                 {/* =================================================
//                     Desktop Extra Information
//                 ================================================= */}

//                 <div className="border-border mt-4 hidden grid-cols-2 gap-4 border-t pt-4 md:grid md:grid-cols-3">
//                   <div>
//                     <p className="text-text-secondary text-xs">Covered Date</p>

//                     <p className="text-text mt-1 text-sm font-medium">
//                       {formatDate(item.coveredDate)}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-text-secondary text-xs">Campaign Day</p>

//                     <p className="text-text mt-1 text-sm font-medium">
//                       Day {item.day ?? "-"}
//                     </p>
//                   </div>

//                   <div>
//                     <p className="text-text-secondary text-xs">Contact</p>

//                     <p className="text-text mt-1 text-sm font-medium">
//                       {item.contactNo || "-"}
//                     </p>
//                   </div>
//                 </div>

//                 {/* =================================================
//                     Address
//                 ================================================= */}

//                 {item.address && (
//                   <div className="border-border mt-4 flex items-start gap-2 border-t pt-3">
//                     <MapPin className="text-text-secondary mt-0.5 h-4 w-4 shrink-0" />

//                     <p className="text-text-secondary text-xs leading-5">
//                       {item.address}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
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
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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

  // =========================================================
  // Zerodose Status Tab
  // =========================================================

  const [statusTab, setStatusTab] = useState("recorded");

  // =========================================================
  // Filter Zerodoses by Status
  // =========================================================

  const filteredZerodoses = useMemo(() => {
    return zerodoses.filter((item) => {
      const status =
        item?.vaccinationStatus ||
        item?.status ||
        getStatus?.(item)?.value ||
        "";

      return String(status).toLowerCase() === statusTab;
    });
  }, [zerodoses, statusTab, getStatus]);

  // =========================================================
  // Google Maps
  // =========================================================

  const openGoogleMaps = (item) => {
    const latitude = item?.location?.latitude ?? item?.latitude;
    const longitude = item?.location?.longitude ?? item?.longitude;

    if (
      latitude === undefined ||
      latitude === null ||
      longitude === undefined ||
      longitude === null
    ) {
      return;
    }

    const url = `https://www.google.com/maps?q=${encodeURIComponent(
      `${latitude},${longitude}`,
    )}`;

    window.open(url, "_blank", "noopener,noreferrer");
  };

  // =========================================================
  // Campaign Day
  // Campaign Start Date = Day 1
  // =========================================================

  const getCampaignDay = (item, status = statusTab) => {
    const startDate = item?.campaign?.startDate;

    if (!startDate) return "-";

    const date =
      status === "covered"
        ? item?.coveredDate
        : status === "visited"
          ? item?.visitDate
          : item?.recordDate;

    if (!date) return "-";

    const start = new Date(startDate);
    const current = new Date(date);

    start.setHours(0, 0, 0, 0);
    current.setHours(0, 0, 0, 0);

    const difference = Math.floor(
      (current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );

    return difference >= 0 ? difference + 1 : "-";
  };

  const formatClientStatus = (status) => {
    if (!status) return "-";

    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };
  // =========================================================
  // Status Tabs
  // =========================================================

  const statusTabs = [
    {
      key: "recorded",
      label: "Recorded",
    },
    {
      key: "visited",
      label: "Visited",
    },
    {
      key: "covered",
      label: "Covered",
    },
  ];

  // =========================================================
  // Card Skeleton
  // =========================================================

  const renderCardSkeleton = (index) => (
    <div
      key={index}
      className="bg-background border-border rounded-xl border p-4 shadow-sm md:p-5"
    >
      {/* Card Header */}
      <div className="flex items-start gap-3">
        <div className="bg-surface h-10 w-10 shrink-0 animate-pulse rounded-xl" />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="bg-surface h-5 w-32 animate-pulse rounded" />
          <div className="bg-surface h-3 w-20 animate-pulse rounded" />
        </div>
      </div>

      {/* Child Information */}
      <div className="border-border mt-4 grid grid-cols-2 gap-x-4 gap-y-4 border-t pt-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="space-y-2">
            <div className="bg-surface h-3 w-16 animate-pulse rounded" />
            <div className="bg-surface h-4 w-24 animate-pulse rounded" />
          </div>
        ))}
      </div>

      {/* Extra Information */}
      <div className="border-border mt-4 grid grid-cols-2 gap-4 border-t pt-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="space-y-2">
            <div className="bg-surface h-3 w-20 animate-pulse rounded" />
            <div className="bg-surface h-4 w-28 animate-pulse rounded" />
          </div>
        ))}
      </div>

      {/* Address */}
      <div className="border-border mt-4 flex items-start gap-2 border-t pt-3">
        <div className="bg-surface mt-0.5 h-4 w-4 shrink-0 animate-pulse rounded" />

        <div className="flex-1 space-y-2">
          <div className="bg-surface h-3 w-full animate-pulse rounded" />
          <div className="bg-surface h-3 w-3/4 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );

  return (
    <section className="bg-surface border-border overflow-hidden rounded-2xl border shadow-sm">
      {/* =========================================================
          Campaign Tabs
      ========================================================= */}

      <div className="border-border border-b p-3 md:p-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onTabChange("current")}
            className={`group relative flex min-w-0 items-center rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
              activeTab === "current"
                ? "bg-primary text-white shadow-sm"
                : "bg-background text-text-secondary border-border hover:border-primary hover:text-primary border"
            }`}
          >
            <span className="min-w-0 truncate pr-10">Current Campaign</span>

            <CalendarDays
              className={`pointer-events-none absolute right-2 bottom-1 h-9 w-9 shrink-0 ${
                activeTab === "current"
                  ? "text-white/20"
                  : "text-primary/15 group-hover:text-primary/20"
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => onTabChange("previous")}
            className={`group relative flex min-w-0 items-center rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
              activeTab === "previous"
                ? "bg-primary text-white shadow-sm"
                : "bg-background text-text-secondary border-border hover:border-primary hover:text-primary border"
            }`}
          >
            <span className="min-w-0 truncate pr-10">Previous Campaigns</span>

            <CalendarDays
              className={`pointer-events-none absolute right-2 bottom-1 h-9 w-9 shrink-0 ${
                activeTab === "previous"
                  ? "text-white/20"
                  : "text-primary/15 group-hover:text-primary/20"
              }`}
            />
          </button>
        </div>
      </div>

      {/* =========================================================
          Section Header
      ========================================================= */}

      <div className="border-border flex flex-col border-b bg-white p-4 md:p-5">
        {/* Heading + Refresh */}
        <div className="flex w-full items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <Users className="text-text-secondary h-5 w-5 shrink-0" />

            <h2 className="text-text truncate text-lg font-semibold">
              {title}
            </h2>
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

        {/* Description - full width */}
        <p className="text-text-secondary mt-2 w-full text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {/* =========================================================
          Status Tabs
          Hardcoded - not part of skeleton
      ========================================================= */}

      <div className="border-border border-b p-3 md:p-4">
        <div className="grid grid-cols-3 gap-2">
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusTab(tab.key)}
              className={`min-w-0 truncate rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                statusTab === tab.key
                  ? "bg-primary text-white shadow-sm"
                  : "bg-background text-text-secondary border-border hover:border-primary hover:text-primary border"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* =========================================================
          Loading
      ========================================================= */}

      {loading ? (
        <div className="space-y-3 p-3 md:space-y-4 md:p-5">
          {[1, 2, 3].map((item) => renderCardSkeleton(item))}
        </div>
      ) : filteredZerodoses.length === 0 ? (
        /* =========================================================
           Empty
        ========================================================= */

        <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
          <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-2xl">
            <Syringe className="h-7 w-7" />
          </div>

          <h3 className="text-text mt-4 font-semibold">
            No {statusTab.charAt(0).toUpperCase() + statusTab.slice(1)} Zerodose
          </h3>

          <p className="text-text-secondary mt-1 max-w-sm text-sm">
            {activeTab === "current"
              ? `Your team has not recorded any ${statusTab} Zerodose during the current campaign yet.`
              : `No ${statusTab} Zerodose records were found from previous campaigns.`}
          </p>
        </div>
      ) : (
        /* =========================================================
           Zerodose Cards
        ========================================================= */

        <div className="space-y-3 p-3 md:space-y-4 md:p-5">
          {filteredZerodoses.map((item, index) => {
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

                  {statusTab !== "covered" && (
                    <div>
                      <div className="text-text-secondary flex items-center gap-1.5 text-xs">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />

                        <span>Visit</span>
                      </div>

                      <p className="text-text mt-1 text-sm font-medium">
                        {formatDate(item.visitDate)}
                      </p>
                    </div>
                  )}
                </div>

                {statusTab === "recorded" && (
                  <div className="border-border mt-4 grid grid-cols-2 gap-3 border-t pt-4">
                    <div>
                      <p className="text-text-secondary text-xs">
                        Covered Date
                      </p>

                      <p className="text-text mt-1 text-sm font-medium">
                        {formatDate(item.coveredDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-text-secondary text-xs">
                        Campaign Day
                      </p>

                      <p className="text-text mt-1 text-sm font-medium">
                        Day {getCampaignDay(item, "recorded")}
                      </p>
                    </div>
                  </div>
                )}

                {/* =================================================
                    Visited:
                    Record + Visit shown above.
                    Client Status + Campaign Day.
                ================================================= */}

                {statusTab === "visited" && (
                  <div className="border-border mt-4 grid grid-cols-2 gap-3 border-t pt-4">
                    <div>
                      <p className="text-text-secondary text-xs">
                        Campaign Day
                      </p>

                      <p className="text-text mt-1 text-sm font-medium">
                        Day {getCampaignDay(item)}
                      </p>
                    </div>

                    <div>
                      <p className="text-text-secondary text-xs">
                        Client Status
                      </p>

                      <p className="text-text mt-1 text-sm font-medium capitalize">
                        {formatClientStatus(item.clientStatus)}
                      </p>
                    </div>
                  </div>
                )}

                {/* =================================================
                    Covered:
                    Only Covered Date.
                    Address hidden.
                ================================================= */}

                {statusTab === "covered" && (
                  <div className="border-border mt-4 grid grid-cols-2 gap-3 border-t pt-4">
                    <div>
                      <p className="text-text-secondary text-xs">
                        Covered Date
                      </p>

                      <p className="text-text mt-1 text-sm font-medium">
                        {formatDate(item.coveredDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-text-secondary text-xs">
                        Campaign Day
                      </p>

                      <p className="text-text mt-1 text-sm font-medium">
                        Day {getCampaignDay(item, "covered")}
                      </p>
                    </div>
                  </div>
                )}

                {/* =================================================
                    Desktop Extra Information
                    Covered hidden here because status-specific
                    information is handled above.
                ================================================= */}

                {statusTab !== "covered" && (
                  <div className="border-border mt-4 hidden grid-cols-2 gap-4 border-t pt-4 md:grid md:grid-cols-3">
                    <div>
                      <p className="text-text-secondary text-xs">
                        Campaign Day
                      </p>

                      <p className="text-text mt-1 text-sm font-medium">
                        Day {getCampaignDay(item, statusTab)}
                      </p>
                    </div>

                    <div>
                      <p className="text-text-secondary text-xs">Contact</p>

                      <p className="text-text mt-1 text-sm font-medium">
                        {item.contactNo || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-text-secondary text-xs">
                        Covered Date
                      </p>

                      <p className="text-text mt-1 text-sm font-medium">
                        {statusTab === "recorded"
                          ? formatDate(item.coveredDate)
                          : "-"}
                      </p>
                    </div>
                  </div>
                )}

                {/* =================================================
                    Address + Google Maps
                    Recorded + Visited only
                ================================================= */}

                {statusTab !== "covered" && item.address && (
                  <div className="border-border mt-4 flex items-start gap-2 border-t pt-3">
                    <div className="flex min-w-0 flex-1 items-start gap-2">
                      <MapPin className="text-text-secondary mt-0.5 h-4 w-4 shrink-0" />

                      <p className="text-text-secondary text-xs leading-5">
                        {item.address}
                      </p>
                    </div>

                    {((item?.location?.latitude !== undefined &&
                      item?.location?.latitude !== null &&
                      item?.location?.longitude !== undefined &&
                      item?.location?.longitude !== null) ||
                      (item?.latitude !== undefined &&
                        item?.latitude !== null &&
                        item?.longitude !== undefined &&
                        item?.longitude !== null)) && (
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          openGoogleMaps(item);
                        }}
                        title="Open location in Google Maps"
                        className="bg-primary/10 text-primary hover:bg-primary/20 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition"
                      >
                        <MapPin className="h-4 w-4" />
                      </button>
                    )}
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
