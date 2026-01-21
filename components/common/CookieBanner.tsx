import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie_consent", "essential_only");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 20, scale: 0.9, filter: "blur(10px)" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-6 right-6 z-[100] w-[calc(100%-3rem)] md:w-[380px] bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[32px] p-6 font-bricolage overflow-hidden"
        >
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[40px] -mr-16 -mt-16 pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest font-outfit">
                Privacy Nodes
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium">
              We use digital cookies to sync your experience with our neural
              mapping tools. By accepting, you authorize data flow for
              performance optimization.
              <br />
              <a
                href="/privacy"
                className="text-blue-600 hover:text-blue-700 underline underline-offset-4 decoration-blue-500/30 transition-colors"
              >
                Read Node Protocol
              </a>
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleDecline}
                className="flex-1 px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 hover:bg-slate-100 hover:text-slate-600 rounded-2xl transition-all"
              >
                Essential
              </button>
              <button
                onClick={handleAccept}
                className="flex-[2] px-6 py-3 text-[10px] font-black text-white uppercase tracking-widest bg-slate-900 hover:bg-blue-600 rounded-2xl shadow-xl shadow-slate-900/10 hover:shadow-blue-500/20 transition-all active:scale-95"
              >
                Accept All Nodes
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
