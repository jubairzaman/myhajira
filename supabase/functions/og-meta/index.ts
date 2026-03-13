import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * This edge function serves proper OG meta tags for social media crawlers
 * (Facebook, Messenger, Twitter, etc.) since SPAs can't render meta tags server-side.
 * 
 * Usage: Set up a proxy/redirect so that social crawler requests get routed here.
 */
Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const url = new URL(req.url);
  const path = url.searchParams.get("path") || "/";

  const { data: settings } = await supabase
    .from("website_settings")
    .select("*")
    .single();

  if (!settings) {
    return new Response("Settings not found", { status: 404 });
  }

  const seoTitle = settings.og_title || settings.seo_title || settings.site_title || "School Website";
  const seoDesc = settings.og_description || settings.seo_description || "";
  const ogImage = settings.og_image_url || settings.logo_url || "";
  const twitterTitle = settings.twitter_card_title || seoTitle;
  const twitterDesc = settings.twitter_card_description || seoDesc;
  const twitterImage = settings.twitter_card_image_url || ogImage;
  const canonical = settings.canonical_url || "";
  const keywords = settings.seo_keywords || "";

  // JSON-LD
  const jsonLdType = settings.json_ld_type || "EducationalOrganization";
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@type": jsonLdType,
    name: settings.school_name || seoTitle,
    description: seoDesc,
    url: canonical || url.origin,
    logo: settings.logo_url || "",
    image: ogImage,
    telephone: settings.contact_phone || "",
    email: settings.contact_email || "",
    address: settings.contact_address
      ? { "@type": "PostalAddress", streetAddress: settings.contact_address }
      : undefined,
    sameAs: [settings.facebook_url, settings.youtube_url, settings.twitter_url, settings.instagram_url].filter(Boolean),
  });

  const html = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <title>${seoTitle}</title>
  <meta name="description" content="${seoDesc}">
  ${keywords ? `<meta name="keywords" content="${keywords}">` : ""}
  
  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${seoTitle}">
  <meta property="og:description" content="${seoDesc}">
  <meta property="og:image" content="${ogImage}">
  ${canonical ? `<meta property="og:url" content="${canonical}${path}">` : ""}
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${twitterTitle}">
  <meta name="twitter:description" content="${twitterDesc}">
  <meta name="twitter:image" content="${twitterImage}">
  
  ${canonical ? `<link rel="canonical" href="${canonical}${path}">` : ""}
  ${settings.favicon_url ? `<link rel="icon" href="${settings.favicon_url}">` : ""}
  
  <!-- JSON-LD -->
  <script type="application/ld+json">${jsonLd}</script>
  
  <!-- Redirect real users to the SPA -->
  <meta http-equiv="refresh" content="0;url=${canonical || url.origin}${path}">
</head>
<body>
  <h1>${settings.school_name || seoTitle}</h1>
  <p>${seoDesc}</p>
  ${ogImage ? `<img src="${ogImage}" alt="${seoTitle}">` : ""}
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
    },
  });
});
