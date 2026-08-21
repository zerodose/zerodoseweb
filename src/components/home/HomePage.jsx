// "use client";

// import Link from "next/link";
// import { ArrowRight, ShieldCheck } from "lucide-react";
// import Image from "next/image";
// import { useEffect, useState } from "react";

// import { getGlobalCount } from "@/api/dashboardApi";

// export default function HomePage() {
//   const [counts, setCounts] = useState({
//     campaigns: 0,
//     teams: 0,
//     supervisors: 0,
//     zerodose: 0,
//   });

//   const [animatedCounts, setAnimatedCounts] = useState({
//     campaigns: 0,
//     teams: 0,
//     supervisors: 0,
//     zerodose: 0,
//   });

//   const [loading, setLoading] = useState(true);
//   const [loadingDots, setLoadingDots] = useState(".");

//   // =====================================================
//   // Fetch Dashboard Counts
//   // =====================================================

//   useEffect(() => {
//     let mounted = true;

//     const fetchCounts = async () => {
//       try {
//         setLoading(true);

//         // Pehle jo working query thi usi ko use kar rahe hain
//         const response = await getGlobalCount("supervisors,teams,zerodose,campaigns");

//         const data = response?.data || {};

//         if (!mounted) {
//           return;
//         }

//         setCounts({
//           // Campaigns abhi API se nahi aa raha
//           campaigns: data.campaigns ?? 0,
//           teams: data.teams ?? 0,
//           supervisors: data.supervisors ?? 0,
//           zerodose: data.zerodose ?? 0,
//         });
//       } catch (error) {
//         console.error("Failed to fetch dashboard counts:", error);

//         if (!mounted) {
//           return;
//         }

//         setCounts({
//           campaigns: 0,
//           teams: 0,
//           supervisors: 0,
//           zerodose: 0,
//         });
//       } finally {
//         if (mounted) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchCounts();

//     return () => {
//       mounted = false;
//     };
//   }, []);

//   // =====================================================
//   // Loading Dots
//   // . -> .. -> ... -> .
//   // =====================================================

//   useEffect(() => {
//     if (!loading) {
//       setLoadingDots(".");
//       return;
//     }

//     const interval = setInterval(() => {
//       setLoadingDots((previous) => {
//         if (previous === ".") {
//           return "..";
//         }

//         if (previous === "..") {
//           return "...";
//         }

//         return ".";
//       });
//     }, 400);

//     return () => {
//       clearInterval(interval);
//     };
//   }, [loading]);

//   // =====================================================
//   // Number Counter Animation
//   // =====================================================

//   useEffect(() => {
//     if (loading) {
//       return;
//     }

//     const duration = 1000;
//     const startTime = performance.now();

//     let animationFrame;

//     const animate = (currentTime) => {
//       const elapsed = currentTime - startTime;
//       const progress = Math.min(elapsed / duration, 1);

//       // Smooth ease-out
//       const easedProgress = 1 - Math.pow(1 - progress, 3);

//       setAnimatedCounts({
//         campaigns: Math.floor(counts.campaigns * easedProgress),

//         teams: Math.floor(counts.teams * easedProgress),

//         supervisors: Math.floor(counts.supervisors * easedProgress),

//         zerodose: Math.floor(counts.zerodose * easedProgress),
//       });

//       if (progress < 1) {
//         animationFrame = requestAnimationFrame(animate);
//       } else {
//         // Exact final values
//         setAnimatedCounts({
//           campaigns: counts.campaigns,
//           teams: counts.teams,
//           supervisors: counts.supervisors,
//           zerodose: counts.zerodose,
//         });
//       }
//     };

//     animationFrame = requestAnimationFrame(animate);

//     return () => {
//       cancelAnimationFrame(animationFrame);
//     };
//   }, [loading, counts]);

//   return (
//     <main className="bg-surface flex min-h-screen items-center justify-center px-3 py-4 sm:px-4 sm:py-8">
//       <div className="w-full max-w-5xl">
//         <div className="bg-background border-border overflow-hidden rounded-2xl border shadow-sm sm:rounded-3xl">
//           <div className="flex flex-col md:grid md:grid-cols-2">
//             {/* =================================================
//                 Left Content
//             ================================================= */}

//             <div className="order-1 flex flex-col justify-center p-5 sm:p-8 md:order-1 mb-10 md:mb-0 md:p-10 lg:p-12">
//               {/* Logo */}

//               <div className="mb-5 flex justify-center md:mb-7 md:justify-start">
//                 <Image
//                   src="/images/logo.png"
//                   alt="Zerodose Logo"
//                   width={100}
//                   height={100}
//                   className="h-[100px] w-[100px] object-contain"
//                   priority
//                 />
//               </div>

//               {/* Brand */}

//               <div className="mb-3 flex items-center justify-center gap-2 md:justify-start">
//                 <span className="text-primary text-sm font-semibold tracking-wide">
//                   ZERODOSE
//                 </span>
//               </div>

//               {/* Heading */}

//               <h1 className="text-text mx-auto max-w-md text-center text-3xl leading-[1.15] font-bold tracking-tight sm:text-4xl md:mx-0 md:text-left">
//                 Centralized
//                 <span className="text-primary block">Management System</span>
//               </h1>

