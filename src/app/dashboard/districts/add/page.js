"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createDistrict } from "@/api/districtApi";

export default function AddDistrictPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    code: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("District name is required.");
      return;
    }

    if (!formData.code) {
      setError("District code is required.");
      return;
    }

    try {
      setLoading(true);

      const response = await createDistrict({
        name: formData.name.trim(),
        code: Number(formData.code),
      });

      setSuccess(response.message || "District created successfully.");

      setFormData({
        name: "",
        code: "",
      });
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to create district.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface px-4 py-10">
      <div className="mx-auto w-full max-w-xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">Add District</h1>

          <p className="mt-2 text-sm text-text-secondary">
            Create a new district in Zerodose.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* District Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-text"
              >
                District Name
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
                required
                disabled={loading}
                className="w-full rounded-lg border border-border bg-input-background px-4 py-3 text-sm text-text outline-none transition placeholder:text-input-placeholder focus:border-primary focus:ring-2 focus:ring-primary-light disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* District Code */}
            <div>
              <label
                htmlFor="code"
                className="mb-2 block text-sm font-medium text-text"
              >
                District Code
              </label>

              <input
                id="code"
                name="code"
                type="number"
                value={formData.code}
                onChange={handleChange}
                placeholder="Enter district code"
                required
                disabled={loading}
                className="w-full appearance-none rounded-lg border border-border bg-input-background px-4 py-3 text-sm text-text outline-none transition placeholder:text-input-placeholder focus:border-primary focus:ring-2 focus:ring-primary-light disabled:cursor-not-allowed disabled:opacity-60 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating District..." : "Add District"}
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => router.back()}
          className="mt-5 text-sm font-medium text-primary transition hover:text-primary-dark"
        >
          ← Go Back
        </button>
      </div>
    </main>
  );
}
