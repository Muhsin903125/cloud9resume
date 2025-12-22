import Head from "next/head";
import { useRouter } from "next/router";
import icon from "@/public/logo-icon.png";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  twitterHandle?: string;
  noIndex?: boolean;
}

const SEO = ({
  title = "Cloud9Profile - ATS-Friendly Resume & Professional Portfolio Builder",
  description = "Create professional, ATS-friendly resumes and stunning portfolios with AI assistance. Optimize for job success with Cloud9Profile.",
  canonical,
  ogType = "website",
  ogImage = "/og-image.png", // Ensure this exists or use a default
  twitterHandle = "@cloud9profile",
  noIndex = false,
}: SEOProps) => {
  const router = useRouter();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://cloud9profile.com";
  const fullUrl = `${siteUrl}${router.asPath}`;
  const finalCanonical = canonical || fullUrl;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      <link rel="canonical" href={finalCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={fullUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={`${siteUrl}${ogImage}`} />
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}

      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href={icon.src} />
    </Head>
  );
};

export default SEO;
