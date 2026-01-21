import { GetServerSideProps } from "next";
import { supabase } from "../lib/supabaseClient";

const EXTERNAL_DATA_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://cloud9profile.com";

const now = new Date().toISOString();

function generateSiteMap(profiles: any[]) {
  const staticPages = [
    { url: "", priority: "1.0", changefreq: "daily" },
    { url: "/login", priority: "0.8", changefreq: "monthly" },
    { url: "/signup", priority: "0.9", changefreq: "monthly" },
    { url: "/plans", priority: "0.8", changefreq: "weekly" },
    { url: "/resume", priority: "0.9", changefreq: "weekly" },
    { url: "/portfolio", priority: "0.9", changefreq: "weekly" },
    { url: "/ats-checker", priority: "0.9", changefreq: "weekly" },
    { url: "/about", priority: "0.7", changefreq: "monthly" },
    { url: "/contact", priority: "0.7", changefreq: "monthly" },
    { url: "/privacy", priority: "0.5", changefreq: "monthly" },
    { url: "/terms", priority: "0.5", changefreq: "monthly" },
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     ${staticPages
       .map(({ url, priority, changefreq }) => {
         return `
       <url>
         <loc>${EXTERNAL_DATA_URL}${url}</loc>
         <lastmod>${now}</lastmod>
         <changefreq>${changefreq}</changefreq>
         <priority>${priority}</priority>
       </url>
     `;
       })
       .join("")}
     ${profiles
       .map(({ username }) => {
         return `
       <url>
           <loc>${`${EXTERNAL_DATA_URL}/${username}`}</loc>
           <lastmod>${now}</lastmod>
           <changefreq>weekly</changefreq>
           <priority>0.6</priority>
       </url>
     `;
       })
       .join("")}
   </urlset>
 `;
}

function SiteMap() {
  // getServerSideProps will do the heavy lifting
}

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  // We fetch the dynamic user profile URLs
  const { data: profiles } = await supabase
    .from("profiles")
    .select("username")
    .limit(1000); // Limit to first 1000 for stability, can increment later

  // We generate the XML sitemap with the profiles data
  const sitemap = generateSiteMap(profiles || []);

  res.setHeader("Content-Type", "text/xml");
  // we send the XML to the browser
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
};

export default SiteMap;