//               {/* Description */}

//               <p className="text-text-secondary mx-auto mt-4 max-w-md text-center text-sm leading-6 sm:text-base sm:leading-7 md:mx-0 md:text-left md:text-lg">
//                 A simple and centralized platform to manage, monitor, and
//                 organize Zerodose data efficiently.
//               </p>

//               {/* Login */}

//               <div className="mt-6 flex justify-center md:mt-8 md:justify-start">
//                 <Link
//                   href="/auth/login"
//                   className="bg-primary hover:bg-primary-dark inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md"
//                 >
//                   Login
//                   <ArrowRight className="h-5 w-5" />
//                 </Link>
//               </div>
//             </div>

//             {/* =================================================
//                 Management Overview
//             ================================================= */}

//             <div className="bg-surface-blue order-2 flex items-center justify-center  p-4 sm:p-6 md:order-2 md:p-6">
//               <div className="w-full max-w-lg mt-10 md:mt-0">
//                 <div className="bg-background border-border rounded-2xl border p-4 shadow-sm sm:p-6">
//                   {/* Header */}

//                   <div className="mb-4 flex items-center justify-between sm:mb-6">
//                     <div>
//                       <p className="text-text-secondary text-xs sm:text-sm">
//                         Dashboard
//                       </p>

//                       <h2 className="text-text mt-1 text-lg font-bold sm:text-xl">
//                         Management Overview
//                       </h2>
//                     </div>

//                     <div className="bg-primary-light flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-10 sm:w-10">
//                       <ShieldCheck className="text-primary h-5 w-5" />
//                     </div>
//                   </div>

//                   {/* Counts */}

//                   <div className="grid grid-cols-2 gap-3 sm:gap-4">
//                     {/* Campaigns */}

//                     <div className="bg-surface rounded-xl p-3 sm:p-4">
//                       <p className="text-text-secondary text-xs">Campaigns</p>

//                       <p className="text-text mt-1 text-xl font-bold sm:text-2xl">
//                         {loading
//                           ? loadingDots
//                           : animatedCounts.campaigns.toLocaleString()}
//                       </p>
//                     </div>

//                     {/* Supervisors */}

//                     <div className="bg-surface rounded-xl p-3 sm:p-4">
//                       <p className="text-text-secondary text-xs">Supervisors</p>

//                       <p className="text-text mt-1 text-xl font-bold sm:text-2xl">
//                         {loading
//                           ? loadingDots
//                           : animatedCounts.supervisors.toLocaleString()}
//                       </p>
//                     </div>

//                     {/* Teams */}

//                     <div className="bg-surface rounded-xl p-3 sm:p-4">
//                       <p className="text-text-secondary text-xs">Teams</p>

//                       <p className="text-text mt-1 text-xl font-bold sm:text-2xl">
//                         {loading
//                           ? loadingDots
//                           : animatedCounts.teams.toLocaleString()}
//                       </p>
//                     </div>

//                     {/* Zerodose */}

//                     <div className="bg-surface rounded-xl p-3 sm:p-4">
//                       <p className="text-text-secondary text-xs">Zerodose</p>

//                       <p className="text-text mt-1 text-xl font-bold sm:text-2xl">
//                         {loading
//                           ? loadingDots
//                           : animatedCounts.zerodose.toLocaleString()}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}

//         <p className="text-text-secondary mt-4 text-center text-xs sm:mt-6 sm:text-sm">
//           © {new Date().getFullYear()} ZeroDose Management System
//         </p>
//       </div>
//     </main>
//   );
// }

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
  // Loading Dots
  // ============================================================

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

    return () => clearInterval(interval);
  }, [loading]);

  // ============================================================
  // Number Counter Animation
  // ============================================================

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

  // ============================================================
  // Stats
  // ============================================================

  const stats = [
    {
      label: "Campaigns",
      value: animatedCounts.campaigns,
      icon: BarChart3,
      description: "Managed campaigns",
    },
    {
      label: "Supervisors",
      value: animatedCounts.supervisors,
      icon: ShieldCheck,
      description: "Active supervisors",
    },
    {
      label: "Teams",
      value: animatedCounts.teams,
      icon: UsersRound,
      description: "Field teams",
    },
    {
      label: "Zerodose",
      value: animatedCounts.zerodose,
      icon: Database,
      description: "Records managed",
    },
  ];

  // ============================================================
  // UI
  // ============================================================

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

                  {/* Stats */}

                  <div className="grid grid-cols-2 gap-3 p-4 sm:gap-4 sm:p-5">
                    {stats.map((stat) => {
                      const Icon = stat.icon;

                      return (
                        <div
                          key={stat.label}
                          className="group bg-surface border-border/60 rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm sm:p-5"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-text-secondary text-xs font-medium">
                                {stat.label}
                              </p>

                              <p className="text-text mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
                                {loading
                                  ? loadingDots
                                  : stat.value.toLocaleString()}
                              </p>
                            </div>

                            <div className="bg-background text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg shadow-sm">
                              <Icon className="h-4.5 w-4.5" />
                            </div>
                          </div>

                          <p className="text-text-secondary mt-3 text-[11px] sm:text-xs">
                            {stat.description}
                          </p>
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
