import { NextPage } from "next";
import Link from "next/link";
import { getAssetUrl } from "../lib/common-functions";
import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
  PencilSquareIcon,
  BriefcaseIcon,
  BoltIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";
import SEO from "../components/SEO";
import FAQ from "../components/FAQ";

const CoverLettersPage: NextPage = () => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "AI Cover Letter Generator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Create professional, ATS-friendly cover letters in minutes with AI-powered technology.",
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <SEO
        title="AI Cover Letter Generator | Cloud9Profile"
        description="Create professional, ATS-friendly cover letters in minutes with our AI-powered generator. Tailored to each job posting for maximum impact."
        structuredData={structuredData}
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
                    AI-Powered Writing Assistant
                  </span>
                </motion.div>

                <motion.h1
                  variants={fadeIn}
                  className="text-4xl md:text-5xl font-black mb-6 leading-tight tracking-tight"
                >
                  Generate{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    Winning Cover Letters
                  </span>{" "}
                  in Minutes
                </motion.h1>

                <motion.p
                  variants={fadeIn}
                  className="text-lg text-slate-400 mb-8 max-w-lg leading-relaxed"
                >
                  Stand out with AI-crafted cover letters matching job
                  requirements. Choose long or short formats based on your
                  needs.
                  <br />
                  <span className="text-white font-bold">
                    Land more interviews.
                  </span>
                </motion.p>

                <motion.div
                  variants={fadeIn}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Link href="/signup">
                    <button className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/25">
                      Start Writing Free
                    </button>
                  </Link>
                  <Link href="/dashboard/cover-letters">
                    <button className="px-8 py-4 bg-white/10 text-white border border-white/20 rounded-xl font-bold text-lg hover:bg-white/20 transition-all backdrop-blur-sm">
                      See Examples
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
                <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10 border border-slate-700/50 bg-white max-w-md">
                  <img
                    src="/artifacts/cover_letter_preview.png"
                    alt="Cover Letter Preview"
                    className="w-full max-w-md h-auto object-contain"
                    onError={(e) => {
                      // Fallback if image doesn't exist
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg width='600' height='800' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='600' height='800' fill='%231e293b'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='%2364748b' text-anchor='middle' dy='.3em'%3ECover Letter Preview%3C/text%3E%3C/svg%3E";
                    }}
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
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                Everything You Need to Land Interviews
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Our AI understands what recruiters look for and crafts
                compelling narratives that get you noticed.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "AI-Powered Writing",
                  desc: "Craft compelling cover letters tailored to each job posting.",
                  icon: SparklesIcon,
                },
                {
                  title: "Long & Short Formats",
                  desc: "Choose between comprehensive or concise cover letters based on application needs.",
                  icon: ChatBubbleBottomCenterTextIcon,
                },
                {
                  title: "Create in Minutes",
                  desc: "Generate professional cover letters in under 5 minutes.",
                  icon: ClockIcon,
                },
                {
                  title: "ATS-Optimized",
                  desc: "Pass applicant tracking systems with keyword-optimized content.",
                  icon: CheckCircleIcon,
                },
              ].map((f, i) => (
                <div
                  key={i}
                  className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
                    <f.icon className="w-6 h-6 text-blue-600" />
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

        {/* How It Works */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">
                Create in <span className="text-blue-600">3 Simple Steps</span>
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Paste Job Description",
                  description:
                    "Paste the job posting. AI analyzes requirements.",
                  icon: DocumentTextIcon,
                },
                {
                  step: "02",
                  title: "Choose Format",
                  description:
                    "Select long or short format and add your details.",
                  icon: PencilSquareIcon,
                },
                {
                  step: "03",
                  title: "Generate & Download",
                  description: "Get a tailored letter. Export as PDF or DOCX.",
                  icon: BoltIcon,
                },
              ].map((item, index) => (
                <div key={index} className="relative group">
                  <div className="absolute inset-0 bg-white rounded-2xl shadow-sm transform transition-transform group-hover:-translate-y-1 duration-300 border border-slate-100"></div>
                  <div className="relative p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                        <item.icon className="w-6 h-6" />
                      </div>
                      <span className="text-2xl font-black text-slate-100 group-hover:text-slate-200 transition-colors">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FAQ
          items={[
            {
              question: "How does the AI cover letter generator work?",
              answer:
                "Our AI analyzes the job description and your background to create a personalized cover letter that highlights your relevant experience and matches the company's requirements.",
            },
            {
              question: "Can I edit the generated cover letter?",
              answer:
                "Absolutely! The AI provides a strong foundation, and you can edit every word to match your personal voice and add specific details.",
            },
            {
              question: "Is it ATS-friendly?",
              answer:
                "Yes, all cover letters are optimized to pass Applicant Tracking Systems while remaining engaging for human readers.",
            },
          ]}
        />

        <section className="py-24 bg-slate-900 text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Write Your Winning Cover Letter?
            </h2>
            <p className="text-slate-400 mb-8 text-lg">
              Join thousands of job seekers who landed interviews with our
              AI-powered cover letters.
            </p>
            <Link href="/signup">
              <button className="px-10 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-200 transition-all shadow-lg">
                Start Building Free
              </button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CoverLettersPage;
