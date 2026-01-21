import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { getAssetUrl } from "../lib/common-functions";
import { motion } from "framer-motion";
import FAQ from "../components/FAQ";
import {
  GlobeAltIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";
import SEO from "../components/SEO";

const PortfolioPage: NextPage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Portfolio Builder",
    applicationCategory: "DesignApplication",
    operatingSystem: "Web",
    description:
      "Turn your resume into a stunning personal website in one click.",
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <SEO
        title="Personal Portfolio Builder - Your Resume as a Website"
        description="Instantly turn your resume into a professional personal website. No coding required. Custom domains, SEO optimized, and built to impress recruiters."
        keywords={[
          "portfolio builder",
          "personal website",
          "portfolio maker",
          "resume to website",
          "developer portfolio",
        ]}
        structuredData={structuredData}
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "Portfolio Builder", item: "/portfolio" },
        ]}
      />

      <div className="pt-24">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden bg-slate-900 text-white">
          <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial="initial"
                animate="animate"
                variants={{
                  initial: { opacity: 0 },
                  animate: {
                    opacity: 1,
                    transition: { staggerChildren: 0.15 },
                  },
                }}
              >
                <motion.div variants={fadeIn}>
                  <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-xs mb-6 tracking-wide uppercase">
                    For Developers, Designers & Markers
                  </span>
                </motion.div>

                <motion.h1
                  variants={fadeIn}
                  className="text-5xl md:text-6xl font-black mb-8 leading-tight tracking-tight"
                >
                  Turn Your Resume into a <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    Personal Website
                  </span>
                </motion.h1>

                <motion.p
                  variants={fadeIn}
                  className="text-xl text-slate-400 mb-10 max-w-lg leading-relaxed"
                >
                  Stop sending just a PDF. Impress recruiters with a live
                  portfolio link that showcases your work, skills, and
                  personality.
                  <br />
                  <span className="text-white font-bold">
                    No coding required.
                  </span>
                </motion.p>

                <motion.div
                  variants={fadeIn}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link href="/signup">
                    <button className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/25">
                      Claim My URL
                    </button>
                  </Link>
                  <Link href="/demo">
                    <button className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-sm">
                      See Live Demo
                    </button>
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10 border border-slate-700/50 bg-slate-800">
                  <img
                    src={getAssetUrl("/portfolio-preview.png")}
                    alt="Portfolio Website Preview"
                    className="w-full h-auto object-cover"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent pointer-events-none"></div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
                <div
                  className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl -z-10 animate-pulse"
                  style={{ animationDelay: "1s" }}
                ></div>
              </motion.div>
            </div>
          </div>

          {/* Abstract Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
        </section>

        {/* Features */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "One-Click Generate",
                  desc: "We parse your resume data to automatically populate your website.",
                  icon: CodeBracketIcon,
                },
                {
                  title: "Custom Domains",
                  desc: "Connect your own domain (e.g., yourname.com) for professional branding.",
                  icon: GlobeAltIcon,
                },
                {
                  title: "Mobile Optimized",
                  desc: "Looks stunning on every device, from 4K monitors to smartphones.",
                  icon: DevicePhoneMobileIcon,
                },
                {
                  title: "Visitor Analytics",
                  desc: "See who's viewing your profile with built-in simple analytics.",
                  icon: ChartBarIcon,
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="p-6 bg-slate-50 rounded-2xl border border-slate-100"
                >
                  <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                    <f.icon className="w-6 h-6 text-slate-900" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-slate-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Preview mockup section could go here */}

        <FAQ
          items={[
            {
              question: "Do I need to know how to code?",
              answer:
                "Zero coding. If you can fill out a form, you can build a stunning portfolio website with our tool.",
            },
            {
              question: "Is hosting included?",
              answer:
                "Yes! We host your portfolio for free on our cloud infrastructure. You don't need to pay for external hosting.",
            },
            {
              question: "Can I use my own domain?",
              answer:
                "Yes, our Pro plan allows you to connect any custom domain you own.",
            },
          ]}
        />

        <section className="py-24 bg-slate-900 text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-6">
              Claim Your Username Before It's Taken
            </h2>
            <p className="text-slate-400 mb-8">cloud9profile.com/yourname</p>
            <Link href="/signup">
              <button className="px-10 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-200 transition-all">
                Start Building Free
              </button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PortfolioPage;
