"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createUnionCouncil } from "@/api/unionCouncilApi";
import { getDistrictDropdown } from "@/api/districtApi";
import { getTownDropdown } from "@/api/townApi";
import Select from "@/components/ui/Select";

export default function AddUnionCouncilPage() {
  const router = useRouter();

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

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // Load Districts
  // =====================================================

  useEffect(() => {
    const loadDistricts = async () => {
      try {
        setDistrictLoading(true);

        const response = await getDistrictDropdown();

        setDistricts(response.data || []);
      } catch (error) {
        console.error("Get districts error:", error);

        setError(error?.response?.data?.message || "Failed to load districts.");
      } finally {
        setDistrictLoading(false);
      }
    };

    loadDistricts();
  }, []);

  // =====================================================
  // Load Towns when District changes
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

        setTowns(response.data || []);
      } catch (error) {
        console.error("Get towns error:", error);

        setTowns([]);

        setError(error?.response?.data?.message || "Failed to load towns.");
      } finally {
        setTownLoading(false);
      }
    };

    loadTowns();
  }, [formData.district]);

  // =====================================================
  // Handle Change
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setError("");
    setSuccess("");

    setFormData((prev) => ({
      ...prev,
      [name]: value,

      // Reset Town when District changes
      ...(name === "district" ? { town: "" } : {}),
    }));
  };

  // =====================================================
  // Submit
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Union Council name is required.");
      return;
    }

    if (!formData.code) {
      setError("Union Council code is required.");
      return;
    }

    if (!formData.district) {
      setError("Please select a district.");
      return;
    }

    if (!formData.town) {
      setError("Please select a town.");
      return;
    }

    try {
      setLoading(true);

      const response = await createUnionCouncil({
        name: formData.name.trim(),
        code: Number(formData.code),
        district: formData.district,
        town: formData.town,
      });

      setSuccess(response.message || "Union Council created successfully.");

      setFormData({
        name: "",
        code: "",
        district: "",
        town: "",
      });

      setTowns([]);
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to create Union Council.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface px-4 py-10">
      <div className="mx-auto w-full max-w-xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">Add Union Council</h1>

          <p className="mt-2 text-sm text-text-secondary">
            Create a new Union Council in Zerodose.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">
          {/* Error */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Union Council Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-text"
              >
                Union Council Name
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
                disabled={loading}
                className="w-full rounded-lg border border-border bg-input-background px-4 py-3 text-sm text-text outline-none transition placeholder:text-input-placeholder focus:border-primary focus:ring-2 focus:ring-primary-light disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            {/* Union Council Code */}
            <div>
              <label
                htmlFor="code"
                className="mb-2 block text-sm font-medium text-text"
              >
                Union Council Code
              </label>

              <input
                id="code"
                name="code"
                type="number"
                value={formData.code}
                onChange={handleChange}
                placeholder="Enter Union Council code"
                required
                disabled={loading}
                className="w-full appearance-none rounded-lg border border-border bg-input-background px-4 py-3 text-sm text-text outline-none transition placeholder:text-input-placeholder focus:border-primary focus:ring-2 focus:ring-primary-light disabled:cursor-not-allowed disabled:opacity-60 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
              placeholder="Select district"
              loading={districtLoading}
              disabled={loading}
              required
              error={
                !formData.district && error ? "Please select a district." : ""
              }
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
                !formData.district ? "Select district first" : "Select town"
              }
              loading={townLoading}
              disabled={loading || !formData.district}
              required
              error={!formData.town && error ? "Please select a town." : ""}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || districtLoading || townLoading}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating Union Council..." : "Add Union Council"}
            </button>
          </form>
        </div>

        {/* Back */}
        <button
          type="button"
          disabled={loading}
          onClick={() => router.back()}
          className="mt-5 text-sm font-medium text-primary transition hover:text-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          ← Go Back
        </button>
      </div>
    </main>
  );
}
