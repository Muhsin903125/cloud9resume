import Link from "next/link";
import { getAssetUrl } from "../lib/common-functions";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-200 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <img
                  src={getAssetUrl("/logo.png")}
                  alt="Cloud9Profile Logo"
                  style={{
                    height: "40px",
                    width: "auto",
                    objectFit: "contain",
                  }}
                  className="filter brightness-0 invert"
                />
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Build professional resumes and portfolios with AI-powered tools.
              Stand out from the crowd and land your dream job.
            </p>
            <div className="flex space-x-5">
              {[
                {
                  name: "Twitter",
                  icon: (
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
                  ),
                },
                {
                  name: "GitHub",
                  icon: (
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  ),
                },
                {
                  name: "LinkedIn",
                  icon: (
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z M2 9h4v12H2z M4 4a2 2 0 1 1-2 2 2 2 0 0 1 2-2z" />
                  ),
                },
              ].map((item) => (
                <a
                  key={item.name}
                  href="#"
                  className="text-slate-400 hover:text-blue-400 transition-colors transform hover:-translate-y-1 duration-200"
                  aria-label={item.name}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {item.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-6 tracking-wide">
              Product
            </h3>
            <ul className="space-y-4">
              {[
                { name: "Pricing", href: "/plans" },
                { name: "Features", href: "/#features" },
                { name: "Resume Builder", href: "/dashboard/resume" },
                { name: "Portfolio Builder", href: "/dashboard/portfolio" },
                { name: "ATS Checker", href: "/dashboard/ats" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-6 tracking-wide">
              Company
            </h3>
            <ul className="space-y-4">
              {["About Us", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold text-lg mb-6 tracking-wide">
              Support
            </h3>
            <ul className="space-y-4">
              {[
                "Help Center",
                "Terms of Service",
                "Privacy Policy",
                "Cookie Policy",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-slate-400 hover:text-blue-400 transition-colors text-sm font-medium"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">
            &copy; {currentYear} Cloud9Profile. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a
              href="#"
              className="text-slate-500 hover:text-slate-300 text-xs transition-colors"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-slate-500 hover:text-slate-300 text-xs transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-slate-500 hover:text-slate-300 text-xs transition-colors"
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
