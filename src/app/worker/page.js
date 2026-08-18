"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Eye,
  CalendarDays,
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
import ZerodoseCampaignSection from "@/components/worker/ZerodoseCampaignSection";

export default function Page() {
  const [campaign, setCampaign] = useState(null);
  const [zerodoses, setZerodoses] = useState([]);

  const [loadingCampaign, setLoadingCampaign] = useState(true);
  const [loadingZerodose, setLoadingZerodose] = useState(true);

  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState("current");

  const [previousZerodoses, setPreviousZerodoses] = useState([]);

  const loadCampaign = async () => {
    try {
      setLoadingCampaign(true);
      setError("");

      const response = await getCampaigns();

      const campaigns = response?.data || [];

      const now = new Date();

      const currentCampaign =
        campaigns.find((item) => item.isCampaignActive === true) || null;

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

  useEffect(() => {
    loadCampaign();
    loadZerodose();
  }, []);

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

  const handleRefresh = async () => {
    await Promise.all([loadCampaign(), loadZerodose()]);
  };

  return (
    <div className="min-h-full p-4 md:p-6">

      <PageHeader
        title="Worker"
        // subtitle="Manage Zerodose recorded by your team"
        subtitle="Manage your team's Zerodose"
      />

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
                  {campaign.name}
                </h2>

                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/85">
                  <span>{formatDate(campaign.startDate)}</span>

                  <span className="text-white/50">→</span>

                  <span>{formatDate(campaign.endDate)}</span>
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

      <section className="mb-6 grid grid-cols-2 gap-3 md:gap-4">
        {/* Add Zerodose */}
        {campaign ? (
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
        ) : (
          <div className="bg-surface border-border flex min-h-36 cursor-not-allowed items-center gap-4 rounded-2xl border p-4 opacity-50 shadow-sm md:min-h-40 md:p-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 md:h-16 md:w-16">
              <Plus className="h-7 w-7 md:h-8 md:w-8" strokeWidth={2} />
            </div>

            <div className="min-w-0">
              <h2 className="text-text text-base font-semibold md:text-lg">
                Add Zerodose
              </h2>

              <p className="text-text-secondary mt-1 hidden text-sm md:block">
                Add Zerodose is available only during campaign days
              </p>
            </div>
          </div>
        )}

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

      {/* <ZerodoseCampaignSection
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentZerodoses={currentZerodoses}
        previousZerodoses={previousZerodoses}
        loading={loadingZerodose}
        onRefresh={handleRefresh}
        getStatus={getStatus}
        formatDate={formatDate}
      /> */}
    </div>
  );
}
