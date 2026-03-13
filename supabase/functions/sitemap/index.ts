import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Content-Type": "application/xml",
  "Access-Control-Allow-Origin": "*",
};

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Get canonical URL from settings
  const { data: settings } = await supabase
    .from("website_settings")
    .select("canonical_url, school_name")
    .single();

  const baseUrl = settings?.canonical_url || new URL(req.url).origin.replace('/functions/v1/sitemap', '');

  // Get enabled pages
  const { data: pages } = await supabase
    .from("website_pages")
    .select("slug, updated_at")
    .eq("is_enabled", true)
    .order("display_order");

  // Get published notices
  const { data: notices } = await supabase
    .from("website_notices")
    .select("id, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(100);

  const now = new Date().toISOString().split("T")[0];

  let urls = `
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

  // Static pages
  const staticPages = ["about", "academics", "admissions", "notices", "results", "alumni", "contact"];
  for (const page of staticPages) {
    urls += `
  <url>
    <loc>${baseUrl}/${page}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  // Dynamic pages from DB
  if (pages) {
    for (const page of pages) {
      if (!staticPages.includes(page.slug) && page.slug !== '/') {
        urls += `
  <url>
    <loc>${baseUrl}/${page.slug}</loc>
    <lastmod>${page.updated_at?.split("T")[0] || now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    }
  }

  // Notice detail pages
  if (notices) {
    for (const notice of notices) {
      urls += `
  <url>
    <loc>${baseUrl}/notices/${notice.id}</loc>
    <lastmod>${notice.created_at?.split("T")[0] || now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(sitemap, { headers: corsHeaders });
});
