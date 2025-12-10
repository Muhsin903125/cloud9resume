import { NextPage } from "next";
import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import Card from "../../components/Card";
import { PlusIcon } from "../../components/Icons";

const PortfolioBuilderPage: NextPage = () => {
  const [portfolios] = useState([
    {
      id: 1,
      title: "Design Portfolio",
      theme: "Modern",
      projects: 8,
      lastModified: "1 day ago",
      status: "Published",
      url: "https://johndoe.cloud9resume.com",
    },
    {
      id: 2,
      title: "Development Work",
      theme: "Dark",
      projects: 12,
      lastModified: "1 week ago",
      status: "Draft",
    },
  ]);

  return (
    <>
      <Head>
        <title>Portfolio Builder - Cloud9 Resume</title>
        <meta
          name="description"
          content="Create stunning portfolios to showcase your work"
        />
      </Head>

      <div className="min-h-screen font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900 relative">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
            <div>
              <h1 className="text-base font-semibold text-gray-900">
                Portfolio Builder
              </h1>
            </div>
            <button className="px-4 py-1.5 bg-gray-900 hover:bg-black text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-2">
              <PlusIcon size={14} />
              New Portfolio
            </button>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-8 relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((portfolio) => (
              <Card
                key={portfolio.id}
                className="p-5 hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {portfolio.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-medium rounded-full uppercase tracking-wide ${
                      portfolio.status === "Published"
                        ? "bg-green-50 text-green-700 border border-green-100"
                        : "bg-yellow-50 text-yellow-700 border border-yellow-100"
                    }`}
                  >
                    {portfolio.status}
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-4">
                  {portfolio.projects} projects • {portfolio.theme} theme
                </p>

                {portfolio.url && (
                  <a
                    href={portfolio.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 mb-4 block truncate hover:underline"
                  >
                    {portfolio.url}
                  </a>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-auto">
                  <span className="text-[10px] text-gray-400">
                    Edited {portfolio.lastModified}
                  </span>
                  <div className="flex gap-2">
                    <button className="text-xs font-medium text-gray-600 hover:text-gray-900 px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 transition-colors">
                      Edit
                    </button>
                    <button className="text-xs font-medium text-gray-600 hover:text-gray-900 px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 transition-colors">
                      View
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default PortfolioBuilderPage;
