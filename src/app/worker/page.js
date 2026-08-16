// "use client";

// import Link from "next/link";
// import { Plus, Eye } from "lucide-react";
// import PageHeader from "@/components/user/PageHeader";

// export default function Page() {
//   return (
//     <div className="min-h-full p-4 md:p-6">
//       {/* Page Header */}
//       <PageHeader
//         title="Worker"
//         subtitle="Manage Zerodose assigned to this worker"
//       />
//       {/* Worker Actions */}
//       <div className="grid grid-cols-2 gap-3 md:gap-5">
//         {/* Add Zerodose */}
//         <Link
//           href="/worker/addzerodose"
//           className="bg-surface border-border group flex aspect-square w-full flex-col items-center justify-center rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md md:p-6"
//         >
//           <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110 md:h-20 md:w-20">
//             <Plus strokeWidth={2} className="h-9 w-9 md:h-10 md:w-10" />
//           </div>

//           <h2 className="text-text mt-4 text-center text-lg font-semibold md:mt-5 md:text-xl">
//             Add Zerodose
//           </h2>

//           <p className="text-text-secondary mt-2 hidden max-w-xs text-center text-sm md:block">
//             Add a new Zerodose for this worker
//           </p>
//         </Link>

//         {/* View Zerodose */}
//         <Link
//           href="/worker/viewzerodose"
//           className="bg-surface border-border group flex aspect-square w-full flex-col items-center justify-center rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md md:p-6"
//         >
//           <div className="bg-primary/10 text-primary flex h-16 w-16 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-110 md:h-20 md:w-20">
//             <Eye strokeWidth={2} className="h-9 w-9 md:h-10 md:w-10" />
//           </div>

//           <h2 className="text-text mt-4 text-center text-lg font-semibold md:mt-5 md:text-xl">
//             View Zerodose
//           </h2>

//           <p className="text-text-secondary mt-2 hidden max-w-xs text-center text-sm md:block">
//             View all Zerodose assigned to this worker
//           </p>
//         </Link>
//       </div>
//     </div>
//   );
// }

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Eye,
  CalendarDays,
  Users,
  Syringe,
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

import PageHeader from "@/components/user/PageHeader";
import { getZerodoses } from "@/api/zerodoseApi";
import { getCampaigns } from "@/api/campaignApi";

