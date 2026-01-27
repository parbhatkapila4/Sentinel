"use client";

import React, { useState, createContext, useContext } from "react";

const PricingContext = createContext<{
  isAnnual: boolean;
  setIsAnnual: (value: boolean) => void;
}>({
  isAnnual: false,
  setIsAnnual: () => { },
});

export function PricingToggle({ children }: { children?: React.ReactNode }) {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <PricingContext.Provider value={{ isAnnual, setIsAnnual }}>
      {children}
    </PricingContext.Provider>
  );
}

export function PricingToggleDisplay() {
  const { isAnnual, setIsAnnual } = usePricing();

  return (
    <div
      className="inline-flex items-center gap-4 px-5 py-2.5 rounded-full"
      style={{
        background: "rgba(20, 30, 50, 0.85)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <span
        className={`text-sm transition-colors duration-300 ${!isAnnual ? "text-white font-medium" : "text-white/50"
          }`}
      >
        Monthly
      </span>
      <div
        className="relative w-12 h-6 rounded-full cursor-pointer transition-all duration-300"
        style={{
          background: "linear-gradient(135deg, #3b5998 0%, #5b7dc1 100%)",
        }}
        onClick={() => setIsAnnual(!isAnnual)}
      >
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ease-in-out shadow-md ${isAnnual ? "right-1" : "left-1"
            }`}
        ></div>
      </div>
      <span
        className={`text-sm transition-colors duration-300 ${isAnnual ? "text-white font-medium" : "text-white/50"
          }`}
      >
        Annually
      </span>
      <span
        className="text-xs font-medium px-3 py-1 rounded-full"
        style={{
          background: "rgba(74, 222, 128, 0.15)",
          color: "#4ade80",
          border: "1px solid rgba(74, 222, 128, 0.3)",
        }}
      >
        Save 34%
      </span>
    </div>
  );
}

export function usePricing() {
  return useContext(PricingContext);
}
