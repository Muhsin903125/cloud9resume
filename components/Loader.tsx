import React from "react";
import { motion } from "framer-motion";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="relative flex flex-col items-center">
        {/* Animated Icon Container */}
        <motion.div
          animate={{
            y: [-10, 10, -10],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative w-24 h-24 flex items-center justify-center"
        >
          {/* Glowing Background Blob */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute inset-0 bg-gradient-to-tr from-blue-400 to-purple-400 rounded-full blur-2xl opacity-50"
          />

          {/* Cloud Icon SVG */}
          <svg
            className="w-16 h-16 text-slate-900 z-10 relative drop-shadow-lg"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <motion.path
              d="M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.132 20.177 10.244 17.819 10.037C17.657 6.623 14.812 4 11.5 4C8.402 4 5.816 6.273 5.257 9.327C2.253 9.682 0 12.247 0 15.5C0 18.538 2.462 21 5.5 21H17.5V19Z"
              fill="url(#loaderGradient)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
              }}
            />
            <motion.path
              d="M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.132 20.177 10.244 17.819 10.037C17.657 6.623 14.812 4 11.5 4C8.402 4 5.816 6.273 5.257 9.327C2.253 9.682 0 12.247 0 15.5C0 18.538 2.462 21 5.5 21H17.5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 1.5,
                ease: "easeInOut",
              }}
            />
            <defs>
              <linearGradient
                id="loaderGradient"
                x1="0"
                y1="0"
                x2="24"
                y2="24"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Loading Spinner Ring */}
        <div className="absolute inset-0 w-24 h-24 border-4 border-slate-100 rounded-full" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 w-24 h-24 border-4 border-transparent border-t-blue-600 rounded-full"
        />
      </div>
    </div>
  );
}
