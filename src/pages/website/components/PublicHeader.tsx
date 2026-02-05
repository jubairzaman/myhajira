import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Mail, Facebook, Youtube, LogIn, LayoutDashboard, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useWebsiteSettings, useWebsitePages } from '@/hooks/queries/useWebsiteCMS';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function PublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { data: settings } = useWebsiteSettings();
  const { data: pages } = useWebsitePages();
  const { user } = useAuth();

  const enabledPages = pages?.filter((p: any) => p.is_enabled && !p.parent_page_id) || [];
  const getSubPages = (parentId: string) => pages?.filter((p: any) => p.is_enabled && p.parent_page_id === parentId) || [];

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

      {/* School Name Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <Link to="/" className="flex items-center justify-center gap-3">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-12 sm:h-14 w-auto flex-shrink-0" />
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center text-white font-bold text-xl sm:text-2xl flex-shrink-0">
                {settings?.school_name?.charAt(0) || 'S'}
              </div>
            )}
            <div className="text-center">
              <h1 className="font-bold text-lg sm:text-2xl text-[#4B0082] font-bengali whitespace-nowrap">
                {settings?.school_name_bn || settings?.school_name || 'স্কুল নাম'}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {settings?.school_name || 'School Name'}
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="bg-gradient-to-r from-[#4B0082] to-[#6B2D8B]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center flex-1 justify-center">
              {enabledPages.map((page: any) => {
                const subPages = getSubPages(page.id);
                if (subPages.length > 0) {
                  return (
                    <DropdownMenu key={page.slug}>
                      <DropdownMenuTrigger asChild>
                        <button
                          className={cn(
                            'px-4 py-3 text-sm font-medium transition-colors flex items-center gap-1 whitespace-nowrap',
                            isActive(page.slug)
                              ? 'bg-white/20 text-white'
                              : 'text-white/90 hover:bg-white/10 hover:text-white'
                          )}
                        >
                          {page.title_bn || page.title}
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="min-w-[180px]">
                        {subPages.map((subPage: any) => (
                          <DropdownMenuItem key={subPage.slug} asChild>
                            <Link to={getPagePath(subPage.slug)} className="font-bengali">
                              {subPage.title_bn || subPage.title}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }
                return (
                  <Link
                    key={page.slug}
                    to={getPagePath(page.slug)}
                    className={cn(
                      'px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                      isActive(page.slug)
                        ? 'bg-white/20 text-white'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    {page.title_bn || page.title}
                  </Link>
                );
              })}
            </nav>
            
            {/* Login/Dashboard Button */}
            <div className="hidden lg:block">
              <Link to={user ? "/dashboard" : "/login"}>
                <Button variant="secondary" size="sm" className="bg-white/20 text-white hover:bg-white/30 border-0">
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
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-white/10 py-3"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="lg:hidden bg-white border-b animate-fade-in">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-1">
              {enabledPages.map((page: any) => {
                const subPages = getSubPages(page.id);
                return (
                  <div key={page.slug}>
                    <Link
                      to={getPagePath(page.slug)}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'block px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                        isActive(page.slug)
                          ? 'bg-[#4B0082] text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      )}
                    >
                      {page.title_bn || page.title}
                    </Link>
                    {subPages.length > 0 && (
                      <div className="ml-4 mt-1 space-y-1">
                        {subPages.map((subPage: any) => (
                          <Link
                            key={subPage.slug}
                            to={getPagePath(subPage.slug)}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              'block px-4 py-2 rounded-lg text-sm transition-colors',
                              isActive(subPage.slug)
                                ? 'bg-[#4B0082]/80 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            )}
                          >
                            {subPage.title_bn || subPage.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Mobile Login/Dashboard Button */}
              <Link 
                to={user ? "/dashboard" : "/login"} 
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2"
              >
                <Button variant="default" size="default" className="w-full bg-[#4B0082] hover:bg-[#6B2D8B]">
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
          </div>
        </nav>
      )}
    </header>
  );
}