export default function Page() {
  const [campaign, setCampaign] = useState(null);
  const [zerodoses, setZerodoses] = useState([]);

  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [loadingZerodose, setLoadingZerodose] = useState(true);

  const [error, setError] = useState("");

  // ============================================================
  // Load Current Campaign
  // ============================================================

  const loadCampaign = async () => {
    try {
      setLoadingCampaign(true);
      setError("");

      const response = await getCampaigns();

      const campaigns = response?.data || [];

      // Current/active campaign
      const currentCampaign =
        campaigns.find(
          (item) =>
            item.isActive === true ||
            item.status === "active" ||
            item.status === "current",
        ) || null;

      setCampaign(currentCampaign);
    } catch (error) {
      console.error("Get campaigns error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load campaign.",
      );
    } finally {
      setLoadingCampaign(false);
    }
  };

  // ============================================================
  // Load Zerodose
  //
  // Backend/API will determine the logged-in worker's records.
  // We only request the records needed for the worker page.
  // ============================================================

  const loadZerodose = async () => {
    try {
      setLoadingZerodose(true);

      const response = await getZerodoses({
        page: 1,
        limit: 50,
        sortBy: "recordDate",
        sortOrder: "desc",
      });

      setZerodoses(response?.data || []);
    } catch (error) {
      console.error("Get worker zerodose error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to load zerodose records.",
      );
    } finally {
      setLoadingZerodose(false);
    }
  };

  // ============================================================
  // Initial Load
  // ============================================================

  useEffect(() => {
    loadCampaign();
    loadZerodose();
  }, []);

  // ============================================================
  // Current Campaign Zerodose
  //
  // If campaign dates are available, show only records
  // belonging to the current campaign period.
  // ============================================================

  const currentZerodoses = useMemo(() => {
    if (!campaign) {
      return zerodoses;
    }

    const startDate = campaign.startDate || campaign.start || campaign.fromDate;

    const endDate = campaign.endDate || campaign.end || campaign.toDate;

    if (!startDate) {
      return zerodoses;
    }

    const start = new Date(startDate);

    const end = endDate ? new Date(endDate) : new Date();

    end.setHours(23, 59, 59, 999);

    return zerodoses.filter((item) => {
      if (!item.recordDate) {
        return false;
      }

      const recordDate = new Date(item.recordDate);

      return recordDate >= start && recordDate <= end;
    });
  }, [campaign, zerodoses]);

  // ============================================================
  // Statistics
  // ============================================================

  const totalZerodose = currentZerodoses.length;

  const visitedZerodose = currentZerodoses.filter(
    (item) => item.vaccinationStatus === "visited",
  ).length;

  const coveredZerodose = currentZerodoses.filter(
    (item) => item.vaccinationStatus === "covered",
  ).length;

  const recordedZerodose = currentZerodoses.filter(
    (item) => item.vaccinationStatus === "recorded",
  ).length;

  // ============================================================
  // Format Date
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // Status
  // ============================================================

  const getStatus = (item) => {
    if (item.vaccinationStatus === "covered") {
      return {
        label: "Covered",
        className:
          "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
      };
    }

    if (item.vaccinationStatus === "visited") {
      return {
        label: "Visited",
        className:
          "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      };
    }

    return {
      label: "Recorded",
      className:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
    };
  };

  // ============================================================
  // Refresh
  // ============================================================

  const handleRefresh = async () => {
    await Promise.all([loadCampaign(), loadZerodose()]);
  };

  return (
    <div className="min-h-full p-4 md:p-6">
      {/* ======================================================
          Header
      ====================================================== */}

      <PageHeader
        title="Worker"
        subtitle="Manage Zerodose recorded by your team"
      />

      {/* ======================================================
          Error
      ====================================================== */}

      {error && (
        <div className="border-border bg-surface mb-5 flex items-center justify-between gap-3 rounded-xl border p-4">
          <p className="text-text-secondary text-sm">{error}</p>

          <button
            type="button"
            onClick={handleRefresh}
            className="text-primary flex shrink-0 items-center gap-2 text-sm font-medium"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      )}

      {/* ======================================================
          Current Campaign
      ====================================================== */}

      <section className="mb-6">
        <div className="bg-primary relative overflow-hidden rounded-2xl p-5 shadow-sm md:p-6">
          <div className="relative z-10">
            <div className="mb-2 flex items-center gap-2 text-white/80">
              <CalendarDays className="h-5 w-5" />

              <span className="text-sm font-medium">Current Campaign</span>
            </div>

            {loadingCampaign ? (
              <div className="h-7 w-48 animate-pulse rounded bg-white/20" />
            ) : campaign ? (
              <>
                <h2 className="text-2xl font-bold text-white md:text-3xl">
                  {campaign.name || campaign.title || "Current Campaign"}
                </h2>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/85">
                  <span>
                    {formatDate(
                      campaign.startDate || campaign.start || campaign.fromDate,
                    )}
                  </span>

                  <span className="text-white/50">→</span>

                  <span>
                    {formatDate(
                      campaign.endDate || campaign.end || campaign.toDate,
                    )}
                  </span>
                </div>
              </>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-white">
                  No Active Campaign
                </h2>

                <p className="mt-1 text-sm text-white/80">
                  There is currently no active campaign.
                </p>
              </div>
            )}
          </div>

          <CalendarDays className="absolute -right-5 -bottom-8 h-36 w-36 text-white/10" />
        </div>
      </section>

      {/* ======================================================
          Statistics
      ====================================================== */}

      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {/* Total */}
        <div className="bg-surface border-border rounded-2xl border p-4 shadow-sm md:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-xl">
              <Syringe className="h-5 w-5" />
            </div>
          </div>

          <p className="text-text-secondary text-sm">Total Zerodose</p>

          <p className="text-text mt-1 text-2xl font-bold">
            {loadingZerodose ? "..." : totalZerodose}
          </p>
        </div>

        {/* Recorded */}
        <div className="bg-surface border-border rounded-2xl border p-4 shadow-sm md:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
              <Clock3 className="h-5 w-5" />
            </div>
          </div>

          <p className="text-text-secondary text-sm">Recorded</p>

          <p className="text-text mt-1 text-2xl font-bold">
            {loadingZerodose ? "..." : recordedZerodose}
          </p>
        </div>

        {/* Visited */}
        <div className="bg-surface border-border rounded-2xl border p-4 shadow-sm md:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <MapPin className="h-5 w-5" />
            </div>
          </div>

          <p className="text-text-secondary text-sm">Visited</p>

          <p className="text-text mt-1 text-2xl font-bold">
            {loadingZerodose ? "..." : visitedZerodose}
          </p>
        </div>

        {/* Covered */}
        <div className="bg-surface border-border rounded-2xl border p-4 shadow-sm md:p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <p className="text-text-secondary text-sm">Covered</p>

          <p className="text-text mt-1 text-2xl font-bold">
            {loadingZerodose ? "..." : coveredZerodose}
          </p>
        </div>
      </section>

      {/* ======================================================
          Worker Actions
      ====================================================== */}

      <section className="mb-6 grid grid-cols-2 gap-3 md:gap-4">
        {/* Add Zerodose */}
        <Link
          href="/worker/addzerodose"
          className="bg-surface border-border group flex min-h-36 items-center gap-4 rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md md:min-h-40 md:p-6"
        >
          <div className="bg-primary/10 text-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105 md:h-16 md:w-16">
            <Plus className="h-7 w-7 md:h-8 md:w-8" strokeWidth={2} />
          </div>

          <div className="min-w-0">
            <h2 className="text-text text-base font-semibold md:text-lg">
              Add Zerodose
            </h2>

            <p className="text-text-secondary mt-1 hidden text-sm md:block">
              Record a new Zerodose
            </p>
          </div>

          <ChevronRight className="text-text-secondary ml-auto hidden h-5 w-5 md:block" />
        </Link>

        {/* View Zerodose */}
        <Link
          href="/worker/viewzerodose"
          className="bg-surface border-border group flex min-h-36 items-center gap-4 rounded-2xl border p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md md:min-h-40 md:p-6"
        >
          <div className="bg-primary/10 text-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105 md:h-16 md:w-16">
            <Eye className="h-7 w-7 md:h-8 md:w-8" strokeWidth={2} />
          </div>

          <div className="min-w-0">
            <h2 className="text-text text-base font-semibold md:text-lg">
              View Zerodose
            </h2>

            <p className="text-text-secondary mt-1 hidden text-sm md:block">
              View all team records
            </p>
          </div>

          <ChevronRight className="text-text-secondary ml-auto hidden h-5 w-5 md:block" />
        </Link>
      </section>

      {/* ======================================================
          Current Campaign Zerodose
      ====================================================== */}

      <section className="bg-surface border-border overflow-hidden rounded-2xl border shadow-sm">
        {/* Section Header */}
        <div className="border-border flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <div>
            <div className="flex items-center gap-2">
              <Users className="text-primary h-5 w-5" />

              <h2 className="text-text text-lg font-semibold">
                Current Campaign Zerodose
              </h2>
            </div>

            <p className="text-text-secondary mt-1 text-sm">
              Zerodose recorded by your team during the current campaign.
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={loadingZerodose}
            className="border-border text-text hover:bg-background flex w-fit items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${loadingZerodose ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* ====================================================
            Loading
        ==================================================== */}

        {loadingZerodose ? (
          <div className="space-y-3 p-4 md:p-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-background h-20 animate-pulse rounded-xl"
              />
            ))}
          </div>
        ) : currentZerodoses.length === 0 ? (
          /* ==================================================
             Empty
          ================================================== */

          <div className="flex flex-col items-center justify-center px-5 py-12 text-center">
            <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-2xl">
              <Syringe className="h-7 w-7" />
            </div>

            <h3 className="text-text mt-4 font-semibold">
              No Zerodose Recorded
            </h3>

            <p className="text-text-secondary mt-1 max-w-sm text-sm">
              Your team has not recorded any Zerodose during the current
              campaign yet.
            </p>

            <Link
              href="/worker/addzerodose"
              className="bg-primary mt-5 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Add Zerodose
            </Link>
          </div>
        ) : (
          /* ==================================================
             Desktop Table + Mobile Cards
          ================================================== */

          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="bg-background border-border border-b">
                  <tr>
                    <th className="text-text-secondary px-5 py-3 text-xs font-semibold uppercase">
                      Child
                    </th>

                    <th className="text-text-secondary px-5 py-3 text-xs font-semibold uppercase">
                      Father
                    </th>

                    <th className="text-text-secondary px-5 py-3 text-xs font-semibold uppercase">
                      Age
                    </th>

                    <th className="text-text-secondary px-5 py-3 text-xs font-semibold uppercase">
                      Status
                    </th>

                    <th className="text-text-secondary px-5 py-3 text-xs font-semibold uppercase">
                      Record Date
                    </th>

                    <th className="text-text-secondary px-5 py-3 text-xs font-semibold uppercase">
                      Visit Date
                    </th>

                    <th className="text-text-secondary px-5 py-3 text-xs font-semibold uppercase">
                      Covered Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-border divide-y">
                  {currentZerodoses.map((item) => {
                    const status = getStatus(item);

                    return (
                      <tr
                        key={item._id}
                        className="hover:bg-background transition-colors"
                      >
                        <td className="text-text px-5 py-4 text-sm font-medium">
                          {item.childName}
                        </td>

                        <td className="text-text-secondary px-5 py-4 text-sm">
                          {item.fatherName}
                        </td>

                        <td className="text-text-secondary px-5 py-4 text-sm">
                          {item.age}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </td>

                        <td className="text-text-secondary px-5 py-4 text-sm">
                          {formatDate(item.recordDate)}
                        </td>

                        <td className="text-text-secondary px-5 py-4 text-sm">
                          {formatDate(item.visitDate)}
                        </td>

                        <td className="text-text-secondary px-5 py-4 text-sm">
                          {formatDate(item.coveredDate)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-border divide-y md:hidden">
              {currentZerodoses.map((item) => {
                const status = getStatus(item);

                return (
                  <div key={item._id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-text truncate font-semibold">
                          {item.childName}
                        </h3>

                        <p className="text-text-secondary mt-1 text-sm">
                          Father: {item.fatherName}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-text-secondary text-xs">Age</p>

                        <p className="text-text mt-1 text-sm font-medium">
                          {item.age}
                        </p>
                      </div>

                      <div>
                        <p className="text-text-secondary text-xs">
                          Record Date
                        </p>

                        <p className="text-text mt-1 text-sm font-medium">
                          {formatDate(item.recordDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-text-secondary text-xs">
                          Visit Date
                        </p>

                        <p className="text-text mt-1 text-sm font-medium">
                          {formatDate(item.visitDate)}
                        </p>
                      </div>

                      <div>
                        <p className="text-text-secondary text-xs">
                          Covered Date
                        </p>

                        <p className="text-text mt-1 text-sm font-medium">
                          {formatDate(item.coveredDate)}
                        </p>
                      </div>
                    </div>

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
          </>
        )}
      </section>
    </div>
  );
}
