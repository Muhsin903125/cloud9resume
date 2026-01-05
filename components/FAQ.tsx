import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  theme?: "light" | "dark";
}

export default function FAQ({ items, theme = "light" }: FAQProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const isDark = theme === "dark";

  return (
    <div className="max-w-3xl mx-auto my-4 md:my-16 px-4 md:px-0">
      {/* <h2
        className={`text-3xl font-semibold mb-12 text-center ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        Frequently Asked Questions
      </h2> */}

      <div className="space-y-4 font-normal">
        {items.map((faq, idx) => (
          <div
            key={idx}
            className={`border rounded-xl overflow-hidden shadow-sm transition-all ${
              isDark
                ? "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                : "bg-white border-slate-100 hover:border-blue-100"
            }`}
          >
            <button
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                isDark ? "hover:bg-slate-700/30" : "hover:bg-slate-50/50"
              }`}
            >
              <span
                className={`font-bold ${
                  isDark ? "text-slate-200" : "text-slate-900"
                }`}
              >
                {faq.question}
              </span>
              <ChevronDownIcon
                className={`w-5 h-5 transition-transform duration-300 ${
                  activeFaq === idx
                    ? isDark
                      ? "rotate-180 text-blue-400"
                      : "rotate-180 text-blue-600"
                    : isDark
                    ? "text-slate-500"
                    : "text-slate-400"
                }`}
              />
            </button>
            <AnimatePresence>
              {activeFaq === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div
                    className={`px-4 pb-4 text-sm leading-relaxed border-t pt-3 ${
                      isDark
                        ? "text-slate-400 border-slate-700/50"
                        : "text-slate-500 border-slate-50"
                    }`}
                  >
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
