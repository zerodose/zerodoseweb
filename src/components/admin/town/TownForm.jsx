"use client";

import { useEffect, useState } from "react";
import { MapPinned, Save } from "lucide-react";
import { toast } from "sonner";

import { createTown, updateTown } from "@/api/townApi";

import { getDistrictDropdown } from "@/api/districtApi";
import Select from "@/components/ui/Select";

export default function TownForm({ mode = "add", town = null, onSuccess }) {
  const isView = mode === "view";
  const isEdit = mode === "edit";

  const [formData, setFormData] = useState({
    name: "",
    district: "",
  });

  const [districts, setDistricts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [districtLoading, setDistrictLoading] = useState(true);

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
  // Load Town Data
  // =====================================================

  useEffect(() => {
    if (!town) {
      return;
    }

    setFormData({
      name: town.name || "",
      district:
        typeof town.district === "object"
          ? town.district?._id || ""
          : town.district || "",
    });
  }, [town]);

  // =====================================================
  // Handle Change
  // =====================================================

  const handleChange = (event) => {
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

    if (isView) {
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Please enter town name.");
      return;
    }

    if (!formData.district) {
      toast.error("Please select district.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        district: formData.district,
      };

      console.log(
        isEdit ? "Update Town Payload:" : "Create Town Payload:",
        payload,
      );

      if (isEdit) {
        await updateTown(town._id, payload);

        toast.success("Town updated successfully.");
      } else {
        await createTown(payload);

        toast.success("Town created successfully.");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const status = error?.response?.status;

      const message =
        error?.response?.data?.message ||
        (isEdit ? "Failed to update town." : "Failed to create town.");

      if (status === 409) {
        toast.error(message);
        return;
      }

      console.error(
        isEdit ? "Update Town error:" : "Create Town error:",
        error,
      );

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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
            <h2 className="text-text font-semibold">Town Information</h2>

            <p className="text-text-secondary mt-0.5 text-xs">
              {isView ? "View town details." : "Enter town details below."}
            </p>
          </div>
        </div>

        {/* =================================================
            Fields
        ================================================= */}

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-3 sm:p-6">
          {/* Town Name */}

          <div>
            <label
              htmlFor="name"
              className="text-text mb-2 block text-sm font-medium"
            >
              Town Name
              <span className="text-primary ml-1">*</span>
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter town name"
              minLength={2}
              maxLength={100}
              disabled={loading || isView}
              readOnly={isView}
              className="bg-input-background text-text placeholder:text-input-placeholder border-border focus:border-primary focus:ring-primary-light w-full rounded-xl border px-4 py-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* District */}

          <Select
            label="District"
            name="district"
            value={formData.district}
            onChange={handleChange}
            placeholder={
              districtLoading ? "Loading districts..." : "Select district"
            }
            disabled={loading || districtLoading || isView}
            required
            options={districts.map((district) => ({
              value: district._id,
              label: district.name,
            }))}
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
              disabled={loading || districtLoading}
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

                  {isEdit ? "Update Town" : "Create Town"}
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
