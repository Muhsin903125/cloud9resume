import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
}

export default function FAQ({ items }: FAQProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto my-4 md:my-16 px-4 md:px-0">
      <h2 className="text-3xl font-semibold text-gray-900 mb-12 text-center">
        Frequently Asked Questions
      </h2>

      <div className="space-y-4 font-normal">
        {items.map((faq, idx) => (
          <div
            key={idx}
            className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm transition-all hover:border-blue-100"
          >
            <button
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
              className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-slate-50/50"
            >
              <span className="font-bold text-slate-900">{faq.question}</span>
              <ChevronDownIcon
                className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                  activeFaq === idx ? "rotate-180 text-blue-600" : ""
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
                  <div className="px-4 pb-4 text-slate-500 text-sm leading-relaxed border-t border-slate-50 pt-3">
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
