import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { PublicHeader } from './components/PublicHeader';
import { PublicFooter } from './components/PublicFooter';
import { PopupNotice } from '@/components/website/PopupNotice';
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

  // Apply dynamic colors as CSS variables
  useEffect(() => {
    if (settings) {
      const root = document.documentElement;
      
      // Apply colors from settings
      if (settings.primary_color) {
        root.style.setProperty('--website-primary', settings.primary_color);
      }
      if (settings.secondary_color) {
        root.style.setProperty('--website-secondary', settings.secondary_color);
      }
      if (settings.cta_button_color) {
        root.style.setProperty('--website-cta', settings.cta_button_color);
      }
      if (settings.secondary_button_color) {
        root.style.setProperty('--website-btn-secondary', settings.secondary_button_color);
      }
    }
    
    // Cleanup on unmount
    return () => {
      const root = document.documentElement;
      root.style.removeProperty('--website-primary');
      root.style.removeProperty('--website-secondary');
      root.style.removeProperty('--website-cta');
      root.style.removeProperty('--website-btn-secondary');
    };
  }, [settings]);

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
      <PopupNotice />
    </div>
  );
}
