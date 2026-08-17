"use client";

import { useEffect, useState } from "react";
import { MapPinned, Save } from "lucide-react";
import { toast } from "sonner";

import { createUnionCouncil, updateUnionCouncil } from "@/api/unionCouncilApi";

import { getDistrictDropdown } from "@/api/districtApi";
import { getTownDropdown } from "@/api/townApi";

import Select from "@/components/ui/Select";

export default function UnionCouncilForm({
  mode = "add",
  unionCouncil = null,
  onSuccess,
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    district: "",
    town: "",
  });

  const [districts, setDistricts] = useState([]);
  const [towns, setTowns] = useState([]);

  const [districtLoading, setDistrictLoading] = useState(true);
  const [townLoading, setTownLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // Load Districts
  // =====================================================

  useEffect(() => {
    const loadDistricts = async () => {
      try {
        setDistrictLoading(true);

        const response = await getDistrictDropdown();

        setDistricts(response?.data || []);
      } catch (error) {
        console.error("Get districts error:", error);

        toast.error(
          error?.response?.data?.message || "Failed to load districts.",
        );
      } finally {
        setDistrictLoading(false);
      }
    };

    loadDistricts();
  }, []);

  // =====================================================
  // Set Existing Data
  // =====================================================

  useEffect(() => {
    if (!unionCouncil) {
      return;
    }

    const district =
      typeof unionCouncil.district === "object"
        ? unionCouncil.district?._id
        : unionCouncil.district;

    const town =
      typeof unionCouncil.town === "object"
        ? unionCouncil.town?._id
        : unionCouncil.town;

    setFormData({
      name: unionCouncil.name || "",
      code:
        unionCouncil.code !== undefined && unionCouncil.code !== null
          ? String(unionCouncil.code)
          : "",
      district: district || "",
      town: town || "",
    });
  }, [unionCouncil]);

  // =====================================================
  // Load Towns
  // =====================================================

  useEffect(() => {
    const loadTowns = async () => {
      if (!formData.district) {
        setTowns([]);
        return;
      }

      try {
        setTownLoading(true);

        const response = await getTownDropdown(formData.district);

        setTowns(response?.data || []);
      } catch (error) {
        console.error("Get towns error:", error);

        setTowns([]);

        toast.error(error?.response?.data?.message || "Failed to load towns.");
      } finally {
        setTownLoading(false);
      }
    };

    loadTowns();
  }, [formData.district]);

  // =====================================================
  // Handle Change
  // =====================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,

      ...(name === "district"
        ? {
            town: "",
          }
        : {}),
    }));
  };

  // =====================================================
  // Submit
  // =====================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isView) {
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Please enter Union Council name.");
      return;
    }

    if (!formData.code) {
      toast.error("Please enter Union Council code.");
      return;
    }

    if (!formData.district) {
      toast.error("Please select district.");
      return;
    }

    if (!formData.town) {
      toast.error("Please select town.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        code: Number(formData.code),
        district: formData.district,
        town: formData.town,
      };

      console.log(
        isEdit
          ? "Update Union Council Payload:"
          : "Create Union Council Payload:",
        payload,
      );

      if (isEdit) {
        await updateUnionCouncil(unionCouncil._id, payload);

        toast.success("Union Council updated successfully.");
      } else {
        await createUnionCouncil(payload);

        toast.success("Union Council created successfully.");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const status = error?.response?.status;

      const message =
        error?.response?.data?.message ||
        `Failed to ${isEdit ? "update" : "create"} Union Council.`;

      if (status === 409) {
        toast.error(message);
        return;
      }

      console.error(
        `${isEdit ? "Update" : "Create"} Union Council error:`,
        error,
      );

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Loading State for View/Edit
  // =====================================================

  const isFormDisabled = loading || districtLoading || townLoading || isView;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="bg-background border-border rounded-2xl border shadow-sm">
      <form onSubmit={handleSubmit}>
        {/* =================================================
            Form Header
        ================================================= */}

        <div className="border-border flex items-center gap-3 border-b p-5 sm:p-6">
          <div className="bg-primary-light flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <MapPinned className="text-primary h-5 w-5" />
          </div>

          <div>
            <h2 className="text-text font-semibold">
              Union Council Information
            </h2>

            <p className="text-text-secondary mt-0.5 text-xs">
              {isView
                ? "View Union Council details."
                : "Enter Union Council details below."}
            </p>
          </div>
        </div>

        {/* =================================================
            Fields
        ================================================= */}

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
          {/* Union Council Name */}

          <div>
            <label
              htmlFor="name"
              className="text-text mb-2 block text-sm font-medium"
            >
              Union Council Name
              <span className="text-primary ml-1">*</span>
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter Union Council name"
              minLength={2}
              maxLength={100}
              required
              disabled={isFormDisabled}
              className="bg-input-background text-text placeholder:text-input-placeholder border-border focus:border-primary focus:ring-primary-light w-full rounded-xl border px-4 py-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Union Council Code */}

          <div>
            <label
              htmlFor="code"
              className="text-text mb-2 block text-sm font-medium"
            >
              Union Council Code
              <span className="text-primary ml-1">*</span>
            </label>

            <input
              id="code"
              name="code"
              type="number"
              value={formData.code}
              onChange={handleChange}
              placeholder="Enter Union Council code"
              required
              disabled={isFormDisabled}
              className="bg-input-background text-text placeholder:text-input-placeholder border-border focus:border-primary focus:ring-primary-light w-full appearance-none rounded-xl border px-4 py-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>

          {/* District */}

          <Select
            label="District"
            name="district"
            value={formData.district}
            onChange={handleChange}
            options={districts.map((district) => ({
              value: district._id,
              label: district.name,
            }))}
            placeholder={
              districtLoading ? "Loading districts..." : "Select district"
            }
            loading={districtLoading}
            disabled={isFormDisabled}
            required
          />

          {/* Town */}

          <Select
            label="Town"
            name="town"
            value={formData.town}
            onChange={handleChange}
            options={towns.map((town) => ({
              value: town._id,
              label: town.name,
            }))}
            placeholder={
              !formData.district
                ? "Select district first"
                : townLoading
                  ? "Loading towns..."
                  : "Select town"
            }
            loading={townLoading}
            disabled={isFormDisabled || !formData.district}
            required
          />
        </div>

        {/* =================================================
            Footer
        ================================================= */}

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
              disabled={loading || districtLoading || townLoading}
              className="bg-primary hover:bg-primary-dark text-primary-foreground inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />

                  {isEdit ? "Update Union Council" : "Create Union Council"}
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
