"use client";

import { useMemo } from "react";

import CampaignHeader from "../supervisor/CampaignHeader";
import SupervisorsTable from "../ucmo/SupervisorsTable";

export default function VaccinatorCurrentCampaignSummery({
  campaign,
  data = [],
  loading = false,
  authUser,
  supervisorName = "",
  supervisorCode = "",
}) {
  // ============================================================
  // SUPERVISOR SUMMARY
  // ============================================================
  //
  // Only supervisors having recorded Zerodose > 0
  // will be displayed.
  //
  // Sorted by Supervisor Code.
  // ============================================================

  const supervisorSummary = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    const supervisorsMap = new Map();

    data.forEach((item) => {
      const currentSupervisorCode =
        item?.supervisorCode ||
        supervisorCode ||
        authUser?.supervisorCode ||
        "";

      const currentSupervisorName =
        item?.supervisorName ||
        supervisorName ||
        authUser?.supervisor?.name ||
        "";

      // ----------------------------------------------------------
      // If there is no supervisor information, skip it.
      // ----------------------------------------------------------

      const key =
        item?.supervisorId ||
        item?.supervisor?._id ||
        currentSupervisorCode ||
        currentSupervisorName;

      if (!key) {
        return;
      }

      if (!supervisorsMap.has(key)) {
        supervisorsMap.set(key, {
          supervisorId: item?.supervisorId || item?.supervisor?._id || "",

          supervisorCode: currentSupervisorCode,

          supervisorName: currentSupervisorName,

          totalTeams: 0,

          recorded: 0,

          visited: 0,

          covered: 0,
        });
      }

      const supervisor = supervisorsMap.get(key);

      // ----------------------------------------------------------
      // Supervisor information
      // ----------------------------------------------------------

      if (currentSupervisorCode) {
        supervisor.supervisorCode = currentSupervisorCode;
      }

      if (currentSupervisorName) {
        supervisor.supervisorName = currentSupervisorName;
      }

      // ----------------------------------------------------------
      // Aggregated summary record
      // ----------------------------------------------------------

      if (
        item?.recorded !== undefined ||
        item?.visited !== undefined ||
        item?.covered !== undefined
      ) {
        supervisor.recorded += Number(item?.recorded || 0);

        supervisor.visited += Number(item?.visited || 0);

        supervisor.covered += Number(item?.covered || 0);

        if (item?.totalTeams !== undefined) {
          supervisor.totalTeams = Math.max(
            supervisor.totalTeams,
            Number(item?.totalTeams || 0),
          );
        }

        return;
      }

      // ----------------------------------------------------------
      // Individual Zerodose record fallback
      // ----------------------------------------------------------

      const status = String(item?.vaccinationStatus || "").toLowerCase();

      if (status === "recorded") {
        supervisor.recorded += 1;
      }

      if (status === "visited") {
        supervisor.visited += 1;
      }

      if (status === "covered") {
        supervisor.covered += 1;
      }

      // ----------------------------------------------------------
      // Team information
      // ----------------------------------------------------------

      if (item?.teamNumber !== undefined && item?.teamNumber !== null) {
        // Count unique teams per supervisor
        const existingTeams = supervisor._teamNumbers || new Set();

        existingTeams.add(String(item.teamNumber));

        supervisor._teamNumbers = existingTeams;

        supervisor.totalTeams = existingTeams.size;
      }
    });

    // ==========================================================
    // IMPORTANT:
    //
    // Only recorded > 0 supervisors are displayed.
    // ==========================================================

    return Array.from(supervisorsMap.values())
      .filter((supervisor) => Number(supervisor?.recorded || 0) > 0)
      .map((supervisor) => {
        const cleanedSupervisor = {
          ...supervisor,
        };

        delete cleanedSupervisor._teamNumbers;

        return cleanedSupervisor;
      })
      .sort((a, b) => {
        const codeA = String(a?.supervisorCode || "").trim();

        const codeB = String(b?.supervisorCode || "").trim();

        // ------------------------------------------------------
        // Numeric supervisor-code sorting
        //
        // SUP-1
        // SUP-2
        // SUP-10
        // ------------------------------------------------------

        const numberA = Number(codeA.match(/\d+/)?.[0] || 0);

        const numberB = Number(codeB.match(/\d+/)?.[0] || 0);

        if (numberA !== numberB) {
          return numberA - numberB;
        }

        return codeA.localeCompare(codeB);
      });
  }, [data, supervisorName, supervisorCode, authUser]);

  // ============================================================
  // SUMMARY
  // ============================================================

  const summary = useMemo(() => {
    return supervisorSummary.reduce(
      (result, supervisor) => {
        result.recorded += Number(supervisor?.recorded || 0);

        result.visited += Number(supervisor?.visited || 0);

        result.covered += Number(supervisor?.covered || 0);

        return result;
      },
      {
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
        <div className="bg-surface border-border rounded-xl border p-6 text-center md:rounded-2xl">
          <p className="text-text font-medium">Current campaign not found.</p>

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
        teams={supervisorSummary.length}
        recorded={summary.recorded}
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
