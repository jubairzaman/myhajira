import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Bell, Calendar } from 'lucide-react';
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
    <section className="relative min-h-[600px] lg:min-h-[650px] flex items-stretch overflow-hidden">
      <div className="flex flex-col lg:flex-row w-full">
        {/* Main Slider Area */}
        <div className="relative flex-1 min-h-[400px] lg:min-h-full bg-gradient-to-br from-[#0D0221] via-[#1a0a2e] to-[#4B0082]">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-[#00D4FF] rounded-full blur-[100px]" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#6B2D8B] rounded-full blur-[120px]" />
          </div>

          {/* Slide Image */}
          {currentSlideData?.image_url && (
            <div className="absolute inset-0">
              <img
                src={currentSlideData.image_url}
                alt={currentSlideData.title || 'Hero'}
                className="w-full h-full object-cover opacity-40 transition-opacity duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0D0221]/90 via-[#0D0221]/70 to-transparent" />
            </div>
          )}

          {/* Slide Content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="max-w-2xl">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 font-bengali leading-tight animate-fade-in">
                  {currentSlideData?.title_bn || currentSlideData?.title || settings?.hero_title_bn || 'আমাদের স্কুলে স্বাগতম'}
                </h1>
                <p className="text-lg md:text-xl text-white/80 mb-6 font-bengali animate-fade-in" style={{ animationDelay: '0.1s' }}>
                  {currentSlideData?.subtitle_bn || currentSlideData?.subtitle || settings?.hero_subtitle_bn || 'আজকের শিক্ষায় আগামীর নেতৃত্ব'}
                </p>
                <div className="flex flex-wrap gap-3 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                  <Button asChild size="lg" className="bg-[#00D4FF] text-[#0D0221] hover:bg-[#00D4FF]/90 font-medium shadow-lg shadow-[#00D4FF]/30">
                    <Link to="/website/admissions">
                      ভর্তি তথ্য
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
                    <Link to="/website/contact">
                      যোগাযোগ করুন
                    </Link>
                  </Button>
                </div>
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
                className="absolute right-4 lg:right-auto lg:left-[calc(100%-60px)] top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all z-20"
              >
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Slide Indicators */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {enabledSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide 
                        ? 'w-8 bg-[#00D4FF]' 
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notice Sidebar */}
        <div className="w-full lg:w-[380px] bg-gradient-to-b from-[#1a0a2e] to-[#0D0221] border-l border-white/10">
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 lg:p-6 border-b border-white/10 bg-gradient-to-r from-[#4B0082] to-[#6B2D8B]">
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
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white font-bengali line-clamp-2 group-hover:text-[#00D4FF] transition-colors">
                              {notice.title_bn || notice.title}
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
                <Button asChild variant="ghost" className="w-full text-[#00D4FF] hover:text-white hover:bg-white/10">
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
