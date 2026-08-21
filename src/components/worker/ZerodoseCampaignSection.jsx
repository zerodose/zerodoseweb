
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
      const status = String(item?.vaccinationStatus || "").toLowerCase();

      return status === statusTab;
    });
  }, [zerodoses, statusTab]);

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
  //
  // Example:
  // Start: 17 Aug = Day 1
  // 18 Aug = Day 2
  // 19 Aug = Day 3
  // ...
  // End Date = Final Campaign Day
  // =========================================================

  const getCampaignDay = (item, status = statusTab) => {
    const startDate = item?.campaign?.startDate;
    const endDate = item?.campaign?.endDate;

    if (!startDate) return "-";

    const date =
      status === "covered"
        ? item?.coveredDate
        : status === "visited"
          ? item?.visitDate
          : item?.recordDate;

    if (!date) return "-";

    // ---------------------------------------------------------
    // Convert date to local calendar date without UTC shifting.
    // This prevents dates like 17 Aug becoming 16 Aug because
    // of timezone conversion.
    // ---------------------------------------------------------

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

    // ---------------------------------------------------------
    // Campaign Day can never be before Day 1.
    // ---------------------------------------------------------

    if (campaignDay < 1) {
      return "-";
    }

    // ---------------------------------------------------------
    // If campaign end date exists, do not allow a date after
    // the campaign end date to produce a day beyond the
    // campaign's final day.
    // ---------------------------------------------------------

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
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-gray-200" />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
        </div>
      </div>

      {/* Child Information */}
      <div className="border-border mt-4 grid grid-cols-2 gap-x-4 gap-y-4 border-t pt-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="space-y-2">
            <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Extra Information */}
      <div className="border-border mt-4 grid grid-cols-2 gap-4 border-t pt-4 md:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="space-y-2">
            <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Address */}
      <div className="border-border mt-4 flex items-start gap-2 border-t pt-3">
        <div className="mt-0.5 h-4 w-4 shrink-0 animate-pulse rounded bg-gray-200" />

        <div className="flex-1 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200" />
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
        <div className="grid grid-cols-2 gap-2 md:gap-3">
          {/* Current Campaign */}
          <button
            type="button"
            onClick={() => onTabChange("current")}
            className={`group relative flex min-h-[72px] min-w-0 items-center overflow-hidden rounded-xl px-3 py-3 text-left transition md:min-h-[82px] md:px-4 ${
              activeTab === "current"
                ? "bg-primary text-white shadow-sm"
                : "bg-background text-text-secondary border-border hover:border-primary hover:text-primary border"
            }`}
          >
            <div className="relative z-10 flex min-w-0 items-center gap-2.5">
              <CalendarDays
                className={`h-5 w-5 shrink-0 ${
                  activeTab === "current"
                    ? "text-white/90"
                    : "text-primary/70 group-hover:text-primary"
                }`}
              />

              <span className="min-w-0 text-sm leading-5 font-semibold md:text-base">
                <span className="block">Current</span>
                <span className="block">Campaign</span>
              </span>
            </div>

            {/* Background Calendar */}
            <CalendarDays
              className={`pointer-events-none absolute -right-4 -bottom-5 z-0 h-20 w-20 ${
                activeTab === "current"
                  ? "text-white/10"
                  : "text-primary/10 group-hover:text-primary/15"
              }`}
            />
          </button>

          {/* Previous Campaigns */}
          <button
            type="button"
            onClick={() => onTabChange("previous")}
            className={`group relative flex min-h-[72px] min-w-0 items-center overflow-hidden rounded-xl px-3 py-3 text-left transition md:min-h-[82px] md:px-4 ${
              activeTab === "previous"
                ? "bg-primary text-white shadow-sm"
                : "bg-background text-text-secondary border-border hover:border-primary hover:text-primary border"
            }`}
          >
            <div className="relative z-10 flex min-w-0 items-center gap-2.5">
              <CalendarDays
                className={`h-5 w-5 shrink-0 ${
                  activeTab === "previous"
                    ? "text-white/90"
                    : "text-primary/70 group-hover:text-primary"
                }`}
              />

              <span className="min-w-0 text-sm leading-5 font-semibold md:text-base">
                <span className="block">Previous</span>
                <span className="block">Campaigns</span>
              </span>
            </div>

            {/* Background Calendar */}
            <CalendarDays
              className={`pointer-events-none absolute -right-4 -bottom-5 z-0 h-20 w-20 ${
                activeTab === "previous"
                  ? "text-white/10"
                  : "text-primary/10 group-hover:text-primary/15"
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
            <h2 className="text-text text-lg font-semibold text-wrap">
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
      ========================================================= */}

      <div className="border-border border-b p-3 md:p-4">
        <div className="border-border grid grid-cols-3 gap-1.5 rounded-2xl border bg-white p-1.5">
          {statusTabs.map((tab) => {
            const Icon =
              tab.key === "recorded"
                ? Clock3
                : tab.key === "visited"
                  ? CalendarDays
                  : Syringe;

            const isDisabled = loading && statusTab !== tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusTab(tab.key)}
                disabled={isDisabled}
                className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-sm font-semibold transition-all ${
                  statusTab === tab.key
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-secondary hover:bg-background hover:text-primary"
                } ${
                  isDisabled
                    ? "hover:text-text-secondary cursor-not-allowed opacity-50 hover:bg-transparent"
                    : ""
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />

                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
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

                <div className="flex items-start justify-between gap-3">
                  {/* Left: Syringe + Child + Status */}

                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    {/* Syringe Icon */}

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

                  {/* Right: Campaign Day */}

                  <div className="shrink-0 text-right">
                    <p className="text-text-secondary text-xs">Campaign Day</p>

                    <p className="text-text mt-1 text-sm font-semibold">
                      Day {getCampaignDay(item, statusTab)}
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

                  {/* Contact */}

                  <div>
                    <div className="text-text-secondary flex items-center gap-1.5 text-xs">
                      <User className="h-3.5 w-3.5 shrink-0" />

                      <span>Contact</span>
                    </div>

                    <p className="text-text mt-1 text-sm font-medium">
                      {item.contactNo || "-"}
                    </p>
                  </div>

                  {/* Recorded */}

                  <div>
                    <div className="text-text-secondary flex items-center gap-1.5 text-xs">
                      <Clock3 className="h-3.5 w-3.5 shrink-0" />

                      <span>Recorded</span>
                    </div>

                    <p className="text-text mt-1 text-sm font-medium">
                      {formatDate(item.recordDate)}
                    </p>
                  </div>

                  {/* Visited */}

                  {statusTab === "visited" && (
                    <div>
                      <div className="text-text-secondary flex items-center gap-1.5 text-xs">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />

                        <span>Visited Date</span>
                      </div>

                      <p className="text-text mt-1 text-sm font-medium">
                        {formatDate(item.visitDate)}
                      </p>
                    </div>
                  )}

                  {/* Covered */}

                  {statusTab === "covered" && (
                    <>
                      <div>
                        <div className="text-text-secondary flex items-center gap-1.5 text-xs">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0" />

                          <span>Visited Date</span>
                        </div>

                        <p className="text-text mt-1 text-sm font-medium">
                          {formatDate(item.visitDate)}
                        </p>
                      </div>

                      <div>
                        <div className="text-text-secondary flex items-center gap-1.5 text-xs">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0" />

                          <span>Covered Date</span>
                        </div>

                        <p className="text-text mt-1 text-sm font-medium">
                          {formatDate(item.coveredDate)}
                        </p>
                      </div>
                    </>
                  )}
                </div>

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
