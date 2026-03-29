import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard, GraduationCap, Users, UserCheck, Monitor, Wallet,
  Package, FileText, Settings, Calendar, Globe, Cpu, MessageSquare, Tv,
  Building2, ChevronRight, ArrowRight, ClipboardCheck, BookOpen, BarChart3,
  Shield, DollarSign
} from 'lucide-react';

const modules = [
  {
    id: 'dashboard',
    title: 'ড্যাশবোর্ড',
    titleEn: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    color: 'bg-blue-500',
    description: 'সফটওয়্যারে লগইন করার পর প্রথমেই ড্যাশবোর্ড দেখা যায়। এখানে স্কুলের সামগ্রিক চিত্র এক নজরে দেখা যায়।',
    features: [
      'মোট শিক্ষার্থী ও শিক্ষক সংখ্যা',
      'আজকের উপস্থিতি (উপস্থিত, বিলম্ব, অনুপস্থিত)',
      'উপস্থিতি হার শতাংশে',
      'সাম্প্রতিক কার্যকলাপ তালিকা',
      'Quick Actions বাটন',
    ],
    steps: [
      'লগইন করুন → স্বয়ংক্রিয়ভাবে ড্যাশবোর্ড দেখাবে',
      'কার্ডগুলোতে ক্লিক করে বিস্তারিত দেখুন',
      'Quick Actions থেকে দ্রুত কাজ করুন',
    ],
  },
  {
    id: 'structure',
    title: 'কাঠামো সেটআপ',
    titleEn: 'Structure Setup',
    icon: Building2,
    path: '/shifts',
    color: 'bg-indigo-500',
    description: 'স্কুলের শিফট, শ্রেণী ও শাখা সেটআপ করুন। এটি সবার আগে করতে হবে।',
    features: [
      'শিফট তৈরি (প্রভাতী/দিবা) ও সময়সূচি সেট',
      'শ্রেণী তৈরি (নার্সারি থেকে ১০ম)',
      'প্রতিটি শ্রেণীতে শাখা যোগ (ক, খ, গ)',
      'শিফটে ক্লাস অ্যাসাইন করা',
    ],
    steps: [
      'সাইডবার → কাঠামো → শিফট → "নতুন শিফট" বাটনে ক্লিক',
      'শিফটের নাম, শুরু ও শেষ সময়, লেট থ্রেশহোল্ড সেট করুন',
      'কাঠামো → শ্রেণী → "নতুন শ্রেণী" → নাম ও শিফট সিলেক্ট',
      'কাঠামো → শাখা → শ্রেণী সিলেক্ট → শাখা যোগ করুন',
    ],
  },
  {
    id: 'academic-year',
    title: 'শিক্ষাবর্ষ',
    titleEn: 'Academic Year',
    icon: Calendar,
    path: '/academic-year',
    color: 'bg-purple-500',
    description: 'শিক্ষাবর্ষ তৈরি ও সক্রিয় বর্ষ নির্ধারণ করুন। সকল ডেটা শিক্ষাবর্ষ ভিত্তিক সংরক্ষিত হয়।',
    features: [
      'নতুন শিক্ষাবর্ষ তৈরি',
      'সক্রিয় বর্ষ সেট করা (একটিমাত্র সক্রিয় থাকবে)',
      'পুরনো বর্ষ আর্কাইভ করা',
    ],
    steps: [
      'সেটিংস → শিক্ষাবর্ষ → "নতুন বর্ষ" বাটন',
      'নাম (যেমন ২০২৬), শুরু ও শেষ তারিখ দিন',
      'সেভ করুন → "সক্রিয় করুন" বাটনে ক্লিক',
    ],
  },
  {
    id: 'students',
    title: 'শিক্ষার্থী ব্যবস্থাপনা',
    titleEn: 'Student Management',
    icon: GraduationCap,
    path: '/students',
    color: 'bg-green-500',
    description: 'শিক্ষার্থীদের তথ্য যোগ, সম্পাদনা ও পরিচালনা করুন।',
    features: [
      'শিক্ষার্থী তালিকা (ক্লাস, সেকশন, শিফট ফিল্টার)',
      'নতুন শিক্ষার্থী রেজিস্ট্রেশন',
      'প্রোফাইল এডিট ও আর্থিক তথ্য',
      'RFID কার্ড এনরোলমেন্ট',
      'Webcam দিয়ে ফটো তোলা',
      'ডকুমেন্ট চেকলিস্ট',
      'শিক্ষার্থী সার্চ (নাম/আইডি/মোবাইল)',
    ],
    steps: [
      'সাইডবার → শিক্ষার্থী → তালিকা দেখুন',
      '"নতুন শিক্ষার্থী" বাটনে ক্লিক করুন',
      'নাম (ইংরেজি ও বাংলা), শিফট, ক্লাস, সেকশন নির্বাচন',
      'অভিভাবকের মোবাইল নম্বর দিন (SMS এর জন্য)',
      'ফটো তুলুন অথবা আপলোড করুন',
      'RFID কার্ড এনরোল করুন (ডিভাইসে কার্ড ট্যাপ)',
      'সেভ করুন',
    ],
  },
  {
    id: 'teachers',
    title: 'শিক্ষক ব্যবস্থাপনা',
    titleEn: 'Teacher Management',
    icon: Users,
    path: '/teachers',
    color: 'bg-amber-500',
    description: 'শিক্ষকদের তথ্য যোগ, সম্পাদনা ও পরিচালনা করুন।',
    features: [
      'শিক্ষক তালিকা',
      'নতুন শিক্ষক রেজিস্ট্রেশন',
      'প্রোফাইল এডিট',
      'RFID কার্ড এনরোলমেন্ট',
      'Punch In / Punch Out ট্র্যাকিং',
    ],
    steps: [
      'সাইডবার → শিক্ষক → "নতুন শিক্ষক" ক্লিক',
      'নাম, পদবী, মোবাইল, শিফট দিন',
      'ফটো তুলুন ও RFID কার্ড এনরোল করুন',
      'সেভ করুন',
    ],
  },
  {
    id: 'attendance',
    title: 'উপস্থিতি ব্যবস্থাপনা',
    titleEn: 'Attendance Management',
    icon: UserCheck,
    path: '/attendance/students',
    color: 'bg-teal-500',
    description: 'RFID কার্ড পাঞ্চের মাধ্যমে স্বয়ংক্রিয় উপস্থিতি রেকর্ড হয়। প্রয়োজনে ম্যানুয়াল এন্ট্রি দেওয়া যায়।',
    features: [
      'শিক্ষার্থী উপস্থিতি (তারিখ ও ক্লাস ভিত্তিক)',
      'শিক্ষক উপস্থিতি (Punch In/Out সময়)',
      'ম্যানুয়াল এন্ট্রি (কারণসহ)',
      'স্বয়ংক্রিয় স্ট্যাটাস: Present / Late / Absent',
      'SMS অটো-ট্রিগার (পাঞ্চ ও অনুপস্থিতিতে)',
    ],
    steps: [
      'RFID ডিভাইসে কার্ড ট্যাপ → স্বয়ংক্রিয় রেকর্ড',
      'উপস্থিতি → শিক্ষার্থী উপস্থিতি → তারিখ ও ক্লাস ফিল্টার',
      'ম্যানুয়াল এন্ট্রি → শিক্ষার্থী/শিক্ষক সিলেক্ট → স্ট্যাটাস দিন',
    ],
  },
  {
    id: 'monitor',
    title: 'লাইভ মনিটর',
    titleEn: 'Live Monitor',
    icon: Monitor,
    path: '/monitor/gate',
    color: 'bg-rose-500',
    description: 'গেটে মনিটর/টিভি সেটআপ করে শিক্ষার্থী/শিক্ষকের ছবি ও তথ্য দেখান।',
    features: [
      'RFID পাঞ্চে ছবি ও তথ্য রিয়েলটাইম দেখায়',
      'ভিডিও প্লেয়ার (পাঞ্চে ১৫ সেকেন্ড পজ)',
      'নিউজ স্ক্রলার (কাস্টমাইজযোগ্য)',
      'অফিস মনিটর ভিউ',
    ],
    steps: [
      'গেটে একটি মনিটর/টিভি সেটআপ করুন',
      'ব্রাউজারে /monitor/gate লিংক খুলুন (ফুলস্ক্রিন)',
      'RFID ডিভাইস থেকে পাঞ্চ করলেই তথ্য দেখাবে',
      'সেটিংস → মনিটর ডিসপ্লে থেকে ভিডিও ও নিউজ কনফিগার',
    ],
  },
  {
    id: 'fees',
    title: 'ফি ম্যানেজমেন্ট',
    titleEn: 'Fee Management',
    icon: Wallet,
    path: '/fees/settings',
    color: 'bg-emerald-500',
    description: 'শিক্ষার্থীদের ফি সেটআপ, আদায় ও রিপোর্ট ব্যবস্থাপনা করুন।',
    features: [
      'শ্রেণী ভিত্তিক ফি সেট (ভর্তি, সেশন, মাসিক)',
      'পরীক্ষা ফি সেটআপ',
      'Late Fine কনফিগারেশন',
      'POS স্টাইল ফি আদায় (কার্ট সিস্টেম)',
      'মাল্টি-আইটেম সিলেকশন (ফি + পণ্য)',
      'রিসিপ্ট প্রিন্ট (A4)',
      'Bulk ফি জেনারেশন',
      'ফি রিপোর্ট ও Defaulter লিস্ট',
    ],
    steps: [
      '① ফি সেটিংস → শ্রেণী ভিত্তিক ফি সেট করুন',
      '② ফি সেটিংস → পরীক্ষা যোগ করুন (যদি থাকে)',
      '③ ফি সেটিংস → "ফি জেনারেট" বাটন → মাস/পরীক্ষা সিলেক্ট',
      '④ ফি আদায় → শিক্ষার্থী সার্চ → মাস/ফি সিলেক্ট',
      '⑤ কার্টে যোগ হবে → "আদায় করুন" বাটন → রিসিপ্ট প্রিন্ট',
    ],
  },
  {
    id: 'inventory',
    title: 'ইনভেন্টরি',
    titleEn: 'Inventory',
    icon: Package,
    path: '/inventory',
    color: 'bg-orange-500',
    description: 'স্কুলের পণ্য (ডায়েরি, আইডি কার্ড, বই ইত্যাদি) স্টক ব্যবস্থাপনা।',
    features: [
      'পণ্য তালিকা (CRUD)',
      'স্টক ইন (মজুদ বাড়ানো)',
      'ফি আদায়ের সময় বিক্রি (স্বয়ংক্রিয় স্টক কমে)',
      'কম স্টক সতর্কতা',
      'ক্যাটাগরি: ডায়েরি, আইডি কার্ড, ফি বুক, ইউনিফর্ম, বই, স্টেশনারি',
    ],
    steps: [
      'সাইডবার → ইনভেন্টরি → "নতুন পণ্য" বাটন',
      'নাম, মূল্য, ক্যাটাগরি দিন → সেভ',
      'স্টক বাড়াতে "Stock In" বাটন → পরিমাণ দিন',
      'ফি আদায়ের সময় পণ্য সিলেক্ট করলে স্বয়ংক্রিয় বিক্রি হবে',
    ],
  },
  {
    id: 'reports',
    title: 'রিপোর্ট',
    titleEn: 'Reports',
    icon: FileText,
    path: '/reports',
    color: 'bg-cyan-500',
    description: 'উপস্থিতি ও ফি সংক্রান্ত বিভিন্ন রিপোর্ট তৈরি ও প্রিন্ট করুন।',
    features: [
      'শ্রেণী মাসিক উপস্থিতি রিপোর্ট',
      'শিক্ষার্থী মাসিক উপস্থিতি রিপোর্ট',
      'শিক্ষক মাসিক উপস্থিতি রিপোর্ট',
      'ফি আদায় রিপোর্ট',
      'প্রিন্ট-ফ্রেন্ডলি ফরম্যাট',
    ],
    steps: [
      'সাইডবার → রিপোর্ট → রিপোর্ট টাইপ সিলেক্ট',
      'মাস, ক্লাস, সেকশন ফিল্টার করুন',
      '"রিপোর্ট দেখুন" বাটন → প্রিন্ট করুন',
    ],
  },
  {
    id: 'website-cms',
    title: 'ওয়েবসাইট সিএমএস',
    titleEn: 'Website CMS',
    icon: Globe,
    path: '/website/admin/settings',
    color: 'bg-violet-500',
    description: 'স্কুলের ওয়েবসাইট সম্পূর্ণ অ্যাডমিন প্যানেল থেকে পরিচালনা করুন।',
    features: [
      'হোম পেজ কনটেন্ট ম্যানেজমেন্ট',
      'হিরো স্লাইডার (ছবি ও টেক্সট)',
      'পপআপ নোটিশ সেটআপ',
      'CTA বাটন লিংক পরিবর্তন',
      'নোটিশ বোর্ড পরিচালনা',
      'ফলাফল আপলোড',
      'প্রাক্তনী তথ্য ম্যানেজমেন্ট',
      'অভিভাবক মতামত',
      'যোগাযোগ বার্তা দেখা',
      'কাস্টম ন্যাভিগেশন মেনু',
    ],
    steps: [
      'সাইডবার → ওয়েবসাইট সিএমএস → সেটিংস',
      'স্কুলের নাম, লোগো, যোগাযোগ তথ্য দিন',
      'হিরো স্লাইড → ছবি আপলোড ও টেক্সট দিন',
      'নোটিশ → "নতুন নোটিশ" → শিরোনাম ও বিবরণ লিখুন',
      'প্রতিটি সেকশন আলাদাভাবে কনফিগার করুন',
    ],
  },
  {
    id: 'sms',
    title: 'এসএমএস/হোয়াটসঅ্যাপ',
    titleEn: 'SMS/WhatsApp',
    icon: MessageSquare,
    path: '/sms',
    color: 'bg-pink-500',
    description: 'অভিভাবকদের কাছে স্বয়ংক্রিয় SMS ও WhatsApp বার্তা পাঠান।',
    features: [
      'পাঞ্চ SMS (স্কুলে আসলে)',
      'বিলম্ব SMS (দেরিতে আসলে)',
      'অনুপস্থিত SMS (না আসলে)',
      'WhatsApp Business API সাপোর্ট',
      'SMS ব্যালেন্স দেখা',
      'কাস্টম টেমপ্লেট',
      'ফি বকেয়া SMS (Defaulter লিস্ট থেকে)',
    ],
    steps: [
      'সেটিংস → এসএমএস সেটিংস → API Key দিন',
      'টেমপ্লেট কাস্টমাইজ করুন',
      'প্রতিটি SMS টাইপ Enable/Disable করুন',
      'WhatsApp সেটআপ করলে Preferred Channel সিলেক্ট করুন',
    ],
  },
  {
    id: 'devices',
    title: 'ডিভাইস ব্যবস্থাপনা',
    titleEn: 'Device Management',
    icon: Cpu,
    path: '/devices',
    color: 'bg-gray-500',
    description: 'RFID কার্ড রিডার ডিভাইস (ZKTeco) কনফিগার ও পরিচালনা করুন।',
    features: [
      'ডিভাইস যোগ (IP Address, Port)',
      'Online/Offline স্ট্যাটাস মনিটরিং',
      'ডিভাইস Sync',
      'গেট/অফিস লোকেশন সেট',
    ],
    steps: [
      'সেটিংস → ডিভাইস → "নতুন ডিভাইস" বাটন',
      'ডিভাইসের নাম, IP Address ও Port দিন',
      'লোকেশন সিলেক্ট করুন (Gate/Office)',
      'সেভ করুন → Sync বাটনে ক্লিক',
    ],
  },
  {
    id: 'calendar',
    title: 'স্কুল ক্যালেন্ডার',
    titleEn: 'School Calendar',
    icon: Calendar,
    path: '/calendar',
    color: 'bg-red-500',
    description: 'স্কুলের ছুটি, পরীক্ষা ও ইভেন্ট ক্যালেন্ডারে যোগ করুন।',
    features: [
      'ছুটি যোগ (সরকারি/সাপ্তাহিক)',
      'পরীক্ষার তারিখ সেট',
      'ইভেন্ট/অনুষ্ঠান যোগ',
      'অর্ধদিবস সেট',
      'শ্রেণী ভিত্তিক ছুটি',
    ],
    steps: [
      'সেটিংস → স্কুল ক্যালেন্ডার → তারিখে ক্লিক',
      'টাইপ সিলেক্ট (ছুটি/পরীক্ষা/ইভেন্ট/অর্ধদিবস)',
      'শিরোনাম দিন → সব ক্লাস বা নির্দিষ্ট ক্লাস সিলেক্ট',
      'সেভ করুন',
    ],
  },
  {
    id: 'monitor-settings',
    title: 'মনিটর ডিসপ্লে সেটিংস',
    titleEn: 'Monitor Display Settings',
    icon: Tv,
    path: '/settings/monitor',
    color: 'bg-sky-500',
    description: 'গেট মনিটরের ভিডিও, নিউজ স্ক্রলার ও ডিজাইন কাস্টমাইজ করুন।',
    features: [
      'স্কুলের নাম ও লোগো সেট',
      'ভিডিও তালিকা (CRUD)',
      'নিউজ স্ক্রলার আইটেম যোগ',
      'স্ক্রলার ডিজাইন কাস্টমাইজ (রং, ফন্ট, গতি)',
    ],
    steps: [
      'সেটিংস → মনিটর ডিসপ্লে',
      'স্কুলের নাম ও লোগো আপলোড করুন',
      'ভিডিও ট্যাব → YouTube লিংক যোগ করুন',
      'নিউজ ট্যাব → স্ক্রলার আইটেম যোগ ও স্টাইল করুন',
    ],
  },
  {
    id: 'results',
    title: 'ফলাফল ব্যবস্থাপনা',
    titleEn: 'Result Management',
    icon: ClipboardCheck,
    path: '/results',
    color: 'bg-fuchsia-500',
    description: 'সম্পূর্ণ কনফিগারযোগ্য ফলাফল ইঞ্জিন। গ্রেডিং স্কেল, পরীক্ষার কাঠামো, মার্কস এন্ট্রি, ট্যাবুলেশন এবং পাবলিশ — সবকিছু এডমিন প্যানেল থেকে পরিচালনা করুন।',
    features: [
      'কাস্টম গ্রেডিং স্কেল তৈরি (GPA 5.00 / 4.00 / কাস্টম)',
      'বিষয় ব্যবস্থাপনা (MCQ, CQ, ব্যবহারিক কম্পোনেন্ট সহ)',
      'পরীক্ষা প্যাটার্ন তৈরি (টার্ম ভিত্তিক / সরাসরি)',
      'ওয়েটেড রেজাল্ট সিস্টেম (টার্ম ১ = ২৫%, টার্ম ২ = ৭৫% ইত্যাদি)',
      'মার্কস এন্ট্রি (শিক্ষক → জমা → এডমিন অনুমোদন)',
      'ট্যাবুলেশন শিট (শ্রেণী ও সেকশন ভিত্তিক)',
      'ফলাফল পাবলিশ ও লক সিস্টেম',
      'গ্রেস মার্কস ও অনুপস্থিতি কনফিগারেশন',
      'র‍্যাংকিং সিস্টেম (GPA → মোট নম্বর → রোল)',
      'প্রমোশন ওভাররাইড (ফেল → পাস)',
      'মার্কস অডিট লগ (কে কখন কি পরিবর্তন করেছে)',
      'A4 প্রিন্ট-রেডি রিপোর্ট',
    ],
    steps: [
      '① সাইডবার → ফলাফল → গ্রেডিং স্কেল → "নতুন স্কেল" বাটন → স্কেলের নাম দিন → গ্রেড যোগ করুন (A+, A, A-, B ইত্যাদি) → প্রতিটি গ্রেডের মিনিমাম-ম্যাক্সিমাম নম্বর ও পয়েন্ট সেট করুন → সেভ',
      '② ফলাফল → বিষয় ব্যবস্থাপনা → ক্লাস সিলেক্ট → "নতুন বিষয়" → বিষয়ের নাম, কোড, পূর্ণমান ও পাশ নম্বর দিন → প্রয়োজনে কম্পোনেন্ট যোগ করুন (MCQ: ৩০, CQ: ৭০) → সেভ',
      '③ ফলাফল → পরীক্ষা প্যাটার্ন → ক্লাস সিলেক্ট → "নতুন প্যাটার্ন" → নাম দিন (যেমন "টার্ম ভিত্তিক") → টার্ম যোগ করুন (১ম সাময়িক, ২য় সাময়িক) → প্রতিটি টার্মের ওজন (%) সেট করুন → সেভ',
      '④ ফলাফল → রেজাল্ট কনফিগ → ক্লাস সিলেক্ট → গ্রেডিং স্কেল নির্বাচন → অনুপস্থিত = ০ চালু/বন্ধ → গ্রেস মার্কস সেট → র‍্যাংকিং প্রায়োরিটি ঠিক করুন → সেভ',
      '⑤ ফলাফল → মার্কস এন্ট্রি → পরীক্ষা, ক্লাস, সেকশন, বিষয় সিলেক্ট → শিক্ষার্থীদের নম্বর টাইপ করুন → অনুপস্থিতদের "Absent" চেক করুন → "ড্রাফট সেভ" বাটন → পরে "জমা দিন" বাটন',
      '⑥ এডমিন → মার্কস রিভিউ → জমাকৃত মার্কস দেখুন → "অনুমোদন" বাটনে ক্লিক → মার্কস লক হয়ে যাবে',
      '⑦ ফলাফল → ট্যাবুলেশন → পরীক্ষা ও ক্লাস সিলেক্ট → সকল শিক্ষার্থীর নম্বর, GPA ও মেরিট দেখুন → "প্রিন্ট" বাটনে ক্লিক',
      '⑧ ফলাফল → ড্যাশবোর্ড → পরীক্ষা ও ক্লাস সিলেক্ট → "পাবলিশ" বাটন → ফলাফল ওয়েবসাইটে প্রকাশিত হবে ও লক হবে',
    ],
  },
  {
    id: 'results-grading',
    title: '↳ গ্রেডিং স্কেল বিস্তারিত',
    titleEn: 'Grading Scale Details',
    icon: BarChart3,
    path: '/results/grading',
    color: 'bg-fuchsia-400',
    description: 'গ্রেডিং স্কেল হল ফলাফলের ভিত্তি। এখানে আপনি নির্ধারণ করবেন কত নম্বরে কোন গ্রেড এবং কত পয়েন্ট হবে।',
    features: [
      'একাধিক গ্রেডিং স্কেল তৈরি সম্ভব (যেমন: প্রাথমিক স্কেল, মাধ্যমিক স্কেল)',
      'প্রতিটি গ্রেডে নির্ধারিত: গ্রেড নাম, মিনিমাম নম্বর, ম্যাক্সিমাম নম্বর, পয়েন্ট',
      'বাংলায় গ্রেড নাম ও মন্তব্য (রিমার্কস) দেওয়া যায়',
      'ডিসপ্লে অর্ডার সেট করা যায়',
      'শিক্ষাবর্ষ ভিত্তিক (পুরনো স্কেল আর্কাইভ থাকবে)',
    ],
    steps: [
      'ফলাফল → গ্রেডিং স্কেল পেজে যান',
      '"নতুন গ্রেডিং স্কেল" বাটনে ক্লিক করুন',
      'স্কেলের নাম দিন (যেমন: "জাতীয় শিক্ষাক্রম ২০২৬")',
      'গ্রেড সারি যোগ করুন → প্রতিটিতে: গ্রেড (A+), মিন (80), ম্যাক্স (100), পয়েন্ট (5.00)',
      'সব গ্রেড যোগ হলে "সেভ" বাটনে ক্লিক করুন',
      '⚠️ নোট: একবার রেজাল্টে ব্যবহৃত হলে স্কেল ডিলিট করা যাবে না',
    ],
  },
  {
    id: 'results-subjects',
    title: '↳ বিষয় ব্যবস্থাপনা বিস্তারিত',
    titleEn: 'Subject Management Details',
    icon: BookOpen,
    path: '/results/subjects',
    color: 'bg-fuchsia-400',
    description: 'প্রতিটি ক্লাসের জন্য আলাদাভাবে বিষয় তৈরি করুন। বিষয়ে MCQ, CQ, ব্যবহারিক ইত্যাদি কম্পোনেন্ট থাকতে পারে।',
    features: [
      'ক্লাস ভিত্তিক বিষয় তৈরি',
      'বিষয়ের ধরন: আবশ্যিক (mandatory), ঐচ্ছিক (optional), ব্যবহারিক (practical)',
      'সাবজেক্ট কোড (যেমন: BNG-101)',
      'পূর্ণমান ও পাশ নম্বর সেট',
      'কম্পোনেন্ট সিস্টেম: MCQ (৩০) + CQ (৭০) = মোট ১০০',
      'কম্পোনেন্টে "পাশ আবশ্যক" সেট করা যায় (যেমন: ব্যবহারিকে পাশ করতেই হবে)',
    ],
    steps: [
      'ফলাফল → বিষয় ব্যবস্থাপনা পেজে যান',
      'উপরে ক্লাস সিলেক্ট করুন (যেমন: ১ম শ্রেণী)',
      '"নতুন বিষয়" বাটনে ক্লিক করুন',
      'বিষয়ের নাম (ইংরেজি ও বাংলা), কোড, ধরন দিন',
      'পূর্ণমান (যেমন: 100) ও পাশ নম্বর (যেমন: 33) দিন',
      'কম্পোনেন্ট থাকলে "কম্পোনেন্ট আছে" চেক করুন → MCQ, CQ ইত্যাদি যোগ করুন',
      'সেভ করুন',
      '⚠️ সতর্কতা: কম্পোনেন্টগুলোর পূর্ণমানের যোগফল = বিষয়ের পূর্ণমান হতে হবে',
    ],
  },
  {
    id: 'results-marks',
    title: '↳ মার্কস এন্ট্রি ওয়ার্কফ্লো',
    titleEn: 'Marks Entry Workflow',
    icon: Shield,
    path: '/results/marks',
    color: 'bg-fuchsia-400',
    description: 'মার্কস এন্ট্রি একটি নিরাপদ ও নিয়ন্ত্রিত প্রক্রিয়া। শিক্ষক এন্ট্রি দেন → জমা দেন → এডমিন অনুমোদন করেন → ফলাফল ক্যালকুলেট হয়।',
    features: [
      'ড্রাফট মোড: শিক্ষক নম্বর টাইপ করেন, পরে এডিট করতে পারেন',
      'জমা (Submit): শিক্ষক ফাইনাল করেন, আর এডিট করতে পারেন না',
      'অনুমোদন (Approve): এডমিন রিভিউ করে অনুমোদন দেন',
      'পাবলিশ (Publish): ফলাফল প্রকাশিত ও লক হয়',
      'ভ্যালিডেশন: পূর্ণমানের বেশি নম্বর দেওয়া যাবে না',
      'Absent মার্কিং: অনুপস্থিত শিক্ষার্থীকে চেকবক্সে মার্ক করুন',
      'অডিট ট্রেইল: সকল পরিবর্তনের লগ সংরক্ষিত হয়',
    ],
    steps: [
      'ফলাফল → মার্কস এন্ট্রি পেজে যান',
      'পরীক্ষা সিলেক্ট করুন (যেমন: ১ম সাময়িক)',
      'ক্লাস ও সেকশন সিলেক্ট করুন',
      'বিষয় সিলেক্ট করুন (যেমন: বাংলা)',
      'শিক্ষার্থীদের তালিকা আসবে → প্রতিজনের পাশে নম্বর লিখুন',
      'অনুপস্থিত থাকলে "Absent" কলামে চেক দিন',
      '"ড্রাফট সেভ" বাটনে ক্লিক করুন (পরে আবার এডিট করা যাবে)',
      'সব ঠিক থাকলে "জমা দিন" বাটনে ক্লিক করুন (এরপর আর এডিট করা যাবে না)',
      'এডমিন মার্কস দেখে "অনুমোদন" দেবেন',
      '⚠️ গুরুত্বপূর্ণ: পূর্ণমানের বেশি নম্বর দিলে সিস্টেম এরর দেখাবে',
    ],
  },
  {
    id: 'results-tabulation',
    title: '↳ ট্যাবুলেশন ও রিপোর্ট',
    titleEn: 'Tabulation & Reports',
    icon: FileText,
    path: '/results/tabulation',
    color: 'bg-fuchsia-400',
    description: 'সকল শিক্ষার্থীর নম্বর, GPA, গ্রেড ও মেরিট পজিশন এক জায়গায় দেখুন এবং A4 সাইজে প্রিন্ট করুন।',
    features: [
      'পরীক্ষা ও ক্লাস ভিত্তিক ট্যাবুলেশন গ্রিড',
      'বিষয়ওয়াই নম্বর কলাম',
      'মোট নম্বর, GPA ও গ্রেড স্বয়ংক্রিয় ক্যালকুলেশন',
      'মেরিট পজিশন (র‍্যাংকিং)',
      'পাশ/ফেল স্ট্যাটাস',
      'A4 ল্যান্ডস্কেপ প্রিন্ট সাপোর্ট',
      'স্কুল হেডার সহ প্রিন্ট',
    ],
    steps: [
      'ফলাফল → ট্যাবুলেশন পেজে যান',
      'পরীক্ষা সিলেক্ট করুন',
      'ক্লাস ও সেকশন সিলেক্ট করুন',
      'ট্যাবুলেশন টেবিল লোড হবে → সকল শিক্ষার্থীর নম্বর দেখুন',
      '"প্রিন্ট" বাটনে ক্লিক করুন → A4 ল্যান্ডস্কেপে প্রিন্ট হবে',
      '⚠️ নোট: মার্কস অনুমোদিত না হলে ট্যাবুলেশনে দেখাবে না',
    ],
  },
  {
    id: 'accounts',
    title: 'একাউন্টস ও ফাইন্যান্স',
    titleEn: 'Accounts & Finance',
    icon: DollarSign,
    path: '/accounts',
    color: 'bg-lime-600',
    description: 'স্কুলের আর্থিক ব্যবস্থাপনা — দৈনিক আয়-ব্যয়, রিপোর্ট ও এডমিন কন্ট্রোল।',
    features: [
      'দৈনিক আয়-ব্যয় সামারি',
      'ব্যয় এন্ট্রি (ক্যাটাগরি, পেমেন্ট মেথড সহ)',
      'ফি আদায়ের সাথে অটোমেটিক আয় ক্যালকুলেশন',
      'এডমিন ফাইন্যান্স ড্যাশবোর্ড (মাসিক/বার্ষিক রিপোর্ট)',
      'ফাইন্যান্স কন্ট্রোল প্যানেল (ফিচার টগল)',
      'ফাইন্যান্স রিপোর্ট (মাসিক সামারি, ক্যাটাগরি বিশ্লেষণ)',
      'সিম্পল মোড ও অ্যাডভান্সড মোড সুইচ',
    ],
    steps: [
      'সাইডবার → একাউন্টস → ড্যাশবোর্ড → আজকের সামারি দেখুন',
      'ব্যয় এন্ট্রি করতে → "নতুন ব্যয়" বাটন → শিরোনাম, পরিমাণ, ক্যাটাগরি দিন → সেভ',
      'এডমিন রিপোর্ট দেখতে → একাউন্টস → এডমিন রিপোর্ট',
      'ফিচার টগল করতে → একাউন্টস → কন্ট্রোল প্যানেল',
    ],
  },
];

