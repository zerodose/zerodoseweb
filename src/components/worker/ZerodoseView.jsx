
"use client";

import {
  AlertCircle,
  Baby,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Hash,
  Map,
  MapPin,
  Navigation,
  Phone,
  Syringe,
  User,
  Users,
} from "lucide-react";

export default function ZerodoseView({ data }) {
  // ============================================================
  // Helpers
  // ============================================================

  const getName = (value) => {
    if (!value) {
      return "-";
    }

    if (typeof value === "object") {
      return (
        value.name ||
        value.fullName ||
        value.label ||
        value.title ||
        "-"
      );
    }

    return String(value);
  };

  const formatDateTime = (date) => {
    if (!date) {
      return "-";
    }

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

  const formatStatus = (value) => {
    if (!value) {
      return "-";
    }

    return String(value)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatNumber = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    return String(value);
  };

  // ============================================================
  // Vaccination Status
  // ============================================================

  const getVaccinationStatus = () => {
    if (data?.vaccinationStatus === "covered") {
      return {
        label: "Covered",
        className:
          "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
      };
    }

    if (data?.vaccinationStatus === "visited") {
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
  // Detail Section
  // ============================================================

  const DetailSection = ({
    icon: Icon,
    title,
    description,
    children,
  }) => {
    return (
      <section className="border-border bg-background overflow-hidden rounded-2xl border shadow-sm">
        {/* Section Header */}

        <div className="border-border flex items-center gap-3 border-b p-4 md:p-5">
          <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2 className="text-text font-semibold">{title}</h2>

            <p className="text-text-secondary mt-0.5 text-xs">
              {description}
            </p>
          </div>
        </div>

        {/* Fields */}

        <div className="grid grid-cols-2 gap-x-10 gap-y-6 p-4 md:grid-cols-2 md:p-5">
          {children}
        </div>
      </section>
    );
  };

  // ============================================================
  // Detail Item
  // ============================================================

  const DetailItem = ({ icon: Icon, label, value }) => {
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
  };

  // ============================================================
  // No Data
  // ============================================================

  if (!data) {
    return null;
  }

  // ============================================================
  // Status
  // ============================================================

  const status = getVaccinationStatus();

  // ============================================================
  // Location
  // ============================================================

  const latitude = data.location?.latitude;
  const longitude = data.location?.longitude;

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="space-y-5">
      {/* ========================================================
          Summary
      ======================================================== */}

      <div className="border-border bg-background rounded-2xl border shadow-sm">
        <div className="flex items-center justify-between p-5 md:p-6">
          <div className="flex min-w-0 items-start gap-4">
            <div className="bg-primary/10 text-primary flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl">
              <Syringe className="h-7 w-7" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-text text-xl font-semibold">
                  {data.childName || "-"}
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
        </div>
      </div>

      {/* ========================================================
          Child Information
      ======================================================== */}

      <DetailSection
        icon={Baby}
        title="Child Information"
        description="Basic information about the child."
      >
        <DetailItem
          icon={User}
          label="Child Name"
          value={data.childName}
        />

        <DetailItem
          icon={User}
          label="Father Name"
          value={data.fatherName}
        />

        <DetailItem
          icon={Baby}
          label="Age (In Month)"
          value={`${formatNumber(data.age)} ${
            data.age !== null &&
            data.age !== undefined &&
            data.age !== ""
              ? "months"
              : ""
          }`}
        />

        <DetailItem
          icon={Phone}
          label="Contact No"
          value={data.contactNo || "-"}
        />

        <DetailItem
          icon={Hash}
          label="Day"
          value={data.day != null ? `Day ${data.day}` : "-"}
        />

        <DetailItem
          icon={MapPin}
          label="Address"
          value={data.address}
        />
      </DetailSection>

      {/* ========================================================
          Campaign Information
      ======================================================== */}

      <DetailSection
        icon={CalendarDays}
        title="Campaign Information"
        description="Campaign and recording information."
      >
        <DetailItem
          icon={CalendarDays}
          label="Campaign"
          value={getName(data.campaign)}
        />

        <DetailItem
          icon={Hash}
          label="Campaign Day"
          value={data.day != null ? `Day ${data.day}` : "-"}
        />

        <DetailItem
          icon={Clock3}
          label="Record Date"
          value={formatDateTime(data.recordDate)}
        />

        <DetailItem
          icon={CalendarDays}
          label="Visit Date"
          value={formatDateTime(data.visitDate)}
        />

        <DetailItem
          icon={CheckCircle2}
          label="Covered Date"
          value={formatDateTime(data.coveredDate)}
        />

        <DetailItem
          icon={Syringe}
          label="Vaccination Status"
          value={status.label}
        />

        <DetailItem
          icon={AlertCircle}
          label="Client Status"
          value={formatStatus(data.clientStatus)}
        />
      </DetailSection>

      {/* ========================================================
          Assignment Information
      ======================================================== */}

      <DetailSection
        icon={Users}
        title="Assignment Information"
        description="Administrative and team assignment details."
      >
        <DetailItem
          icon={Map}
          label="District"
          value={getName(data.district)}
        />

        <DetailItem
          icon={Map}
          label="Town"
          value={getName(data.town)}
        />

        <DetailItem
          icon={MapPin}
          label="Union Council"
          value={getName(data.unionCouncil)}
        />

        <DetailItem
          icon={User}
          label="UCMO"
          value={getName(data.ucmo)}
        />

        <DetailItem
          icon={User}
          label="Supervisor"
          value={getName(data.supervisor)}
        />

        <DetailItem
          icon={Users}
          label="Team Number"
          value={formatNumber(data.teamNumber)}
        />

        <DetailItem
          icon={User}
          label="User"
          value={getName(data.user)}
        />
      </DetailSection>

      {/* ========================================================
          Location
      ======================================================== */}

      <DetailSection
        icon={Navigation}
        title="Location"
        description="GPS location captured when the Zerodose was recorded."
      >
        <DetailItem
          icon={MapPin}
          label="Latitude"
          value={formatNumber(latitude)}
        />

        <DetailItem
          icon={MapPin}
          label="Longitude"
          value={formatNumber(longitude)}
        />

        {latitude != null && longitude != null && (
          <div className="col-span-2">
            <a
              href={`https://www.google.com/maps?q=${latitude},${longitude}`}
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

      {/* ========================================================
          Record Information
      ======================================================== */}

      <DetailSection
        icon={Clock3}
        title="Record Information"
        description="Zerodose record metadata."
      >
        <DetailItem
          icon={Hash}
          label="Zerodose ID"
          value={data._id}
        />

        <DetailItem
          icon={CalendarDays}
          label="Created At"
          value={formatDateTime(data.createdAt)}
        />

        <DetailItem
          icon={Clock3}
          label="Updated At"
          value={formatDateTime(data.updatedAt)}
        />
      </DetailSection>
    </div>
  );
}