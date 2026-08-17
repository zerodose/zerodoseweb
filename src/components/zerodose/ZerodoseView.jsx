"use client";

import {
  User,
  Users,
  MapPin,
  CalendarDays,
  Phone,
  Map,
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

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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
  // Field
  // ============================================================

  const DetailField = ({ label, value, fullWidth = false }) => {
    return (
      <div className={fullWidth ? "md:col-span-2" : ""}>
        <label className="text-text-secondary mb-2 block text-xs font-medium">
          {label}
        </label>

        <div className="border-border bg-input-background text-text min-h-11 rounded-lg border px-3 py-2.5 text-sm">
          {value || "-"}
        </div>
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
  // Location
  // ============================================================

  const latitude = data.location?.latitude;
  const longitude = data.location?.longitude;

  // ============================================================
  // UI
  // ============================================================

  return (
    <div className="w-full">
      <div className="border-border bg-background overflow-hidden rounded-xl border shadow-sm">
        {/* ======================================================
            Assignment Information
        ====================================================== */}

        <div className="p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <Users size={20} />
            </div>

            <div>
              <h2 className="text-text font-semibold">
                Assignment Information
              </h2>

              <p className="text-text-secondary text-sm">
                Campaign and worker assignment details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <DetailField
              label="Campaign"
              value={getName(data.campaign)}
            />

            <DetailField
              label="District"
              value={getName(data.district)}
            />

            <DetailField
              label="Town"
              value={getName(data.town)}
            />

            <DetailField
              label="Union Council"
              value={getName(data.unionCouncil)}
            />

            <DetailField
              label="UCMO"
              value={getName(data.ucmo)}
            />

            <DetailField
              label="Supervisor"
              value={getName(data.supervisor)}
            />

            <DetailField
              label="User"
              value={getName(data.user)}
            />

            <DetailField
              label="Team Number"
              value={formatNumber(data.teamNumber)}
            />
          </div>
        </div>

        {/* ======================================================
            Child Information
        ====================================================== */}

        <div className="border-border border-t p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <User size={20} />
            </div>

            <div>
              <h2 className="text-text font-semibold">
                Child Information
              </h2>

              <p className="text-text-secondary text-sm">
                Zerodose child details.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <DetailField
              label="Child Name"
              value={data.childName}
            />

            <DetailField
              label="Father Name"
              value={data.fatherName}
            />

            <DetailField
              label="Age (In Month)"
              value={formatNumber(data.age)}
            />

            <DetailField
              label="Contact No"
              value={data.contactNo || "-"}
            />

            <DetailField
              label="Day"
              value={formatNumber(data.day)}
            />

            <DetailField
              label="Address"
              value={data.address}
              fullWidth
            />
          </div>
        </div>

        {/* ======================================================
            Status Information
        ====================================================== */}

        <div className="border-border border-t p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <CalendarDays size={20} />
            </div>

            <div>
              <h2 className="text-text font-semibold">
                Status Information
              </h2>

              <p className="text-text-secondary text-sm">
                Record, visit and vaccination status.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <DetailField
              label="Client Status"
              value={formatStatus(data.clientStatus)}
            />

            <DetailField
              label="Vaccination Status"
              value={formatStatus(data.vaccinationStatus)}
            />

            <DetailField
              label="Record Date"
              value={formatDate(data.recordDate)}
            />

            <DetailField
              label="Visit Date"
              value={formatDate(data.visitDate)}
            />

            <DetailField
              label="Covered Date"
              value={formatDate(data.coveredDate)}
            />
          </div>
        </div>

        {/* ======================================================
            Location Information
        ====================================================== */}

        <div className="border-border border-t p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <MapPin size={20} />
            </div>

            <div>
              <h2 className="text-text font-semibold">
                Location Information
              </h2>

              <p className="text-text-secondary text-sm">
                GPS coordinates of the Zerodose record.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <DetailField
              label="Latitude"
              value={formatNumber(latitude)}
            />

            <DetailField
              label="Longitude"
              value={formatNumber(longitude)}
            />
          </div>
        </div>

        {/* ======================================================
            Record Information
        ====================================================== */}

        <div className="border-border border-t p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <Map size={20} />
            </div>

            <div>
              <h2 className="text-text font-semibold">
                Record Information
              </h2>

              <p className="text-text-secondary text-sm">
                Zerodose record metadata.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <DetailField
              label="Zerodose ID"
              value={data._id}
            />

            <DetailField
              label="Created At"
              value={formatDate(data.createdAt)}
            />

            <DetailField
              label="Updated At"
              value={formatDate(data.updatedAt)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
