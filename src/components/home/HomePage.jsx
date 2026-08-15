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

  const [animatedCounts, setAnimatedCounts] = useState({
    campaigns: 0,
    teams: 0,
    supervisors: 0,
    zerodose: 0,
  });

  const [loading, setLoading] = useState(true);
  const [loadingDots, setLoadingDots] = useState(".");

  // =====================================================
  // Fetch Dashboard Counts
  // =====================================================

  useEffect(() => {
    let mounted = true;

    const fetchCounts = async () => {
      try {
        setLoading(true);

        // Pehle jo working query thi usi ko use kar rahe hain
        const response = await getGlobalCount("supervisors,teams,zerodose");

        const data = response?.data || {};

        if (!mounted) {
          return;
        }

        setCounts({
          // Campaigns abhi API se nahi aa raha
          campaigns: 0,
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

  // =====================================================
  // Loading Dots
  // . -> .. -> ... -> .
  // =====================================================

  useEffect(() => {
    if (!loading) {
      setLoadingDots(".");
      return;
    }

    const interval = setInterval(() => {
      setLoadingDots((previous) => {
        if (previous === ".") {
          return "..";
        }

        if (previous === "..") {
          return "...";
        }

        return ".";
      });
    }, 400);

    return () => {
      clearInterval(interval);
    };
  }, [loading]);

  // =====================================================
  // Number Counter Animation
  // =====================================================

  useEffect(() => {
    if (loading) {
      return;
    }

    const duration = 1000;
    const startTime = performance.now();

    let animationFrame;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setAnimatedCounts({
        campaigns: Math.floor(counts.campaigns * easedProgress),

        teams: Math.floor(counts.teams * easedProgress),

        supervisors: Math.floor(counts.supervisors * easedProgress),

        zerodose: Math.floor(counts.zerodose * easedProgress),
      });

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        // Exact final values
        setAnimatedCounts({
          campaigns: counts.campaigns,
          teams: counts.teams,
          supervisors: counts.supervisors,
          zerodose: counts.zerodose,
        });
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [loading, counts]);

  return (
    <main className="bg-surface flex min-h-screen items-center justify-center px-3 py-4 sm:px-4 sm:py-8">
      <div className="w-full max-w-5xl">
        <div className="bg-background border-border overflow-hidden rounded-2xl border shadow-sm sm:rounded-3xl">
          <div className="flex flex-col md:grid md:grid-cols-2">
            {/* =================================================
                Left Content
            ================================================= */}

            <div className="order-1 flex flex-col justify-center p-5 sm:p-8 md:order-1 mb-10 md:mb-0 md:p-10 lg:p-12">
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

            {/* =================================================
                Management Overview
            ================================================= */}

            <div className="bg-surface-blue order-2 flex items-center justify-center  p-4 sm:p-6 md:order-2 md:p-6">
              <div className="w-full max-w-lg mt-10 md:mt-0">
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
                        {loading
                          ? loadingDots
                          : animatedCounts.campaigns.toLocaleString()}
                      </p>
                    </div>

                    {/* Supervisors */}

                    <div className="bg-surface rounded-xl p-3 sm:p-4">
                      <p className="text-text-secondary text-xs">Supervisors</p>

                      <p className="text-text mt-1 text-xl font-bold sm:text-2xl">
                        {loading
                          ? loadingDots
                          : animatedCounts.supervisors.toLocaleString()}
                      </p>
                    </div>

                    {/* Teams */}

                    <div className="bg-surface rounded-xl p-3 sm:p-4">
                      <p className="text-text-secondary text-xs">Teams</p>

                      <p className="text-text mt-1 text-xl font-bold sm:text-2xl">
                        {loading
                          ? loadingDots
                          : animatedCounts.teams.toLocaleString()}
                      </p>
                    </div>

                    {/* Zerodose */}

                    <div className="bg-surface rounded-xl p-3 sm:p-4">
                      <p className="text-text-secondary text-xs">Zerodose</p>

                      <p className="text-text mt-1 text-xl font-bold sm:text-2xl">
                        {loading
                          ? loadingDots
                          : animatedCounts.zerodose.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
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
