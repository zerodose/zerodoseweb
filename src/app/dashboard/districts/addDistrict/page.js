"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, MapPinned, Save } from "lucide-react";
import { toast } from "sonner";

import { createDistrict } from "@/api/districtApi";

export default function AddDistrictPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });

  const [loading, setLoading] = useState(false);

  // =====================================================
  // Handle Inputs
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

      console.log("Create District Payload:", payload);

      await createDistrict(payload);

      toast.success("District created successfully.");

      router.push("/dashboard/districts");
    } catch (error) {
      const status = error?.response?.status;

      const message =
        error?.response?.data?.message || "Failed to create district.";

      if (status === 409) {
        toast.error(message);
        return;
      }

      console.error("Create District error:", error);

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
            Add District
          </h1>

          <p className="text-text-secondary mt-1 text-sm">
            Create a new district in Zerodose.
          </p>
        </div>
      </div>

      {/* =====================================================
          Form Card
      ===================================================== */}

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
              <h2 className="text-text font-semibold">District Information</h2>

              <p className="text-text-secondary mt-0.5 text-xs">
                Enter district details below.
              </p>
            </div>
          </div>

          {/* =================================================
              Fields
          ================================================= */}

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
                disabled={loading}
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
                disabled={loading}
                className="bg-input-background text-text placeholder:text-input-placeholder border-border focus:border-primary focus:ring-primary-light w-full appearance-none rounded-xl border px-4 py-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
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
                  Create District
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
