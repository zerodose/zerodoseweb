"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeClosed, EyeOff } from "lucide-react";

import Select from "@/components/ui/Select";
import Loader from "@/components/ui/Loader";
import VerifyEmailModal from "@/components/auth/VerifyEmailModal";
import { usePathname } from "next/navigation";
import { getDistrictDropdown } from "@/api/districtApi";
import { getTownDropdown } from "@/api/townApi";
import { getUnionCouncilDropdown } from "@/api/unionCouncilApi";
import { createUser } from "@/api/userApi";

import { verifyEmail, resendVerification } from "@/api/authApi";
import { dashboardRoutes } from "@/content/data";

export default function SignupForm() {
  const router = useRouter();

  // =====================================================
  // Designations
  // =====================================================

  const pathname = usePathname();

  const DESIGNATIONS = [
    { value: "vaccinator", label: "Vaccinator" },
    { value: "otherStaff", label: "Other Staff" },
    { value: "supervisor", label: "Supervisor" },
    { value: "ucmo", label: "UCMO" },
    { value: "townFP", label: "Town Focal Person" },
    { value: "districtFP", label: "District Focal Person" },
    // { value: "worker", label: "Worker" },
  ];

  const FROMADMINDESIGNATIONS = [
    { value: "vaccinator", label: "Vaccinator" },
    { value: "otherStaff", label: "Other Staff" },
    { value: "supervisor", label: "Supervisor" },
    { value: "ucmo", label: "UCMO" },
    { value: "townFP", label: "Town Focal Person" },
    { value: "districtFP", label: "District Focal Person" },
    { value: "admin", label: "Admin" },
    // { value: "worker", label: "Worker" },
  ];

  const designationOptions =
    pathname === "/dashboard/users/addUser"
      ? FROMADMINDESIGNATIONS
      : DESIGNATIONS;

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

  const isSupervisor = selectedDesignation === "supervisor";

  // =====================================================
  // Location Requirements Based On Designation
  // =====================================================

  const requiresDistrict = [
    "ucmo",
    "supervisor",
    "vaccinator",
    "otherStaff",
    "townFP",
    "districtFP",
    "worker",
  ].includes(selectedDesignation);

  const requiresTown = [
    "ucmo",
    "supervisor",
    "vaccinator",
    "otherStaff",
    "townFP",
    "worker",
  ].includes(selectedDesignation);

  const requiresUnionCouncil = [
    "ucmo",
    "supervisor",
    "vaccinator",
    "otherStaff",
    "worker",
  ].includes(selectedDesignation);

  const isAdmin = selectedDesignation === "admin";

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

  const [showVerifyModal, setShowVerifyModal] = useState(false);

  const [verificationEmail, setVerificationEmail] = useState("");

  const [verificationLoading, setVerificationLoading] = useState(false);

  const [verificationError, setVerificationError] = useState("");

  const [resendLoading, setResendLoading] = useState(false);

  // =====================================================
  // Password Visibility
  // =====================================================

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      if (!selectedDistrict || !requiresTown) {
        setTowns([]);
        setUnionCouncils([]);
        return;
      }

      try {
        setTownLoading(true);

        const response = await getTownDropdown(selectedDistrict);

        setTowns(response?.data || []);
      } catch (error) {
        console.error("Get towns error:", error);

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
  }, [selectedDistrict, requiresTown]);

  // =====================================================
  // Load Union Councils When Town Changes
  // =====================================================

  useEffect(() => {
    const loadUnionCouncils = async () => {
      if (!selectedTown || !requiresUnionCouncil) {
        setUnionCouncils([]);
        return;
      }

      try {
        setUcLoading(true);

        const response = await getUnionCouncilDropdown(selectedTown);

        console.log("UC RESPONSE:", response);

        setUnionCouncils(response?.data || []);
      } catch (error) {
        console.error("Get union councils error:", error);

        setUnionCouncils([]);

        toast.error("Failed to load Union Councils", {
          description:
            error?.response?.data?.message ||
            error?.message ||
            "Please try again.",
        });
      } finally {
        setUcLoading(false);
      }
    };

    loadUnionCouncils();
  }, [selectedTown, requiresUnionCouncil]);

  // =====================================================
  // Clear Supervisor Code When Designation Changes
  // =====================================================

  useEffect(() => {
    if (!isSupervisor) {
      setValue("supervisorCode", "");
      clearErrors("supervisorCode");
    }
  }, [isSupervisor, setValue, clearErrors]);

  // =====================================================
  // Clear Location Fields Based On Designation
  // =====================================================

  useEffect(() => {
    if (!requiresDistrict) {
      setValue("district", "");
      clearErrors("district");
    }

    if (!requiresTown) {
      setValue("town", "");
      clearErrors("town");
      setTowns([]);
    }

    if (!requiresUnionCouncil) {
      setValue("unionCouncil", "");
      clearErrors("unionCouncil");
      setUnionCouncils([]);
    }
  }, [
    requiresDistrict,
    requiresTown,
    requiresUnionCouncil,
    setValue,
    clearErrors,
  ]);

  // =====================================================
  // Helper: Get First Form Error
  // =====================================================

  const getFirstError = (formErrors) => {
    const firstError = Object.values(formErrors)[0];

    return firstError?.message || "Please check the highlighted fields.";
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

        email: data.email.trim().toLowerCase(),

        contactNumber: data.contactNumber,

        district: requiresDistrict ? data.district : null,

        town: requiresTown ? data.town : null,

        unionCouncil: requiresUnionCouncil ? data.unionCouncil : null,

        designation: data.designation,

        supervisorCode: isSupervisor ? data.supervisorCode.trim() : null,

        password: data.password,
      };

      const response = await createUser(payload);

      if (response?.success) {
        const email = response?.data?.email || data.email.trim().toLowerCase();

        setVerificationEmail(email);
        setVerificationError("");
        setShowVerifyModal(true);

        toast.info("Verification code sent!", {
          description:
            "Please check your email and enter the verification code.",
        });
      } else {
        toast.error("Unable to create account", {
          description: response?.message || "Please try again.",
        });
      }
    } catch (error) {
      // console.error("Signup error:", error);
      // console.error("Response:", error?.response?.data);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create account.";

      toast.error("Registration failed", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Submit Validation Error
  // =====================================================

  const onInvalid = (formErrors) => {
    const message = getFirstError(formErrors);

    toast.error("Please fix the form errors", {
      description: message,
    });
  };

  return (
    <>
      {/* =====================================================
          Page Loader
      ===================================================== */}

      {loading && <Loader text="Creating your account..." />}

      {/* =====================================================
          Main
      ===================================================== */}

      <main className="bg-surface min-h-screen w-full px-4 py-16 ">
        <div className="mx-auto w-full">
          <div className="border-border bg-background rounded-2xl border p-6 shadow-sm sm:p-8">
            {/* =================================================
                Logo
            ================================================= */}

            <div className="mb-8 flex flex-col items-center justify-center gap-2 text-center">
              <Image
                src="/images/logo.png"
                alt="Zerodose Logo"
                width={100}
                height={100}
                className="h-[100px] w-[100px]"
                priority
              />

              <p className="text-text-secondary mt-2 text-sm">
                Register your account to get started
              </p>
            </div>

            {/* =================================================
                Form
            ================================================= */}

            <form
              onSubmit={handleSubmit(onSubmit, onInvalid)}
              className="space-y-6"
              noValidate
            >
              {/* =================================================
                  Personal Information
              ================================================= */}

              <section>
                <h2 className="text-text text-lg font-semibold">
                  Personal Information
                </h2>

                <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* =================================================
                      Full Name
                  ================================================= */}

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="name"
                      className="text-text mb-2 block text-sm font-medium"
                    >
                      Full Name
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      id="name"
                      type="text"
                      placeholder="Enter your full name"
                      autoComplete="name"
                      disabled={loading}
                      {...register("name", {
                        required: "Full name is required.",

                        minLength: {
                          value: 2,
                          message: "Name must be at least 2 characters.",
                        },

                        maxLength: {
                          value: 100,
                          message: "Name cannot exceed 100 characters.",
                        },

                        validate: (value) =>
                          value.trim().length >= 2 ||
                          "Please enter a valid full name.",
                      })}
                      className={`bg-input-background text-text placeholder:text-input-placeholder w-full rounded-lg border px-4 py-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                        errors.name
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
                      className="text-text mb-2 block text-sm font-medium"
                    >
                      Contact Number
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      id="contactNumber"
                      type="tel"
                      placeholder="03XXXXXXXXX"
                      maxLength={11}
                      inputMode="tel"
                      autoComplete="tel"
                      disabled={loading}
                      {...register("contactNumber", {
                        required: "Contact number is required.",

                        pattern: {
                          value: /^03[0-9]{9}$/,
                          message: "Enter a valid Pakistani mobile number.",
                        },
                      })}
                      className={`bg-input-background text-text placeholder:text-input-placeholder w-full rounded-lg border px-4 py-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                        errors.contactNumber
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                          : "border-border focus:border-primary focus:ring-primary-light"
                      }`}
                    />

                    {errors.contactNumber && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {errors.contactNumber.message}
                      </p>
                    )}
                  </div>

                  {/* =================================================
                      Email
                  ================================================= */}

                  <div>
                    <label
                      htmlFor="email"
                      className="text-text mb-2 block text-sm font-medium"
                    >
                      Email
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      disabled={loading}
                      {...register("email", {
                        required: "Email is required.",

                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Enter a valid email address.",
                        },
                      })}
                      className={`bg-input-background text-text placeholder:text-input-placeholder w-full rounded-lg border px-4 py-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                        errors.email
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
                <h2 className="text-text text-lg font-semibold">
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
                        options={designationOptions}
                        placeholder="Select designation"
                        loading={false}
                        disabled={loading}
                        required
                        error={errors.designation?.message}
                      />
                    )}
                  />
                </div>

                {/* =================================================
                    Supervisor Code
                ================================================= */}

                {isSupervisor && (
                  <div className="mt-5">
                    <label
                      htmlFor="supervisorCode"
                      className="text-text mb-2 block text-sm font-medium"
                    >
                      Supervisor Code
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <input
                      id="supervisorCode"
                      type="text"
                      placeholder="Enter supervisor code"
                      disabled={loading}
                      {...register("supervisorCode", {
                        required: "Supervisor code is required.",

                        validate: (value) =>
                          value.trim().length > 0 ||
                          "Supervisor code is required.",
                      })}
                      className={`bg-input-background text-text placeholder:text-input-placeholder w-full rounded-lg border px-4 py-3 text-sm uppercase transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                        errors.supervisorCode
                          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                          : "border-border focus:border-primary focus:ring-primary-light"
                      }`}
                    />

                    {errors.supervisorCode && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {errors.supervisorCode.message}
                      </p>
                    )}
                  </div>
                )}
              </section>

              {/* =================================================
                  Location
              ================================================= */}

              {!isAdmin && (
                <section>
                  <h2 className="text-text text-lg font-semibold">Location</h2>

                  <div
                    className={`mt-4 grid grid-cols-1 gap-5 ${
                      requiresUnionCouncil
                        ? "sm:grid-cols-3"
                        : requiresTown
                          ? "sm:grid-cols-2"
                          : "sm:grid-cols-1"
                    }`}
                  >
                    {/* =================================================
                        District
                    ================================================= */}

                    {/* {requiresDistrict && ( */}
                      <div>
                        <Controller
                          name="district"
                          control={control}
                          rules={{
                            required: requiresDistrict
                              ? "Please select a district."
                              : false,
                          }}
                          render={({ field }) => (
                            <Select
                              label="District"
                              name={field.name}
                              value={field.value}
                              onChange={(e) => {
                                field.onChange(e);

                                setValue("town", "");
                                setValue("unionCouncil", "");

                                setTowns([]);
                                setUnionCouncils([]);

                                clearErrors(["town", "unionCouncil"]);
                              }}
                              options={districts.map((district) => ({
                                value: district._id,
                                label: district.name,
                              }))}
                              placeholder="Select district"
                              searchPlaceholder="Search district..."
                              searchable
                              loading={districtLoading}
                              disabled={loading}
                              required
                              error={errors.district?.message}
                            />
                          )}
                        />

                        {errors.district && (
                          <p className="mt-1.5 text-xs text-red-500">
                            {errors.district.message}
                          </p>
                        )}
                      </div>
                    {/* // )} */}

                    {/* =================================================
                        Town
                    ================================================= */}

                    {requiresTown && (
                      <div>
                        <Controller
                          name="town"
                          control={control}
                          rules={{
                            required: requiresTown
                              ? "Please select a town."
                              : false,
                          }}
                          render={({ field }) => (
                            <Select
                              label="Town"
                              name={field.name}
                              value={field.value}
                              onChange={(e) => {
                                field.onChange(e);

                                setValue("unionCouncil", "");
                                setUnionCouncils([]);

                                clearErrors("unionCouncil");
                              }}
                              options={towns.map((town) => ({
                                value: town._id,
                                label: town.name,
                              }))}
                              placeholder={
                                !selectedDistrict
                                  ? "Select district first"
                                  : "Select town"
                              }
                              searchPlaceholder="Search town..."
                              searchable
                              loading={townLoading}
                              disabled={loading || !selectedDistrict}
                              required
                              error={errors.town?.message}
                            />
                          )}
                        />

                        {errors.town && (
                          <p className="mt-1.5 text-xs text-red-500">
                            {errors.town.message}
                          </p>
                        )}
                      </div>
                    )}

                    {/* =================================================
                        Union Council
                    ================================================= */}

                    {requiresUnionCouncil && (
                      <div>
                        <Controller
                          name="unionCouncil"
                          control={control}
                          rules={{
                            required: requiresUnionCouncil
                              ? "Please select a Union Council."
                              : false,
                          }}
                          render={({ field }) => (
                            <Select
                              label="Union Council"
                              name={field.name}
                              value={field.value}
                              onChange={field.onChange}
                              options={unionCouncils.map((unionCouncil) => ({
                                value: unionCouncil._id,
                                label: unionCouncil.name,
                                code: unionCouncil.code,
                              }))}
                              placeholder={
                                !selectedTown
                                  ? "Select town first"
                                  : "Select Union Council"
                              }
                              searchPlaceholder="Search Union Council..."
                              searchable
                              loading={ucLoading}
                              disabled={loading || !selectedTown}
                              showCode
                              codePrefix="UC"
                              required
                              error={errors.unionCouncil?.message}
                            />
                          )}
                        />

                        {errors.unionCouncil && (
                          <p className="mt-1.5 text-xs text-red-500">
                            {errors.unionCouncil.message}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* =================================================
                  Security
              ================================================= */}

              <section>
                <h2 className="text-text text-lg font-semibold">Security</h2>

                <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* =================================================
                      Password
                  ================================================= */}

                  <div>
                    <label
                      htmlFor="password"
                      className="text-text mb-2 block text-sm font-medium"
                    >
                      Password
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 8 characters"
                        autoComplete="new-password"
                        disabled={loading}
                        {...register("password", {
                          required: "Password is required.",

                          minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters.",
                          },
                        })}
                        className={`bg-input-background text-text placeholder:text-input-placeholder w-full rounded-lg border px-4 py-3 pr-16 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                          errors.password
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : "border-border focus:border-primary focus:ring-primary-light"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        disabled={loading}
                        className="text-text-secondary hover:text-text absolute top-1/2 right-3 -translate-y-1/2 text-sm font-medium transition disabled:opacity-50"
                      >
                        {showPassword ? (
                          <EyeClosed size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>

                    {errors.password && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* =================================================
                      Confirm Password
                  ================================================= */}

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="text-text mb-2 block text-sm font-medium"
                    >
                      Confirm Password
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm password"
                        autoComplete="new-password"
                        disabled={loading}
                        {...register("confirmPassword", {
                          required: "Please confirm your password.",

                          minLength: {
                            value: 8,
                            message: "Password must be at least 8 characters.",
                          },

                          validate: (value) =>
                            value === password || "Passwords do not match.",
                        })}
                        className={`bg-input-background text-text placeholder:text-input-placeholder w-full rounded-lg border px-4 py-3 pr-16 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                          errors.confirmPassword
                            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                            : "border-border focus:border-primary focus:ring-primary-light"
                        }`}
                      />

                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        disabled={loading}
                        className="text-text-secondary hover:text-text absolute top-1/2 right-3 -translate-y-1/2 text-sm font-medium transition disabled:opacity-50"
                      >
                        {showConfirmPassword ? (
                          <EyeClosed size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>

                    {errors.confirmPassword && (
                      <p className="mt-1.5 text-xs text-red-500">
                        {errors.confirmPassword.message}
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
                  (requiresTown && townLoading) ||
                  (requiresUnionCouncil && ucLoading)
                }
                className="bg-primary text-primary-foreground hover:bg-primary-dark w-full rounded-lg px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            {/* =================================================
                Login Link
            ================================================= */}

            <div className="text-text-secondary mt-6 text-center text-sm">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="text-primary hover:text-primary-dark font-semibold transition"
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

              const response = await verifyEmail({
                email: verificationEmail,
                code,
              });

              if (response?.success) {
                toast.success("Email verified successfully!", {
                  description: "Your account has been verified.",
                });

                setShowVerifyModal(false);

                if (pathname === "/dashboard/users/addUser") {
                  router.back();
                  return;
                }

                router.push(
                  dashboardRoutes[selectedDesignation] || "/dashboard",
                );
              } else {
                const message =
                  response?.message || "Email verification failed.";

                setVerificationError(message);

                toast.error("Verification failed", {
                  description: message,
                });
              }
            } catch (error) {
              console.error("Email verification error:", error);

              const message =
                error?.response?.data?.message ||
                error?.message ||
                "Invalid verification code.";

              setVerificationError(message);

              toast.error("Verification failed", {
                description: message,
              });
            } finally {
              setVerificationLoading(false);
            }
          }}

          // ===================================================
          // Resend Verification
          // ===================================================

          onResend={async () => {
            try {
              setResendLoading(true);
              setVerificationError("");

              const response = await resendVerification({
                email: verificationEmail,
              });

              if (response?.success) {
                setVerificationError("");

                toast.success("Verification code sent!", {
                  description: `A new verification code was sent to ${verificationEmail}.`,
                });
              } else {
                const message =
                  response?.message || "Failed to resend verification code.";

                setVerificationError(message);

                toast.error("Failed to resend code", {
                  description: message,
                });
              }
            } catch (error) {
              console.error("Resend verification error:", error);

              console.error("Response:", error?.response?.data);

              const message =
                error?.response?.data?.message ||
                error?.message ||
                "Failed to resend verification code.";

              setVerificationError(message);

              toast.error("Failed to resend code", {
                description: message,
              });
            } finally {
              setResendLoading(false);
            }
          }}
        />
      </main>
    </>
  );
}
