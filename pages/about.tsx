import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { getAssetUrl } from "../lib/common-functions";
import {
  SparklesIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import SEO from "../components/SEO";

const AboutPage: NextPage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Cloud9Profile",
    url: "https://cloud9profile.com",
    logo: "https://cloud9profile.com/logo.png",
    description:
      "Empowering freshers and professionals with free, AI-powered career tools.",
  };

  const fadeIn = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <SEO
        title="About Us | Cloud9Profile"
        description="Empowering freshers and professionals with free, AI-powered career tools. Learn about our mission to democratize career success."
        keywords={["about us", "career tools", "mission", "freshers"]}
        structuredData={structuredData}
        breadcrumbs={[
          { name: "Home", item: "/" },
          { name: "About", item: "/about" },
        ]}
      />

      {/* Reduced top padding */}
      <div className="pt-20 pb-12">
        {/* Hero Section - Reduced vertical padding */}
        <section className="relative py-12 md:py-16 overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-50/50 -z-10 rounded-bl-[80px]"></div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <motion.div
                initial="initial"
                animate="animate"
                variants={{
                  initial: { opacity: 0 },
                  animate: { opacity: 1, transition: { staggerChildren: 0.1 } },
                }}
              >
                <motion.div
                  variants={fadeIn}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-xs mb-4"
                >
                  <SparklesIcon className="w-4 h-4" />
                  <span>Our Mission</span>
                </motion.div>

                {/* Smaller Heading */}
                <motion.h1
                  variants={fadeIn}
                  className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 leading-tight"
                >
                  Helping Every Fresher <br />
                  <span className="text-blue-600">Start Strong.</span>
                </motion.h1>

                {/* More compact text */}
                <motion.p
                  variants={fadeIn}
                  className="text-base md:text-lg text-slate-500 mb-6 leading-relaxed max-w-lg"
                >
                  We believe a professional career shouldn't have a paywall.
                  Cloud9Profile provides cutting-edge, AI-powered tools
                  completely free for students and early-career professionals.
                </motion.p>

                <motion.div
                  variants={fadeIn}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link href="/signup">
                    <button className="px-6 py-3 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800 transition-all shadow-lg text-sm md:text-base">
                      Join the Movement
                    </button>
                  </Link>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative mt-8 lg:mt-0"
              >
                {/* Constrained Image Container */}
                <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-100 max-w-md mx-auto">
                  <img
                    src={getAssetUrl("/about-mission.png")}
                    alt="Future of Work for Freshers"
                    className="w-full h-auto object-cover"
                  />
                </div>
                {/* Smaller decorative blobs */}
                <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section - Tighter spacing */}
        <section className="py-12 md:py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-slate-900">
                Built for the Modern Job Market
              </h2>
              <p className="text-slate-500 text-sm md:text-base">
                The old way of applying is broken. We're fixing it with
                technology that keeps you ahead.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Always Free",
                  desc: "We pledge to keep our core tools free. No hidden costs.",
                  icon: CurrencyDollarIcon,
                  color: "bg-green-100 text-green-600",
                },
                {
                  title: "Trend Aware",
                  desc: "Algorithms update based on latest hiring trends.",
                  icon: ArrowTrendingUpIcon,
                  color: "bg-blue-100 text-blue-600",
                },
                {
                  title: "Auto-Design",
                  desc: "Look professional instantly without design skills.",
                  icon: GlobeAltIcon,
                  color: "bg-purple-100 text-purple-600",
                },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"
                >
                  <div
                    className={`w-10 h-10 rounded-lg ${feature.color} flex items-center justify-center mb-4`}
                  >
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section - Compact */}
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900">
              Our Story
            </h2>
            <div className="prose prose-base mx-auto text-slate-500">
              <p>
                Founded in 2025, Cloud9Profile started with a simple
                observation:{" "}
                <strong>
                  Talent is evenly distributed, but opportunity is not.
                </strong>
              </p>
              <p>
                We saw brilliant fresh graduates getting rejected by automated
                bots simply because their resume formatting was off. We decided
                to bridge that gap.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
