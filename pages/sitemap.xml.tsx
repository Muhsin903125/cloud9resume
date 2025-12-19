import { GetServerSideProps } from "next";
import { supabase } from "../lib/supabaseClient";

const EXTERNAL_DATA_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://cloud9profile.com";

function generateSiteMap(profiles: any[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>${EXTERNAL_DATA_URL}</loc>
     </url>
     <url>
       <loc>${EXTERNAL_DATA_URL}/login</loc>
     </url>
     <url>
       <loc>${EXTERNAL_DATA_URL}/signup</loc>
     </url>
     <url>
       <loc>${EXTERNAL_DATA_URL}/plans</loc>
     </url>
     ${profiles
       .map(({ username }) => {
         return `
       <url>
           <loc>${`${EXTERNAL_DATA_URL}/${username}`}</loc>
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
