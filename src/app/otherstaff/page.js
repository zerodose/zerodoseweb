"use client";

import { useEffect, useMemo, useState } from "react";

import { getOtherStaffTotalSummary } from "@/api/dashboardApi";

import VaccinatorSummaryCards from "@/components/vaccinator/VaccinatorSummaryCards";
import VaccinatorCampaignSection from "@/components/vaccinator/VaccinatorCampaignSection";
import { useTabLoader } from "@/context/TabLoaderContext";
import OtherStaffActions from "@/components/otherstaff/OtherStaffActions";

export default function VaccinatorPage() {
  const { showTabLoader, hideTabLoader } = useTabLoader();
  const authUser = useMemo(() => {
    if (typeof window === "undefined") {
      return null;
    }

    try {
      const storedAuthUser = localStorage.getItem("authUser");

      if (!storedAuthUser) {
        return null;
      }

      return JSON.parse(storedAuthUser);
    } catch (error) {
      console.error("Failed to parse authUser:", error);

      return null;
    }
  }, []);

  const [summary, setSummary] = useState({
    recordCount: 0,
    visitCount: 0,
    coveredCount: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadVaccinatorSummary = async () => {
      try {
        setLoading(true);
        showTabLoader();
        const response = await getOtherStaffTotalSummary();

        if (cancelled) {
          return;
        }

        if (!response?.success) {
          setSummary({
            recordCount: 0,
            visitCount: 0,
            coveredCount: 0,
          });

          return;
        }

        const data = response?.data || {};

        const nextSummary = {
          recordCount: Number(data?.recordCount ?? 0),

          visitCount: Number(data?.visitCount ?? 0),

          coveredCount: Number(data?.coveredCount ?? 0),
        };

        setSummary(nextSummary);
      } catch (error) {
        if (cancelled) {
          return;
        }

        // console.error("Failed to fetch vaccinator total summary:", error);

        setSummary({
          recordCount: 0,
          visitCount: 0,
          coveredCount: 0,
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
          hideTabLoader()
        }
      }
    };

    loadVaccinatorSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="w-full space-y-6">
      <VaccinatorSummaryCards
        recordedZerodose={summary.recordCount}
        visitedZerodose={summary.visitCount}
        coveredZerodose={summary.coveredCount}
        loading={loading}
      />

      <OtherStaffActions />

      <VaccinatorCampaignSection authUser={authUser} />
    </div>
  );
}
