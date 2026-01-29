
# ওয়েবসাইট সিএমএস উন্নতি এবং সম্পূর্ণ কন্টেন্ট ম্যানেজমেন্ট সিস্টেম

## সমস্যা বিশ্লেষণ

বর্তমান সিস্টেমে কিছু সীমাবদ্ধতা রয়েছে:
1. **হার্ডকোডেড কন্টেন্ট**: শিক্ষা কার্যক্রম পেজে প্রাথমিক, নিম্ন মাধ্যমিক, মাধ্যমিক - এগুলো কোডে সরাসরি লেখা আছে। উচ্চ মাধ্যমিক এড করার উপায় নেই।
2. **অসম্পূর্ণ অ্যাডমিন প্যানেল**: সব পেজের জন্য আলাদা ম্যানেজার নেই
3. **স্লাইডার ডিজাইন**: শ্যাডো বেশি, টেক্সট বড়, বাটন কালার চেঞ্জ হয় না
4. **কালার সেটিংস**: এপিয়ারেন্সে কালার চেঞ্জ করলে কাজ হচ্ছে না
5. **হোমপেজ সেকশন নিয়ন্ত্রণ**: এডমিন চাইলে যেকোনো সেকশন হোমপেজে আনতে পারছেন না

## পরিকল্পনা

### ধাপ ১: ডাটাবেস মাইগ্রেশন (নতুন টেবিল এবং কলাম)

**নতুন টেবিল তৈরি:**
- `website_programs` - শিক্ষা স্তর/প্রোগ্রাম (প্রাথমিক, নিম্ন মাধ্যমিক, মাধ্যমিক, উচ্চ মাধ্যমিক ইত্যাদি)
- `website_facilities` - সুবিধাসমূহ (লাইব্রেরি, ল্যাব, মাঠ ইত্যাদি)
- `website_methodologies` - শিক্ষাদান পদ্ধতি
- `website_vision_mission` - দৃষ্টিভঙ্গি ও লক্ষ্য
- `website_principal_message` - অধ্যক্ষের বাণী
- `website_home_sections` - হোমপেজে কোন সেকশনগুলো দেখাবে তার নিয়ন্ত্রণ

**website_settings-এ নতুন কলাম:**
- `cta_button_color` - কল-টু-অ্যাকশন বাটনের কালার
- `secondary_button_color` - সেকেন্ডারি বাটনের কালার

### ধাপ ২: প্রতিটি পেজের জন্য আলাদা অ্যাডমিন ম্যানেজার তৈরি

| পেজ | অ্যাডমিন ম্যানেজার | কার্যক্রম |
|-----|-------------------|----------|
| হোম | HomePageManager | সেকশন অর্ডার, কোন সেকশন দেখাবে |
| আমাদের সম্পর্কে | AboutManager | পরিচিতি, দৃষ্টি-লক্ষ্য, অধ্যক্ষ বাণী, সুবিধা |
| শিক্ষা কার্যক্রম | AcademicsManager | প্রোগ্রাম, পদ্ধতি, পাঠ্যক্রম |
| ভর্তি | AdmissionsManager | ভর্তি প্রক্রিয়া, প্রয়োজনীয় ডকুমেন্ট |
| প্রাক্তন ছাত্র | (আছে) AlumniManager | - |
| নোটিশ | (আছে) NoticesManager | - |
| ফলাফল | (আছে) ResultsManager | - |
| যোগাযোগ | (আছে) ContactsManager | - |

### ধাপ ৩: হিরো স্লাইডার ডিজাইন উন্নতি

- শ্যাডো কমানো (opacity-40 থেকে opacity-60)
- টাইটেল সাইজ ছোট করা (5xl থেকে 4xl)
- সাবটাইটেল ছোট করা
- বাটন কালার ডাইনামিক করা (সেটিংস থেকে)

### ধাপ ৪: অ্যাপিয়ারেন্স কালার ফিক্স

