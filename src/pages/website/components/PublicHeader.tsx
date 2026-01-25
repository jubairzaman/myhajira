import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, Facebook, Youtube, LogIn, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWebsiteSettings, useWebsitePages } from '@/hooks/queries/useWebsiteCMS';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { data: settings } = useWebsiteSettings();
  const { data: pages } = useWebsitePages();
  const { user } = useAuth();

  const enabledPages = pages?.filter(p => p.is_enabled) || [];

  const isActive = (slug: string) => {
    if (slug === 'home') return location.pathname === '/';
    return location.pathname === `/${slug}`;
  };

  const getPagePath = (slug: string) => {
    return slug === 'home' ? '/' : `/${slug}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-[#4B0082] to-[#6B2D8B] text-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            {settings?.contact_phone && (
              <a href={`tel:${settings.contact_phone}`} className="flex items-center gap-1 hover:text-cyan-300 transition-colors">
                <Phone className="w-3 h-3" />
                <span className="hidden sm:inline">{settings.contact_phone}</span>
              </a>
            )}
            {settings?.contact_email && (
              <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-1 hover:text-cyan-300 transition-colors">
                <Mail className="w-3 h-3" />
                <span className="hidden sm:inline">{settings.contact_email}</span>
              </a>
            )}
          </div>
          <div className="flex items-center gap-3">
            {settings?.facebook_url && (
              <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            )}
            {settings?.youtube_url && (
              <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-300 transition-colors">
                <Youtube className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-12 w-auto" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center text-white font-bold text-xl">
                {settings?.school_name?.charAt(0) || 'S'}
              </div>
            )}
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-[#4B0082] font-bengali">
                {settings?.school_name_bn || settings?.school_name || 'স্কুল নাম'}
              </h1>
              <p className="text-xs text-muted-foreground">
                {settings?.school_name || 'School Name'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {enabledPages.map((page) => (
              <Link
                key={page.slug}
                to={getPagePath(page.slug)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive(page.slug)
                    ? 'bg-[#4B0082] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                {page.title_bn || page.title}
              </Link>
            ))}
            
            {/* Login/Dashboard Button */}
            <Link to={user ? "/dashboard" : "/login"} className="ml-4">
              <Button variant="hero" size="sm">
                {user ? (
                  <>
                    <LayoutDashboard className="w-4 h-4 mr-1" />
                    ড্যাশবোর্ড
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-1" />
                    লগইন
                  </>
                )}
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t pt-4 animate-fade-in">
            <div className="flex flex-col gap-2">
              {enabledPages.map((page) => (
                <Link
                  key={page.slug}
                  to={getPagePath(page.slug)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive(page.slug)
                      ? 'bg-[#4B0082] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {page.title_bn || page.title}
                </Link>
              ))}
              
              {/* Mobile Login/Dashboard Button */}
              <Link 
                to={user ? "/dashboard" : "/login"} 
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2"
              >
                <Button variant="hero" size="default" className="w-full">
                  {user ? (
                    <>
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      ড্যাশবোর্ড
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 mr-2" />
                      লগইন
                    </>
                  )}
                </Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
