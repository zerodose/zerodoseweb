"use client";

import {
  Activity,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

const defaultStats = [
  {
    key: "campaigns",
    title: "Total Campaigns",
    value: 0,
    icon: BriefcaseBusiness,
  },
  {
    key: "districts",
    title: "Total Districts",
    value: 0,
    icon: Building2,
  },
  {
    key: "supervisors",
    title: "Total Supervisors",
    value: 0,
    icon: ShieldCheck,
  },
  {
    key: "teams",
    title: "Total Teams",
    value: 0,
    icon: Users,
  },
  {
    key: "zerodose",
    title: "Total Zerodose",
    value: 0,
    icon: ClipboardList,
  },
  {
    key: "covered",
    title: "Total Covered",
    value: 0,
    icon: Activity,
  },
];

export default function DashboardStats({ stats = {} }) {
  const [animated, setAnimated] = useState(false);
  const [displayValues, setDisplayValues] = useState({});

  // =====================================================
  // Card animation
  // =====================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimated(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // =====================================================
  // Number Counter Animation
  // =====================================================

  // =====================================================
  // Fast Number Loading Animation
  // =====================================================

  useEffect(() => {
    const duration = 700;
    const startTime = performance.now();

    const targets = {};

    defaultStats.forEach((item) => {
      targets[item.key] = Number(stats[item.key] ?? 0);
    });

    const animateNumbers = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const nextValues = {};

      defaultStats.forEach((item) => {
        const target = targets[item.key];

        if (progress < 1) {
          // Fast loading/rolling feel
          const randomMax = Math.max(Math.floor(target * 1.2), 100);

          nextValues[item.key] = Math.floor(Math.random() * randomMax);
        } else {
          // Exact DB value at the end
          nextValues[item.key] = target;
        }
      });

      setDisplayValues(nextValues);

      if (progress < 1) {
        requestAnimationFrame(animateNumbers);
      } else {
        setDisplayValues(targets);
      }
    };

    requestAnimationFrame(animateNumbers);
  }, [stats]);

  return (
    <div className="grid grid-cols-2 gap-3 pb-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {defaultStats.map((item, index) => {
        const Icon = item.icon;

        const value = Number(displayValues[item.key] ?? 0);

        return (
          <div
            key={item.key}
            className={`bg-background border-border rounded-2xl border p-4 shadow-sm transition-all duration-700 ease-out sm:p-5 ${
              animated ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
            style={{
              transitionDelay: `${index * 100}ms`,
            }}
          >
            {/* =================================================
                Icon
            ================================================= */}

            <div className="flex items-start justify-between">
              <div className="bg-primary-light flex h-10 w-10 items-center justify-center rounded-xl">
                <Icon className="text-primary h-5 w-5" />
              </div>
            </div>

            {/* =================================================
                Count
            ================================================= */}

            <div className="mt-4">
              <p className="text-text-secondary text-xs font-medium">
                {item.title}
              </p>

              <p className="text-text mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                {value.toLocaleString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
