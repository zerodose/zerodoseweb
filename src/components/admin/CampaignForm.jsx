"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Save } from "lucide-react";
import { toast } from "sonner";

import Select from "@/components/ui/Select";
import { createCampaign, updateCampaign } from "@/api/campaignApi";

const CAMPAIGN_TYPES = [
  {
    value: "NID",
    label: "NID",
  },
  {
    value: "SNID",
    label: "SNID",
  },
];

const CAMPAIGN_SCOPES = [
  {
    value: "nationwide",
    label: "Nationwide",
  },
  {
    value: "high_risk_districts",
    label: "High Risk Districts",
  },
  {
    value: "sindh_karachi",
    label: "Sindh / Karachi",
  },
  {
    value: "karachi",
    label: "Karachi",
  },
];

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const CURRENT_YEAR = new Date().getFullYear();

const YEARS = Array.from({ length: 11 }, (_, index) => {
  const year = CURRENT_YEAR - 5 + index;

  return {
    value: year,
    label: String(year),
  };
});

const EMPTY_FORM = {
  name: "",
  scope: "",
  year: "",
  month: "",
  startDate: "",
  endDate: "",
  campaignStatus: "",
};

const formatDateForInput = (date) => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function CampaignForm({
  mode = "add",
  campaign = null,
  onSuccess,
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!campaign) {
      setFormData(EMPTY_FORM);
      return;
    }

    setFormData({
      name: campaign.name || "",
      scope: campaign.scope || "",
      year: campaign.year ? String(campaign.year) : "",
      month: campaign.month ? String(campaign.month) : "",
      startDate: formatDateForInput(campaign.startDate),
      endDate: formatDateForInput(campaign.endDate),
      campaignStatus: campaign.campaignStatus || "",
    });
  }, [campaign]);

  const handleInputChange = (event) => {
    if (isView) {
      return;
    }

    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSelectChange = (event) => {
    if (isView) {
      return;
    }

    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isView) {
      return;
    }

    if (!formData.name) {
      toast.error("Please select campaign type.");
      return;
    }

    if (!formData.scope) {
      toast.error("Please select campaign scope.");
      return;
    }

    if (!formData.year) {
      toast.error("Please select year.");
      return;
    }

    if (!formData.month) {
      toast.error("Please select month.");
      return;
    }

    if (!formData.startDate) {
      toast.error("Please select start date.");
      return;
    }

    if (!formData.endDate) {
      toast.error("Please select end date.");
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error("End date cannot be before start date.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        scope: formData.scope,
        year: Number(formData.year),
        month: Number(formData.month),
        startDate: formData.startDate,
        endDate: formData.endDate,
      };

      if (isAdd) {
        await createCampaign(payload);

        toast.success("Campaign created successfully.");
      }

      if (isEdit) {
        await updateCampaign(campaign._id, payload);

        toast.success("Campaign updated successfully.");
      }

      onSuccess?.();
    } catch (error) {
      const status = error?.response?.status;

      const message =
        error?.response?.data?.message ||
        `Failed to ${isAdd ? "create" : "update"} campaign.`;

      if (status === 409) {
        toast.error(message);
        return;
      }

      console.error("Campaign form error:", error);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month) => {
    return (
      MONTHS.find((item) => Number(item.value) === Number(month))?.label || "-"
    );
  };

  const getScopeName = (scope) => {
    return (
      CAMPAIGN_SCOPES.find((item) => item.value === scope)?.label ||
      scope ||
      "-"
    );
  };

  const getStatusName = (status) => {
    if (status === "current") {
      return "Current";
    }

    if (status === "upcoming") {
      return "Upcoming";
    }

    if (status === "previous") {
      return "Previous";
    }

    return "-";
  };

  return (
    <div className="bg-background border-border rounded-2xl border shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="border-border flex items-center gap-3 border-b p-5 sm:p-6">
          <div className="bg-primary-light flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <CalendarDays className="text-primary h-5 w-5" />
          </div>

          <div>
            <h2 className="text-text font-semibold">Campaign Information</h2>

            <p className="text-text-secondary mt-0.5 text-xs">
              {isView
                ? "View campaign details."
                : isEdit
                  ? "Update campaign details below."
                  : "Enter campaign details below."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-3 sm:p-6">
          {isView ? (
            <ReadOnlyField label="Campaign Type" value={formData.name || "-"} />
          ) : (
            <Select
              name="name"
              label="Campaign Type"
              value={formData.name}
              onChange={handleSelectChange}
              options={CAMPAIGN_TYPES}
              placeholder="Select campaign type"
              required
              disabled={loading}
            />
          )}

          {isView ? (
            <ReadOnlyField
              label="Campaign Scope"
              value={getScopeName(formData.scope)}
            />
          ) : (
            <Select
              name="scope"
              label="Campaign Scope"
              value={formData.scope}
              onChange={handleSelectChange}
              options={CAMPAIGN_SCOPES}
              placeholder="Select campaign scope"
              required
              disabled={loading}
            />
          )}

          {isView ? (
            <ReadOnlyField label="Year" value={formData.year || "-"} />
          ) : (
            <Select
              name="year"
              label="Year"
              value={formData.year}
              onChange={handleSelectChange}
              options={YEARS}
              placeholder="Select year"
              required
              disabled={loading}
            />
          )}

          {isView ? (
            <ReadOnlyField label="Month" value={getMonthName(formData.month)} />
          ) : (
            <Select
              name="month"
              label="Month"
              value={formData.month}
              onChange={handleSelectChange}
              options={MONTHS}
              placeholder="Select month"
              required
              disabled={loading}
            />
          )}

          {isView ? (
            <ReadOnlyField
              label="Start Date"
              value={formatDate(formData.startDate)}
            />
          ) : (
            <DateField
              label="Start Date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              disabled={loading}
            />
          )}

          {isView ? (
            <ReadOnlyField
              label="End Date"
              value={formatDate(formData.endDate)}
            />
          ) : (
            <DateField
              label="End Date"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              disabled={loading}
            />
          )}

          {isView && (
            <ReadOnlyField
              label="Campaign Status"
              value={getStatusName(formData.campaignStatus)}
            />
          )}
        </div>

        {!isView && (
          <div className="border-border flex flex-col-reverse gap-3 border-t p-5 sm:flex-row sm:justify-end sm:p-6">
            <button
              type="button"
              onClick={() => window.history.back()}
              disabled={loading}
              className="border-border bg-background text-text hover:bg-surface rounded-xl border px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="bg-primary hover:bg-primary-dark text-primary-foreground inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  {isAdd ? "Creating..." : "Updating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isAdd ? "Create Campaign" : "Update Campaign"}
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div>
      <label className="text-text mb-2 block text-sm font-medium">
        {label}
      </label>

      <div className="bg-input-background border-border text-text rounded-xl border px-4 py-3 text-sm">
        {value}
      </div>
    </div>
  );
}

function DateField({ label, name, value, onChange, disabled }) {
  return (
    <div>
      <label
        htmlFor={name}
        className="text-text mb-2 block text-sm font-medium"
      >
        {label}
        <span className="text-primary ml-1">*</span>
      </label>

      <input
        id={name}
        name={name}
        type="date"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="bg-input-background text-text placeholder:text-input-placeholder border-border focus:border-primary focus:ring-primary-light w-full rounded-xl border px-4 py-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}

function formatDate(date) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