const quickStartSteps = [
  { step: '১', title: 'শিক্ষাবর্ষ তৈরি করুন', desc: 'সেটিংস → শিক্ষাবর্ষ → নতুন বর্ষ তৈরি ও সক্রিয় করুন' },
  { step: '২', title: 'শিফট ও ক্লাস সেটআপ', desc: 'কাঠামো → শিফট → ক্লাস → সেকশন ক্রমানুসারে তৈরি করুন' },
  { step: '৩', title: 'RFID ডিভাইস যোগ', desc: 'সেটিংস → ডিভাইস → ডিভাইসের IP ও Port দিন' },
  { step: '৪', title: 'শিক্ষক ও শিক্ষার্থী যোগ', desc: 'শিক্ষক ও শিক্ষার্থী রেজিস্ট্রেশন করুন ও RFID কার্ড দিন' },
  { step: '৫', title: 'ফি সেটআপ', desc: 'ফি সেটিংস → শ্রেণী ভিত্তিক ফি দিন → ফি জেনারেট করুন' },
  { step: '৬', title: 'SMS কনফিগার', desc: 'সেটিংস → এসএমএস → API Key ও টেমপ্লেট সেট করুন' },
  { step: '৭', title: 'মনিটর সেটআপ', desc: 'গেটে মনিটর লাগান ও /monitor/gate পেজ খুলুন' },
  { step: '৮', title: 'ওয়েবসাইট কনফিগার', desc: 'ওয়েবসাইট সিএমএস থেকে কনটেন্ট যোগ করুন' },
];

