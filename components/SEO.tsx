import Head from "next/head";
import { useRouter } from "next/router";
import { getAssetUrl } from "../lib/common-functions";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  twitterHandle?: string;
  noIndex?: boolean;
  structuredData?: Record<string, any>;
  breadcrumbs?: { name: string; item: string }[];
}

const SEO = ({
  title = "Cloud9Profile | AI-Powered Resume & Portfolio Builder",
  description = "Build a professional, ATS-friendly resume and portfolio in minutes with AI. Stand out to recruiters with Cloud9Profile's expert tools.",
  keywords = [
    "resume builder",
    "portfolio builder",
    "ATS friendly resume",
    "AI resume maker",
    "online portfolio",
    "free resume checker",
  ],
  canonical,
  ogType = "website",
  ogImage = "/og-image.png",
  twitterHandle = "@cloud9profile",
  noIndex = false,
  structuredData,
  breadcrumbs,
}: SEOProps) => {
  const router = useRouter();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://cloud9profile.com";
  const fullUrl = `${siteUrl}${router.asPath}`;
  const finalCanonical = canonical || fullUrl;

  const breadcrumbData = breadcrumbs
    ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: breadcrumbs.map((crumb, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: crumb.name,
          item: crumb.item.startsWith("http")
            ? crumb.item
            : `${siteUrl}${crumb.item}`,
        })),
      }
    : null;

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(", ")} />
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
      <link rel="icon" href={getAssetUrl("/logo-icon.png")} />

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}

      {/* Breadcrumb Data */}
      {breadcrumbData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbData),
          }}
        />
      )}
    </Head>
  );
};

export default SEO;
