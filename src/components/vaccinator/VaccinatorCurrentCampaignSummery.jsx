"use client";

import { useMemo } from "react";

import CampaignHeader from "../supervisor/CampaignHeader";
import SupervisorsTable from "../ucmo/SupervisorsTable";

export default function VaccinatorCurrentCampaignSummery({
  campaign,
  data = [],
  loading = false,
  authUser,
}) {
  // ============================================================
  // SUPERVISOR SUMMARY
  // ============================================================
  //
  // API DATA:
  //
  // supervisorId
  // supervisorName
  // supervisorCode
  // numberOfTeams
  // recordCount
  // visitCount
  // coveredCount
  //
  // Convert API structure into the structure expected
  // by SupervisorsTable.
  // ============================================================

  const supervisorSummary = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    return (
      data
        .map((item) => ({
          supervisorId: item?.supervisorId || "",

          supervisorCode: item?.supervisorCode || "-",

          supervisorName: item?.supervisorName || "-",

          totalTeams: Number(item?.numberOfTeams || 0),

          recorded: Number(item?.recordCount || 0),

          visited: Number(item?.visitCount || 0),

          covered: Number(item?.coveredCount || 0),
        }))
        // Only supervisors having recorded Zerodose
        .filter((supervisor) => supervisor.recorded > 0)
        // Sort by Supervisor Code
        .sort((a, b) => {
          const codeA = String(a?.supervisorCode || "").trim();

          const codeB = String(b?.supervisorCode || "").trim();

          const numberA = Number(codeA.match(/\d+/)?.[0] || 0);

          const numberB = Number(codeB.match(/\d+/)?.[0] || 0);

          if (numberA !== numberB) {
            return numberA - numberB;
          }

          return codeA.localeCompare(codeB);
        })
    );
  }, [data]);

  // ============================================================
  // TOTAL SUMMARY
  // ============================================================

  const summary = useMemo(() => {
    return supervisorSummary.reduce(
      (result, supervisor) => {
        result.recorded += Number(supervisor?.recorded || 0);

        result.visited += Number(supervisor?.visited || 0);

        result.covered += Number(supervisor?.covered || 0);

        result.totalTeams += Number(supervisor?.totalTeams || 0);

        return result;
      },
      {
        totalTeams: 0,
        recorded: 0,
        visited: 0,
        covered: 0,
      },
    );
  }, [supervisorSummary]);

  // ============================================================
  // NO CURRENT CAMPAIGN
  // ============================================================

  if (!campaign) {
    return (
      <section>
        {" "}
        <div className="bg-surface border-border rounded-xl border p-6 text-center md:rounded-2xl">
          {" "}
          <p className="text-text font-medium">Current campaign not found. </p>
          <p className="text-text-secondary mt-1 text-sm">
            No active campaign data is available for this vaccinator.
          </p>
        </div>
      </section>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <section>
      {/* ========================================================
CURRENT CAMPAIGN HEADER
======================================================== */}

      <CampaignHeader
        campaign={campaign}
        label="CURRENT CAMPAIGN"
        teams={summary.totalTeams}
        recorded={summary.recorded}
        visited={summary.visited}
        covered={summary.covered}
      />

      {/* ========================================================
      SECTION HEADER
  ======================================================== */}

      <div className="mt-5 mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-text text-base font-semibold md:text-lg">
            Current Zerodose
          </h3>

          <p className="text-text-secondary mt-1 text-xs">
            Supervisor-wise Zerodose record for current campaign
          </p>
        </div>

        <span className="text-text-secondary text-xs">
          {supervisorSummary.length} Supervisors
        </span>
      </div>

      {/* ========================================================
      LOADING
  ======================================================== */}

      {loading ? (
        <div className="bg-surface border-border overflow-hidden rounded-xl border md:rounded-2xl">
          <div className="animate-pulse space-y-3 p-4 md:p-5">
            <div className="bg-border h-10 rounded-lg" />
            <div className="bg-border h-12 rounded-lg" />
            <div className="bg-border h-12 rounded-lg" />
            <div className="bg-border h-12 rounded-lg" />
          </div>
        </div>
      ) : supervisorSummary.length === 0 ? (
        /* ======================================================
       EMPTY STATE
    ====================================================== */

        <div className="bg-surface border-border rounded-xl border p-6 text-center md:rounded-2xl">
          <p className="text-text font-medium">No Zerodose records found.</p>

          <p className="text-text-secondary mt-1 text-sm">
            No supervisor has recorded Zerodose activity for this campaign yet.
          </p>
        </div>
      ) : (
        /* ======================================================
       SUPERVISOR TABLE
    ====================================================== */

        <SupervisorsTable data={supervisorSummary} />
      )}
    </section>
  );
}
