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

      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
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
      </div>

      {/* 1. Hero Section */}
      <section className="relative pt-24 pb-16 lg:pt-36 lg:pb-24 overflow-hidden">
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 backdrop-blur-sm border border-slate-100 text-slate-600 font-medium text-xs mb-6 shadow-sm">
                <SparklesIcon className="w-3.5 h-3.5 text-blue-500" />
                <span>Free ATS-Friendly Resume Builder</span>
              </div>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6 text-slate-900"
            >
              Build ATS-Friendly Resumes & Professional Profiles{" "}
              <span className="text-blue-600">That Get Noticed</span>
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
            >
              Generate text-selectable, searchable, and ATS-readable PDFs.
              Elevate your job application with a professional public profile at
              cloud9profile.com.
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
              className="grid md:grid-cols-3 gap-6 mb-16 max-w-5xl mx-auto"
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

            <motion.p variants={fadeIn} className="mt-6 text-sm text-slate-400">
              Join 10,000+ applicants landing jobs at top tech companies.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* 2. Problem -> Solution */}
      <section className="py-24 relative overflow-hidden">
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
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden rounded-[3rem] mx-4 shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(59,130,246,0.3),transparent)] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-4 relative">
          <motion.h2
            {...fadeIn}
            className="text-3xl font-black text-center mb-16"
          >
            Three Steps to Your{" "}
            <span className="text-blue-400 text-gradient bg-clip-text">
              Dream Job
            </span>
          </motion.h2>
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={{
              initial: { opacity: 0 },
              animate: { opacity: 1, transition: { staggerChildren: 0.2 } },
            }}
            className="grid md:grid-cols-3 gap-12"
          >
            {[
              {
                id: "1",
                title: "Create Profile",
                text: "Sign up and input your experience and skills details.",
              },
              {
                id: "2",
                title: "Build & Check",
                text: "Create an ATS-safe resume and check your score against JDs.",
              },
              {
                id: "3",
                title: "Export & Share",
                text: "Download your PDF or share your public portfolio link.",
              },
            ].map((s, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="flex flex-col items-center text-center group cursor-default"
              >
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black mb-8 shadow-lg shadow-blue-500/40 rotate-3 group-hover:rotate-0 transition-all duration-300">
                  {s.id}
                </div>
                <h3 className="text-xl font-bold mb-4">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed max-w-[200px] font-medium">
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
              className="relative group lg:scale-110"
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
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-blue-100 to-indigo-100 rounded-full shadow-inner ring-4 ring-white/40"></div>
                    <div>
                      <div className="w-32 h-5 bg-slate-900/10 rounded-full mb-2"></div>
                      <div className="w-48 h-3 bg-slate-900/5 rounded-full"></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="h-40 bg-slate-900/[0.03] rounded-2xl border border-slate-900/[0.05]"></div>
                    <div className="h-40 bg-slate-900/[0.03] rounded-2xl border border-slate-900/[0.05]"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="w-full h-3 bg-slate-900/5 rounded-full"></div>
                    <div className="w-5/6 h-3 bg-slate-900/5 rounded-full"></div>
                    <div className="w-4/6 h-3 bg-slate-900/5 rounded-full"></div>
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

      {/* 6. Plans & Credits (Soft Sell) */}
      <section className="py-32 relative">
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
              className="text-3xl font-black text-slate-900 mb-4"
            >
              Simple Pricing,{" "}
              <span className="text-blue-600">No Subscriptions</span>
            </motion.h2>
            <motion.p
              variants={fadeIn}
              className="text-slate-500 max-w-lg mx-auto font-medium"
            >
              Choose the plan that fits your job search. Upgrade anytime.
            </motion.p>
          </motion.div>

          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={{
              initial: { opacity: 0 },
              animate: { opacity: 1, transition: { staggerChildren: 0.2 } },
            }}
            className="grid sm:grid-cols-2 gap-10 max-w-4xl mx-auto px-4"
          >
            <motion.div
              variants={fadeIn}
              className="p-10 bg-white/60 backdrop-blur-md rounded-3xl border border-white/40 shadow-xl group hover:shadow-2xl transition-all duration-300 glass-card"
            >
              <h3 className="text-xl font-bold mb-2 text-slate-900">
                Free Plan
              </h3>
              <p className="text-4xl font-black mb-8 text-slate-900">
                $0
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">
                  /forever
                </span>
              </p>
              <ul className="space-y-4 mb-10 text-sm text-slate-600 font-medium">
                <li className="flex gap-3 items-center">
                  <CheckBadgeIcon className="w-5 h-5 text-green-500" /> 1
                  ATS-Safe Resume
                </li>
                <li className="flex gap-3 items-center">
                  <CheckBadgeIcon className="w-5 h-5 text-green-500" /> Public
                  Portfolio Profile
                </li>
                <li className="flex gap-3 items-center text-slate-300">
                  <XMarkIcon className="w-5 h-5" /> AI Keyword Optimization
                </li>
              </ul>
              <Link href="/signup">
                <button className="w-full py-4 border-2 border-slate-100 rounded-2xl hover:bg-slate-50 transition-all font-bold text-slate-900">
                  Start For Free
                </button>
              </Link>
            </motion.div>

            <motion.div
              variants={fadeIn}
              className="p-10 bg-slate-900 text-white rounded-3xl shadow-2xl relative overflow-hidden group"
            >
              <div className="absolute top-6 right-6 text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-widest animate-pulse z-20">
                Best Value
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(59,130,246,0.25),transparent)] z-0"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Pro (Credit-Based)</h3>
                <p className="text-4xl font-black mb-8">
                  $14
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-2">
                    /10 Credits
                  </span>
                </p>
                <ul className="space-y-4 mb-10 text-sm text-slate-300 font-medium">
                  <li className="flex gap-3 items-center">
                    <CheckBadgeIcon className="w-5 h-5 text-blue-400" />{" "}
                    Everything in Free
                  </li>
                  <li className="flex gap-3 items-center">
                    <CheckBadgeIcon className="w-5 h-5 text-blue-400" /> 10 AI
                    Generation Credits
                  </li>
                  <li className="flex gap-3 items-center">
                    <CheckBadgeIcon className="w-5 h-5 text-blue-400" />{" "}
                    Priority Support
                  </li>
                </ul>
                <Link href="/signup">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 transition-all"
                  >
                    Go Pro Now
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 7. ATS Trust Section */}
      <section className="py-20 border-y border-slate-50">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-12">
            Compatible With Major ATS Platforms
          </h2>
          <div className="flex flex-wrap justify-center gap-12 grayscale opacity-50">
            {[
              "Workday",
              "Greenhouse",
              "Lever",
              "iCIMS",
              "SAP SuccessFactors",
            ].map((name, i) => (
              <span
                key={i}
                className="text-2xl font-bold text-slate-900 font-serif italic"
              >
                {name}
              </span>
            ))}
          </div>
          <p className="mt-12 text-slate-500 max-w-2xl mx-auto text-sm leading-relaxed">
            Our PDFs are 100% text-based. No images, no canvas, and no SVG text
            hacks. Just raw, searchable data that mirrors the text-extracting
            logic of 99% of modern ATS software.
          </p>
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
      <section className="py-24 bg-blue-600 text-white text-center">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-8">
            Start Your Career 2.0 Today
          </h2>
          <p className="text-xl text-blue-100 mb-12">
            No credit card required for the free plan.
          </p>
          <Link href="/signup">
            <button className="px-12 py-5 bg-white text-blue-600 rounded-xl font-bold text-xl hover:bg-slate-50 transition-all shadow-xl">
              Start Free – Build My Resume
            </button>
          </Link>
          <div className="mt-8 flex justify-center gap-6 opacity-80 text-sm font-medium">
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
