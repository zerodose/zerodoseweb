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
    <div className="pointer-events-none fixed top-0 right-0 left-0 z-[99999] h-0.75 overflow-hidden">
      <div className="bg-primary h-full w-1/3 animate-[tab-loading_1s_ease-in-out_infinite]" />

      <style jsx>{`
        @keyframes tab-loading {
          0% {
            transform: translateX(-100%);
          }

          50% {
            transform: translateX(200%);
          }

          100% {
            transform: translateX(400%);
          }
        }
      `}</style>
    </div>
  );
}