import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  PaintBrushIcon,
  CheckBadgeIcon,
  RocketLaunchIcon,
  SparklesIcon,
  ArrowRightIcon,
  CloudArrowUpIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const HomePage: NextPage = () => {
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const features = [
    {
      title: "AI Resume Builder",
      description:
        "Create professional resumes with AI-powered suggestions and smart templates that pass ATS scans.",
      icon: DocumentTextIcon,
      color: "bg-blue-500",
    },
    {
      title: "Portfolio Builder",
      description:
        "Showcase your work with stunning, customizable portfolio layouts that look great on any device.",
      icon: PaintBrushIcon,
      color: "bg-purple-500",
    },
    {
      title: "ATS Checker",
      description:
        "Get instant feedback on your resume's compatibility with Applicant Tracking Systems.",
      icon: CheckBadgeIcon,
      color: "bg-green-500",
    },
  ];

  const steps = [
    {
      id: "01",
      title: "Choose a Template",
      description:
        "Select from our wide range of professional, ATS-friendly templates designed by career experts.",
    },
    {
      id: "02",
      title: "Enter Your Details",
      description:
        "Fill in your experience, skills, and education. Our AI helper will suggest improvements along the way.",
    },
    {
      id: "03",
      title: "Customize & Export",
      description:
        "Tweak the design to match your style, then export as PDF or share your live portfolio link.",
    },
  ];

  const stats = [
    { label: "Resumes Created", value: "10k+", icon: DocumentTextIcon },
    { label: "Portfolios Live", value: "5k+", icon: PaintBrushIcon },
    { label: "Users Hired", value: "85%", icon: UserGroupIcon },
    { label: "ATS Score", value: "9/10", icon: CheckBadgeIcon },
  ];

  const faqs = [
    {
      question: "Is Cloud9 Profile really free?",
      answer:
        "Yes! We offer a generous free plan that lets you build and download a professional resume. We also have premium plans for advanced features.",
    },
    {
      question: "Will my resume pass ATS scans?",
      answer:
        "Absolutely. Our templates are specifically engineered to be ATS-friendly, ensuring your resume gets read by human recruiters.",
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer:
        "Yes, you can cancel your subscription at any time with no hidden fees or penalties.",
    },
    {
      question: "Do you offer portfolio hosting?",
      answer:
        "Yes, every user gets a personal portfolio link (e.g., cloud9profile.com/yourname) to showcase their work.",
    },
  ];

  return (
    <>
      <Head>
        <title>Cloud9 Profile - AI-Powered Resume & Portfolio Builder</title>
        <meta
          name="description"
          content="Create professional resumes and portfolios with AI assistance. Optimize for ATS and land your dream job."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
            <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 left-10 w-[40rem] h-[40rem] bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-medium text-sm mb-8">
                <SparklesIcon className="w-4 h-4" />
                <span>AI-Powered Career Growth</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-8 tracking-tight leading-tight">
                Build Your Future, <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  One Pixel at a Time
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed font-light">
                Create stunning resumes and portfolios that stand out. powered
                by intelligent design and ATS optimization.
              </p>

              <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                <Link href="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center gap-2"
                  >
                    <RocketLaunchIcon className="w-5 h-5" />
                    Start Building Free
                  </motion.button>
                </Link>
                {/* View Pricing button removed as requested */}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="flex flex-col items-center p-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-4xl font-bold text-slate-900 mb-1">
                      {stat.value}
                    </div>
                    <div className="text-slate-500 font-medium">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-slate-50 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="text-center mb-16"
            >
              <motion.h2
                variants={fadeIn}
                className="text-4xl font-bold text-slate-900 mb-6"
              >
                Everything You Need to Succeed
              </motion.h2>
              <motion.p
                variants={fadeIn}
                className="text-lg text-slate-600 max-w-2xl mx-auto"
              >
                Powerful tools designed to help you create, optimize, and
                showcase your professional brand with ease.
              </motion.p>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid md:grid-cols-3 gap-8"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    variants={fadeIn}
                    whileHover={{ y: -10 }}
                    className="group p-8 rounded-3xl bg-white border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
                  >
                    <div
                      className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                How It Works
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Building your professional profile has never been easier. Three
                simple steps to success.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-blue-200 -z-0"></div>

              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="relative z-10 flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 bg-white border-4 border-blue-50 rounded-full flex items-center justify-center text-3xl font-bold text-blue-600 shadow-xl mb-8">
                    {step.id}
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">
                    {step.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed px-4">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-900 mb-6">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-slate-600">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-gradient-to-br from-blue-900 to-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20"></div>
          <div className="absolute top-0 right-0 w-[30rem] h-[30rem] bg-blue-500 rounded-full mix-blend-overlay filter blur-[100px] opacity-20"></div>

          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 tracking-tight">
              Ready to Reset Your Career?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join 10,000+ professionals who have already built their dream
              resumes and portfolios with Cloud9 Profile.
            </p>
            <Link href="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-10 py-5 bg-white text-blue-900 rounded-xl font-bold text-xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl flex items-center gap-3 mx-auto"
              >
                Get Started Now <ArrowRightIcon className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;
