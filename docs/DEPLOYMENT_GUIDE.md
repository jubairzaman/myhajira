# 🚀 মাল্টি-স্কুল ডিপ্লয়মেন্ট গাইড

## SEO সিস্টেম আর্কিটেকচার

### ফোল্ডার স্ট্রাকচার
```
src/
├── components/
│   └── seo/
│       └── DynamicSeoHead.tsx      # ডাইনামিক মেটা ট্যাগ ইনজেকশন + JSON-LD
├── pages/
│   └── website/
│       └── admin/
│           └── SeoSettings.tsx     # অ্যাডমিন SEO সেটিংস প্যানেল
supabase/
└── functions/
    ├── sitemap/index.ts            # অটো-জেনারেটেড sitemap.xml
    ├── robots-txt/index.ts         # ডাইনামিক robots.txt
    └── og-meta/index.ts            # সোশ্যাল মিডিয়া ক্রলার সার্ভিস
```

### ডাটাবেস SEO ফিল্ডস (website_settings টেবিল)
| Field | Purpose |
|-------|---------|
| `seo_title` | Google সার্চ টাইটেল (<60 chars) |
| `seo_description` | Meta description (<160 chars) |
| `seo_keywords` | Keywords (comma-separated) |
| `og_title` | Facebook/Messenger শিরোনাম |
| `og_description` | Facebook/Messenger বিবরণ |
| `og_image_url` | OG ইমেজ (1200×630 recommended) |
| `twitter_card_title` | Twitter/X শিরোনাম |
| `twitter_card_description` | Twitter/X বিবরণ |
| `twitter_card_image_url` | Twitter ইমেজ |
| `canonical_url` | ক্যানোনিক্যাল URL |
| `robots_txt_override` | কাস্টম robots.txt |
| `json_ld_type` | Structured Data টাইপ |

---

## নতুন স্কুলের জন্য ডিপ্লয় করার ধাপ

### ১. প্রজেক্ট ক্লোন
```bash
# প্রজেক্ট কপি করুন
git clone <repo-url> new-school-name
cd new-school-name
npm install
```

### ২. ডাটাবেস সেটআপ
- Lovable Cloud এ নতুন প্রজেক্ট তৈরি করুন
- সমস্ত মাইগ্রেশন স্বয়ংক্রিয়ভাবে চলবে
- `website_settings` টেবিলে ডিফল্ট ডেটা যোগ হবে

### ৩. স্কুল-ভিত্তিক কনফিগারেশন
অ্যাডমিন প্যানেলে যান → **Website CMS** → **SEO Settings**:
- Site Title: "আলী আকবর মডেল হাই স্কুল"
- Meta Description: "ঢাকার অন্যতম সেরা শিক্ষা প্রতিষ্ঠান..."
- OG Image: স্কুলের ব্যানার আপলোড করুন
- Canonical URL: `https://aliakbar.edu.bd`

### ৪. কাস্টম ডোমেইন
Lovable Settings → Domains → Connect Domain:
- A Record: @ → 185.158.133.1
- A Record: www → 185.158.133.1

### ৫. Sitemap ও Robots.txt
Edge functions স্বয়ংক্রিয়ভাবে deploy হয়:
- Sitemap: `{SUPABASE_URL}/functions/v1/sitemap`
- Robots: `{SUPABASE_URL}/functions/v1/robots-txt`
- OG Meta: `{SUPABASE_URL}/functions/v1/og-meta?path=/`

### ৬. Facebook/Messenger OG ভেরিফাই
1. OG Image ও Title সেট করুন admin panel থেকে
2. [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) এ URL চেক করুন
3. "Scrape Again" ক্লিক করুন

---

## SEO চেকলিস্ট
- ✅ Site Title (60 অক্ষরের মধ্যে)
- ✅ Meta Description (160 অক্ষরের মধ্যে)
- ✅ OG Image (1200×630px)
- ✅ Canonical URL সেট
- ✅ JSON-LD Structured Data
- ✅ Sitemap.xml অটো-জেনারেট
- ✅ Robots.txt কনফিগার
- ✅ Favicon আপলোড
- ✅ Mobile Responsive
- ✅ Lazy Loading Images

## মাল্টি-স্কুল নোট
- কোনো হার্ডকোডেড ব্র্যান্ডিং নেই
- সব SEO ফিল্ড ডাটাবেস থেকে ডাইনামিক
- প্রতিটি স্কুল নিজের ডোমেইন, লোগো, OG ইমেজ, ফেভিকন সেট করতে পারবে
- অ্যাডমিন রিয়েল-টাইমে সব SEO সেটিংস আপডেট করতে পারবে
