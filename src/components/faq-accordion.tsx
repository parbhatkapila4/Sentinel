"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className={`group relative rounded-xl border transition-all duration-500 overflow-hidden ${isOpen
                ? "bg-gradient-to-br from-gray-800/80 via-gray-800/70 to-gray-900/80 border-blue-500/40 shadow-xl shadow-blue-500/10 scale-[1.02]"
                : "bg-black/60 border-gray-800/60 hover:bg-black/70 hover:border-gray-700/70"
              }`}
            style={{
              transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 ${isOpen
                  ? "bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500 opacity-100"
                  : "bg-gradient-to-b from-gray-700 to-gray-800 opacity-0 group-hover:opacity-50"
                }`}
            ></div>

            {isOpen && (
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 pointer-events-none"></div>
            )}

            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="w-full p-5 flex items-center justify-between text-left relative z-10 group/button"
            >
              <h3
                className={`flex-1 pr-4 transition-colors duration-300 ${isOpen
                    ? "text-white font-medium"
                    : "text-white/90 group-hover/button:text-white"
                  }`}
                style={{
                  fontFamily:
                    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  fontSize: "0.95rem",
                  fontWeight: isOpen ? "500" : "400",
                  lineHeight: "1.5",
                }}
              >
                {item.question}
              </h3>
              <div
                className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-500 ${isOpen
                    ? "bg-blue-500/20 border border-blue-500/40 rotate-180"
                    : "bg-gray-800/50 border border-gray-700/50 group-hover/button:bg-gray-700/60 group-hover/button:border-gray-600/60"
                  }`}
              >
                {isOpen ? (
                  <span
                    className="text-blue-400 transition-colors duration-300"
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "300",
                      lineHeight: "1",
                    }}
                  >
                    −
                  </span>
                ) : (
                  <span
                    className="text-white/70 group-hover/button:text-white transition-colors duration-300"
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "300",
                      lineHeight: "1",
                    }}
                  >
                    +
                  </span>
                )}
              </div>
            </button>
            <div
              className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
              <div className="px-5 pb-5 pt-2 relative">
                <div className="absolute left-5 top-0 bottom-5 w-px bg-gradient-to-b from-blue-500/30 via-purple-500/30 to-transparent"></div>
                <p
                  className="text-white/70 leading-relaxed pl-4 relative"
                  style={{
                    fontFamily:
                      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                    fontSize: "0.875rem",
                    lineHeight: "1.7",
                    fontWeight: "400",
                  }}
                >
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
