"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { UserPlus, Users, Phone, Hash, ShieldCheck } from "lucide-react";
import { createWorker } from "@/api/supervisorApi";
import Select from "@/components/ui/Select";
import ClientPageHeader from "@/components/ui/ClientPageHeader";

export default function Page() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      contactNumber: "",
      teamNumber: "",
      workerRole: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await createWorker({
        name: data.name.trim(),
        contactNumber: data.contactNumber.trim(),
        teamNumber: Number(data.teamNumber),
        workerRole: data.workerRole,
      });

      setSuccess(response.message || "Worker added successfully.");

      reset();

      // Route change intentionally removed.
      // Page isi screen par rahega.
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* =====================================================
          Header
      ===================================================== */}
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <ClientPageHeader
          title={"Add Worker"}
          description={"Add a worker to your team."}
          onBack={() => router.back()}
        />
      </div>
      {/* =====================================================
          Form
      ===================================================== */}

      <div className="bg-surface mx-auto max-w-7xl">
        <div className="border-border rounded-2xl border p-5 md:p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* =================================================
                Worker Information
            ================================================= */}

            <div className="mb-6">
              <div className="mb-4 flex items-center gap-2">
                <Users size={18} className="text-primary" />

                <h2 className="text-text text-base font-semibold">
                  Worker Information
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* =================================================
                    Worker Name
                ================================================= */}

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
                      type="text"
                      placeholder="Enter worker name"
                      disabled={loading}
                      {...register("name", {
                        required: "Worker name is required.",
                        minLength: {
                          value: 2,
                          message: "Name must be at least 2 characters.",
                        },
                      })}
                      className="bg-background border-border text-text placeholder:text-text-secondary focus:border-primary focus:ring-primary/20 h-11 w-full rounded-lg border pr-3 pl-10 text-sm transition outline-none focus:ring-2"
                    />
                  </div>

                  {errors.name && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* =================================================
                    Contact Number
                ================================================= */}

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
                      type="tel"
                      placeholder="03XXXXXXXXX"
                      maxLength={11}
                      disabled={loading}
                      {...register("contactNumber", {
                        required: "Contact number is required.",
                        pattern: {
                          value: /^03\d{9}$/,
                          message:
                            "Please enter a valid Pakistani mobile number.",
                        },
                      })}
                      className="bg-background border-border text-text placeholder:text-text-secondary focus:border-primary focus:ring-primary/20 h-11 w-full rounded-lg border pr-3 pl-10 text-sm transition outline-none focus:ring-2"
                    />
                  </div>

                  {errors.contactNumber && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.contactNumber.message}
                    </p>
                  )}
                </div>

                {/* =================================================
                    Team Number
                ================================================= */}

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
                      type="number"
                      min="1"
                      placeholder="Enter team number"
                      disabled={loading}
                      {...register("teamNumber", {
                        required: "Team number is required.",
                        min: {
                          value: 1,
                          message: "Team number must be at least 1.",
                        },
                        valueAsNumber: true,
                      })}
                      className="bg-background border-border text-text placeholder:text-text-secondary focus:border-primary focus:ring-primary/20 h-11 w-full rounded-lg border pr-3 pl-10 text-sm transition outline-none focus:ring-2"
                    />
                  </div>

                  {errors.teamNumber && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.teamNumber.message}
                    </p>
                  )}
                </div>

                {/* =================================================
                    Worker Role
                ================================================= */}

                <div>
                  <Controller
                    name="workerRole"
                    control={control}
                    rules={{
                      required: "Please select a team role.",
                    }}
                    render={({ field }) => (
                      <Select
                        label="Team Role"
                        name={field.name}
                        value={field.value}
                        onChange={(e) => field.onChange(e)}
                        options={[
                          {
                            value: "teamLeader",
                            label: "Team Leader",
                          },
                          {
                            value: "teamMember",
                            label: "Team Member",
                          },
                        ]}
                        placeholder="Select team role"
                        disabled={loading}
                        required
                      />
                    )}
                  />

                  {errors.workerRole && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.workerRole.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* =====================================================
                Automatically Assigned
            ===================================================== */}

            <div className="bg-primary/5 border-primary/10 mb-6 rounded-xl border p-4">
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck size={17} className="text-primary" />

                <p className="text-text text-sm font-semibold">
                  Automatically Assigned
                </p>
              </div>

              <p className="text-text-secondary text-xs leading-5">
                District, Town, Union Council, UCMO and Supervisor will be
                automatically assigned according to your account. Worker
                designation will also be assigned automatically.
              </p>
            </div>

            {/* =====================================================
                Error
            ===================================================== */}

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* =====================================================
                Success
            ===================================================== */}

            {success && (
              <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-600">
                {success}
              </div>
            )}

            {/* =====================================================
                Buttons
            ===================================================== */}

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
