import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Youtube, Twitter, Instagram, Clock } from 'lucide-react';
import { useWebsiteSettings, useWebsitePages } from '@/hooks/queries/useWebsiteCMS';

export function PublicFooter() {
  const { data: settings } = useWebsiteSettings();
  const { data: pages } = useWebsitePages();

  const enabledPages = pages?.filter(p => p.is_enabled) || [];

  const getPagePath = (slug: string) => {
    return slug === 'home' ? '/website' : `/website/${slug}`;
  };

  return (
    <footer className="bg-gradient-to-br from-[#1a0a2e] via-[#2d1052] to-[#4B0082] text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* School Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {settings?.logo_url ? (
                <img src={settings.logo_url} alt="Logo" className="h-14 w-auto brightness-0 invert" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold">
                  {settings?.school_name?.charAt(0) || 'S'}
                </div>
              )}
              <div>
                <h3 className="font-bold text-lg font-bengali">
                  {settings?.school_name_bn || 'স্কুল নাম'}
                </h3>
                <p className="text-sm text-white/70">
                  {settings?.school_name || 'School Name'}
                </p>
              </div>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              শিক্ষায় শ্রেষ্ঠত্ব, চরিত্রে মাধুর্য, জীবনে সাফল্য - এই আমাদের অঙ্গীকার।
            </p>
            <div className="flex gap-3">
              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#00D4FF] hover:text-[#4B0082] transition-all"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings?.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#00D4FF] hover:text-[#4B0082] transition-all"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              )}
              {settings?.twitter_url && (
                <a
                  href={settings.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#00D4FF] hover:text-[#4B0082] transition-all"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#00D4FF] hover:text-[#4B0082] transition-all"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-[#00D4FF]">দ্রুত লিংক</h4>
            <ul className="space-y-2">
              {enabledPages.slice(0, 6).map((page) => (
                <li key={page.slug}>
                  <Link
                    to={getPagePath(page.slug)}
                    className="text-white/80 hover:text-[#00D4FF] transition-colors text-sm flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-[#00D4FF]" />
                    {page.title_bn || page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-[#00D4FF]">যোগাযোগ</h4>
            <ul className="space-y-3">
              {settings?.contact_address && (
                <li className="flex items-start gap-3 text-sm text-white/80">
                  <MapPin className="w-4 h-4 mt-0.5 text-[#00D4FF] flex-shrink-0" />
                  <span className="font-bengali">{settings.contact_address_bn || settings.contact_address}</span>
                </li>
              )}
              {settings?.contact_phone && (
                <li className="flex items-center gap-3 text-sm text-white/80">
                  <Phone className="w-4 h-4 text-[#00D4FF] flex-shrink-0" />
                  <a href={`tel:${settings.contact_phone}`} className="hover:text-[#00D4FF] transition-colors">
                    {settings.contact_phone}
                  </a>
                </li>
              )}
              {settings?.contact_email && (
                <li className="flex items-center gap-3 text-sm text-white/80">
                  <Mail className="w-4 h-4 text-[#00D4FF] flex-shrink-0" />
                  <a href={`mailto:${settings.contact_email}`} className="hover:text-[#00D4FF] transition-colors">
                    {settings.contact_email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Office Hours */}
          <div>
            <h4 className="font-bold text-lg mb-4 text-[#00D4FF]">অফিস সময়</h4>
            <div className="flex items-start gap-3 text-sm text-white/80">
              <Clock className="w-4 h-4 mt-0.5 text-[#00D4FF] flex-shrink-0" />
              <div className="font-bengali whitespace-pre-line">
                {settings?.office_hours_bn || settings?.office_hours || 'রবিবার - বৃহস্পতিবার\nসকাল ৮:০০ - বিকাল ৪:০০'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 text-sm text-white/60">
            <p>
              &copy; {new Date().getFullYear()} {settings?.school_name || 'School'}. সর্বস্বত্ব সংরক্ষিত।
            </p>
            <p>
              Developed with ❤️ by <span className="text-[#00D4FF]">Jubair Zaman</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
