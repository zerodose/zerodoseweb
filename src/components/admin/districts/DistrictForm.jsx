"use client";

import { useEffect, useState } from "react";
import { MapPinned, Save } from "lucide-react";
import { toast } from "sonner";

import {
  createDistrict,
  updateDistrict,
} from "@/api/districtApi";

export default function DistrictForm({
  mode = "add",
  district = null,
  onSuccess,
}) {
  const isView = mode === "view";
  const isEdit = mode === "edit";
  const isAdd = mode === "add";

  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!district) {
      return;
    }

    setFormData({
      name: district.name || "",
      code: district.code ?? "",
    });
  }, [district]);

  const handleChange = (event) => {
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

    if (!formData.name.trim()) {
      toast.error("Please enter district name.");
      return;
    }

    if (!formData.code) {
      toast.error("Please enter district code.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        code: Number(formData.code),
      };

      console.log(
        isEdit
          ? "Update District Payload:"
          : "Create District Payload:",
        payload,
      );

      if (isEdit) {
        await updateDistrict(district._id, payload);

        toast.success("District updated successfully.");
      } else {
        await createDistrict(payload);

        toast.success("District created successfully.");
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const status = error?.response?.status;

      const message =
        error?.response?.data?.message ||
        (isEdit
          ? "Failed to update district."
          : "Failed to create district.");

      if (status === 409) {
        toast.error(message);
        return;
      }

      console.error(
        isEdit ? "Update District error:" : "Create District error:",
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
        {/* Form Header */}
        <div className="border-border flex items-center gap-3 border-b p-5 sm:p-6">
          <div className="bg-primary-light flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
            <MapPinned className="text-primary h-5 w-5" />
          </div>

          <div>
            <h2 className="text-text font-semibold">
              District Information
            </h2>

            <p className="text-text-secondary mt-0.5 text-xs">
              {isView
                ? "View district details."
                : "Enter district details below."}
            </p>
          </div>
        </div>

        {/* Fields */}
        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-3 sm:p-6">
          {/* District Name */}
          <div>
            <label
              htmlFor="name"
              className="text-text mb-2 block text-sm font-medium"
            >
              District Name
              <span className="text-primary ml-1">*</span>
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter district name"
              minLength={2}
              maxLength={100}
              disabled={loading || isView}
              readOnly={isView}
              className="bg-input-background text-text placeholder:text-input-placeholder border-border focus:border-primary focus:ring-primary-light w-full rounded-xl border px-4 py-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* District Code */}
          <div>
            <label
              htmlFor="code"
              className="text-text mb-2 block text-sm font-medium"
            >
              District Code
              <span className="text-primary ml-1">*</span>
            </label>

            <input
              id="code"
              name="code"
              type="number"
              value={formData.code}
              onChange={handleChange}
              placeholder="Enter district code"
              disabled={loading || isView}
              readOnly={isView}
              className="bg-input-background text-text placeholder:text-input-placeholder border-border focus:border-primary focus:ring-primary-light w-full appearance-none rounded-xl border px-4 py-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* Footer */}
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

                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />

                  {isEdit
                    ? "Update District"
                    : "Create District"}
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}