

"use client";

import { useEffect, useState } from "react";

import { getSupervisorSummary } from "@/api/dashboardApi";
import { getPendingZerodoseCount } from "@/api/zerodoseApprovalApi";

import SupervisorActions from "@/components/supervisor/SupervisorActions";
import PendingApprovalButton from "@/components/ucmo/PendingApprovalButton";
import ZerodoseStats from "@/components/worker/ZerodoseStats";
import SupervisorCampaignSection from "@/components/supervisor/SupervisorCampaignSection";

export default function Page() {
const [authUser, setAuthUser] = useState(null);

const [summary, setSummary] = useState({
recorded: 0,
visited: 0,
covered: 0,
});

const [loadingSummary, setLoadingSummary] = useState(true);
const [error, setError] = useState("");

const [pendingApprovals, setPendingApprovals] = useState(0);
const [pendingApprovalsLoading, setPendingApprovalsLoading] =
useState(true);

// ============================================================
// GET AUTH USER
// ============================================================

useEffect(() => {
let cancelled = false;


const loadAuthUser = () => {
  try {
    const storedAuthUser = localStorage.getItem("authUser");

    if (!storedAuthUser) {
      if (!cancelled) {
        setAuthUser(null);
      }

      return;
    }

    const parsedUser = JSON.parse(storedAuthUser);

    if (!cancelled) {
      setAuthUser(parsedUser);
    }
  } catch (error) {
    console.error("Auth user parse error:", error);

    if (!cancelled) {
      setAuthUser(null);
    }
  }
};

loadAuthUser();

return () => {
  cancelled = true;
};


}, []);

// ============================================================
// GET SUPERVISOR SUMMARY
// ============================================================

useEffect(() => {
let cancelled = false;


const fetchSupervisorSummary = async () => {
  try {
    setLoadingSummary(true);
    setError("");

    const response = await getSupervisorSummary();

    console.log("Supervisor summary response:", response);

    if (!response?.success) {
      throw new Error(
        response?.message ||
          "Failed to fetch supervisor summary.",
      );
    }

    const data = response?.data || {};

    if (cancelled) {
      return;
    }

    setSummary({
      recorded: Number(data.recordCount || 0),
      visited: Number(data.visitCount || 0),
      covered: Number(data.coveredCount || 0),
    });
  } catch (error) {
    if (cancelled) {
      return;
    }

    console.error("Supervisor summary error:", error);

    setError(
      error?.message ||
        "Failed to load supervisor summary.",
    );

    setSummary({
      recorded: 0,
      visited: 0,
      covered: 0,
    });
  } finally {
    if (!cancelled) {
      setLoadingSummary(false);
    }
  }
};

fetchSupervisorSummary();

return () => {
  cancelled = true;
};


}, []);

// ============================================================
// PENDING ZERODOSE APPROVALS
// ============================================================

useEffect(() => {
let cancelled = false;


const fetchPendingApprovals = async () => {
  try {
    setPendingApprovalsLoading(true);

    const supervisorId = authUser?.id
      ? String(authUser.id)
      : null;

    if (!supervisorId) {
      if (!cancelled) {
        setPendingApprovals(0);
        setPendingApprovalsLoading(false);
      }

      return;
    }

    const response =
      await getPendingZerodoseCount(supervisorId);

    if (cancelled) {
      return;
    }

    if (!response?.success) {
      setPendingApprovals(0);
      return;
    }

    setPendingApprovals(
      Number(response.count || 0),
    );
  } catch (error) {
    if (cancelled) {
      return;
    }

    console.error(
      "Pending Zerodose count error:",
      error,
    );

    setPendingApprovals(0);
  } finally {
    if (!cancelled) {
      setPendingApprovalsLoading(false);
    }
  }
};

fetchPendingApprovals();

return () => {
  cancelled = true;
};


}, [authUser]);

// ============================================================
// UI
// ============================================================

return ( <div className="min-h-full"> <div className="mx-auto w-full max-w-7xl">
{/* Header */}


    <div className="mb-4 flex flex-col md:mb-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-text text-2xl font-bold md:text-3xl">
          Supervisor
        </h1>

        <PendingApprovalButton
          link="/supervisor/zerodoseApproval"
          name="Zerodose Approval"
          pendingApprovals={pendingApprovals}
          loading={pendingApprovalsLoading}
        />
      </div>

      <p className="text-text-secondary mt-1 text-sm">
        Manage teams and campaign-wise Zerodose records
      </p>
    </div>

    {/* Error */}

    {error && (
      <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
        {error}
      </div>
    )}

    {/* Overall Zerodose Stats */}

    <ZerodoseStats
      summary={summary}
      loading={loadingSummary}
    />

    {/* Actions */}

    <SupervisorActions />

    {/* Campaign Section */}

    <SupervisorCampaignSection
      authUser={authUser}
    />
  </div>
</div>


);
}
