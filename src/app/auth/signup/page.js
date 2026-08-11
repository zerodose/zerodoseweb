
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

import Select from "@/components/ui/Select";

import { getDistrictDropdown } from "@/api/districtApi";
import { getTownDropdown } from "@/api/townApi";
import { getUnionCouncilDropdown } from "@/api/unionCouncilApi";
import { createUser } from "@/api/userApi";
import VerifyEmailModal from "@/components/auth/VerifyEmailModal";
import {
  verifyEmail,
  resendVerificationCode,
} from "@/api/authApi";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [formData, setFormData] = useState({
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
  });

  const DESIGNATIONS = [
    { value: "ucmo", label: "UCMO" },
    { value: "supervisor", label: "Supervisor" },
    { value: "vaccinator", label: "Vaccinator" },
    { value: "otherStaff", label: "Other Staff" },
    { value: "admin", label: "Admin" },
    // { value: "worker", label: "Worker" },
  ];
  const router = useRouter();

  const dashboardRoutes = {
    admin: "/dashboard",
    worker: "/worker",
    supervisor: "/supervisor",
    ucmo: "/ucmo",
    otherStaff: "/otherstaff",
    vaccinator: "/vaccinator",
  };

  // =====================================================
  // Email Verification Data
  // =====================================================

  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

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

  // =====================================================
  // Form Loading
  // =====================================================

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");

  const isSupervisor = formData.designation === "supervisor";

  // =====================================================
  // Load Districts
  // =====================================================

  useEffect(() => {
    const loadDistricts = async () => {
      try {
        setDistrictLoading(true);
        setError("");

        const response = await getDistrictDropdown();

        setDistricts(response.data || []);
      } catch (error) {
        console.error("Get districts error:", error);

        setDistricts([]);

        setError(error?.response?.data?.message || "Failed to load districts.");
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
      if (!formData.district) {
        setTowns([]);
        setUnionCouncils([]);
        return;
      }

      try {
        setTownLoading(true);
        setError("");

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
  // Load Union Councils When Town Changes
  // =====================================================

  useEffect(() => {
    const loadUnionCouncils = async () => {
      if (!formData.town) {
        setUnionCouncils([]);
        return;
      }

      try {
        setUcLoading(true);
        setError("");

        const response = await getUnionCouncilDropdown(formData.town);

        console.log("UC RESPONSE:", response);

        setUnionCouncils(response.data || []);
      } catch (error) {
        console.error("Get union councils error:", error);

        setUnionCouncils([]);

        setError(
          error?.response?.data?.message || "Failed to load Union Councils.",
        );
      } finally {
        setUcLoading(false);
      }
    };

    loadUnionCouncils();
  }, [formData.town]);

  // =====================================================
  // Handle Change
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setError("");

    // District changed
    if (name === "district") {
      setFormData((prev) => ({
        ...prev,
        district: value,
        town: "",
        unionCouncil: "",
      }));

      // Clear dependent dropdowns immediately
      setTowns([]);
      setUnionCouncils([]);

      return;
    }

    // Town changed
    if (name === "town") {
      setFormData((prev) => ({
        ...prev,
        town: value,
        unionCouncil: "",
      }));

      // Clear dependent UC immediately
      setUnionCouncils([]);

      return;
    }

    // Normal field
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // Submit
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.name.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!formData.contactNumber) {
      setError("Contact number is required.");
      return;
    }

    if (!formData.email) {
      setError("Email is required.");
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

    if (!formData.unionCouncil) {
      setError("Please select a Union Council.");
      return;
    }

    if (!formData.designation) {
      setError("Please select a designation.");
      return;
    }

    if (isSupervisor && !formData.supervisorCode) {
      setError("Supervisor code is required.");
      return;
    }

    if (!formData.password) {
      setError("Password is required.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        contactNumber: formData.contactNumber,
        district: formData.district,
        town: formData.town,
        unionCouncil: formData.unionCouncil,
        designation: formData.designation,
        supervisorCode: isSupervisor ? formData.supervisorCode.trim() : null,
        password: formData.password,
      };

      const response = await createUser(payload);

      // console.log("User created successfully:", response);
      // =====================================================
      // Email Verification Modal
      // =====================================================

      setVerificationEmail(formData.email.trim().toLowerCase());
      setVerificationError("");
      setShowVerifyModal(true);

      // Yahan baad mein login/dashboard redirect kar sakte hain.
    } catch (error) {
      console.error("Signup error:", error);

      setError(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to create account.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        {/* =====================================================
            Logo / Header
        ====================================================== */}

        <div className="mb-8 flex flex-col items-center justify-center gap-2 text-center">
          <Image
            src="/images/logo.png"
            alt="Zerodose Logo"
            width={100}
            height={100}
            loading="eager"
          />

          <p className="mt-2 text-sm text-text-secondary">
            Register your account to get started
          </p>
        </div>

        {/* =====================================================
            Card
        ====================================================== */}

        <div className="rounded-2xl border border-border bg-background p-6 shadow-sm sm:p-8">
          {/* Error */}

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* =====================================================
                Personal Information
            ====================================================== */}

            <section>
              <h2 className="text-lg font-semibold text-text">
                Personal Information
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Full Name */}

                <div className="sm:col-span-2">
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Full Name
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    minLength={2}
                    maxLength={100}
                    required
                    disabled={loading}
                    className="w-full rounded-lg border border-border bg-input-background px-4 py-3 text-sm text-text outline-none transition placeholder:text-input-placeholder focus:border-primary focus:ring-2 focus:ring-primary-light disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {/* Contact Number */}

                <div>
                  <label
                    htmlFor="contactNumber"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Contact Number
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    id="contactNumber"
                    name="contactNumber"
                    type="tel"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    placeholder="03XXXXXXXXX"
                    pattern="03[0-9]{9}"
                    maxLength={11}
                    inputMode="tel"
                    required
                    disabled={loading}
                    className="w-full rounded-lg border border-border bg-input-background px-4 py-3 text-sm text-text outline-none transition placeholder:text-input-placeholder focus:border-primary focus:ring-2 focus:ring-primary-light disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {/* Email */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Email
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                    disabled={loading}
                    className="w-full rounded-lg border border-border bg-input-background px-4 py-3 text-sm text-text outline-none transition placeholder:text-input-placeholder focus:border-primary focus:ring-2 focus:ring-primary-light disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>
            </section>

            {/* =====================================================
                Work Information
            ====================================================== */}

            <section>
              <h2 className="text-lg font-semibold text-text">
                Work Information
              </h2>

              <div className="mt-4">
                {/* Designation */}

                <Select
                  label="Designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  options={DESIGNATIONS}
                  placeholder="Select designation"
                  loading={false}
                  disabled={loading}
                  required
                />
              </div>

              {/* Supervisor Code */}

              {isSupervisor && (
                <div className="mt-5">
                  <label
                    htmlFor="supervisorCode"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Supervisor Code
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <input
                    id="supervisorCode"
                    name="supervisorCode"
                    type="text"
                    value={formData.supervisorCode}
                    onChange={handleChange}
                    placeholder="Enter supervisor code"
                    required
                    disabled={loading}
                    className="w-full rounded-lg border border-border bg-input-background px-4 py-3 text-sm uppercase text-text outline-none transition placeholder:text-input-placeholder focus:border-primary focus:ring-2 focus:ring-primary-light disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              )}
            </section>

            {/* =====================================================
                Location
            ====================================================== */}

            <section>
              <h2 className="text-lg font-semibold text-text">Location</h2>

              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
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
                />

                {/* Union Council */}

                <Select
                  label="Union Council"
                  name="unionCouncil"
                  value={formData.unionCouncil}
                  onChange={handleChange}
                  options={unionCouncils.map((unionCouncil) => ({
                    value: unionCouncil._id,
                    label: unionCouncil.name,
                    code: unionCouncil.code,
                  }))}
                  placeholder={
                    !formData.town
                      ? "Select town first"
                      : "Select Union Council"
                  }
                  loading={ucLoading}
                  disabled={loading || !formData.town}
                  showCode
                  codePrefix="UC"
                  required
                />
              </div>
            </section>

            {/* =====================================================
                Security
            ====================================================== */}

            <section>
              <h2 className="text-lg font-semibold text-text">Security</h2>

              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Password */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Password
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 8 characters"
                      minLength={8}
                      required
                      autoComplete="new-password"
                      disabled={loading}
                      className="w-full rounded-lg border border-border bg-input-background px-4 py-3 pr-16 text-sm text-text outline-none transition placeholder:text-input-placeholder focus:border-primary focus:ring-2 focus:ring-primary-light disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-text-secondary transition hover:text-text disabled:opacity-50"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-text"
                  >
                    Confirm Password
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      minLength={8}
                      required
                      autoComplete="new-password"
                      disabled={loading}
                      className="w-full rounded-lg border border-border bg-input-background px-4 py-3 pr-16 text-sm text-text outline-none transition placeholder:text-input-placeholder focus:border-primary focus:ring-2 focus:ring-primary-light disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-text-secondary transition hover:text-text disabled:opacity-50"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* =====================================================
                Submit
            ====================================================== */}

            <button
              type="submit"
              disabled={loading || districtLoading || townLoading || ucLoading}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* =====================================================
              Login
          ====================================================== */}

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

            console.log("Email verification successful:", response);

            const { user } = response.data;

            console.log("Verified user:", user);

            const route = dashboardRoutes[user.designation];

            if (!route) {
              throw new Error("Invalid user designation.");
            }

            console.log("Redirecting to:", route);

            setShowVerifyModal(false);

            router.replace(route);
          } catch (error) {
            console.error("Email verification error:", error);

            setVerificationError(
              error?.response?.data?.message ||
              error?.message ||
              "Invalid verification code.",
            );
          } finally {
            setVerificationLoading(false);
          }
        }}
        onResend={async () => {
          try {
            setResendLoading(true);
            setVerificationError("");

            const response = await resendVerificationCode({
              email: verificationEmail,
            });

            console.log("Verification code resent:", response);
          } catch (error) {
            console.error("Resend verification error:", error);

            setVerificationError(
              error?.response?.data?.message ||
              error?.message ||
              "Failed to resend verification code.",
            );
          } finally {
            setResendLoading(false);
          }
        }}
      />

    </main>
  );
}
