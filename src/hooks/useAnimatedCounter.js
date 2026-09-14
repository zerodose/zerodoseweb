"use client";

import { useEffect, useState } from "react";

export default function useAnimatedCounter(
  targets,
  {
    duration = 700,
    loading = false,
    loadingMax = 99,
    loadingMode = "random", // random | count
    dotsDuration = 1200,
  } = {},
) {
  const [values, setValues] = useState(() => {
    const initial = {};

    Object.keys(targets).forEach((key) => {
      initial[key] = 0;
    });

    return initial;
  });

  const [loadingDots, setLoadingDots] = useState(".");

  useEffect(() => {
    let animationFrame;
    let numberInterval;
    let dotsInterval;
    let numberTimeout;

    // ==========================================
    // LOADING ANIMATION
    // ==========================================

    if (loading) {
      // ------------------------------------------
      // DOTS ANIMATION
      // . → .. → ...
      // ------------------------------------------

      dotsInterval = setInterval(() => {
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

      // ------------------------------------------
      // START NUMBERING AFTER DOTS
      // ------------------------------------------

      numberTimeout = setTimeout(() => {
        if (loadingMode === "random") {
          numberInterval = setInterval(() => {
            const next = {};

            Object.keys(targets).forEach((key) => {
              next[key] = Math.floor(Math.random() * loadingMax);
            });

            setValues(next);
          }, 20);
        }

        if (loadingMode === "count") {
          let counter = 0;

          numberInterval = setInterval(() => {
            counter = (counter + 3) % loadingMax;

            const next = {};

            Object.keys(targets).forEach((key, index) => {
              next[key] = (counter + index * 15) % loadingMax;
            });

            setValues(next);
          }, 20);
        }
      }, dotsDuration);

      return () => {
        clearInterval(dotsInterval);
        clearInterval(numberInterval);
        clearTimeout(numberTimeout);
      };
    }

    // ==========================================
    // FINAL ANIMATION
    // ==========================================

    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;

      const progress = Math.min(elapsed / duration, 1);

      // Ease Out
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      const next = {};

      Object.keys(targets).forEach((key) => {
        next[key] = Math.floor(Number(targets[key] || 0) * easedProgress);
      });

      setValues(next);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setValues(targets);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [targets, duration, loading, loadingMax, loadingMode, dotsDuration]);

  return {
    values,
    loadingDots,
  };
}
