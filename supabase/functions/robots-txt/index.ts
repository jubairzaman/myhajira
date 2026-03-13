import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: settings } = await supabase
    .from("website_settings")
    .select("robots_txt_override, canonical_url")
    .single();

  let robotsTxt: string;

  if (settings?.robots_txt_override?.trim()) {
    robotsTxt = settings.robots_txt_override;
  } else {
    const baseUrl = settings?.canonical_url || new URL(req.url).origin;
    robotsTxt = `User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`;
  }

  return new Response(robotsTxt, {
    headers: {
      "Content-Type": "text/plain",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
