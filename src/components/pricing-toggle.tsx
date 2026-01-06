"use client";

import React, { useState, createContext, useContext } from "react";

const PricingContext = createContext<{
  isAnnual: boolean;
  setIsAnnual: (value: boolean) => void;
}>({
  isAnnual: false,
  setIsAnnual: () => {},
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
    <div className="flex items-center gap-2.5">
      <span
        className={`text-sm transition-colors duration-300 ${
          !isAnnual ? "text-gray-100 font-medium" : "text-gray-500"
        }`}
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        Billed monthly
      </span>
      <div
        className="relative w-10 h-5 rounded-full cursor-pointer border border-white/8 bg-gray-900/40 transition-all duration-300"
        onClick={() => setIsAnnual(!isAnnual)}
      >
        <div
          className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-transform duration-300 ease-in-out ${
            isAnnual ? "right-0.5" : "left-0.5"
          }`}
        ></div>
      </div>
      <span
        className={`relative inline-block px-2 py-0.5 rounded-full text-sm transition-all duration-300 ${
          isAnnual ? "text-black font-medium bg-white" : "text-gray-500"
        }`}
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        Billed annually
      </span>
    </div>
  );
}

export function usePricing() {
  return useContext(PricingContext);
}