export default function Documentation() {
  return (
    <MainLayout title="ডকুমেন্টেশন" titleBn="Documentation">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold">📖 আমার হাজিরা - ব্যবহারকারী নির্দেশিকা</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            সফটওয়্যারের সকল মডিউল ও ফিচারের বিস্তারিত ডকুমেন্টেশন
          </p>
          <Badge variant="secondary" className="text-xs">সংস্করণ ১.০ | ফেব্রুয়ারি ২০২৬</Badge>
        </div>

        {/* Quick Start */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              🚀 দ্রুত শুরু করুন (Quick Start Guide)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {quickStartSteps.map((s) => (
                <div key={s.step} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shrink-0">
                    {s.step}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Module-by-module */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold px-1">📋 মডিউল ভিত্তিক বিবরণ</h2>
          <Accordion type="multiple" className="space-y-2">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <AccordionItem key={mod.id} value={mod.id} className="border rounded-lg px-1 overflow-hidden">
                  <AccordionTrigger className="hover:no-underline py-3 px-3">
                    <div className="flex items-center gap-3 text-left">
                      <div className={`w-9 h-9 rounded-lg ${mod.color} text-white flex items-center justify-center shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-semibold text-sm block">{mod.title}</span>
                        <span className="text-xs text-muted-foreground">{mod.titleEn} • {mod.path}</span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-3 pb-4">
                    <div className="space-y-4">
                      {/* Description */}
                      <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        {mod.description}
                      </p>

                      {/* Features */}
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">✅ ফিচারসমূহ</h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {mod.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Steps */}
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-1">📝 ধাপে ধাপে ব্যবহার</h4>
                        <ol className="space-y-1.5">
                          {mod.steps.map((s, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                                {i + 1}
                              </span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* FAQ */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">❓ সচরাচর জিজ্ঞাসা (FAQ)</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple">
              <AccordionItem value="faq1">
                <AccordionTrigger className="text-sm">শিক্ষাবর্ষ পরিবর্তন করলে কি পুরনো ডেটা মুছে যাবে?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  না। প্রতিটি শিক্ষাবর্ষের ডেটা আলাদাভাবে সংরক্ষিত থাকে। আপনি যেকোনো সময় পুরনো বর্ষের ডেটা দেখতে পারবেন।
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq2">
                <AccordionTrigger className="text-sm">RFID কার্ড হারিয়ে গেলে কি করবো?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  শিক্ষার্থী/শিক্ষকের প্রোফাইলে গিয়ে পুরনো কার্ড রিমুভ করুন এবং নতুন কার্ড এনরোল করুন।
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq3">
                <AccordionTrigger className="text-sm">একজন শিক্ষার্থীর ফি কাস্টমাইজ করা যাবে?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  হ্যাঁ। শিক্ষার্থীর প্রোফাইলের "Financial" ট্যাবে গিয়ে কাস্টম মাসিক ফি ও ভর্তি ফি সেট করতে পারবেন।
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq4">
                <AccordionTrigger className="text-sm">ফি আদায়ের রিসিপ্ট কিভাবে প্রিন্ট করবো?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  ফি আদায় করার পর Success Dialog আসবে, সেখানে "প্রিন্ট" বাটনে ক্লিক করুন। A4 সাইজে প্রিন্ট হবে।
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq5">
                <AccordionTrigger className="text-sm">SMS ব্যালেন্স কিভাবে চেক করবো?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  সেটিংস → এসএমএস সেটিংস পেজে SMS ব্যালেন্স দেখা যাবে। এটি স্বয়ংক্রিয়ভাবে আপডেট হয়।
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq6">
                <AccordionTrigger className="text-sm">ওয়েবসাইটের কনটেন্ট কিভাবে পরিবর্তন করবো?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  সাইডবার → ওয়েবসাইট সিএমএস → সংশ্লিষ্ট পেজে গিয়ে কনটেন্ট পরিবর্তন করুন। পরিবর্তন তৎক্ষণাৎ ওয়েবসাইটে প্রতিফলিত হবে।
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq7">
                <AccordionTrigger className="text-sm">গ্রেডিং স্কেল কিভাবে তৈরি করবো?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  ফলাফল → গ্রেডিং স্কেল → "নতুন স্কেল" বাটন → স্কেলের নাম দিন → গ্রেড সারি যোগ করুন (A+ থেকে F পর্যন্ত) → প্রতিটি গ্রেডে মিনিমাম-ম্যাক্সিমাম নম্বর ও পয়েন্ট সেট করুন → সেভ করুন।
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq8">
                <AccordionTrigger className="text-sm">মার্কস এন্ট্রি করার পর কি আবার এডিট করা যায়?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  ড্রাফট মোডে থাকলে এডিট করা যায়। কিন্তু "জমা দিন" বাটনে ক্লিক করলে শিক্ষক আর এডিট করতে পারবেন না। শুধুমাত্র এডমিন এডিট ও অনুমোদন করতে পারবেন। পাবলিশ হয়ে গেলে শুধু সুপার এডমিন আনলক করতে পারবেন।
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq9">
                <AccordionTrigger className="text-sm">অনুপস্থিত শিক্ষার্থীর নম্বর কিভাবে হিসাব হবে?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  রেজাল্ট কনফিগ পেজে "অনুপস্থিত = ০" অপশন চালু থাকলে অনুপস্থিতদের নম্বর ০ ধরা হবে। বন্ধ থাকলে ক্যালকুলেশন থেকে বাদ যাবে। এটি ক্লাস ভিত্তিক কনফিগার করা যায়।
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="faq10">
                <AccordionTrigger className="text-sm">ফলাফল পাবলিশ করলে কি আবার পরিবর্তন করা যায়?</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  পাবলিশ হয়ে গেলে ফলাফল সম্পূর্ণ লক হয়ে যায়। শুধুমাত্র সুপার এডমিন "আনলক" করতে পারবেন। আনলক করলে মার্কস এডিট ও পুনরায় পাবলিশ করা যাবে।
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pb-8">
          <p>আমার হাজিরা © ২০২৬ | Developed by Jubair Zaman</p>
          <p className="mt-1">সমস্যা বা পরামর্শের জন্য যোগাযোগ করুন</p>
        </div>
      </div>
    </MainLayout>
  );
}