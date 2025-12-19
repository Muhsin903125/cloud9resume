import { GetStaticProps, GetStaticPaths } from "next";
import Head from "next/head";
import { createClient } from "@supabase/supabase-js";
import { ResumeRenderer } from "@/components/ResumeRenderer";
import { Portfolio, Resume } from "@/lib/types";

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
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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

  // Determine sections to show based on portfolio settings
  const visibleSections = portfolio.settings?.visibleSections;
  const filteredSections = visibleSections
    ? sections.filter((s) => visibleSections.includes(s.section_type))
    : sections;

  // Apply portfolio-specific override data if any
  // e.g. if portfolio has custom title/content logic
  // For now, we use resume data + portfolio theme settings

  return (
    <>
      <Head>
        <title>
          {portfolio.settings?.customTitle ||
            `${resume.title} - ${resume.job_title || "Portfolio"}`}
        </title>
        <meta
          name="description"
          content={`Portfolio of ${resume.title} - ${resume.job_title}`}
        />
        {/* Open Graph / Social Media */}
        <meta property="og:title" content={resume.title} />
        <meta
          property="og:description"
          content={resume.job_title || "Professional Portfolio"}
        />
        {/* Add more meta tags as needed */}
      </Head>

      <ResumeRenderer
        resume={resume}
        sections={filteredSections}
        template={portfolio.template_id || "modern"}
        themeColor={portfolio.theme_color || "#3b82f6"}
      />

      {/* Branding Footer */}
      <div className="py-6 text-center text-xs text-gray-400 bg-gray-50/50">
        Powered by{" "}
        <a
          href="https://cloud9profile.com"
          className="font-bold hover:text-gray-600"
        >
          Cloud9Profile
        </a>
      </div>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Pre-render top 50 active portfolios? Or just empty and blocking.
  // Using empty paths with fallback: blocking for on-demand generation
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
        revalidate: 60, // check again in 1 min
      };
    }

    const { resumes: resume, ...portfolioData } = portfolio;

    // Fetch Sections manually if not joined deeply or if standard 'resumes' object doesn't include them
    // The previous file (portfolio/[slug]) showed resumes(*) which usually implies fields.
    // But sections might be in a separate table 'resume_sections'.

    let sections = [];
    if (resume.resume_sections) {
      sections = resume.resume_sections;
    } else {
      // Fetch sections if not included in the join
      const { data: sectionData } = await supabase
        .from("resume_sections")
        .select("*")
        .eq("resume_id", resume.id)
        .order("order_index", { ascending: true });

      sections = sectionData || [];
    }

    // Map 'section_data' to 'content' if needed by renderer, although ResumeRenderer uses section_data directly?
    // Checking ResumeRenderer: line 43: const { section_type, section_data } = section;
    // So it expects 'section_data'.

    // Fix: Ensure dates are serialized
    return {
      props: {
        portfolio: JSON.parse(JSON.stringify(portfolioData)),
        resume: JSON.parse(JSON.stringify(resume)),
        sections: JSON.parse(JSON.stringify(sections)),
      },
      revalidate: 60 * 60 * 24, // 24 hours
    };
  } catch (e) {
    console.error("Error generating portfolio:", e);
    return {
      props: { error: "Internal Server Error" },
      revalidate: 60,
    };
  }
};
