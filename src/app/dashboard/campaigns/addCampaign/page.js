"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarDays, Save } from "lucide-react";
import { toast } from "sonner";

import { createCampaign } from "@/api/campaignApi";
import Select from "@/components/ui/Select";

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

export default function AddCampaignPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    year: "",
    month: "",
    startDate: "",
    // endDate: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);

  // =====================================================
  // Handle Normal Inputs
  // =====================================================

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // Handle Select
  // =====================================================

  const handleSelectChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // Submit
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.name) {
      toast.error("Please select campaign type.");
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

    // if (!formData.endDate) {
    //   toast.error("Please select end date.");
    //   return;
    // }

    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        year: Number(formData.year),
        month: Number(formData.month),
        startDate: formData.startDate,
        // endDate: formData.endDate,
        isActive: formData.isActive,
      };

      console.log("Create Campaign Payload:", payload);

      await createCampaign(payload);

      toast.success("Campaign created successfully.");

      router.push("/dashboard/campaigns");
    } catch (error) {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message || "Failed to create campaign.";

      if (status === 409) {
        toast.error(message);
        return;
      }

      console.error("Create campaign error:", error);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* =====================================================
          Header
      ===================================================== */}

      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="bg-background border-border text-icon hover:bg-surface flex h-10 w-10 items-center justify-center rounded-xl border transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-text text-xl font-bold sm:text-2xl">
            Add Campaign
          </h1>

          <p className="text-text-secondary mt-1 text-sm">
            Create a new NID or SNID campaign.
          </p>
        </div>
      </div>

      {/* =====================================================
          Form Card
      ===================================================== */}

      <div className="bg-background border-border rounded-2xl border shadow-sm ">
        <form onSubmit={handleSubmit}>
          {/* =================================================
              Form Header
          ================================================= */}

          <div className="border-border flex items-center gap-3 border-b p-5 sm:p-6">
            <div className="bg-primary-light flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
              <CalendarDays className="text-primary h-5 w-5" />
            </div>

            <div>
              <h2 className="text-text font-semibold">Campaign Information</h2>

              <p className="text-text-secondary mt-0.5 text-xs">
                Enter campaign details below.
              </p>
            </div>
          </div>

          {/* =================================================
              Fields
          ================================================= */}

          <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-3 sm:p-6">
            {/* Campaign Type */}

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

            {/* Year */}

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

            {/* Month */}

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

            {/* Start Date */}

            <div>
              <label
                htmlFor="startDate"
                className="text-text mb-2 block text-sm font-medium"
              >
                Start Date
                <span className="text-primary ml-1">*</span>
              </label>

              <input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                disabled={loading}
                className="bg-input-background text-text placeholder:text-input-placeholder border-border focus:border-primary focus:ring-primary-light w-full rounded-xl border px-4 py-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* End Date */}

            {/* <div>
              <label
                htmlFor="endDate"
                className="text-text mb-2 block text-sm font-medium"
              >
                End Date
                <span className="text-primary ml-1">*</span>
              </label>

              <input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleInputChange}
                disabled={loading}
                className="bg-input-background text-text placeholder:text-input-placeholder border-border focus:border-primary focus:ring-primary-light w-full rounded-xl border px-4 py-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div> */}

            {/* Active Status */}

            <div>
              <label className="text-text mb-2 block text-sm font-medium">
                Status
              </label>

              <button
                type="button"
                disabled={loading}
                onClick={() =>
                  setFormData((previous) => ({
                    ...previous,
                    isActive: !previous.isActive,
                  }))
                }
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                  formData.isActive
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border bg-input-background text-text-secondary"
                }`}
              >
                <span>{formData.isActive ? "Active" : "Inactive"}</span>

                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    formData.isActive ? "bg-primary" : "bg-gray"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* =================================================
              Footer
          ================================================= */}

          <div className="border-border flex flex-col-reverse gap-3 border-t p-5 sm:flex-row sm:justify-end sm:p-6">
            <button
              type="button"
              onClick={() => router.back()}
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
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Campaign
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
