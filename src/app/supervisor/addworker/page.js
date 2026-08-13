"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Users, Phone, Hash, ShieldCheck } from "lucide-react";

export default function Page() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    contactNumber: "",
    teamNumber: "",
    workerRole: "",
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
      setError("Worker name is required.");
      return;
    }

    if (!formData.contactNumber.trim()) {
      setError("Contact number is required.");
      return;
    }

    if (!/^03\d{9}$/.test(formData.contactNumber.trim())) {
      setError("Please enter a valid Pakistani mobile number.");
      return;
    }

    if (!formData.teamNumber) {
      setError("Team number is required.");
      return;
    }

    if (!formData.workerRole) {
      setError("Please select worker role.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/supervisor/workers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          contactNumber: formData.contactNumber.trim(),
          teamNumber: Number(formData.teamNumber),
          workerRole: formData.workerRole,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to add worker.");
      }

      setSuccess("Worker added successfully.");

      setFormData({
        name: "",
        contactNumber: "",
        teamNumber: "",
        workerRole: "",
      });

      setTimeout(() => {
        router.push("/supervisor");
      }, 1000);
    } catch (error) {
      setError(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-7">
        <div className="mb-3 flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex h-11 w-11 items-center justify-center rounded-xl">
            <UserPlus size={21} />
          </div>

          <div>
            <h1 className="text-text text-2xl font-bold md:text-3xl">
              Add Worker
            </h1>

            <p className="text-text-secondary mt-1 text-sm">
              Add a new worker to your team
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-3xl">
        <div className="bg-surface border-border rounded-2xl border p-5 md:p-6">
          <form onSubmit={handleSubmit}>
            {/* Worker Information */}
            <div className="mb-6">
              <div className="mb-4 flex items-center gap-2">
                <Users size={18} className="text-primary" />

                <h2 className="text-text text-base font-semibold">
                  Worker Information
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="text-text mb-1.5 block text-sm font-medium"
                  >
                    Worker Name
                    <span className="text-red-500"> *</span>
                  </label>

                  <div className="relative">
                    <UserPlus
                      size={17}
                      className="text-text-secondary absolute top-1/2 left-3 -translate-y-1/2"
                    />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter worker name"
                      className="bg-background border-border text-text placeholder:text-text-secondary focus:border-primary focus:ring-primary/20 h-11 w-full rounded-lg border pr-3 pl-10 text-sm transition outline-none focus:ring-2"
                    />
                  </div>
                </div>

                {/* Contact */}
                <div>
                  <label
                    htmlFor="contactNumber"
                    className="text-text mb-1.5 block text-sm font-medium"
                  >
                    Contact Number
                    <span className="text-red-500"> *</span>
                  </label>

                  <div className="relative">
                    <Phone
                      size={17}
                      className="text-text-secondary absolute top-1/2 left-3 -translate-y-1/2"
                    />

                    <input
                      id="contactNumber"
                      name="contactNumber"
                      type="tel"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="03XXXXXXXXX"
                      maxLength={11}
                      className="bg-background border-border text-text placeholder:text-text-secondary focus:border-primary focus:ring-primary/20 h-11 w-full rounded-lg border pr-3 pl-10 text-sm transition outline-none focus:ring-2"
                    />
                  </div>

                  <p className="text-text-secondary mt-1 text-[11px]">
                    Example: 03001234567
                  </p>
                </div>

                {/* Team Number */}
                <div>
                  <label
                    htmlFor="teamNumber"
                    className="text-text mb-1.5 block text-sm font-medium"
                  >
                    Team Number
                    <span className="text-red-500"> *</span>
                  </label>

                  <div className="relative">
                    <Hash
                      size={17}
                      className="text-text-secondary absolute top-1/2 left-3 -translate-y-1/2"
                    />

                    <input
                      id="teamNumber"
                      name="teamNumber"
                      type="number"
                      min="1"
                      value={formData.teamNumber}
                      onChange={handleChange}
                      placeholder="Enter team number"
                      className="bg-background border-border text-text placeholder:text-text-secondary focus:border-primary focus:ring-primary/20 h-11 w-full rounded-lg border pr-3 pl-10 text-sm transition outline-none focus:ring-2"
                    />
                  </div>
                </div>

                {/* Worker Role */}
                <div>
                  <label
                    htmlFor="workerRole"
                    className="text-text mb-1.5 block text-sm font-medium"
                  >
                    Team Role
                    <span className="text-red-500"> *</span>
                  </label>

                  <div className="relative">
                    <ShieldCheck
                      size={17}
                      className="text-text-secondary absolute top-1/2 left-3 -translate-y-1/2"
                    />

                    <select
                      id="workerRole"
                      name="workerRole"
                      value={formData.workerRole}
                      onChange={handleChange}
                      className="bg-background border-border text-text focus:border-primary focus:ring-primary/20 h-11 w-full appearance-none rounded-lg border pr-3 pl-10 text-sm transition outline-none focus:ring-2"
                    >
                      <option value="">Select team role</option>

                      <option value="teamLeader">Team Leader</option>

                      <option value="teamMember">Team Member</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Auto Assigned Information */}
            <div className="bg-primary/5 border-primary/10 mb-6 rounded-xl border p-4">
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck size={17} className="text-primary" />

                <p className="text-text text-sm font-semibold">
                  Automatically Assigned
                </p>
              </div>

              <p className="text-text-secondary text-xs leading-5">
                District, Town, Union Council, UCMO and Supervisor will
                automatically be assigned according to your current supervisor
                account. The worker designation will also be assigned
                automatically.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                {success}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading}
                className="border-border text-text hover:bg-background h-11 rounded-lg border px-5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-primary hover:bg-primary/90 flex h-11 items-center justify-center gap-2 rounded-lg px-6 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                <UserPlus size={17} />

                {loading ? "Adding Worker..." : "Add Worker"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
