"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Database,
  ShieldCheck,
  Users,
  UsersRound,
} from "lucide-react";

import { getGlobalCount } from "@/api/dashboardApi";
import useAnimatedCounter from "@/hooks/useAnimatedCounter";

export default function HomePage() {
  // ============================================================
  // Dashboard Counts
  // ============================================================

  const [counts, setCounts] = useState({
    campaigns: 0,
    teams: 0,
    supervisors: 0,
    zerodose: 0,
  });

  const [loading, setLoading] = useState(true);

  // ============================================================
  // Reusable Number Animation
  // ============================================================

  const { values: animatedCounts, loadingDots } = useAnimatedCounter(counts, {
    loading,
    duration: 1000,
  });

  // ============================================================
  // Fetch Dashboard Counts
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const fetchCounts = async () => {
      try {
        setLoading(true);

        const response = await getGlobalCount(
          "supervisors,teams,zerodose,campaigns",
        );

        const data = response?.data || {};

        if (!mounted) {
          return;
        }

        setCounts({
          campaigns: data.campaigns ?? 0,
          teams: data.teams ?? 0,
          supervisors: data.supervisors ?? 0,
          zerodose: data.zerodose ?? 0,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard counts:", error);

        if (!mounted) {
          return;
        }

        setCounts({
          campaigns: 0,
          teams: 0,
          supervisors: 0,
          zerodose: 0,
        });
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchCounts();

    return () => {
      mounted = false;
    };
  }, []);



  // ============================================================
  // Stats
  // ============================================================

  const stats = [
    {
      label: "Campaigns",
      value: animatedCounts.campaigns,
      icon: BarChart3,
    },
    {
      label: "Supervisors",
      value: animatedCounts.supervisors,
      icon: ShieldCheck,
    },
    {
      label: "Teams",
      value: animatedCounts.teams,
      icon: UsersRound,
    },
    {
      label: "Zerodose",
      value: animatedCounts.zerodose,
      icon: Database,
    },
  ];

  return (
    <main className="bg-surface relative flex min-h-screen items-center justify-center overflow-hidden px-3 py-4 sm:px-5 sm:py-8">
      {/* ========================================================
          Background Decoration
      ======================================================== */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-primary/5 absolute -top-32 -left-32 h-72 w-72 rounded-full blur-3xl" />

        <div className="bg-primary/5 absolute -right-32 -bottom-32 h-80 w-80 rounded-full blur-3xl" />

        <div className="absolute inset-0 opacity-[0.025]">
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "36px 36px",
            }}
          />
        </div>
      </div>

      {/* ========================================================
          Main Container
      ======================================================== */}

      <div className="relative z-10 w-full max-w-6xl">
        {/* ======================================================
            Main Card
        ====================================================== */}

        <div className="bg-background border-border overflow-hidden rounded-2xl border shadow-[0_20px_70px_-30px_rgba(0,0,0,0.18)] sm:rounded-3xl">
          <div className="grid md:grid-cols-[0.95fr_1.05fr]">
            {/* ==================================================
                LEFT / BRANDING
            ================================================== */}

            <section className="relative flex flex-col justify-center overflow-hidden p-6 sm:p-9 md:p-10 lg:p-12 xl:p-14">
              {/* Decorative Circle */}

              <div className="bg-primary/5 pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full" />

              <div className="relative z-10">
                {/* Logo */}

                <div className="mb-7 flex items-center justify-center md:justify-start">
                  <div className="bg-primary-light border-primary/10 flex h-20 w-20 items-center justify-center rounded-2xl border shadow-sm sm:h-24 sm:w-24">
                    <Image
                      src="/images/logo.png"
                      alt="Zerodose Logo"
                      width={100}
                      height={100}
                      className="h-[72px] w-[72px] object-contain sm:h-[84px] sm:w-[84px]"
                      priority
                    />
                  </div>
                </div>

                {/* Brand */}

                <div className="mb-4 flex items-center justify-center gap-2 md:justify-start">
                  <span className="bg-primary-light text-primary inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-[0.14em]">
                    ZERODOSE
                  </span>
                </div>

                {/* Heading */}

                <h1 className="text-text mx-auto max-w-xl text-center text-[2rem] leading-[1.08] font-bold tracking-tight sm:text-4xl md:mx-0 md:text-left lg:text-[2.75rem]">
                  Centralized
                  <span className="text-primary mt-1 block">
                    Management System
                  </span>
                </h1>

                {/* Description */}

                <p className="text-text-secondary mx-auto mt-5 max-w-lg text-center text-sm leading-6 sm:text-base sm:leading-7 md:mx-0 md:text-left">
                  A centralized platform designed to manage, monitor, and
                  organize Zerodose operations with clarity and efficiency.
                </p>

                {/* CTA */}

                <div className="mt-7 flex justify-center md:mt-9 md:justify-start">
                  <Link
                    href="/auth/login"
                    className="bg-primary hover:bg-primary-dark group focus:ring-primary/20 inline-flex h-12 items-center justify-center gap-2 rounded-xl px-6 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus:ring-4 focus:outline-none"
                  >
                    Access Dashboard
                    <ArrowRight className="h-4.5 w-4.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Link>
                </div>

                {/* Trust Indicator */}

                <div className="mt-7 flex items-center justify-center gap-2 md:justify-start">
                  <div className="bg-primary-light text-primary flex h-7 w-7 items-center justify-center rounded-lg">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>

                  <span className="text-text-secondary text-xs font-medium">
                    Secure centralized data management
                  </span>
                </div>
              </div>
            </section>

            {/* ==================================================
                RIGHT / OVERVIEW
            ================================================== */}

            <section className="bg-surface-blue relative flex items-center justify-center overflow-hidden p-4 sm:p-7 md:p-8 lg:p-10">
              {/* Decorative Elements */}

              <div className="bg-primary/5 pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full" />

              <div className="bg-primary/5 pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full" />

              <div className="relative z-10 w-full max-w-xl">
                {/* Dashboard Card */}

                <div className="bg-background border-border overflow-hidden rounded-2xl border shadow-sm sm:rounded-3xl">
                  {/* Header */}

                  <div className="border-border border-b p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="bg-primary h-2 w-2 rounded-full" />

                          <p className="text-text-secondary text-xs font-medium tracking-wider uppercase">
                            System Overview
                          </p>
                        </div>

                        <h2 className="text-text text-xl font-bold tracking-tight sm:text-2xl">
                          Management Overview
                        </h2>

                        <p className="text-text-secondary mt-1.5 text-xs leading-5 sm:text-sm">
                          Current system activity and records
                        </p>
                      </div>

                      <div className="bg-primary-light text-primary flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                    </div>

                    {/* Status */}

                    <div className="bg-surface mt-5 flex items-center justify-between rounded-xl px-3.5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-sm">
                          <CheckCircle2 className="text-primary h-4 w-4" />
                        </div>

                        <div>
                          <p className="text-text text-xs font-semibold">
                            System Status
                          </p>

                          <p className="text-text-secondary text-[11px]">
                            {loading
                              ? "Loading information..."
                              : "Overview updated successfully"}
                          </p>
                        </div>
                      </div>

                      {!loading && (
                        <span className="text-primary text-[11px] font-semibold">
                          Live
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-4 sm:gap-4 sm:p-5">
                    {stats.map((stat) => {
                      const Icon = stat.icon;

                      return (
                        <div
                          key={stat.label}
                          className="group bg-surface border-border/60 relative overflow-hidden rounded-xl border p-4 shadow-sm transition-all duration-300 sm:p-5"
                        >
                          {/* Decorative background */}
                          <div className="bg-primary/5 pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full md:h-28 md:w-28" />

                          {/* Top row */}
                          <div className="relative flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-text-secondary text-xs font-medium sm:text-sm">
                                {stat.label}
                              </p>

                              <p className="text-text mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                                {loading
                                  ? loadingDots
                                  : stat.value.toLocaleString()}
                              </p>
                            </div>

                            {/* Icon */}
                            <div className="bg-primary-light text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm sm:h-11 sm:w-11">
                              <Icon className="h-5 w-5" />
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-text-secondary relative mt-3 text-[11px] leading-relaxed sm:text-xs">
                            {stat.description}
                          </p>

                          {/* Bottom accent */}
                          <div className="bg-primary absolute bottom-0 left-0 h-0.5 w-full origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}

                  <div className="border-border border-t px-5 py-4 sm:px-6">
                    <div className="flex items-center gap-2">
                      <Users className="text-text-secondary h-4 w-4" />

                      <p className="text-text-secondary text-xs">
                        Centralized field operations and data monitoring
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* ======================================================
            Footer
        ====================================================== */}

        <div className="mt-4 flex flex-col items-center justify-center gap-1 sm:mt-6 sm:flex-row sm:gap-2">
          <p className="text-text-secondary text-xs sm:text-sm">
            © {new Date().getFullYear()} ZeroDose Management System
          </p>

          <span className="text-border hidden sm:inline">•</span>

          <p className="text-text-secondary text-[11px] sm:text-xs">
            Centralized. Simple. Efficient.
          </p>
        </div>
      </div>
    </main>
  );
}
