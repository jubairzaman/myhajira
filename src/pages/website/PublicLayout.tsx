import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { PublicHeader } from './components/PublicHeader';
import { PublicFooter } from './components/PublicFooter';
import { useWebsiteSettings } from '@/hooks/queries/useWebsiteCMS';

export default function PublicLayout() {
  const { data: settings, isLoading } = useWebsiteSettings();

  // Dynamic favicon
  useEffect(() => {
    if (settings?.favicon_url) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = settings.favicon_url;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [settings?.favicon_url]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4B0082] to-[#6B2D8B]">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-lg font-bengali">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!settings?.is_website_enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4B0082] to-[#6B2D8B]">
        <div className="text-center text-white p-8">
          <h1 className="text-4xl font-bold mb-4 font-bengali">ওয়েবসাইট বন্ধ আছে</h1>
          <p className="text-lg opacity-80">অনুগ্রহ করে পরে আবার চেষ্টা করুন।</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  );
}
