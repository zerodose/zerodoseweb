"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { createTown } from "@/api/townApi";
import { getDistrictDropdown } from "@/api/districtApi";
import Select from "@/components/ui/Select";

export default function AddTownPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    district: "",
  });

  const [districts, setDistricts] = useState([]);

  const [loading, setLoading] = useState(false);
  const [districtLoading, setDistrictLoading] = useState(true);

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
  // Handle Change
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // Submit
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.name.trim()) {
      setError("Town name is required.");
      return;
    }

    if (!formData.district) {
      setError("Please select a district.");
      return;
    }

    try {
      setLoading(true);

      const response = await createTown({
        name: formData.name.trim(),
        district: formData.district,
      });

      setSuccess(response.message || "Town created successfully.");

      setFormData({
        name: "",
        district: "",
      });
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to create town.";

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
          <h1 className="text-3xl font-bold text-text">Add Town</h1>

          <p className="mt-2 text-sm text-text-secondary">
            Create a new town in Zerodose.
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
            {/* Town Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-text"
              >
                Town Name
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
                required
                disabled={loading}
                className="
                  h-12 w-full rounded-lg
                  border border-border
                  bg-input-background
                  px-4
                  text-sm text-text
                  outline-none
                  transition
                  placeholder:text-input-placeholder
                  focus:border-primary
                  focus:ring-2
                  focus:ring-primary-light
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
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
              disabled={loading || districtLoading}
              required
              options={districts.map((district) => ({
                value: district._id,
                label: district.name,
              }))}
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || districtLoading}
              className="
                h-12 w-full rounded-lg
                bg-primary
                px-4
                text-sm font-semibold
                text-primary-foreground
                transition
                hover:bg-primary-dark
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {loading ? "Creating Town..." : "Add Town"}
            </button>
          </form>
        </div>

        {/* Back */}
        <button
          type="button"
          disabled={loading}
          onClick={() => router.back()}
          className="
            mt-5 text-sm font-medium
            text-primary
            transition
            hover:text-primary-dark
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          ← Go Back
        </button>
      </div>
    </main>
  );
}
