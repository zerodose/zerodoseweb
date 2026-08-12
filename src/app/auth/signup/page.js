"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import Select from "@/components/ui/Select";
import Loader from "@/components/ui/Loader";
import VerifyEmailModal from "@/components/auth/VerifyEmailModal";

import { getDistrictDropdown } from "@/api/districtApi";
import { getTownDropdown } from "@/api/townApi";
import { getUnionCouncilDropdown } from "@/api/unionCouncilApi";
import { createUser } from "@/api/userApi";

import {
  verifyEmail,
  resendVerification,
} from "@/api/authApi";

export default function SignupPage() {
  const router = useRouter();

  // =====================================================
  // Designations
  // =====================================================

  const DESIGNATIONS = [
    { value: "ucmo", label: "UCMO" },
    { value: "supervisor", label: "Supervisor" },
    { value: "vaccinator", label: "Vaccinator" },
    { value: "otherStaff", label: "Other Staff" },
    { value: "admin", label: "Admin" },
    // { value: "worker", label: "Worker" },
  ];

  // =====================================================
  // Dashboard Routes
  // =====================================================

  const dashboardRoutes = {
    admin: "/dashboard",
    worker: "/worker",
    supervisor: "/supervisor",
    ucmo: "/ucmo",
    otherStaff: "/otherStaff",
    vaccinator: "/vaccinator",
  };

  // =====================================================
  // React Hook Form
  // =====================================================

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm({
    mode: "onBlur",
    reValidateMode: "onChange",

    defaultValues: {
      name: "",
      email: "",
      contactNumber: "",
      district: "",
      town: "",
      unionCouncil: "",
      designation: "",
      supervisorCode: "",
      password: "",
      confirmPassword: "",
    },
  });

  // =====================================================
  // Watched Values
  // =====================================================

  const selectedDistrict = watch("district");
  const selectedTown = watch("town");
  const selectedDesignation = watch("designation");
  const password = watch("password");

  const isSupervisor =
    selectedDesignation === "supervisor";

  // =====================================================
  // Dropdown Data
  // =====================================================

  const [districts, setDistricts] = useState([]);
  const [towns, setTowns] = useState([]);
  const [unionCouncils, setUnionCouncils] = useState([]);

  // =====================================================
  // Dropdown Loading
  // =====================================================

  const [districtLoading, setDistrictLoading] = useState(true);
  const [townLoading, setTownLoading] = useState(false);
  const [ucLoading, setUcLoading] = useState(false);

  // =====================================================
  // Form Loading
  // =====================================================

  const [loading, setLoading] = useState(false);

  // =====================================================
  // Verification Modal
  // =====================================================

  const [showVerifyModal, setShowVerifyModal] =
    useState(false);

  const [verificationEmail, setVerificationEmail] =
    useState("");

  const [verificationLoading, setVerificationLoading] =
    useState(false);

  const [verificationError, setVerificationError] =
    useState("");

  const [resendLoading, setResendLoading] =
    useState(false);

  // =====================================================
  // Password Visibility
  // =====================================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  // =====================================================
  // Load Districts
  // =====================================================

  useEffect(() => {
    const loadDistricts = async () => {
      try {
        setDistrictLoading(true);

        const response =
          await getDistrictDropdown();

        setDistricts(response?.data || []);
      } catch (error) {
        console.error(
          "Get districts error:",
          error,
        );

        setDistricts([]);

        toast.error("Failed to load districts", {
          description:
            error?.response?.data?.message ||
            error?.message ||
            "Please try again.",
        });
      } finally {
        setDistrictLoading(false);
      }
    };

    loadDistricts();
  }, []);

  // =====================================================
  // Load Towns When District Changes
  // =====================================================

  useEffect(() => {
    const loadTowns = async () => {
      if (!selectedDistrict) {
        setTowns([]);
        setUnionCouncils([]);
        return;
      }

      try {
        setTownLoading(true);

        const response =
          await getTownDropdown(
            selectedDistrict,
          );

        setTowns(response?.data || []);
      } catch (error) {
        console.error(
          "Get towns error:",
          error,
        );

        setTowns([]);

        toast.error("Failed to load towns", {
          description:
            error?.response?.data?.message ||
            error?.message ||
            "Please try again.",
        });
      } finally {
        setTownLoading(false);
      }
    };

    loadTowns();
  }, [selectedDistrict]);

  // =====================================================
  // Load Union Councils When Town Changes
  // =====================================================

  useEffect(() => {
    const loadUnionCouncils = async () => {
      if (!selectedTown) {
        setUnionCouncils([]);
        return;
      }

      try {
        setUcLoading(true);

        const response =
          await getUnionCouncilDropdown(
            selectedTown,
          );

        console.log(
          "UC RESPONSE:",
          response,
        );

        setUnionCouncils(
          response?.data || [],
        );
      } catch (error) {
        console.error(
          "Get union councils error:",
          error,
        );

        setUnionCouncils([]);

        toast.error(
          "Failed to load Union Councils",
          {
            description:
              error?.response?.data?.message ||
              error?.message ||
              "Please try again.",
          },
        );
      } finally {
        setUcLoading(false);
      }
    };

    loadUnionCouncils();
  }, [selectedTown]);

  // =====================================================
  // Clear Supervisor Code When Designation Changes
  // =====================================================

  useEffect(() => {
    if (!isSupervisor) {
      setValue("supervisorCode", "");
      clearErrors("supervisorCode");
    }
  }, [
    isSupervisor,
    setValue,
    clearErrors,
  ]);

  // =====================================================
  // Helper: Get First Form Error
  // =====================================================

  const getFirstError = (formErrors) => {
    const firstError = Object.values(
      formErrors,
    )[0];

    return (
      firstError?.message ||
      "Please check the highlighted fields."
    );
  };

  // =====================================================
  // Submit
  // =====================================================

  const onSubmit = async (data) => {
    if (loading) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: data.name.trim(),

        email: data.email
          .trim()
          .toLowerCase(),

        contactNumber:
          data.contactNumber,

        district: data.district,

        town: data.town,

        unionCouncil:
          data.unionCouncil,

        designation:
          data.designation,

        supervisorCode: isSupervisor
          ? data.supervisorCode.trim()
          : null,

        password: data.password,
      };

      const response =
        await createUser(payload);

      if (response?.success) {
        const email =
          response?.data?.email ||
          data.email
            .trim()
            .toLowerCase();

        setVerificationEmail(email);

        setVerificationError("");

        setShowVerifyModal(true);

        toast.info("Verification code sent!", {
          description:
            "Please check your email and enter the verification code.",
        });
      } else {
        toast.error(
          "Unable to create account",
          {
            description:
              response?.message ||
              "Please try again.",
          },
        );
      }
    } catch (error) {
      console.error(
        "Signup error:",
        error,
      );

      console.error(
        "Response:",
        error?.response?.data,
      );

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create account.";

      toast.error(
        "Registration failed",
        {
          description: message,
        },
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Submit Validation Error
  // =====================================================

  const onInvalid = (formErrors) => {
    const message =
      getFirstError(formErrors);

    toast.error(
      "Please fix the form errors",
      {
        description: message,
      },
    );
  };

  return (
    <>
      {/* =====================================================
          Page Loader
      ===================================================== */}

      {loading && (
        <Loader text="Creating your account..." />
      )}

      {/* =====================================================
          Main
      ===================================================== */}

      <main className="min-h-screen bg-surface px-4 py-10">
        <div className="mx-auto w-full max-w-2xl">
          <div className="rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">

            {/* =================================================
                Logo
            ================================================= */}

            <div className="mb-8 flex flex-col items-center justify-center gap-2 text-center">
              <Image
                src="/images/logo.png"
                alt="Zerodose Logo"
                width={100}
                height={100}
                className="h-auto w-[100px]"
                priority
              />

              <p className="mt-2 text-sm text-text-secondary">
                Register your account to get started
              </p>
            </div>

            {/* =================================================
                Form
            ================================================= */}

            <form
              onSubmit={handleSubmit(
                onSubmit,
                onInvalid,
              )}
              className="space-y-6"
              noValidate
            >

              {/* =================================================
                  Personal Information
              ================================================= */}

              <section>
                <h2 className="text-lg font-semibold text-text">
                  Personal Information
                </h2>

                <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">

                  {/* =================================================
                      Full Name
                  ================================================= */}

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-text"
                    >
                      Full Name
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      autoComplete="name"
                      disabled={loading}
                      {...register("name", {
                        required:
                          "Full name is required.",

                        minLength: {
                          value: 2,
                          message:
                            "Name must be at least 2 characters.",
                        },

                        maxLength: {
                          value: 100,
                          message:
                            "Name cannot exceed 100 characters.",
                        },

                        validate: (value) =>
                          value.trim().length >= 2 ||
                          "Please enter a valid full name.",
                      })}
                      className={`w-full rounded-lg border bg-input-background px-4 py-3 text-sm text-text outline-none transition placeholder:text-input-placeholder focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${errors.name
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : "border-border focus:border-primary focus:ring-primary-light"
                        }`}
                    />

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
                      className="mb-2 block text-sm font-medium text-text"
                    >
                      Contact Number
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="contactNumber"
                      type="tel"
                      placeholder="03XXXXXXXXX"
                      maxLength={11}
                      inputMode="tel"
                      autoComplete="tel"
                      disabled={loading}
                      {...register(
                        "contactNumber",
                        {
                          required:
                            "Contact number is required.",

                          pattern: {
                            value:
                              /^03[0-9]{9}$/,
                            message:
                              "Enter a valid Pakistani mobile number.",
                          },
                        },
                      )}
                      className={`w-full rounded-lg border bg-input-background px-4 py-3 text-sm text-text outline-none transition placeholder:text-input-placeholder focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${errors.contactNumber
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : "border-border focus:border-primary focus:ring-primary-light"
                        }`}
                    />

                    {errors.contactNumber && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {
                          errors
                            .contactNumber
                            .message
                        }
                      </p>
                    )}
                  </div>

                  {/* =================================================
                      Email
                  ================================================= */}

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-text"
                    >
                      Email
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      disabled={loading}
                      {...register("email", {
                        required:
                          "Email is required.",

                        pattern: {
                          value:
                            /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message:
                            "Enter a valid email address.",
                        },
                      })}
                      className={`w-full rounded-lg border bg-input-background px-4 py-3 text-sm text-text outline-none transition placeholder:text-input-placeholder focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${errors.email
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : "border-border focus:border-primary focus:ring-primary-light"
                        }`}
                    />

                    {errors.email && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* =================================================
                  Work Information
              ================================================= */}

              <section>
                <h2 className="text-lg font-semibold text-text">
                  Work Information
                </h2>

                <div className="mt-4">

                  {/* =================================================
                      Designation
                  ================================================= */}

                  <Controller
                    name="designation"
                    control={control}
                    rules={{
                      required: "Please select a designation.",
                    }}
                    render={({ field }) => (
                      <Select
                        label="Designation"
                        name={field.name}
                        value={field.value}
                        onChange={field.onChange}
                        options={DESIGNATIONS}
                        placeholder="Select designation"
                        loading={false}
                        disabled={loading}
                        required
                        error={errors.designation?.message}
                      />
                    )}
                  />

                  {/* {errors.designation && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {
                        errors
                          .designation
                          .message
                      }
                    </p>
                  )} */}
                </div>

                {/* =================================================
                    Supervisor Code
                ================================================= */}

                {isSupervisor && (
                  <div className="mt-5">
                    <label
                      htmlFor="supervisorCode"
                      className="mb-2 block text-sm font-medium text-text"
                    >
                      Supervisor Code
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <input
                      id="supervisorCode"
                      type="text"
                      placeholder="Enter supervisor code"
                      disabled={loading}
                      {...register(
                        "supervisorCode",
                        {
                          required:
                            "Supervisor code is required.",

                          validate: (value) =>
                            value.trim().length >
                            0 ||
                            "Supervisor code is required.",
                        },
                      )}
                      className={`w-full rounded-lg border bg-input-background px-4 py-3 text-sm uppercase text-text outline-none transition placeholder:text-input-placeholder focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${errors.supervisorCode
                        ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                        : "border-border focus:border-primary focus:ring-primary-light"
                        }`}
                    />

                    {errors.supervisorCode && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {
                          errors
                            .supervisorCode
                            .message
                        }
                      </p>
                    )}
                  </div>
                )}
              </section>

              {/* =================================================
                  Location
              ================================================= */}

              <section>
                <h2 className="text-lg font-semibold text-text">
                  Location
                </h2>

                <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">

                  {/* =================================================
                      District
                  ================================================= */}

                  <div>
                    <Controller
                      name="district"
                      control={control}
                      rules={{
                        required:
                          "Please select a district.",
                      }}
                      render={({
                        field,
                      }) => (
                        <Select
                          label="District"
                          name={field.name}
                          value={
                            field.value
                          }
                          onChange={(
                            e,
                          ) => {
                            field.onChange(
                              e,
                            );

                            setValue(
                              "town",
                              "",
                            );

                            setValue(
                              "unionCouncil",
                              "",
                            );

                            setTowns(
                              [],
                            );

                            setUnionCouncils(
                              [],
                            );

                            clearErrors([
                              "town",
                              "unionCouncil",
                            ]);
                          }}
                          options={districts.map(
                            (
                              district,
                            ) => ({
                              value:
                                district._id,
                              label:
                                district.name,
                            }),
                          )}
                          placeholder="Select district"
                          loading={
                            districtLoading
                          }
                          disabled={
                            loading
                          }
                          required
                        />
                      )}
                    />

                    {errors.district && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {
                          errors
                            .district
                            .message
                        }
                      </p>
                    )}
                  </div>

                  {/* =================================================
                      Town
                  ================================================= */}

                  <div>
                    <Controller
                      name="town"
                      control={control}
                      rules={{
                        required:
                          "Please select a town.",
                      }}
                      render={({
                        field,
                      }) => (
                        <Select
                          label="Town"
                          name={field.name}
                          value={
                            field.value
                          }
                          onChange={(
                            e,
                          ) => {
                            field.onChange(
                              e,
                            );

                            setValue(
                              "unionCouncil",
                              "",
                            );

                            setUnionCouncils(
                              [],
                            );

                            clearErrors(
                              "unionCouncil",
                            );
                          }}
                          options={towns.map(
                            (town) => ({
                              value:
                                town._id,
                              label:
                                town.name,
                            }),
                          )}
                          placeholder={
                            !selectedDistrict
                              ? "Select district first"
                              : "Select town"
                          }
                          loading={
                            townLoading
                          }
                          disabled={
                            loading ||
                            !selectedDistrict
                          }
                          required
                        />
                      )}
                    />

                    {errors.town && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {
                          errors.town
                            .message
                        }
                      </p>
                    )}
                  </div>

                  {/* =================================================
                      Union Council
                  ================================================= */}

                  <div>
                    <Controller
                      name="unionCouncil"
                      control={control}
                      rules={{
                        required:
                          "Please select a Union Council.",
                      }}
                      render={({
                        field,
                      }) => (
                        <Select
                          label="Union Council"
                          name={field.name}
                          value={
                            field.value
                          }
                          onChange={
                            field.onChange
                          }
                          options={unionCouncils.map(
                            (
                              unionCouncil,
                            ) => ({
                              value:
                                unionCouncil._id,
                              label:
                                unionCouncil.name,
                              code:
                                unionCouncil.code,
                            }),
                          )}
                          placeholder={
                            !selectedTown
                              ? "Select town first"
                              : "Select Union Council"
                          }
                          loading={
                            ucLoading
                          }
                          disabled={
                            loading ||
                            !selectedTown
                          }
                          showCode
                          codePrefix="UC"
                          required
                        />
                      )}
                    />

                    {errors.unionCouncil && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {
                          errors
                            .unionCouncil
                            .message
                        }
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* =================================================
                  Security
              ================================================= */}

              <section>
                <h2 className="text-lg font-semibold text-text">
                  Security
                </h2>

                <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">

                  {/* =================================================
                      Password
                  ================================================= */}

                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-medium text-text"
                    >
                      Password
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <input
                        id="password"
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="Minimum 8 characters"
                        autoComplete="new-password"
                        disabled={loading}
                        {...register(
                          "password",
                          {
                            required:
                              "Password is required.",

                            minLength: {
                              value: 8,
                              message:
                                "Password must be at least 8 characters.",
                            },
                          },
                        )}
                        className={`w-full rounded-lg border bg-input-background px-4 py-3 pr-16 text-sm text-text outline-none transition placeholder:text-input-placeholder focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${errors.password
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                          : "border-border focus:border-primary focus:ring-primary-light"
                          }`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(
                            (prev) =>
                              !prev,
                          )
                        }
                        disabled={loading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-text-secondary transition hover:text-text disabled:opacity-50"
                      >
                        {showPassword
                          ? "Hide"
                          : "Show"}
                      </button>
                    </div>

                    {errors.password && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {
                          errors
                            .password
                            .message
                        }
                      </p>
                    )}
                  </div>

                  {/* =================================================
                      Confirm Password
                  ================================================= */}

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-medium text-text"
                    >
                      Confirm Password
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={
                          showConfirmPassword
                            ? "text"
                            : "password"
                        }
                        placeholder="Confirm password"
                        autoComplete="new-password"
                        disabled={loading}
                        {...register(
                          "confirmPassword",
                          {
                            required:
                              "Please confirm your password.",

                            minLength: {
                              value: 8,
                              message:
                                "Password must be at least 8 characters.",
                            },

                            validate:
                              (value) =>
                                value ===
                                password ||
                                "Passwords do not match.",
                          },
                        )}
                        className={`w-full rounded-lg border bg-input-background px-4 py-3 pr-16 text-sm text-text outline-none transition placeholder:text-input-placeholder focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${errors.confirmPassword
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                          : "border-border focus:border-primary focus:ring-primary-light"
                          }`}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(
                            (prev) =>
                              !prev,
                          )
                        }
                        disabled={loading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-text-secondary transition hover:text-text disabled:opacity-50"
                      >
                        {showConfirmPassword
                          ? "Hide"
                          : "Show"}
                      </button>
                    </div>

                    {errors.confirmPassword && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {
                          errors
                            .confirmPassword
                            .message
                        }
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* =================================================
                  Submit Button
              ================================================= */}

              <button
                type="submit"
                disabled={
                  loading ||
                  districtLoading ||
                  townLoading ||
                  ucLoading
                }
                className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Creating account..."
                  : "Create Account"}
              </button>
            </form>

            {/* =================================================
                Login Link
            ================================================= */}

            <div className="mt-6 text-center text-sm text-text-secondary">
              Already have an account?{" "}

              <Link
                href="/auth/login"
                className="font-semibold text-primary transition hover:text-primary-dark"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* =====================================================
            Verify Email Modal
        ===================================================== */}

        <VerifyEmailModal
          open={showVerifyModal}
          email={verificationEmail}
          loading={verificationLoading}
          error={verificationError}
          resendLoading={resendLoading}

          onClose={() => {
            if (!verificationLoading) {
              setShowVerifyModal(false);
            }
          }}

          // ===================================================
          // Verify Email
          // ===================================================

          onVerify={async (code) => {
            try {
              setVerificationLoading(true);
              setVerificationError("");

              const response =
                await verifyEmail({
                  email:
                    verificationEmail,
                  code,
                });

              if (response?.success) {
                toast.success(
                  "Email verified successfully!",
                  {
                    description:
                      "Your account has been verified.",
                  },
                );

                setShowVerifyModal(
                  false,
                );

                router.push(
                  dashboardRoutes[
                  selectedDesignation
                  ] ||
                  "/dashboard",
                );
              } else {
                const message =
                  response?.message ||
                  "Email verification failed.";

                setVerificationError(
                  message,
                );

                toast.error(
                  "Verification failed",
                  {
                    description:
                      message,
                  },
                );
              }
            } catch (error) {
              console.error(
                "Email verification error:",
                error,
              );

              const message =
                error?.response
                  ?.data?.message ||
                error?.message ||
                "Invalid verification code.";

              setVerificationError(
                message,
              );

              toast.error(
                "Verification failed",
                {
                  description:
                    message,
                },
              );
            } finally {
              setVerificationLoading(
                false,
              );
            }
          }}

          // ===================================================
          // Resend Verification
          // ===================================================

          onResend={async () => {
            try {
              setResendLoading(true);
              setVerificationError("");

              const response =
                await resendVerification({
                  email:
                    verificationEmail,
                });

              if (response?.success) {
                setVerificationError("");

                toast.success(
                  "Verification code sent!",
                  {
                    description:
                      `A new verification code was sent to ${verificationEmail}.`,
                  },
                );
              } else {
                const message =
                  response?.message ||
                  "Failed to resend verification code.";

                setVerificationError(
                  message,
                );

                toast.error(
                  "Failed to resend code",
                  {
                    description:
                      message,
                  },
                );
              }
            } catch (error) {
              console.error(
                "Resend verification error:",
                error,
              );

              console.error(
                "Response:",
                error?.response?.data,
              );

              const message =
                error?.response
                  ?.data?.message ||
                error?.message ||
                "Failed to resend verification code.";

              setVerificationError(
                message,
              );

              toast.error(
                "Failed to resend code",
                {
                  description:
                    message,
                },
              );
            } finally {
              setResendLoading(
                false,
              );
            }
          }}
        />
      </main>
    </>
  );
}