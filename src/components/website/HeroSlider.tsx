import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Bell, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useHeroSlides, useWebsiteNotices, useWebsiteSettings } from '@/hooks/queries/useWebsiteCMS';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

export function HeroSlider() {
  const { data: slides } = useHeroSlides();
  const { data: notices } = useWebsiteNotices(true);
  const { data: settings } = useWebsiteSettings();
  const [currentSlide, setCurrentSlide] = useState(0);

  const enabledSlides = slides?.filter(s => s.is_enabled) || [];
  const latestNotices = notices?.slice(0, 5) || [];

  // Get colors from settings or use defaults
  const primaryColor = settings?.primary_color || '#4B0082';
  const primaryColorLight = settings?.primary_color ? adjustColorBrightness(settings.primary_color, 30) : '#6B2D8B';
  const ctaColor = settings?.cta_button_color || settings?.secondary_color || '#00D4FF';
  const darkBg = '#0D0221';
  const darkBgLight = '#1a0a2e';

  // Auto-advance slides
  useEffect(() => {
    if (enabledSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % enabledSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [enabledSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % enabledSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + enabledSlides.length) % enabledSlides.length);
  };

  const currentSlideData = enabledSlides[currentSlide];

  return (
    <section className="relative min-h-[500px] lg:min-h-[550px] flex items-stretch overflow-hidden">
      <div className="flex flex-col lg:flex-row w-full">
        {/* Main Slider Area */}
        <div 
          className="relative flex-1 min-h-[400px] lg:min-h-full"
          style={{ 
            background: `linear-gradient(to bottom right, ${darkBg}, ${darkBgLight}, ${primaryColor})`
          }}
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div 
              className="absolute top-20 left-10 w-72 h-72 rounded-full blur-[100px]" 
              style={{ backgroundColor: ctaColor }}
            />
            <div 
              className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-[120px]" 
              style={{ backgroundColor: primaryColorLight }}
            />
          </div>

          {/* Slide Image */}
          {currentSlideData?.image_url && (
            <div className="absolute inset-0">
              <img
                src={currentSlideData.image_url}
                alt={currentSlideData.title || 'Hero'}
                className="w-full h-full object-cover transition-opacity duration-700"
              />
              {/* Bottom-only gradient for text readability */}
              <div 
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(to top, ${darkBg}cc 0%, ${darkBg}66 30%, transparent 60%)`
                }}
              />
            </div>
          )}

          {/* Slide Content - Now at bottom */}
          <div className="relative z-10 h-full flex items-end pb-16 lg:pb-20">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="max-w-3xl">
                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 font-bengali leading-tight animate-fade-in">
                  {currentSlideData?.title_bn || currentSlideData?.title || settings?.hero_title_bn || 'আমাদের স্কুলে স্বাগতম'}
                </h1>
                <p className="text-sm md:text-base text-white/80 font-bengali animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  {currentSlideData?.subtitle_bn || currentSlideData?.subtitle || settings?.hero_subtitle_bn || 'আজকের শিক্ষায় আগামীর নেতৃত্ব'}
                </p>
              </div>
            </div>
          </div>

          {/* Slider Controls */}
          {enabledSlides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all z-20"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all z-20"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {enabledSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide ? 'w-8' : 'bg-white/40 hover:bg-white/60'
                    }`}
                    style={index === currentSlide ? { backgroundColor: ctaColor } : undefined}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notice Sidebar */}
        <div 
          className="w-full lg:w-[380px] border-l border-white/10"
          style={{
            background: `linear-gradient(to bottom, ${darkBgLight}, ${darkBg})`
          }}
        >
          <div className="h-full flex flex-col">
            {/* Header */}
            <div 
              className="p-4 lg:p-6 border-b border-white/10"
              style={{
                background: `linear-gradient(to right, ${primaryColor}, ${primaryColorLight})`
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-bengali">নোটিশ বোর্ড</h3>
                  <p className="text-xs text-white/60">সর্বশেষ আপডেট</p>
                </div>
              </div>
            </div>

            {/* Notice List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[300px] lg:max-h-none">
              {latestNotices.length > 0 ? (
                latestNotices.map((notice) => (
                  <Link
                    key={notice.id}
                    to={`/website/notices/${notice.id}`}
                    className="block group"
                  >
                    <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all overflow-hidden">
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{
                              background: `linear-gradient(to bottom right, ${primaryColor}, ${primaryColorLight})`
                            }}
                          >
                            <Calendar className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 
                              className="text-sm font-medium text-white font-bengali line-clamp-2 transition-colors group-hover:text-opacity-100"
                              style={{ '--hover-color': ctaColor } as React.CSSProperties}
                            >
                              <span className="group-hover:hidden">{notice.title_bn || notice.title}</span>
                              <span className="hidden group-hover:inline" style={{ color: ctaColor }}>{notice.title_bn || notice.title}</span>
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-white/50">
                                {notice.publish_date && format(new Date(notice.publish_date), 'dd MMM', { locale: bn })}
                              </span>
                              <Badge variant="secondary" className="bg-white/10 text-white/70 text-[10px] px-1.5 py-0">
                                {notice.category === 'general' && 'সাধারণ'}
                                {notice.category === 'exam' && 'পরীক্ষা'}
                                {notice.category === 'holiday' && 'ছুটি'}
                                {notice.category === 'event' && 'অনুষ্ঠান'}
                                {notice.category === 'admission' && 'ভর্তি'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <div className="text-center text-white/50 py-8">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-bengali">কোনো নোটিশ নেই</p>
                </div>
              )}
            </div>

            {/* View All Button */}
            {latestNotices.length > 0 && (
              <div className="p-4 border-t border-white/10">
                <Button 
                  asChild 
                  variant="ghost" 
                  className="w-full hover:bg-white/10"
                  style={{ color: ctaColor }}
                >
                  <Link to="/website/notices">
                    সব নোটিশ দেখুন
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Helper function to adjust color brightness
function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}