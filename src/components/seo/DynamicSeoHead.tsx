import { useEffect } from 'react';
import { useWebsiteSettings } from '@/hooks/queries/useWebsiteCMS';

/**
 * Injects dynamic SEO meta tags into <head> based on admin settings.
 * Also generates JSON-LD structured data for search engines.
 */
export function DynamicSeoHead() {
  const { data: settings } = useWebsiteSettings();

  useEffect(() => {
    if (!settings) return;

    const seoTitle = settings.seo_title || settings.site_title || '';
    const seoDesc = settings.seo_description || '';
    const ogTitle = settings.og_title || seoTitle;
    const ogDesc = settings.og_description || seoDesc;
    const ogImage = settings.og_image_url || settings.logo_url || '';
    const twitterTitle = settings.twitter_card_title || ogTitle;
    const twitterDesc = settings.twitter_card_description || ogDesc;
    const twitterImage = settings.twitter_card_image_url || ogImage;
    const canonical = settings.canonical_url || '';
    const keywords = settings.seo_keywords || '';

    // Helper to set or create a meta tag
    const setMeta = (selector: string, attr: string, content: string) => {
      if (!content) return;
      let el = document.querySelector(selector) as HTMLMetaElement;
      if (!el) {
        el = document.createElement('meta');
        const [attrName, attrVal] = selector.match(/\[(\w+)="([^"]+)"\]/)?.slice(1) || [];
        if (attrName && attrVal) el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, content);
    };

    // Title
    if (seoTitle) document.title = seoTitle;

    // Basic meta
    setMeta('meta[name="description"]', 'content', seoDesc);
    if (keywords) setMeta('meta[name="keywords"]', 'content', keywords);

    // Open Graph
    setMeta('meta[property="og:title"]', 'content', ogTitle);
    setMeta('meta[property="og:description"]', 'content', ogDesc);
    setMeta('meta[property="og:image"]', 'content', ogImage);
    setMeta('meta[property="og:type"]', 'content', 'website');
    if (canonical) setMeta('meta[property="og:url"]', 'content', canonical);

    // Twitter Card
    setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'content', twitterTitle);
    setMeta('meta[name="twitter:description"]', 'content', twitterDesc);
    setMeta('meta[name="twitter:image"]', 'content', twitterImage);

    // Canonical
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = canonical;
    }

    // JSON-LD Structured Data
    const jsonLdType = settings.json_ld_type || 'EducationalOrganization';
    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': jsonLdType,
      name: settings.school_name || seoTitle,
      description: seoDesc,
      url: canonical || window.location.origin,
      logo: settings.logo_url || '',
      image: ogImage,
      telephone: settings.contact_phone || '',
      email: settings.contact_email || '',
      address: settings.contact_address ? {
        '@type': 'PostalAddress',
        streetAddress: settings.contact_address,
      } : undefined,
      sameAs: [
        settings.facebook_url,
        settings.youtube_url,
        settings.twitter_url,
        settings.instagram_url,
      ].filter(Boolean),
    };

    let script = document.querySelector('script[data-seo-jsonld]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.setAttribute('data-seo-jsonld', 'true');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(jsonLd);

    // Favicon
    if (settings.favicon_url) {
      let favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = settings.favicon_url;
    }
  }, [settings]);

  return null;
}
