import { useState, useEffect } from "react";
import { NextPage } from "next";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  DocumentTextIcon,
  CheckBadgeIcon,
  RocketLaunchIcon,
  SparklesIcon,
  ArrowRightIcon,
  UserGroupIcon,
  GlobeAltIcon,
  QueueListIcon,
  BoltIcon,
  FingerPrintIcon,
  ShieldCheckIcon,
  XMarkIcon,
  ChevronDownIcon,
  ArrowTrendingUpIcon,
  CommandLineIcon,
} from "@heroicons/react/24/outline";
import SEO from "../components/SEO";

const HomePage: NextPage = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Mouse tracking for interactive effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring for the cursor blob
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const fadeIn = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.4 },
  };

  return (
    <div className="min-h-screen bg-transparent text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 relative overflow-hidden">
      <SEO
        title="Build ATS-Friendly Resumes & Professional Profiles | Cloud9Profile"
        description="Create text-selectable, ATS-readable resumes and professional portfolio websites. Optimize your job search with our free ATS checker and AI-powered builder."
      />

      {/* Interactive Background Cursor Blob */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        className="fixed top-0 left-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10"
      />

      {/* Enhanced Parallax Background with SVG */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        {/* Animated gradient blobs */}
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[5%] w-64 h-64 bg-blue-100/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 60, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] right-[10%] w-96 h-96 bg-purple-100/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -40, 0], rotate: [0, 180, 360] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[20%] left-[15%] w-80 h-80 bg-indigo-100/25 rounded-full blur-3xl"
        />

        {/* Floating SVG Shapes */}
        <motion.svg
          className="absolute top-[15%] right-[20%] opacity-10"
          width="120"
          height="120"
          animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <circle cx="60" cy="60" r="40" fill="#3B82F6" />
          <circle cx="60" cy="60" r="25" fill="#60A5FA" />
        </motion.svg>

        <motion.svg
          className="absolute bottom-[30%] right-[30%] opacity-10"
          width="80"
          height="80"
          animate={{
            y: [0, 15, 0],
            rotate: [0, -15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <rect x="20" y="20" width="40" height="40" fill="#A78BFA" rx="8" />
        </motion.svg>

        <motion.svg
          className="absolute top-[60%] left-[10%] opacity-10"
          width="100"
          height="100"
          animate={{
            y: [0, -25, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <polygon points="50,10 90,90 10,90" fill="#EC4899" />
        </motion.svg>

        {/* Top Section Dense SVG Shapes - 10+ shapes */}
        <motion.svg
          className="absolute top-[5%] left-[15%] opacity-10"
          width="50"
          height="50"
          animate={{ y: [0, 12, 0], rotate: [0, 180, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="25" cy="25" r="20" fill="#EF4444" />
        </motion.svg>

        <motion.svg
          className="absolute top-[8%] right-[35%] opacity-10"
          width="45"
          height="45"
          animate={{ x: [0, 10, 0], y: [0, -8, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="10" y="10" width="25" height="25" fill="#14B8A6" rx="5" />
        </motion.svg>

        <motion.svg
          className="absolute top-[12%] left-[40%] opacity-10"
          width="55"
          height="55"
          animate={{ rotate: [0, -180, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        >
          <polygon points="27.5,5 50,22 40,50 15,50 5,22" fill="#8B5CF6" />
        </motion.svg>

        <motion.svg
          className="absolute top-[18%] right-[12%] opacity-10"
          width="48"
          height="48"
          animate={{ y: [0, -15, 0], x: [0, 8, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M24,5 L40,24 L24,43 L8,24 Z" fill="#F97316" />
        </motion.svg>

        <motion.svg
          className="absolute top-[22%] left-[55%] opacity-10"
          width="42"
          height="42"
          animate={{ rotate: [0, 360, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        >
          <circle cx="21" cy="21" r="15" fill="#06B6D4" opacity="0.8" />
          <circle cx="21" cy="21" r="8" fill="#22D3EE" />
        </motion.svg>

        <motion.svg
          className="absolute top-[28%] left-[8%] opacity-10"
          width="52"
          height="52"
          animate={{ y: [0, 18, 0], rotate: [0, 25, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="10" y="10" width="32" height="32" fill="#EC4899" rx="8" />
        </motion.svg>

        <motion.svg
          className="absolute top-[32%] right-[25%] opacity-10"
          width="58"
          height="58"
          animate={{ x: [0, -12, 0], y: [0, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        >
          <polygon points="29,8 50,29 29,50 8,29" fill="#10B981" />
        </motion.svg>

        <motion.svg
          className="absolute top-[38%] left-[30%] opacity-10"
          width="46"
          height="46"
          animate={{ rotate: [0, -360, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M23,5 L30,18 L45,23 L30,28 L23,41 L16,28 L1,23 L16,18 Z"
            fill="#A855F7"
          />
        </motion.svg>

        <motion.svg
          className="absolute top-[42%] right-[40%] opacity-10"
          width="50"
          height="50"
          animate={{ y: [0, -14, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        >
          <circle cx="25" cy="25" r="18" fill="#F59E0B" />
          <circle cx="25" cy="25" r="10" fill="#FBBF24" />
        </motion.svg>

        <motion.svg
          className="absolute top-[35%] left-[65%] opacity-10"
          width="44"
          height="44"
          animate={{ x: [0, 15, 0], rotate: [0, 45, 0] }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect x="8" y="8" width="28" height="28" fill="#3B82F6" rx="6" />
        </motion.svg>

        <motion.svg
          className="absolute top-[48%] left-[45%] opacity-10"
          width="54"
          height="54"
          animate={{ y: [0, 16, 0], rotate: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        >
          <polygon points="27,6 48,20 42,45 12,45 6,20" fill="#EF4444" />
        </motion.svg>

        <motion.svg
          className="absolute top-[10%] left-[70%] opacity-10"
          width="47"
          height="47"
          animate={{ x: [0, -10, 0], y: [0, 12, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        >
          <path d="M23.5,8 L35,23.5 L23.5,39 L12,23.5 Z" fill="#6366F1" />
        </motion.svg>

        {/* Additional SVG Shapes */}
        <motion.svg
          className="absolute top-[25%] left-[25%] opacity-10"
          width="90"
          height="90"
          animate={{
            y: [0, 20, 0],
            rotate: [0, 360, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <path d="M45,5 L85,45 L45,85 L5,45 Z" fill="#10B981" />
        </motion.svg>

        <motion.svg
          className="absolute bottom-[15%] right-[15%] opacity-10"
          width="70"
          height="70"
          animate={{
            y: [0, -18, 0],
            x: [0, -10, 0],
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <circle cx="35" cy="35" r="30" fill="#F59E0B" opacity="0.7" />
          <circle cx="35" cy="35" r="15" fill="#FBBF24" />
        </motion.svg>

        <motion.svg
          className="absolute top-[45%] right-[8%] opacity-10"
          width="60"
          height="60"
          animate={{
            rotate: [0, -360, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <polygon points="30,5 55,25 45,55 15,55 5,25" fill="#8B5CF6" />
        </motion.svg>

        <motion.svg
          className="absolute bottom-[45%] left-[5%] opacity-10"
          width="110"
          height="110"
          animate={{
            y: [0, 22, 0],
            rotate: [0, 15, 0],
          }}
          transition={{
            duration: 11,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <rect x="15" y="15" width="80" height="80" fill="#06B6D4" rx="15" />
          <rect x="30" y="30" width="50" height="50" fill="#22D3EE" rx="10" />
        </motion.svg>

        <motion.svg
          className="absolute top-[80%] right-[25%] opacity-10"
          width="95"
          height="95"
          animate={{
            x: [0, 15, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <path
            d="M47.5,10 L60,40 L90,47.5 L60,55 L47.5,85 L35,55 L5,47.5 L35,40 Z"
            fill="#F43F5E"
          />
        </motion.svg>

        {/* Small Minimal Honeycomb Pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.1]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="honeycomb-small"
              width="28"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <polygon
                points="14,3 21,7 21,17 14,21 7,17 7,7"
                fill="none"
                stroke="#64748b"
                strokeWidth="0.5"
              />
              <polygon
                points="0,27 7,31 7,41 0,45 -7,41 -7,31"
                fill="none"
                stroke="#64748b"
                strokeWidth="0.5"
              />
              <polygon
                points="28,27 35,31 35,41 28,45 21,41 21,31"
                fill="none"
                stroke="#64748b"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#honeycomb-small)" />
        </svg>
      </div>

      {/* 1. Hero Section */}
      <section className="relative pt-20 pb-12 md:pt-24 md:pb-16 lg:pt-36 lg:pb-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative text-center">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={{
              initial: { opacity: 0 },
              animate: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
          >
            <motion.div variants={fadeIn}>
              <Link href="/" className="inline-block mb-6">
                <img
                  src="/logo.png"
                  alt="Cloud9Profile"
                  className="h-12 mx-auto"
                />
              </Link>
            </motion.div>

            <motion.div variants={fadeIn}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 text-blue-700 font-bold text-xs mb-6 shadow-sm">
                <SparklesIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Free Portfolio for Every Fresher</span>
              </div>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 text-slate-900"
            >
              Your <span className="text-blue-600">First Job</span> Starts with
              a <span className="text-blue-600">Pro Profile</span>
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
            >
              Stand out from day one—free ATS resume + professional portfolio.
              No experience needed, just ambition.
            </motion.p>

            <motion.div
              variants={fadeIn}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center font-medium mb-16"
            >
              <Link href="/signup">
                <button className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                  Create Free Resume <ArrowRightIcon className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/dashboard/ats">
                <button className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                  Check ATS Score (Free)
                </button>
              </Link>
            </motion.div>

            {/* Live Dashboard Grid */}
            <motion.div
              variants={fadeIn}
              className="hidden md:grid md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto"
            >
              {/* Card 1: ATS Score */}
              <motion.div
                whileHover={{ y: -5, rotateY: 5, rotateX: -5 }}
                className="relative p-6 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl group transition-all duration-500 glass-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    ATS Resume Score
                  </span>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                  </div>
                </div>
                <div className="flex items-end justify-center mb-4">
                  <span className="text-4xl font-black text-slate-900">
                    98<span className="text-xl text-blue-600">/100</span>
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "98%" }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                  />
                </div>
                <p className="mt-4 text-[9px] text-green-600 font-bold flex items-center justify-center gap-1">
                  <CheckBadgeIcon className="w-3 h-3" /> Extremely High
                  Visibility
                </p>
              </motion.div>

              {/* Card 2: Recruiter Reach */}
              <motion.div
                whileHover={{ y: -5, rotateY: -5, rotateX: -5 }}
                className="relative p-6 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl group transition-all duration-500 glass-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Recruiter Reach
                  </span>
                  <ArrowTrendingUpIcon className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex items-end justify-center mb-4">
                  <span className="text-4xl font-black text-slate-900">
                    +42<span className="text-xl text-blue-600">%</span>
                  </span>
                </div>
                <div className="flex gap-1.5 items-end h-8 justify-center">
                  {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      transition={{ duration: 0.5, delay: 0.1 * i }}
                      className="w-2 bg-blue-100 group-hover:bg-blue-200 transition-colors rounded-t-sm"
                    />
                  ))}
                </div>
                <p className="mt-4 text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                  Growth since profile shared
                </p>
              </motion.div>

              {/* Card 3: Skill Matching */}
              <motion.div
                whileHover={{ y: -5, rotateY: 5, rotateX: 5 }}
                className="relative p-6 bg-white/60 backdrop-blur-md rounded-2xl border border-white/40 shadow-xl group transition-all duration-500 glass-card text-left"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    AI Match: Senior Dev
                  </span>
                  <CommandLineIcon className="w-4 h-4 text-purple-500" />
                </div>
                <div className="mb-4">
                  <span className="text-4xl font-black text-slate-900">
                    94<span className="text-xl text-purple-600">%</span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["React", "Node.js", "System Design"].map((s, i) => (
                    <span
                      key={i}
                      className="text-[8px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100 flex items-center gap-1"
                    >
                      <div className="w-1 h-1 rounded-full bg-green-500"></div>{" "}
                      {s}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-[9px] text-indigo-500 font-bold uppercase tracking-tighter">
                  Optimized for hiring trends
                </p>
              </motion.div>
            </motion.div>

            <motion.p
              variants={fadeIn}
              className="mt-6 text-sm text-slate-400 hidden md:block"
            >
              Join 10,000+ applicants landing jobs at top tech companies.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* 2. Problem -> Solution */}
      <section className="py-24 relative overflow-hidden hidden md:block">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={{
              initial: { opacity: 0 },
              animate: { opacity: 1, transition: { staggerChildren: 0.15 } },
            }}
            className="grid md:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={fadeIn}>
              <h2 className="text-3xl font-bold mb-6 text-slate-900 leading-tight">
                Why Your Resume <br />
                <span className="text-red-500">Is Getting Rejected</span>
              </h2>
              <div className="space-y-6">
                {[
                  {
                    t: "PDFs That AI Can't Read",
                    d: "Many builders create 'image-only' PDFs that look good but are invisible to ATS scanners.",
                  },
                  {
                    t: "Generic Layouts",
                    d: "Human recruiters skip resumes that lack a professional, modern hierarchy.",
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 p-4 rounded-xl bg-white/40 border border-white/40 shadow-sm glass-card"
                  >
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                      <XMarkIcon className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">
                        {item.t}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">
                        {item.d}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeIn} className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/10 to-indigo-500/10 blur-2xl rounded-3xl group-hover:from-blue-500/20 group-hover:to-indigo-500/20 transition-all duration-500"></div>
              <div className="relative bg-white/80 p-8 rounded-2xl shadow-xl border border-white/40 overflow-hidden glass-panel">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckBadgeIcon className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="font-bold text-slate-900">
                    The Cloud9 Solution
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-100/50">
                    <p className="text-xs font-mono text-slate-400 mb-2">
                      // Text-Selectable PDF Output
                    </p>
                    <div className="h-2 bg-blue-600/10 w-full rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "100%" }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-blue-600"
                      />
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50/50 rounded-lg border border-slate-100/50">
                    <p className="text-xs font-mono text-slate-400 mb-2">
                      // Modern Portfolio URL
                    </p>
                    <p className="text-sm font-bold text-blue-600">
                      cloud9profile.com/yourname
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 3. Core Features */}
      <section className="py-24 relative">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={{
              initial: { opacity: 0 },
              animate: { opacity: 1, transition: { staggerChildren: 0.1 } },
            }}
            className="text-center mb-16"
          >
            <motion.h2
              variants={fadeIn}
              className="text-3xl font-bold text-slate-900 mb-4"
            >
              Built for Modern Recruitment
            </motion.h2>
            <motion.p variants={fadeIn} className="text-slate-500">
              Everything you need to showcase your talent in 2025.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={{
              initial: { opacity: 0 },
              animate: { opacity: 1, transition: { staggerChildren: 0.12 } },
            }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              {
                title: "ATS Builder",
                desc: "Text-selectable layouts that pass 100% of scans.",
                icon: DocumentTextIcon,
                color: "bg-blue-50 text-blue-600",
              },
              {
                title: "Free ATS Checker",
                desc: "Compare your resume against any job description.",
                icon: CheckBadgeIcon,
                color: "bg-green-50 text-green-600",
              },
              {
                title: "Portfolio Website",
                desc: "Your experience and projects in one sleek link.",
                icon: GlobeAltIcon,
                color: "bg-purple-50 text-purple-600",
              },
              {
                title: "Multiple Versions",
                desc: "Create tailored resumes for different job roles.",
                icon: QueueListIcon,
                color: "bg-orange-50 text-orange-600",
              },
              {
                title: "AI Optimization",
                desc: "Smart suggestions based on industry standards.",
                icon: BoltIcon,
                color: "bg-yellow-50 text-yellow-600",
              },
              {
                title: "Privacy First",
                desc: "You control who sees your public profile link.",
                icon: ShieldCheckIcon,
                color: "bg-indigo-50 text-indigo-600",
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                whileHover={{ y: -5 }}
                className="p-6 rounded-2xl bg-white/60 border border-white/40 shadow-sm glass-card transition-all"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-6 shadow-inner`}
                >
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed font-normal">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="py-16 relative">
        <div className="max-w-4xl mx-auto px-4">
          <motion.h2
            {...fadeIn}
            className="text-2xl md:text-3xl font-bold text-center mb-12 text-slate-900"
          >
            Get Started in <span className="text-blue-600">3 Easy Steps</span>
          </motion.h2>
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={{
              initial: { opacity: 0 },
              animate: { opacity: 1, transition: { staggerChildren: 0.15 } },
            }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                id: "1",
                title: "Sign Up",
                text: "Create your free account in seconds.",
              },
              {
                id: "2",
                title: "Build",
                text: "Use our ATS-friendly templates.",
              },
              {
                id: "3",
                title: "Share",
                text: "Download PDF or share your link.",
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-lg font-black mb-4 shadow-lg shadow-blue-500/30 text-white group-hover:scale-110 transition-transform">
                  {s.id}
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">
                  {s.title}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {s.text}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 5. Portfolio Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={{
              initial: { opacity: 0 },
              animate: { opacity: 1, transition: { staggerChildren: 0.15 } },
            }}
            className="grid md:grid-cols-2 gap-20 items-center"
          >
            <motion.div variants={fadeIn}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/50 backdrop-blur-sm border border-blue-100 text-blue-600 font-bold text-[10px] uppercase tracking-wider mb-8">
                <GlobeAltIcon className="w-3 h-3" /> Professional Portfolio
              </div>
              <h2 className="text-4xl font-extrabold text-slate-900 mb-8 leading-tight">
                Your Career, <br />
                <span className="text-blue-600">In One Sleek Link</span>
              </h2>
              <p className="text-slate-500 mb-10 text-lg leading-relaxed font-normal">
                Stop emailing heavy files. Share your{" "}
                <span className="font-bold text-slate-900">
                  cloud9profile.com/yourname
                </span>{" "}
                link. It includes your resume, verified skills, and project
                links in one interactive page designed to wow recruiters.
              </p>
              <div className="space-y-4 mb-10">
                {[
                  "Optimized for Instagram & LinkedIn bios",
                  "Direct PDF download for recruiters",
                  "Interactive project & skill links",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-4 items-center text-slate-700"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <CheckBadgeIcon className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/dashboard/portfolio">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-500/20"
                >
                  Configure My Profile
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="relative group lg:scale-110 hidden md:block"
            >
              <div className="absolute -inset-12 bg-blue-500/10 blur-[100px] rounded-full group-hover:bg-blue-500/20 transition-all duration-700"></div>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 p-4 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] glass-panel"
              >
                <div className="absolute top-0 left-0 right-0 h-10 bg-white/50 border-b border-white/40 flex items-center px-6 gap-2 rounded-t-3xl">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                  </div>
                  <div className="ml-6 flex-1 bg-white/50 rounded-lg h-5 text-[9px] flex items-center px-4 text-slate-400 font-mono">
                    cloud9profile.com/sarah-jones
                  </div>
                </div>
                <div className="pt-14 pb-6 px-4">
                  {/* Profile Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-xl">
                      SJ
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm mb-1">
                        Sarah Jones
                      </div>
                      <div className="text-xs text-slate-500">
                        Full Stack Developer
                      </div>
                    </div>
                  </div>

                  {/* Skills Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {["React", "Node.js", "TypeScript"].map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-[9px] font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Project Cards */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-3 flex flex-col justify-between">
                      <div className="w-6 h-6 bg-blue-500 rounded-lg"></div>
                      <div>
                        <div className="h-2 bg-blue-200 rounded w-3/4 mb-1"></div>
                        <div className="h-1.5 bg-blue-100 rounded w-1/2"></div>
                      </div>
                    </div>
                    <div className="h-32 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100 p-3 flex flex-col justify-between">
                      <div className="w-6 h-6 bg-purple-500 rounded-lg"></div>
                      <div>
                        <div className="h-2 bg-purple-200 rounded w-3/4 mb-1"></div>
                        <div className="h-1.5 bg-purple-100 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>

                  {/* Experience Section */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="h-2 bg-slate-200 rounded flex-1"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="h-2 bg-slate-200 rounded w-4/5"></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                      <div className="h-2 bg-slate-200 rounded w-3/5"></div>
                    </div>
                  </div>
                </div>
                {/* Floating Tooltip */}
                <div className="absolute -bottom-8 -right-8 p-4 bg-white rounded-2xl shadow-2xl border border-slate-100 flex items-center gap-3 animate-float">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                      Live Profile
                    </p>
                    <p className="text-xs font-bold font-mono">
                      248 Views today
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 8. Audience Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Who Is Cloud9 For?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                label: "Freshers",
                icon: UserGroupIcon,
                desc: "Land your first intern or junior role.",
              },
              {
                label: "Job Switchers",
                icon: FingerPrintIcon,
                desc: "Pivot your career with tailored resumes.",
              },
              {
                label: "Remote Seekers",
                icon: GlobeAltIcon,
                desc: "Stand out in international job pools.",
              },
              {
                label: "Top Talent",
                icon: SparklesIcon,
                desc: "Showcase a pro portfolio link.",
              },
            ].map((a, i) => (
              <div
                key={i}
                className="p-6 bg-slate-50/50 rounded-xl text-center"
              >
                <a.icon className="w-8 h-8 mx-auto text-blue-600 mb-4" />
                <h3 className="font-bold mb-2">{a.label}</h3>
                <p className="text-xs text-slate-500">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4 font-normal">
            {[
              {
                q: "Is it really ATS-friendly?",
                a: "Yes. Most resume builders use fancy graphics that break ATS. We focus on 'Text Selectable Resume PDF' tech that Greenhouse and Workday love.",
              },
              {
                q: "How does the portfolio link work?",
                a: "Once you build your resume, you get a unique URL like cloud9profile.com/name. Share it in your LinkedIn bio or email signature.",
              },
              {
                q: "Is there a truly free plan?",
                a: "Absolutely. You can build and download one full resume for free. Credits are only needed for AI-powered keyword optimization.",
              },
              {
                q: "Do you have an Instagram community?",
                a: "Yes! Follow @cloud9profile for daily resume hooks, ATS tips, and career advice.",
              },
            ].map((faq, i) => (
              <div
                key={i}
                className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm transition-all hover:border-blue-100"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-6 text-left transition-colors hover:bg-slate-50/50"
                >
                  <span className="font-bold text-slate-900">{faq.q}</span>
                  <ChevronDownIcon
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                      activeFaq === i ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {activeFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-slate-500 text-sm leading-relaxed border-t border-slate-50 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Final CTA */}
      <section className="py-16 bg-blue-600 text-white text-center">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-6">
            Start Your Career 2.0 Today
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            No credit card required for the free plan.
          </p>
          <Link href="/signup">
            <button className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all shadow-xl">
              Start Free – Build My Resume
            </button>
          </Link>
          <div className="mt-6 flex justify-center gap-6 opacity-80 text-sm font-medium">
            <span>ATS Readable</span>
            <span>•</span>
            <span>Dynamic Portfolio</span>
            <span>•</span>
            <span>AI Assisted</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
