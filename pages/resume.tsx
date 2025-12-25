import { NextPage } from "next";
import Link from "next/link";
import { motion } from "framer-motion";
import { BoltIcon, CheckBadgeIcon, SparklesIcon } from "@heroicons/react/24/outline";
import SEO from "../components/SEO";
import { getAssetUrl } from "../lib/common-functions";
import FAQ from "@/components/FAQ";

const ResumePage: NextPage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "AI Resume Builder",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Create a job-winning resume in minutes with our AI-powered builder.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <SEO
        title="AI Resume Builder | Cloud9Profile"
        description="Create a job-winning resume in minutes with our AI-powered builder. ATS-friendly templates, expert suggestions, and instant formatting."
        keywords={["resume builder", "AI resume", "CV maker", "ATS resume"]}
        structuredData={structuredData}
      />

      <div className="pt-24">
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial="initial"
                animate="animate"
                variants={{
                  initial: { opacity: 0 },
                  animate: { opacity: 1, transition: { staggerChildren: 0.1 } },
                }}
              >
                <motion.div variants={fadeIn}>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-bold text-xs mb-6">
                    <SparklesIcon className="w-4 h-4" />
                    <span>AI-Powered Writing Assistant</span>
                  </div>
                </motion.div>

                <motion.h1
                  variants={fadeIn}
                  className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]"
                >
                  The <span className="text-blue-600">Resume Builder</span>{" "}
                  <br />
                  That Gets You Hired
                </motion.h1>

                <motion.p
                  variants={fadeIn}
                  className="text-lg text-slate-500 mb-8 max-w-lg leading-relaxed"
                >
                  Build a professional, ATS-friendly resume in minutes. Our AI
                  helps you write better bullet points and tailor your resume to
                  any job description.
                </motion.p>

                <motion.div
                  variants={fadeIn}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link href="/signup">
                    <button className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                      Build My Resume Free
                    </button>
                  </Link>
                  <Link href="#features">
                    <button className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all">
                      View Templates
                    </button>
                  </Link>
                </motion.div>

                <motion.div
                  variants={fadeIn}
                  className="mt-8 flex items-center gap-4 text-sm text-slate-500"
                >
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold overflow-hidden"
                      >
                        <img
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                          alt="User"
                        />
                      </div>
                    ))}
                  </div>
                  <p>Trusted by 10,000+ job seekers</p>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="relative z-10 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 bg-white">
                  <img
                    src={getAssetUrl("/resume-builder-preview.png")}
                    alt="Resume Builder UI"
                    className="w-full h-auto object-cover"
                  />

                  {/* Floating Badge */}
                  <div className="absolute top-8 right-8 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg border border-white/50 animate-float">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckBadgeIcon className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">
                          ATS Score
                        </p>
                        <p className="text-xl font-black text-slate-900">
                          98/100
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl -z-10"></div>
                <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl -z-10"></div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-24 bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Everything You Need to Get Hired
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto">
                Stop struggling with Word documents. Our builder handles the
                formatting so you can focus on the content.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "ATS-Friendly by Design",
                  desc: "Our templates are built to pass Applicant Tracking Systems (ATS) used by 99% of Fortune 500 companies.",
                  icon: CheckBadgeIcon,
                  color: "bg-green-100 text-green-600",
                },
                {
                  title: "AI & Smart Suggestions",
                  desc: "Get instant feedback on your resume's content. Our AI suggests stronger action verbs and skills.",
                  icon: SparklesIcon,
                  color: "bg-purple-100 text-purple-600",
                },
                {
                  title: "Real-Time Preview",
                  desc: "See changes instantly as you type. Switch between templates without losing your data.",
                  icon: BoltIcon,
                  color: "bg-blue-100 text-blue-600",
                },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-6`}
                  >
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <FAQ
          items={[
            {
              question: "Is the resume builder free?",
              answer:
                "Yes, you can build and download your first resume for free. We also offer premium features like AI writing assistance and unlimited resumes.",
            },
            {
              question: "Can I import my existing resume?",
              answer:
                "Currently, we recommend building from scratch to ensure maximum ATS compatibility, but PDF import is coming soon.",
            },
            {
              question: "Will my resume pass the ATS?",
              answer:
                "Absolutely. formatting standards (no columns for parsing, readable fonts, correct headings) are baked into every template.",
            },
          ]}
        />

        {/* Final CTA */}
        <section className="py-24 bg-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-lg text-slate-500 mb-10">
              Join thousands of professionals who improved their career with
              Cloud9Profile.
            </p>
            <Link href="/signup">
              <button className="px-10 py-5 bg-blue-600 text-white rounded-xl font-bold text-xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20">
                Create My Resume Now
              </button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ResumePage;
