"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
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

    setLoading(true);

    try {
      // Backend API baad mein connect karenge
      console.log("Login data:", formData);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 flex flex-col items-center justify-center gap-2">
          <Image
            src="/images/logo.png"
            alt="Zerodose Logo"
            width={100}
            height={100}
            loading="eager"
          />

          <p className="mt-2 text-sm text-text-secondary">
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div className="bg-background rounded-2xl shadow-sm border border-border p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text mb-2"
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
                autoComplete="email"
                required
                className="w-full rounded-lg border border-border bg-input-background px-4 py-3 text-sm text-text placeholder:text-muted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-light"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-text"
                >
                  Password
                </label>

                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:text-primary-dark transition"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-lg border border-border bg-input-background px-4 py-3 pr-20 text-sm text-text placeholder:text-muted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-light"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted hover:text-text transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Signup */}
          <div className="mt-6 text-center text-sm text-text-secondary">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-semibold text-primary hover:text-primary-dark transition"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
