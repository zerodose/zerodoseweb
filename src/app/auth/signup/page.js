"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const DESIGNATIONS = [
  { value: "ucmo", label: "UCMO" },
  { value: "supervisor", label: "Supervisor" },
  { value: "vaccinator", label: "Vaccinator" },
  { value: "otherStaff", label: "Other Staff" },
  { value: "worker", label: "Worker" },
];

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
    supervisor: "",
    teamNumber: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      // Backend API baad mein connect karenge
      console.log("Signup data:", formData);
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setLoading(false);
    }
  };

  const isSupervisor = formData.designation === "supervisor";
  const isWorker = formData.designation === "worker";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        {/* Header */}
        {/* Logo / Brand */}
        <div className="text-center mb-8 flex flex-col items-center justify-center gap-2">
          <Image
            src={"/images/logo.png"}
            alt="Zerodose Logo"
            width={100}
            height={100}
          />
          {/* <h1 className="text-3xl font-bold text-text">Zerodose</h1> */}

          {/* <p className="mt-2 text-sm text-gray-500">Sign in to your account</p> */}
        </div>
        <div className="text-center mb-8">
          {/* <h1 className="text-3xl font-bold text-text">
            Create Zerodose Account
          </h1> */}

          <p className="mt-2 text-sm text-gray-500">
            Register your account to get started
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <section>
              <h2 className="text-lg font-semibold text-text">
                Personal Information
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Name */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Full Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    minLength={2}
                    maxLength={100}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Contact */}
                <div>
                  <label
                    htmlFor="contactNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Contact Number
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
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required={!isWorker}
                    disabled={isWorker}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  {isWorker && (
                    <p className="mt-1 text-xs text-gray-500">
                      Email is not required for workers.
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Location */}
            <section>
              <h2 className="text-lg font-semibold text-text">Location</h2>

              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
                {/* District */}
                <div>
                  <label
                    htmlFor="district"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    District
                  </label>

                  <select
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select District</option>
                    <option value="placeholder">District options later</option>
                  </select>
                </div>

                {/* Town */}
                <div>
                  <label
                    htmlFor="town"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Town
                  </label>

                  <select
                    id="town"
                    name="town"
                    value={formData.town}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select Town</option>
                    <option value="placeholder">Town options later</option>
                  </select>
                </div>

                {/* UC */}
                <div>
                  <label
                    htmlFor="unionCouncil"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Union Council
                  </label>

                  <select
                    id="unionCouncil"
                    name="unionCouncil"
                    value={formData.unionCouncil}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Select UC</option>
                    <option value="placeholder">
                      Union Council options later
                    </option>
                  </select>
                </div>
              </div>
            </section>

            {/* Designation */}
            <section>
              <h2 className="text-lg font-semibold text-text">
                Work Information
              </h2>

              <div className="mt-4">
                <label
                  htmlFor="designation"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Designation
                </label>

                <select
                  id="designation"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">Select Designation</option>

                  {DESIGNATIONS.map((designation) => (
                    <option key={designation.value} value={designation.value}>
                      {designation.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Supervisor Code */}
              {isSupervisor && (
                <div className="mt-5">
                  <label
                    htmlFor="supervisorCode"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Supervisor Code
                  </label>

                  <input
                    id="supervisorCode"
                    name="supervisorCode"
                    type="text"
                    value={formData.supervisorCode}
                    onChange={handleChange}
                    placeholder="Enter supervisor code"
                    required
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm uppercase outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              )}

              {/* Worker fields */}
              {isWorker && (
                <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Supervisor */}
                  <div>
                    <label
                      htmlFor="supervisor"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Supervisor
                    </label>

                    <select
                      id="supervisor"
                      name="supervisor"
                      value={formData.supervisor}
                      onChange={handleChange}
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">Select Supervisor</option>
                      <option value="placeholder">
                        Supervisors will load from API
                      </option>
                    </select>
                  </div>

                  {/* Team */}
                  <div>
                    <label
                      htmlFor="teamNumber"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Team Number
                    </label>

                    <input
                      id="teamNumber"
                      name="teamNumber"
                      type="number"
                      value={formData.teamNumber}
                      onChange={handleChange}
                      placeholder="Enter team number"
                      required
                      min={1}
                      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Password */}
            {!isWorker && (
              <section>
                <h2 className="text-lg font-semibold text-text">
                  Security
                </h2>

                <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Password
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
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-16 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Confirm Password
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
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 pr-16 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />

                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Login */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
