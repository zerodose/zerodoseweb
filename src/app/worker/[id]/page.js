"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Baby,
  CalendarDays,
  Clock3,
  Edit,
  Hash,
  MapPin,
  Phone,
  Syringe,
  User,
  Users,
  Building2,
  Map,
  Navigation,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import { getZerodose } from "@/api/zerodoseApi";
import WorkerPageSkeleton from "@/components/worker/WorkerPageSkeleton";

export default function ZerodoseDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id;

  const [zerodose, setZerodose] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadZerodose = async () => {
      try {
        setLoading(true);

        const response = await getZerodose(id);
        const data = response?.data || response;

        if (!data) {
          toast.error("Zerodose not found.");
          router.back();
          return;
        }

        setZerodose(data);
      } catch (error) {
        console.error("Get zerodose detail error:", error);

        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load zerodose.",
        );

        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadZerodose();
  }, [id, router]);

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatus = () => {
    if (zerodose?.vaccinationStatus === "covered") {
      return {
        label: "Covered",
        className:
          "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
      };
    }

    if (zerodose?.vaccinationStatus === "visited") {
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

  const getClientStatus = () => {
    if (!zerodose?.clientStatus) return "-";

    return zerodose.clientStatus
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  if (loading) {
    return <WorkerPageSkeleton />;
  }

  if (!zerodose) {
    return null;
  }

  const status = getStatus();

  return (
    <div className="min-h-full">
      <div className="mt-4 mb-6 flex items-start gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="border-border bg-background text-text-secondary hover:bg-surface flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="text-text text-2xl font-semibold">Zerodose Details</h1>

          <p className="text-text-secondary mt-1 text-sm">
            View complete zerodose record information.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="border-border bg-background rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between gap-4 p-5 md:p-6">
            <div className="flex min-w-0 items-start gap-4">
              <div className="bg-primary/10 text-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
                <Syringe className="h-7 w-7" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-text text-xl font-semibold break-words">
                    {zerodose.childName || "-"}
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}
                  >
                    {status.label}
                  </span>
                </div>

                <p className="text-text-secondary mt-1 text-sm">
                  Zerodose Record
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.push(`/worker/${zerodose._id}/update`)}
              className="border-border bg-background text-text-secondary hover:bg-surface hover:text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition"
              title="Edit Zerodose"
            >
              <Edit className="h-4 w-4" />
            </button>
          </div>
        </div>

        <DetailSection
          icon={Baby}
          title="Child Information"
          description="Basic information about the child."
        >
          <DetailItem
            icon={User}
            label="Child Name"
            value={zerodose.childName}
          />

          <DetailItem
            icon={User}
            label="Father Name"
            value={zerodose.fatherName}
          />

          <DetailItem
            icon={Baby}
            label="Age"
            value={
              zerodose.age !== undefined && zerodose.age !== null
                ? `${zerodose.age} months`
                : "-"
            }
          />

          <DetailItem
            icon={Phone}
            label="Contact Number"
            value={zerodose.contactNo || "-"}
          />

          <DetailItem
            icon={MapPin}
            label="Address"
            value={zerodose.address || "-"}
          />
        </DetailSection>

        <DetailSection
          icon={CalendarDays}
          title="Campaign Information"
          description="Campaign and recording information."
        >
          <DetailItem
            icon={CalendarDays}
            label="Campaign"
            value={zerodose.campaign?.name || "-"}
          />

          <DetailItem
            icon={Hash}
            label="Campaign Year"
            value={zerodose.campaign?.year ?? "-"}
          />

          <DetailItem
            icon={CalendarDays}
            label="Campaign Month"
            value={zerodose.campaign?.month ?? "-"}
          />

          <DetailItem
            icon={Hash}
            label="Campaign Day"
            value={
              zerodose.day !== undefined && zerodose.day !== null
                ? `Day ${zerodose.day}`
                : "-"
            }
          />

          <DetailItem
            icon={Clock3}
            label="Record Date"
            value={formatDateTime(zerodose.recordDate)}
          />

          <DetailItem
            icon={CalendarDays}
            label="Visit Date"
            value={formatDateTime(zerodose.visitDate)}
          />

          <DetailItem
            icon={CheckCircle2}
            label="Covered Date"
            value={formatDateTime(zerodose.coveredDate)}
          />

          <DetailItem
            icon={Syringe}
            label="Vaccination Status"
            value={status.label}
          />

          <DetailItem
            icon={AlertCircle}
            label="Client Status"
            value={getClientStatus()}
          />
        </DetailSection>

        <DetailSection
          icon={Users}
          title="Assignment Information"
          description="Administrative and team assignment details."
        >
          <DetailItem
            icon={Building2}
            label="District"
            value={zerodose.district?.name || "-"}
          />

          <DetailItem
            icon={Map}
            label="Town"
            value={zerodose.town?.name || "-"}
          />

          <DetailItem
            icon={MapPin}
            label="Union Council"
            value={zerodose.unionCouncil?.name || "-"}
          />

          <DetailItem
            icon={User}
            label="UCMO"
            value={zerodose.ucmo?.name || "-"}
          />

          <DetailItem
            icon={User}
            label="Supervisor"
            value={zerodose.supervisor?.name || "-"}
          />

          <DetailItem
            icon={Users}
            label="Team Number"
            value={zerodose.teamNumber ?? "-"}
          />

          <DetailItem
            icon={User}
            label="Recorded By"
            value={zerodose.user?.name || "-"}
          />

          <DetailItem
            icon={User}
            label="Team Leader"
            value={zerodose.teamLeader?.name || "-"}
          />

          <DetailItem
            icon={User}
            label="Team Member"
            value={zerodose.teamMember?.name || "-"}
          />
        </DetailSection>

        <DetailSection
          icon={Navigation}
          title="Location"
          description="GPS location captured when the zerodose was recorded."
        >
          <DetailItem
            icon={MapPin}
            label="Latitude"
            value={zerodose.location?.latitude ?? "-"}
          />

          <DetailItem
            icon={MapPin}
            label="Longitude"
            value={zerodose.location?.longitude ?? "-"}
          />

          {zerodose.location?.latitude != null &&
            zerodose.location?.longitude != null && (
              <div className="md:col-span-2">
                <a
                  href={`https://www.google.com/maps?q=${zerodose.location.latitude},${zerodose.location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary-dark inline-flex items-center gap-2 text-sm font-medium"
                >
                  <MapPin className="h-4 w-4" />
                  Open Location in Google Maps
                </a>
              </div>
            )}
        </DetailSection>

        <DetailSection
          icon={Clock3}
          title="Record Information"
          description="Record creation and last modification information."
        >
          <DetailItem
            icon={Clock3}
            label="Created At"
            value={formatDateTime(zerodose.createdAt)}
          />

          <DetailItem
            icon={Clock3}
            label="Updated At"
            value={formatDateTime(zerodose.updatedAt)}
          />
        </DetailSection>
      </div>
    </div>
  );
}

function DetailSection({ icon: Icon, title, description, children }) {
  return (
    <section className="border-border bg-background overflow-hidden rounded-2xl border shadow-sm">
      <div className="border-border flex items-center gap-3 border-b p-4 md:p-5">
        <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <h2 className="text-text font-semibold">{title}</h2>

          <p className="text-text-secondary mt-0.5 text-xs">{description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-4 md:grid-cols-2 md:p-5">
        {children}
      </div>
    </section>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="text-text-secondary flex items-center gap-1.5 text-xs">
        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}

        <span>{label}</span>
      </div>

      <p className="text-text mt-1.5 text-sm font-medium break-words">
        {value || "-"}
      </p>
    </div>
  );
}
