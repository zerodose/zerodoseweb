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

      {loading && <TabLoader />}
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

function TabLoader() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[99999] flex items-center justify-center"
      aria-label="Loading"
    >
      <div className="flex items-center gap-2">
        <div
          className="bg-primary h-2.5 w-2.5 rounded-full"
          style={{
            animation: "tabLoaderBounce 1s ease-in-out infinite",
          }}
        />

        <div
          className="bg-primary h-2.5 w-2.5 rounded-full"
          style={{
            animation: "tabLoaderBounce 1s ease-in-out -0.16s infinite",
          }}
        />

        <div
          className="bg-primary h-2.5 w-2.5 rounded-full"
          style={{
            animation: "tabLoaderBounce 1s ease-in-out -0.32s infinite",
          }}
        />
      </div>
      <style jsx>{`
        @keyframes tabLoaderBounce {
          0%,
          100% {
            transform: translateY(8px);
          }

          50% {
            transform: translateY(-8px);
          }
        }
      `}</style>
    </div>
  );
}
