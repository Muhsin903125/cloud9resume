import Link from "next/link";
import Image from "next/image";
import { getAssetUrl } from "../lib/common-functions";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../lib/authUtils";

const defaultNavItems = [
  { name: "Resume Builder", href: "/resume" },
  { name: "Portfolio", href: "/portfolio" },
  { name: "Cover Letters", href: "/cover-letters" },
  { name: "ATS Checker", href: "/ats-checker" },
];

export default function Navbar() {
  const router = useRouter();
  const { user } = useAuth(); // Import useAuth to check admin status
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  // Dynamic Navigation Items
  const navigationItems = [...defaultNavItems];
  if (user?.is_admin) {
    navigationItems.push({ name: "Administration", href: "/admin" });
  }

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);
      setIsAtTop(scrollY === 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Check if current page needs dark mode navbar (white text)
  const isDarkPage = router.pathname === "/plans";
  const useWhiteText = isDarkPage && !scrolled;

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className={`font-bold flex items-center gap-2 group flex-shrink-0 ${
                useWhiteText ? "text-white" : "text-blue-600"
              }`}
            >
              <motion.div
                whileHover={{
                  scale: 1.05,
                  filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.5))",
                }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "40px",
                    height: "40px",
                  }}
                  className="rounded-lg overflow-hidden"
                >
                  <Image
                    src={getAssetUrl("/logo.png")}
                    alt="Cloud9Profile - AI Resume Builder & Portfolio Creator"
                    fill
                    sizes="40px"
                    style={{
                      objectFit: "contain",
                      filter: useWhiteText ? "brightness(0) invert(1)" : "none",
                    }}
                    className="transition-all"
                    priority
                  />
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-medium transition-colors relative group ${
                    useWhiteText
                      ? "text-slate-200 hover:text-white"
                      : router.pathname === item.href
                        ? "text-blue-600"
                        : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  {item.name}
                  <span
                    className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full ${
                      useWhiteText ? "bg-white" : "bg-blue-600"
                    }`}
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-5 py-2.5 rounded-full font-medium text-sm transition-colors shadow-lg ${
                    useWhiteText
                      ? "bg-white text-slate-900 hover:bg-slate-100 shadow-white/20"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
                  }`}
                >
                  Dashboard
                </motion.button>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`font-medium text-sm transition-colors ${
                    useWhiteText
                      ? "text-slate-200 hover:text-white"
                      : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  Sign In
                </Link>
                <Link href="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      boxShadow: [
                        "0 0 0 0px rgba(59, 130, 246, 0.4)",
                        "0 0 0 10px rgba(59, 130, 246, 0)",
                      ],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 2,
                      ease: "easeInOut",
                    }}
                    className={`px-5 py-2.5 rounded-full font-medium text-sm transition-colors shadow-lg ${
                      useWhiteText
                        ? "bg-white text-slate-900 hover:bg-slate-100 shadow-white/20"
                        : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/20"
                    }`}
                  >
                    Get Started
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              className={`focus:outline-none p-2 rounded-md transition-colors ${
                useWhiteText
                  ? "text-white hover:bg-white/10"
                  : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              {isMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden bg-white/95 backdrop-blur-xl border-t border-gray-100"
            >
              <div className="px-4 pt-2 pb-6 space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 space-y-3 px-4">
                  {user ? (
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="block w-full text-center py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-colors"
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full text-center py-3 text-gray-600 font-medium hover:text-blue-600 border border-gray-200 rounded-xl hover:border-blue-200 transition-colors"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setIsMenuOpen(false)}
                        className="block w-full text-center py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-colors"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
