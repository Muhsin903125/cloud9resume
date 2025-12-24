import React from "react";
import { motion } from "framer-motion";

export default function Loader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center z-50">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-200 rounded-full blur-3xl"
        />
      </div>

      {/* Logo SVG Loader */}
      <div className="relative">
        <motion.svg
          width="80"
          height="80"
          viewBox="0 0 100 100"
          className="drop-shadow-2xl"
        >
          {/* Cloud Shape */}
          <motion.path
            d="M25,50 Q25,35 35,35 Q40,25 50,25 Q60,25 65,35 Q75,35 75,50 Q75,65 65,65 L35,65 Q25,65 25,50 Z"
            fill="url(#cloudGradient)"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Number 9 */}
          <motion.text
            x="50"
            y="58"
            fontSize="32"
            fontWeight="bold"
            fill="#3B82F6"
            textAnchor="middle"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            9
          </motion.text>

          {/* Gradient Definitions */}
          <defs>
            <linearGradient
              id="cloudGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#A78BFA" />
            </linearGradient>
          </defs>
        </motion.svg>

        {/* Rotating Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-24 h-24 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full" />
        </motion.div>
      </div>

      {/* Loading Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-1/3 text-slate-600 font-semibold text-sm"
      >
        Loading...
      </motion.p>
    </div>
  );
}
