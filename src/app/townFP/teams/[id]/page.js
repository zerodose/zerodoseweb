"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  Hash,
  MapPin,
  Users,
  UserRound,
  UsersRound,
} from "lucide-react";

export default function TeamDetailPage() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // Get Team / UCMO Detail
  // ============================================================

  useEffect(() => {
    if (!id) {
      return;
    }

    const getTeamDetail = async () => {
      try {
        setLoading(true);

        const response = await fetch(`/api/users/town-team-summary/${id}`, {
          method: "GET",
          credentials: "include",
        });

        const result = await response.json();

        if (!response.ok || !result?.success) {
          throw new Error(result?.message || "Failed to fetch team details.");
        }

        setData(result?.data || null);
      } catch (error) {
        console.error("Get team detail error:", error);

        setData(null);
      } finally {
        setLoading(false);
      }
    };

    getTeamDetail();
  }, [id]);

  // ============================================================
  // Loading
  // ============================================================

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-text-secondary text-sm">
          Loading team details...
        </div>
      </div>
    );
  }

  // ============================================================
  // Not Found
  // ============================================================

  if (!data) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="text-text-secondary hover:text-text inline-flex items-center gap-2 text-sm font-medium transition"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="border-border bg-background rounded-2xl border p-8 text-center shadow-sm">
          <p className="text-text-secondary text-sm">
            Team information not found.
          </p>
        </div>
      </div>
    );
  }

  const districtName = data?.district?.name || "-";

  const townName = data?.town?.name || "-";

  const unionCouncilName = data?.unionCouncil?.name || "-";

  const unionCouncilCode = data?.unionCouncil?.code || "-";

  const ucmoName = data?.ucmo?.name || "-";

  const supervisors = Array.isArray(data?.supervisors) ? data.supervisors : [];

  // ============================================================
  // Detail Item
  // ============================================================

  const DetailItem = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
      <div className="bg-primary-light text-primary mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-text-secondary text-xs font-medium">{label}</p>

        <p className="text-text mt-1 text-sm font-semibold break-words">
          {value || "-"}
        </p>
      </div>
    </div>
  );

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className="space-y-6">
      {/* ======================================================
          Header
      ====================================================== */}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="border-border bg-background text-text-secondary hover:border-primary hover:text-primary flex h-10 w-10 items-center justify-center rounded-xl border shadow-sm transition"
        >
          <ArrowLeft size={19} />
        </button>

        <div>
          <h1 className="text-text text-xl font-bold">Team Details</h1>

          <p className="text-text-secondary mt-1 text-sm">
            View Union Council, UCMO, supervisor and team information.
          </p>
        </div>
      </div>

      {/* ======================================================
          Summary Card
      ====================================================== */}

      <div className="border-border bg-background relative overflow-hidden rounded-2xl border p-5 shadow-sm">
        <div className="bg-primary-light/50 absolute -top-10 -right-10 h-32 w-32 rounded-full" />

        <div className="relative grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Teams */}

          <div className="border-border bg-surface rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-xl">
                <UsersRound size={19} />
              </div>

              <div>
                <p className="text-text-secondary text-xs">Total Teams</p>

                <p className="text-text text-xl font-bold">
                  {Number(data?.teamsCount || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Workers */}

          <div className="border-border bg-surface rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-xl">
                <Users size={19} />
              </div>

              <div>
                <p className="text-text-secondary text-xs">Total Workers</p>

                <p className="text-text text-xl font-bold">
                  {Number(data?.workersCount || 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Supervisors */}

          <div className="border-border bg-surface rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-xl">
                <UserRound size={19} />
              </div>

              <div>
                <p className="text-text-secondary text-xs">Supervisors</p>

                <p className="text-text text-xl font-bold">
                  {supervisors.length}
                </p>
              </div>
            </div>
          </div>

          {/* UCMO */}

          <div className="border-border bg-surface rounded-xl border p-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-xl">
                <BriefcaseBusiness size={19} />
              </div>

              <div className="min-w-0">
                <p className="text-text-secondary text-xs">UCMO</p>

                <p className="text-text truncate text-sm font-bold">
                  {ucmoName}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================
          Location / Assignment Details
      ====================================================== */}

      <div className="border-border bg-background rounded-2xl border shadow-sm">
        <div className="border-border border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <MapPin size={19} className="text-primary" />

            <h2 className="text-text text-base font-semibold">
              Assignment Details
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem icon={Building2} label="District" value={districtName} />

          <DetailItem icon={Building2} label="Town" value={townName} />

          <DetailItem
            icon={MapPin}
            label="Union Council"
            value={unionCouncilName}
          />

          <DetailItem icon={Hash} label="UC Code" value={unionCouncilCode} />

          <DetailItem icon={UserRound} label="UCMO" value={ucmoName} />

          <DetailItem
            icon={UsersRound}
            label="Total Teams"
            value={Number(data?.teamsCount || 0)}
          />
        </div>
      </div>

      {/* ======================================================
          Supervisors
      ====================================================== */}

      <div className="border-border bg-background rounded-2xl border shadow-sm">
        <div className="border-border border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <UserRound size={19} className="text-primary" />

            <h2 className="text-text text-base font-semibold">Supervisors</h2>
          </div>

          <p className="text-text-secondary mt-1 text-sm">
            Supervisors assigned under this UCMO.
          </p>
        </div>

        <div className="p-5">
          {supervisors.length === 0 ? (
            <div className="border-border rounded-xl border border-dashed p-6 text-center">
              <p className="text-text-secondary text-sm">
                No approved supervisors found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {supervisors.map((supervisor) => (
                <div
                  key={supervisor?._id}
                  className="border-border bg-surface rounded-xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="bg-primary-light text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                        <UserRound size={18} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-text truncate text-sm font-semibold">
                          {supervisor?.name || "-"}
                        </p>

                        <p className="text-text-secondary mt-1 text-xs">
                          Supervisor
                        </p>
                      </div>
                    </div>

                    <span className="bg-primary-light text-primary rounded-lg px-2.5 py-1 text-xs font-semibold">
                      {supervisor?.supervisorCode || "-"}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="border-border bg-background rounded-lg border p-3">
                      <p className="text-text-secondary text-xs">Teams</p>

                      <p className="text-text mt-1 text-base font-bold">
                        {Number(supervisor?.teamsCount || 0)}
                      </p>
                    </div>

                    <div className="border-border bg-background rounded-lg border p-3">
                      <p className="text-text-secondary text-xs">Workers</p>

                      <p className="text-text mt-1 text-base font-bold">
                        {Number(supervisor?.workersCount || 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