- `useUpdateWebsiteSettings` হুকে সমস্যা খুঁজে ঠিক করা
- কালার প্রিভিউ যোগ করা
- বাটন কালার সেটিংস যোগ করা

### ধাপ ৫: সাইডবার আপডেট

Website CMS মেনুতে নতুন আইটেম যোগ:
- হোম পেজ সেটিংস
- আমাদের সম্পর্কে
- শিক্ষা কার্যক্রম
- ভর্তি তথ্য
- হিরো স্লাইড
- অভিভাবক মতামত

### ধাপ ৬: ডাইনামিক পেজ কন্টেন্ট

প্রতিটি হার্ডকোডেড কন্টেন্ট ডাটাবেস থেকে আসবে:
- শিক্ষা স্তর (উচ্চ মাধ্যমিক যোগ করা যাবে)
- সুবিধাসমূহ
- শিক্ষাদান পদ্ধতি
- ভর্তি ডকুমেন্ট লিস্ট

---

## কারিগরি বিবরণ

### ডাটাবেস স্কিমা

```text
website_programs
├── id (uuid)
├── level (text) - প্রাথমিক, মাধ্যমিক, উচ্চ মাধ্যমিক
├── level_bn (text)
├── grades (text) - শ্রেণী রেঞ্জ
├── grades_bn (text)
├── color_from (text) - গ্রেডিয়েন্ট শুরু
├── color_to (text) - গ্রেডিয়েন্ট শেষ
├── icon (text)
├── display_order (integer)
├── is_enabled (boolean)
└── created_at, updated_at

website_facilities
├── id (uuid)
├── title (text)
├── title_bn (text)
├── description (text)
├── description_bn (text)
├── icon (text)
├── display_order (integer)
└── is_enabled (boolean)

website_home_sections
├── id (uuid)
├── section_key (text) - 'features', 'stats', 'alumni', 'testimonials'
├── display_order (integer)
├── is_enabled (boolean)
└── created_at

website_settings (নতুন কলাম)
├── cta_button_color (text)
└── secondary_button_color (text)
```

### ফাইল পরিবর্তন

**নতুন ফাইল:**
- `src/pages/website/admin/HomePageManager.tsx`
- `src/pages/website/admin/AboutManager.tsx`
- `src/pages/website/admin/AcademicsManager.tsx`
- `src/pages/website/admin/AdmissionsManager.tsx`

**আপডেট করা ফাইল:**
- `src/hooks/queries/useWebsiteCMS.ts` - নতুন হুক
- `src/components/website/HeroSlider.tsx` - ডিজাইন ফিক্স
- `src/components/layout/Sidebar.tsx` - নতুন মেনু
- `src/pages/website/Academics.tsx` - ডাইনামিক কন্টেন্ট
- `src/pages/website/About.tsx` - ডাইনামিক কন্টেন্ট
- `src/pages/website/Admissions.tsx` - ডাইনামিক কন্টেন্ট
- `src/pages/website/admin/WebsiteSettings.tsx` - বাটন কালার
- `src/App.tsx` - নতুন রাউট

### রাউটিং

```text
/website/admin/home-page      → HomePageManager
/website/admin/about          → AboutManager
/website/admin/academics      → AcademicsManager
/website/admin/admissions     → AdmissionsManager
/website/admin/hero-slides    → (আছে)
/website/admin/parent-testimonials → (আছে)
```

---

## ফলাফল

এই পরিবর্তনের পর:
1. প্রতিটি পেজের সব তথ্য অ্যাডমিন প্যানেল থেকে ম্যানেজ করা যাবে
2. উচ্চ মাধ্যমিক বা যেকোনো নতুন শিক্ষা স্তর যোগ করা যাবে
3. হোমপেজে কোন সেকশন দেখাবে তা নিয়ন্ত্রণ করা যাবে
4. স্লাইডারের বাটন কালার আলাদাভাবে চেঞ্জ করা যাবে
5. সব কালার সেটিংস সঠিকভাবে সেভ হবে
