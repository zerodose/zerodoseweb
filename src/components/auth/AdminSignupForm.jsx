"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { ArrowLeft, Eye, EyeClosed, Save, UserRound } from "lucide-react";

import Select from "@/components/ui/Select";
import Loader from "@/components/ui/Loader";
import VerifyEmailModal from "@/components/auth/VerifyEmailModal";

import { getDistrictDropdown } from "@/api/districtApi";
import { getTownDropdown } from "@/api/townApi";
import { getUnionCouncilDropdown } from "@/api/unionCouncilApi";

import { createUser, getUser, updateUser } from "@/api/userApi";

import { verifyEmail, resendVerification } from "@/api/authApi";
import { designationRoutes } from "@/content/data";

export default function AdminSignupForm({ mode = "add", userId = null }) {
  const router = useRouter();
  const pathname = usePathname();

  // =====================================================
  // Modes
  // =====================================================

  const isAddMode = mode === "add";
  const isEditMode = mode === "edit";
  const isViewMode = mode === "view";

  const isReadOnly = isViewMode;

  // =====================================================
  // Page Type
  // =====================================================

  const isDashboardUserPage = pathname?.startsWith("/dashboard/users");

  const isDashboardAddUser = pathname === "/dashboard/users/addUser";

  // =====================================================
  // Designations
  // =====================================================

  const DESIGNATIONS = [
    {
      value: "ucmo",
      label: "UCMO",
    },
    {
      value: "supervisor",
      label: "Supervisor",
    },
    {
      value: "vaccinator",
      label: "Vaccinator",
    },
    {
      value: "otherstaff",
      label: "Other Staff",
    },
    {
      value: "townFP",
      label: "Town Focal Person",
    },
    {
      value: "districtfp",
      label: "District Focal Person",
    },
  ];

  const FROMADMINDESIGNATIONS = [
    {
      value: "ucmo",
      label: "UCMO",
    },
    {
      value: "supervisor",
      label: "Supervisor",
    },
    {
      value: "vaccinator",
      label: "Vaccinator",
    },
    {
      value: "otherstaff",
      label: "Other Staff",
    },
    {
      value: "townFP",
      label: "Town Focal Person",
    },
    {
      value: "districtfp",
      label: "District Focal Person",
    },
    {
      value: "admin",
      label: "Admin",
    },
  ];

  /*
   * Dashboard ke user pages par Admin bhi allowed hai.
   *
   * Add / Edit / View tino mein same options rakh rahe hain
   * taake agar existing user admin ho to View mein bhi
   * designation properly show ho.
   */
  const designationOptions = isDashboardUserPage
    ? FROMADMINDESIGNATIONS
    : DESIGNATIONS;

  // =====================================================
  // Dashboard Routes
  // =====================================================

  // =====================================================
  // React Hook Form
  // =====================================================

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
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
  // Dropdown Data
  // =====================================================

  const [districts, setDistricts] = useState([]);
  const [towns, setTowns] = useState([]);
  const [unionCouncils, setUnionCouncils] = useState([]);

  // =====================================================
  // Loading States
  // =====================================================

  const [districtLoading, setDistrictLoading] = useState(true);

  const [townLoading, setTownLoading] = useState(false);

  const [ucLoading, setUcLoading] = useState(false);

  const [loading, setLoading] = useState(false);

  const [userLoading, setUserLoading] = useState(false);

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
  // Helper
  // Get ID from populated object OR direct ID
  // =====================================================

  const getId = (value) => {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      return value;
    }

    if (typeof value === "object") {
      return value?._id || value?.id || "";
    }

    return "";
  };

  // =====================================================
  // Load User For Edit / View
  // =====================================================

  useEffect(() => {
    if (isAddMode || !userId) {
      return;
    }

    const loadUser = async () => {
      try {
        setUserLoading(true);

        const response = await getUser(userId);

        console.log("Get single user response:", response);

        /*
         * API normally:
         *
         * {
         *   success: true,
         *   data: {...}
         * }
         *
         * Agar API direct user return kare to
         * fallback bhi rakha hai.
         */
        const user =
          response?.data?.user || response?.data || response?.user || response;

        if (!user) {
          toast.error("User not found");
          return;
        }

        const district = getId(user.district);

        const town = getId(user.town);

        const unionCouncil = getId(user.unionCouncil);

        const designation = user.designation || "";

        const supervisorCode = user.supervisorCode || "";

        /*
         * Password intentionally empty.
         *
         * Password database mein hashed hota hai,
         * is liye existing password form mein nahi
         * bharna chahiye.
         */
        reset({
          name: user.name || "",

          email: user.email || "",

          contactNumber: user.contactNumber || "",

          district: district,

          town: town,

          unionCouncil: unionCouncil,

          designation,

          supervisorCode,

          password: "",

          confirmPassword: "",
        });

        console.log("User form populated:", {
          name: user.name,
          email: user.email,
          contactNumber: user.contactNumber,
          district: district,
          town: town,
          unionCouncil: unionCouncil,
          designation,
          supervisorCode,
        });
      } catch (error) {
        console.error("Get user error:", error);

        toast.error("Failed to load user", {
          description:
            error?.response?.data?.message ||
            error?.message ||
            "Please try again.",
        });
      } finally {
        setUserLoading(false);
      }
    };

    loadUser();
  }, [userId, isAddMode, reset]);

  // =====================================================
  // Load Towns
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
  }, [selectedDistrict]);

  // =====================================================
  // Load Union Councils
  // =====================================================

  useEffect(() => {
    const loadUnionCouncils = async () => {
      if (!selectedTown) {
        setUnionCouncils([]);
        return;
      }

      try {
        setUcLoading(true);

        const response = await getUnionCouncilDropdown(selectedTown);

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
  }, [selectedTown]);

  // =====================================================
  // Clear Supervisor Code
  // =====================================================

  useEffect(() => {
    if (!isSupervisor) {
      setValue("supervisorCode", "");

      clearErrors("supervisorCode");
    }
  }, [isSupervisor, setValue, clearErrors]);

  // =====================================================
  // Helper
  // =====================================================

  const getFirstError = (formErrors) => {
    const firstError = Object.values(formErrors)[0];

    return firstError?.message || "Please check the highlighted fields.";
  };

  // =====================================================
  // Submit
  // =====================================================

  const onSubmit = async (data) => {
    if (loading || isViewMode) {
      return;
    }

    try {
      setLoading(true);

      /*
       * ============================
       * EDIT
       * ============================
       */

      if (isEditMode) {
        const payload = {
          name: data.name.trim(),

          email: data.email.trim().toLowerCase(),

          contactNumber: data.contactNumber,

          district: data.district,

          town: data.town,

          unionCouncil: data.unionCouncil,

          designation: data.designation,

          supervisorCode: isSupervisor ? data.supervisorCode.trim() : null,
        };

        /*
         * Password sirf tab bhejein
         * jab user new password enter kare.
         */
        if (data.password && data.password.trim()) {
          payload.password = data.password;
        }

        const response = await updateUser(userId, payload);

        if (response?.success) {
          toast.success("User updated successfully!");

          router.back();
        } else {
          toast.error("Unable to update user", {
            description: response?.message || "Please try again.",
          });
        }

        return;
      }

      /*
       * ============================
       * ADD
       * ============================
       */

      const payload = {
        name: data.name.trim(),

        email: data.email.trim().toLowerCase(),

        contactNumber: data.contactNumber,

        district: data.district,

        town: data.town,

        unionCouncil: data.unionCouncil,

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
      console.error("Submit user error:", error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to save user.";

      toast.error(isEditMode ? "Update failed" : "Registration failed", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // Validation Error
  // =====================================================

  const onInvalid = (formErrors) => {
    const message = getFirstError(formErrors);

    toast.error("Please fix the form errors", {
      description: message,
    });
  };

  // =====================================================
  // Page Title
  // =====================================================

  const pageTitle = isViewMode
    ? "View User"
    : isEditMode
      ? "Edit User"
      : isDashboardAddUser
        ? "Add User"
        : "Create Account";

  const pageDescription = isViewMode
    ? "View user account and assigned information."
    : isEditMode
      ? "Update user account, role, location, and access details."
      : isDashboardAddUser
        ? "Create a new user account and assign their role, location, and access details."
        : "Create your account and enter your work information.";

  // =====================================================
  // Render
  // =====================================================

  return (
    <>
      {/* =====================================================
          Loader
      ===================================================== */}

      {(loading || userLoading) && (
        <Loader
          text={
            userLoading
              ? "Loading user information..."
              : isEditMode
                ? "Updating user..."
                : "Creating user account..."
          }
        />
      )}

      {/* =====================================================
          Main
      ===================================================== */}

      <main className="bg-surface min-h-screen">
        <div className="mx-auto w-full max-w-7xl">
          {/* =================================================
              Header
          ================================================= */}

          {(isAddMode || isEditMode) && (
            <div className="mb-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={loading || userLoading}
                className="bg-background border-border text-icon hover:bg-surface flex h-10 w-10 items-center justify-center rounded-xl border transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>

              <div>
                <h1 className="text-text text-xl font-bold sm:text-2xl">
                  {pageTitle}
                </h1>

                <p className="text-text-secondary mt-1 text-sm">
                  {pageDescription}
                </p>
              </div>
            </div>
          )}

          {/* =================================================
              Main Card
          ================================================= */}

          <div className="bg-background border-border rounded-2xl border shadow-sm">
            {/* =================================================
                Dashboard User Information Header
            ================================================= */}

            {isDashboardUserPage && (
              <div className="border-border flex items-center gap-3 border-b p-5 sm:p-6">
                <div className="bg-primary-light flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
                  <UserRound className="text-primary h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-text font-semibold">User Information</h2>

                  <p className="text-text-secondary mt-0.5 text-xs">
                    {isViewMode
                      ? "User account information."
                      : isEditMode
                        ? "Update user details below."
                        : "Enter user details below."}
                  </p>
                </div>
              </div>
            )}

            {/* =================================================
                Form Content
            ================================================= */}

            <div className="p-5 sm:p-6">
              {/* =================================================
                  Client Form Intro
              ================================================= */}

              {!isDashboardUserPage && (
                <div className="border-border bg-surface-blue mb-7 rounded-xl border p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                    <div className="bg-primary-light mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                      <UserRound className="text-primary h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-text text-base font-semibold">
                        User Information
                      </h2>

                      <p className="text-text-secondary mt-1 text-sm">
                        Enter your account details below.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* =================================================
                  Form
              ================================================= */}

              <form
                onSubmit={handleSubmit(onSubmit, onInvalid)}
                className="space-y-7"
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
                    {/* Full Name */}

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="name"
                        className="text-text mb-2 block text-sm font-medium"
                      >
                        Full Name
                        {!isViewMode && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </label>

                      <input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        autoComplete="name"
                        disabled={loading || userLoading || isReadOnly}
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
                        className={`bg-input-background text-text placeholder:text-input-placeholder w-full rounded-xl border px-4 py-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
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

                    {/* Contact Number */}

                    <div>
                      <label
                        htmlFor="contactNumber"
                        className="text-text mb-2 block text-sm font-medium"
                      >
                        Contact Number
                        {!isViewMode && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </label>

                      <input
                        id="contactNumber"
                        type="tel"
                        placeholder="03XXXXXXXXX"
                        maxLength={11}
                        inputMode="tel"
                        autoComplete="tel"
                        disabled={loading || userLoading || isReadOnly}
                        {...register("contactNumber", {
                          required: "Contact number is required.",

                          pattern: {
                            value: /^03[0-9]{9}$/,
                            message: "Enter a valid Pakistani mobile number.",
                          },
                        })}
                        className={`bg-input-background text-text placeholder:text-input-placeholder w-full rounded-xl border px-4 py-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
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

                    {/* Email */}

                    <div>
                      <label
                        htmlFor="email"
                        className="text-text mb-2 block text-sm font-medium"
                      >
                        Email
                        {!isViewMode && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </label>

                      <input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        autoComplete="email"
                        disabled={loading || userLoading || isReadOnly}
                        {...register("email", {
                          required: "Email is required.",

                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Enter a valid email address.",
                          },
                        })}
                        className={`bg-input-background text-text placeholder:text-input-placeholder w-full rounded-xl border px-4 py-3 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
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
                          loading={userLoading}
                          disabled={loading || userLoading || isReadOnly}
                          required={!isViewMode}
                          error={errors.designation?.message}
                        />
                      )}
                    />
                  </div>

                  {/* Supervisor Code */}

                  {isSupervisor && (
                    <div className="mt-5">
                      <label
                        htmlFor="supervisorCode"
                        className="text-text mb-2 block text-sm font-medium"
                      >
                        Supervisor Code
                        {!isViewMode && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </label>

                      <input
                        id="supervisorCode"
                        type="text"
                        placeholder="Enter supervisor code"
                        disabled={loading || userLoading || isReadOnly}
                        {...register("supervisorCode", {
                          required: "Supervisor code is required.",

                          validate: (value) =>
                            value.trim().length > 0 ||
                            "Supervisor code is required.",
                        })}
                        className={`bg-input-background text-text placeholder:text-input-placeholder w-full rounded-xl border px-4 py-3 text-sm uppercase transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
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

                <section>
                  <h2 className="text-text text-lg font-semibold">Location</h2>

                  <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
                    {/* District */}

                    <div>
                      <Controller
                        name="district"
                        control={control}
                        rules={{
                          required: "Please select a district.",
                        }}
                        render={({ field }) => (
                          <Select
                            label="District"
                            name={field.name}
                            value={field.value}
                            onChange={(value) => {
                              if (isReadOnly) {
                                return;
                              }

                              field.onChange(value);

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
                            loading={districtLoading || userLoading}
                            disabled={loading || userLoading || isReadOnly}
                            required={!isViewMode}
                            error={errors.district?.message}
                          />
                        )}
                      />
                    </div>

                    {/* Town */}

                    <div>
                      <Controller
                        name="town"
                        control={control}
                        rules={{
                          required: "Please select a town.",
                        }}
                        render={({ field }) => (
                          <Select
                            label="Town"
                            name={field.name}
                            value={field.value}
                            onChange={(value) => {
                              if (isReadOnly) {
                                return;
                              }

                              field.onChange(value);

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
                            loading={townLoading}
                            disabled={
                              loading ||
                              userLoading ||
                              !selectedDistrict ||
                              isReadOnly
                            }
                            required={!isViewMode}
                            error={errors.town?.message}
                          />
                        )}
                      />
                    </div>

                    {/* Union Council */}

                    <div>
                      <Controller
                        name="unionCouncil"
                        control={control}
                        rules={{
                          required: "Please select a Union Council.",
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
                            loading={ucLoading}
                            disabled={
                              loading ||
                              userLoading ||
                              !selectedTown ||
                              isReadOnly
                            }
                            showCode
                            codePrefix="UC"
                            required={!isViewMode}
                            error={errors.unionCouncil?.message}
                          />
                        )}
                      />
                    </div>
                  </div>
                </section>

                {/* =================================================
                    Security
                ================================================= */}

                <section>
                  <h2 className="text-text text-lg font-semibold">Security</h2>

                  {/* =================================================
                      VIEW MODE
                  ================================================= */}

                  {isViewMode ? (
                    <div className="mt-4">
                      <div className="bg-surface border-border rounded-xl border p-4">
                        <p className="text-text-secondary text-sm">
                          Password is securely stored and cannot be displayed.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                      {/* Password */}

                      <div>
                        <label
                          htmlFor="password"
                          className="text-text mb-2 block text-sm font-medium"
                        >
                          Password
                          {isAddMode && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                          {isEditMode && (
                            <span className="text-text-secondary ml-2 text-xs font-normal">
                              Optional
                            </span>
                          )}
                        </label>

                        <div className="relative">
                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder={
                              isEditMode
                                ? "Leave empty to keep current password"
                                : "Minimum 8 characters"
                            }
                            autoComplete="new-password"
                            disabled={loading || userLoading}
                            {...register("password", {
                              required: isAddMode
                                ? "Password is required."
                                : false,

                              minLength: {
                                value: 8,
                                message:
                                  "Password must be at least 8 characters.",
                              },
                            })}
                            className={`bg-input-background text-text placeholder:text-input-placeholder w-full rounded-xl border px-4 py-3 pr-16 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                              errors.password
                                ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                                : "border-border focus:border-primary focus:ring-primary-light"
                            }`}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword((previous) => !previous)
                            }
                            disabled={loading || userLoading}
                            className="text-text-secondary hover:text-text absolute top-1/2 right-3 -translate-y-1/2 transition disabled:opacity-50"
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

                      {/* Confirm Password */}

                      <div>
                        <label
                          htmlFor="confirmPassword"
                          className="text-text mb-2 block text-sm font-medium"
                        >
                          Confirm Password
                          {isAddMode && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </label>

                        <div className="relative">
                          <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password"
                            autoComplete="new-password"
                            disabled={loading || userLoading}
                            {...register("confirmPassword", {
                              required: isAddMode
                                ? "Please confirm your password."
                                : false,

                              minLength: {
                                value: 8,
                                message:
                                  "Password must be at least 8 characters.",
                              },

                              validate: (value) => {
                                if (!value && isEditMode) {
                                  return true;
                                }

                                return (
                                  value === password ||
                                  "Passwords do not match."
                                );
                              },
                            })}
                            className={`bg-input-background text-text placeholder:text-input-placeholder w-full rounded-xl border px-4 py-3 pr-16 text-sm transition outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                              errors.confirmPassword
                                ? "border-red-500 focus:border-red-500 focus:ring-red-100"
                                : "border-border focus:border-primary focus:ring-primary-light"
                            }`}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword((previous) => !previous)
                            }
                            disabled={loading || userLoading}
                            className="text-text-secondary hover:text-text absolute top-1/2 right-3 -translate-y-1/2 transition disabled:opacity-50"
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
                  )}
                </section>

                {/* =================================================
                    Footer
                ================================================= */}

                {!isViewMode && (
                  <div className="border-border flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
                    {/* Cancel */}

                    {isDashboardUserPage && (
                      <button
                        type="button"
                        onClick={() => router.back()}
                        disabled={loading || userLoading}
                        className="border-border bg-background text-text hover:bg-surface rounded-xl border px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    )}

                    {/* Submit */}

                    <button
                      type="submit"
                      disabled={
                        loading ||
                        userLoading ||
                        districtLoading ||
                        townLoading ||
                        ucLoading
                      }
                      className="bg-primary hover:bg-primary-dark text-primary-foreground inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                          {isEditMode ? "Updating..." : "Creating..."}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />

                          {isEditMode
                            ? "Update User"
                            : isDashboardAddUser
                              ? "Create User"
                              : "Create Account"}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
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

                  if (isDashboardAddUser) {
                    router.back();
                    return;
                  }

                  router.push(
                    designationRoutes[selectedDesignation] || "/dashboard",
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
        </div>
      </main>
    </>
  );
}
