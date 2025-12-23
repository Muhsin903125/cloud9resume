import { GetStaticProps, GetStaticPaths } from "next";
import { useEffect } from "react";
// Force rebuild
import { createClient } from "@supabase/supabase-js";
import { PortfolioRenderer } from "@/lib/portfolio-templates";
import { Portfolio, Resume } from "@/lib/types";
import SEO from "../components/SEO";

// Init Supabase Client (Server Side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PortfolioPageProps {
  portfolio: Portfolio;
  resume: Resume;
  sections: any[];
  error?: string;
}

export default function PortfolioPage({
  portfolio,
  resume,
  sections,
  error,
}: PortfolioPageProps) {
  useEffect(() => {
    // Record view
    if (portfolio?.id) {
      const recorded = sessionStorage.getItem(`viewed_${portfolio.id}`);
      if (!recorded) {
        fetch("/api/portfolios/record-view", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: portfolio.id }),
        }).catch((err) => console.error("Failed to record view", err));
        sessionStorage.setItem(`viewed_${portfolio.id}`, "true");
      }
    }
  }, [portfolio?.id]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <SEO title="Portfolio | Cloud9Profile" noIndex={true} />
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-100 max-w-md">
          <div className="text-4xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Portfolio Not Found
          </h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <a
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Create Your Own
          </a>
        </div>
      </div>
    );
  }

  // Use portfolio settings if available, otherwise default
  const themeColor = portfolio.settings?.themeColor || "#3b82f6";
  const templateId = portfolio.template_id || "modern";
  const customTitle = portfolio.settings?.customTitle;

  return (
    <>
      <SEO
        title={
          customTitle || `${resume.title} - ${resume.job_title || "Portfolio"}`
        }
        description={`Professional portfolio of ${resume.title} - ${resume.job_title}. Built with Cloud9Profile.`}
      />

      <PortfolioRenderer
        resume={resume}
        sections={sections}
        template={templateId}
        settings={{
          themeColor: themeColor,
          visibleSections: portfolio.settings?.visibleSections,
          isMobile: false, // Default to desktop view for public page
        }}
      />

      {/* Premium Footer CTA */}
      <footer className="bg-slate-900 border-t border-slate-800 py-16 px-4 relative z-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
            Cloud9Profile
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 tracking-tight">
            Make your portfolio too.
          </h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
            Join thousands of professionals building stunning portfolios in
            minutes. No coding required.
          </p>
          <a
            href="https://cloud9profile.com"
            target="_blank" // Assuming external or keeping internal logic consistent if it's the same domain
            rel="noreferrer"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-slate-900 font-bold rounded-full hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/10"
          >
            Create Your Portfolio
          </a>
        </div>
      </footer>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const username = params?.username as string;

  if (!username) {
    return { notFound: true };
  }

  try {
    // Fetch Portfolio
    const { data: portfolio, error } = await supabase
      .from("portfolios")
      .select("*, resumes(*)")
      .eq("slug", username)
      .eq("is_active", true)
      .single();

    if (error || !portfolio) {
      return {
        props: { error: "This portfolio does not exist or is not public." },
        revalidate: 60,
      };
    }

    const { resumes: initialResume, ...portfolioData } = portfolio;
    let resume = initialResume;
    let sections = [];

    // PRIORITIZE SAVED PORTFOLIO CONTENT
    if (portfolioData.content && portfolioData.content.resume) {
      // Use the snapshot data from the portfolio
      resume = portfolioData.content.resume;
      sections = portfolioData.content.sections || [];
    } else {
      // Fallback to live resume data if no snapshot exists
      if (resume.resume_sections) {
        sections = resume.resume_sections;
      } else {
        const { data: sectionData } = await supabase
          .from("resume_sections")
          .select("*")
          .eq("resume_id", resume.id)
          .order("order_index", { ascending: true });
        sections = sectionData || [];
      }
    }

    return {
      props: {
        portfolio: JSON.parse(JSON.stringify(portfolioData)),
        resume: JSON.parse(JSON.stringify(resume)),
        sections: JSON.parse(JSON.stringify(sections)),
      },
      revalidate: 60,
    };
  } catch (e) {
    console.error("Error generating portfolio:", e);
    return {
      props: { error: "Internal Server Error" },
      revalidate: 60,
    };
  }
};
