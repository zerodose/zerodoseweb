"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User } from "lucide-react";
import { toast } from "sonner";

import { createUser, getUser, updateUser } from "@/api/userApi";

import { getDistrictDropdown } from "@/api/districtApi";
import { getTownDropdown } from "@/api/townApi";
import { getUnionCouncilDropdown } from "@/api/unionCouncilApi";

export default function UserForm({ mode = "create", userId = null }) {
  const router = useRouter();

  const isEdit = mode === "edit";

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);

  const [districts, setDistricts] = useState([]);
  const [towns, setTowns] = useState([]);
  const [unionCouncils, setUnionCouncils] = useState([]);

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

  // ============================================================
  // Load Districts
  // ============================================================

  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const response = await getDistrictDropdown();

        setDistricts(response?.data || []);
      } catch (error) {
        console.error("Get districts error:", error);
      }
    };

    loadDistricts();
  }, []);

  // ============================================================
  // Load User
  // ============================================================

  useEffect(() => {
    if (!isEdit || !userId) return;

    const loadUser = async () => {
      try {
        setInitialLoading(true);

        const response = await getUser(userId);

        const user = response?.data;

        if (!user) {
          toast.error("User not found.");
          router.back();
          return;
        }

        setFormData({
          name: user.name || "",
          email: user.email || "",
          contactNumber: user.contactNumber || "",
          district: user.district?._id || user.district || "",
          town: user.town?._id || user.town || "",
          unionCouncil: user.unionCouncil?._id || user.unionCouncil || "",
          designation: user.designation || "",
          supervisorCode: user.supervisorCode || "",
          password: "",
          confirmPassword: "",
        });
      } catch (error) {
        console.error("Get user error:", error);

        toast.error(error?.response?.data?.message || "Failed to load user.");

        router.back();
      } finally {
        setInitialLoading(false);
      }
    };

    loadUser();
  }, [isEdit, userId, router]);

  // ============================================================
  // Load Towns
  // ============================================================

  useEffect(() => {
    if (!formData.district) {
      setTowns([]);
      return;
    }

    const loadTowns = async () => {
      try {
        const response = await getTownDropdown(formData.district);

        setTowns(response?.data || []);
      } catch (error) {
        console.error("Get towns error:", error);
        setTowns([]);
      }
    };

    loadTowns();
  }, [formData.district]);

  // ============================================================
  // Load Union Councils
  // ============================================================

  useEffect(() => {
    if (!formData.town) {
      setUnionCouncils([]);
      return;
    }

    const loadUnionCouncils = async () => {
      try {
        const response = await getUnionCouncilDropdown(formData.town);

        setUnionCouncils(response?.data || []);
      } catch (error) {
        console.error("Get union councils error:", error);

        setUnionCouncils([]);
      }
    };

    loadUnionCouncils();
  }, [formData.town]);

  // ============================================================
  // Change
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (name === "district") {
      setFormData((previous) => ({
        ...previous,
        district: value,
        town: "",
        unionCouncil: "",
      }));
    }

    if (name === "town") {
      setFormData((previous) => ({
        ...previous,
        town: value,
        unionCouncil: "",
      }));
    }
  };

  // ============================================================
  // Submit
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required.");
      return;
    }

    if (!formData.contactNumber.trim()) {
      toast.error("Contact number is required.");
      return;
    }

    if (!formData.district) {
      toast.error("District is required.");
      return;
    }

    if (!formData.town) {
      toast.error("Town is required.");
      return;
    }

    if (!formData.unionCouncil) {
      toast.error("Union Council is required.");
      return;
    }

    if (!formData.designation) {
      toast.error("Designation is required.");
      return;
    }

    if (!isEdit) {
      if (!formData.email.trim()) {
        toast.error("Email is required.");
        return;
      }

      if (!formData.password) {
        toast.error("Password is required.");
        return;
      }

      if (formData.password.length < 8) {
        toast.error("Password must be at least 8 characters.");
        return;
      }

      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match.");
        return;
      }
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        contactNumber: formData.contactNumber.trim(),
        district: formData.district,
        town: formData.town,
        unionCouncil: formData.unionCouncil,
        designation: formData.designation,
        supervisorCode: formData.supervisorCode.trim() || undefined,
      };

      if (!isEdit) {
        payload.password = formData.password;
      }

      if (isEdit) {
        await updateUser(userId, payload);

        toast.success("User updated successfully.");
      } else {
        await createUser(payload);

        toast.success("User created successfully.");
      }

      router.push("/dashboard/users");
    } catch (error) {
      console.error("Save user error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to save user.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="text-text-secondary flex min-h-[300px] items-center justify-center">
        Loading user...
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* ========================================================
          Header
      ======================================================== */}

      <div className="mt-4 mb-6 flex items-start gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="border-border bg-background text-text-secondary hover:bg-surface mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowLeft size={18} />
        </button>

        <div>
          <h1 className="text-text text-2xl font-semibold">
            {isEdit ? "Edit User" : "Add User"}
          </h1>

          <p className="text-text-secondary mt-1 text-sm">
            {isEdit ? "Update user information." : "Create a new user."}
          </p>
        </div>
      </div>

      {/* ========================================================
          Form
      ======================================================== */}

      <div className="border-border bg-background rounded-xl border shadow-sm">
        <div className="p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="bg-primary-light text-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <User size={20} />
            </div>

            <div>
              <h2 className="text-text font-semibold">User Information</h2>

              <p className="text-text-secondary text-sm">
                Enter user details below.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Name */}

            <div>
              <label className="text-text mb-2 block text-sm font-medium">
                Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={loading}
                placeholder="Enter name"
                className="border-border bg-input-background text-text placeholder:text-input-placeholder focus:border-primary focus:ring-primary-light h-11 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 disabled:opacity-60"
              />
            </div>

            {/* Email */}

            <div>
              <label className="text-text mb-2 block text-sm font-medium">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading || isEdit}
                placeholder="Enter email"
                className="border-border bg-input-background text-text placeholder:text-input-placeholder focus:border-primary focus:ring-primary-light h-11 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 disabled:opacity-60"
              />
            </div>

            {/* Contact */}

            <div>
              <label className="text-text mb-2 block text-sm font-medium">
                Contact Number
              </label>

              <input
                type="tel"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 11);

                  setFormData((previous) => ({
                    ...previous,
                    contactNumber: value,
                  }));
                }}
                disabled={loading}
                placeholder="03XXXXXXXXX"
                inputMode="numeric"
                maxLength={11}
                className="border-border bg-input-background text-text placeholder:text-input-placeholder focus:border-primary focus:ring-primary-light h-11 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 disabled:opacity-60"
              />
            </div>

            {/* Designation */}

            <div>
              <label className="text-text mb-2 block text-sm font-medium">
                Designation
              </label>

              <select
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                disabled={loading}
                className="border-border bg-input-background text-text focus:border-primary focus:ring-primary-light h-11 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2"
              >
                <option value="">Select designation</option>

                <option value="admin">Admin</option>
                <option value="ucmo">UCMO</option>
                <option value="supervisor">Supervisor</option>
                <option value="vaccinator">Vaccinator</option>
                <option value="otherStaff">Other Staff</option>
                <option value="townFP">Town Focal Person</option>
                <option value="districtFP">District Focal Person</option>
              </select>
            </div>

            {/* District */}

            <div>
              <label className="text-text mb-2 block text-sm font-medium">
                District
              </label>

              <select
                name="district"
                value={formData.district}
                onChange={handleChange}
                disabled={loading}
                className="border-border bg-input-background text-text focus:border-primary focus:ring-primary-light h-11 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2"
              >
                <option value="">Select district</option>

                {districts.map((district) => (
                  <option key={district._id} value={district._id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Town */}

            <div>
              <label className="text-text mb-2 block text-sm font-medium">
                Town
              </label>

              <select
                name="town"
                value={formData.town}
                onChange={handleChange}
                disabled={loading || !formData.district}
                className="border-border bg-input-background text-text focus:border-primary focus:ring-primary-light h-11 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 disabled:opacity-60"
              >
                <option value="">Select town</option>

                {towns.map((town) => (
                  <option key={town._id} value={town._id}>
                    {town.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Union Council */}

            <div>
              <label className="text-text mb-2 block text-sm font-medium">
                Union Council
              </label>

              <select
                name="unionCouncil"
                value={formData.unionCouncil}
                onChange={handleChange}
                disabled={loading || !formData.town}
                className="border-border bg-input-background text-text focus:border-primary focus:ring-primary-light h-11 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 disabled:opacity-60"
              >
                <option value="">Select union council</option>

                {unionCouncils.map((uc) => (
                  <option key={uc._id} value={uc._id}>
                    {uc.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Supervisor Code */}

            <div>
              <label className="text-text mb-2 block text-sm font-medium">
                Supervisor Code
              </label>

              <input
                type="text"
                name="supervisorCode"
                value={formData.supervisorCode}
                onChange={handleChange}
                disabled={loading}
                placeholder="Enter supervisor code"
                className="border-border bg-input-background text-text placeholder:text-input-placeholder focus:border-primary focus:ring-primary-light h-11 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2 disabled:opacity-60"
              />
            </div>

            {/* Password */}

            {!isEdit && (
              <>
                <div>
                  <label className="text-text mb-2 block text-sm font-medium">
                    Password
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Enter password"
                    className="border-border bg-input-background text-text placeholder:text-input-placeholder focus:border-primary focus:ring-primary-light h-11 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2"
                  />
                </div>

                <div>
                  <label className="text-text mb-2 block text-sm font-medium">
                    Confirm Password
                  </label>

                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Confirm password"
                    className="border-border bg-input-background text-text placeholder:text-input-placeholder focus:border-primary focus:ring-primary-light h-11 w-full rounded-lg border px-3 text-sm outline-none focus:ring-2"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* ======================================================
            Buttons
        ====================================================== */}

        <div className="border-border flex flex-col-reverse gap-3 border-t p-5 sm:flex-row sm:justify-end sm:p-6">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="border-border text-text hover:bg-surface h-11 rounded-lg border px-5 text-sm font-medium"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="bg-primary hover:bg-primary-dark h-11 rounded-lg px-6 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? "Saving..." : isEdit ? "Update User" : "Add User"}
          </button>
        </div>
      </div>
    </div>
  );
}
