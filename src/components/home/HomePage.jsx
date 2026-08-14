"use client";

import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getGlobalCount } from "@/api/dashboardApi";

export default function HomePage() {
  const [counts, setCounts] = useState({
    campaigns: 0,
    teams: 0,
    supervisors: 0,
    zerodose: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await getGlobalCount("supervisors,teams,zerodose");

        const data = response?.data || {};

        setCounts({
          campaigns: 0,
          teams: data.teams ?? 0,
          supervisors: data.supervisors ?? 0,
          zerodose: data.zerodose ?? 0,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard counts:", error);

        setCounts({
          campaigns: 0,
          teams: 0,
          supervisors: 0,
          zerodose: 0,
        });
      }
    };

    fetchCounts();
  }, []);

  return (
    <main className="bg-surface flex min-h-screen items-center justify-center px-3 py-4 sm:px-4 sm:py-8">
      <div className="w-full max-w-5xl">
        <div className="bg-background border-border overflow-hidden rounded-2xl border shadow-sm sm:rounded-3xl">
          <div className="flex flex-col md:grid md:grid-cols-2">
            {/* =================================================
                Management Overview
            ================================================= */}

            <div className="bg-surface-blue order-1 flex items-center justify-center p-4 sm:p-6 md:order-2 md:p-6">
              <div className="w-full max-w-lg">
                <div className="bg-background border-border rounded-2xl border p-4 shadow-sm sm:p-6">
                  {/* Header */}
                  <div className="mb-4 flex items-center justify-between sm:mb-6">
                    <div>
                      <p className="text-text-secondary text-xs sm:text-sm">
                        Dashboard
                      </p>

                      <h2 className="text-text mt-1 text-lg font-bold sm:text-xl">
                        Management Overview
                      </h2>
                    </div>

                    <div className="bg-primary-light flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10">
                      <ShieldCheck className="text-primary h-5 w-5" />
                    </div>
                  </div>

                  {/* Counts */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {/* Campaigns */}
                    <div className="bg-surface rounded-xl p-3 sm:p-4">
                      <p className="text-text-secondary text-xs">Campaigns</p>

                      <p className="text-text mt-1 text-xl font-bold sm:text-2xl">
                        {counts.campaigns}
                      </p>
                    </div>

                    {/* Supervisors */}
                    <div className="bg-surface rounded-xl p-3 sm:p-4">
                      <p className="text-text-secondary text-xs">Supervisors</p>

                      <p className="text-text mt-1 text-xl font-bold sm:text-2xl">
                        {counts.supervisors}
                      </p>
                    </div>

                    {/* Teams */}
                    <div className="bg-surface rounded-xl p-3 sm:p-4">
                      <p className="text-text-secondary text-xs">Teams</p>

                      <p className="text-text mt-1 text-xl font-bold sm:text-2xl">
                        {counts.teams}
                      </p>
                    </div>

                    {/* Zerodose */}
                    <div className="bg-surface rounded-xl p-3 sm:p-4">
                      <p className="text-text-secondary text-xs">Zerodose</p>

                      <p className="text-text mt-1 text-xl font-bold sm:text-2xl">
                        {counts.zerodose}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                Left Content
            ================================================= */}

            <div className="order-2 flex flex-col justify-center p-5 sm:p-8 md:order-1 md:p-10 lg:p-12">
              {/* Logo */}
              <div className="mb-5 flex justify-center md:mb-7 md:justify-start">
                <Image
                  src="/images/logo.png"
                  alt="Zerodose Logo"
                  width={100}
                  height={100}
                  className="h-[100px] w-[100px] object-contain"
                  priority
                />
              </div>

              {/* Brand */}
              <div className="mb-3 flex items-center justify-center gap-2 md:justify-start">
                <span className="text-primary text-sm font-semibold tracking-wide">
                  ZERODOSE
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-text mx-auto max-w-md text-center text-3xl leading-[1.15] font-bold tracking-tight sm:text-4xl md:mx-0 md:text-left">
                Centralized
                <span className="text-primary block">Management System</span>
              </h1>

              {/* Description */}
              <p className="text-text-secondary mx-auto mt-4 max-w-md text-center text-sm leading-6 sm:text-base sm:leading-7 md:mx-0 md:text-left md:text-lg">
                A simple and centralized platform to manage, monitor, and
                organize Zerodose data efficiently.
              </p>

              {/* Login */}
              <div className="mt-6 flex justify-center md:mt-8 md:justify-start">
                <Link
                  href="/auth/login"
                  className="bg-primary hover:bg-primary-dark inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  Login
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-text-secondary mt-4 text-center text-xs sm:mt-6 sm:text-sm">
          © {new Date().getFullYear()} ZeroDose Management System
        </p>
      </div>
    </main>
  );
}
