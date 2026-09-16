"use client";

import { createContext, useContext, useState } from "react";

const TabLoaderContext = createContext(null);

export function TabLoaderProvider({ children }) {
  const [loading, setLoading] = useState(false);

  const showTabLoader = () => {
    setLoading(true);
  };

  const hideTabLoader = () => {
    setLoading(false);
  };

  return (
    <TabLoaderContext.Provider
      value={{
        loading,
        showTabLoader,
        hideTabLoader,
      }}
    >
      {children}

      {loading && <TabLoader loading={loading} />}
    </TabLoaderContext.Provider>
  );
}

export function useTabLoader() {
  const context = useContext(TabLoaderContext);

  if (!context) {
    throw new Error("useTabLoader must be used inside TabLoaderProvider");
  }

  return context;
}

function TabLoader({ loading }) {
  if (!loading) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[99999] flex items-center justify-center"
      aria-label="Loading"
    >
      <div className="flex items-center gap-2">
        <span className="loader-dot" />
        <span className="loader-dot" />
        <span className="loader-dot" />
      </div>

      <style jsx>{`
        .loader-dot {
          display: block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #40a5fe;
          animation: dotPulse 1.2s ease-in-out infinite;
        }

        .loader-dot:nth-child(1) {
          animation-delay: 0s;
        }

        .loader-dot:nth-child(2) {
          animation-delay: 0.15s;
        }

        .loader-dot:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes dotPulse {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.35;
          }

          30% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
