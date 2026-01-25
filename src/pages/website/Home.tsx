import { Link } from 'react-router-dom';
import { GraduationCap, Users, Award, Heart, ArrowRight, Bell, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWebsiteSettings, useWebsiteSections, useWebsiteNotices, useWebsiteTestimonials } from '@/hooks/queries/useWebsiteCMS';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  Users,
  Award,
  Heart,
};

export default function Home() {
  const { data: settings } = useWebsiteSettings();
  const { data: sections } = useWebsiteSections('home');
  const { data: notices } = useWebsiteNotices(true);
  const { data: testimonials } = useWebsiteTestimonials(true);

  const heroSection = sections?.find(s => s.section_type === 'hero');
  const featuresSection = sections?.find(s => s.section_type === 'features');
  const statsSection = sections?.find(s => s.section_type === 'stats');

  const featureItems = (featuresSection?.metadata as any)?.items || [];
  const statsItems = (statsSection?.metadata as any)?.items || [];

  const latestNotices = notices?.slice(0, 3) || [];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[600px] lg:min-h-[700px] flex items-center bg-gradient-to-br from-[#0D0221] via-[#1a0a2e] to-[#4B0082] overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#00D4FF] rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#6B2D8B] rounded-full blur-[120px]" />
        </div>

        {/* Hero Image */}
        {settings?.hero_image_url && (
          <div className="absolute inset-0">
            <img
              src={settings.hero_image_url}
              alt="Hero"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0D0221]/90 to-[#4B0082]/70" />
          </div>
        )}

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-bengali leading-tight animate-fade-in">
              {settings?.hero_title_bn || settings?.hero_title || 'আমাদের স্কুলে স্বাগতম'}
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-8 font-bengali animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {settings?.hero_subtitle_bn || settings?.hero_subtitle || 'আজকের শিক্ষায় আগামীর নেতৃত্ব'}
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Button asChild size="lg" className="bg-[#00D4FF] text-[#0D0221] hover:bg-[#00D4FF]/90 font-medium">
                <Link to="/website/admissions">
                  ভর্তি তথ্য
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Link to="/website/notices">
                  <Bell className="mr-2 w-4 h-4" />
                  নোটিশ বোর্ড
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      {featuresSection?.is_enabled && featureItems.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#4B0082] mb-4 font-bengali">
                {featuresSection.title_bn || featuresSection.title || 'কেন আমাদের বেছে নেবেন'}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featureItems.map((item: any, index: number) => {
                const Icon = iconMap[item.icon] || GraduationCap;
                return (
                  <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2 font-bengali">
                        {item.title_bn || item.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Stats Section */}
      {statsSection?.is_enabled && statsItems.length > 0 && (
        <section className="py-20 bg-gradient-to-r from-[#4B0082] to-[#6B2D8B] text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {statsItems.map((item: any, index: number) => (
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold mb-2 text-[#00D4FF]">
                    {item.value}
                  </div>
                  <div className="text-lg font-bengali opacity-90">
                    {item.label_bn || item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Notices */}
      {latestNotices.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-[#4B0082] font-bengali">সর্বশেষ নোটিশ</h2>
                <div className="w-16 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mt-2 rounded-full" />
              </div>
              <Button asChild variant="ghost" className="text-[#4B0082]">
                <Link to="/website/notices">
                  সব দেখুন
                  <ChevronRight className="ml-1 w-4 h-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestNotices.map((notice) => (
                <Card key={notice.id} className="group hover:shadow-lg transition-all border-0 shadow-md overflow-hidden">
                  <CardContent className="p-0">
                    <div className="bg-gradient-to-r from-[#4B0082] to-[#6B2D8B] p-4">
                      <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                        <Calendar className="w-4 h-4" />
                        {notice.publish_date && format(new Date(notice.publish_date), 'dd MMM yyyy', { locale: bn })}
                      </div>
                      <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                        {notice.category === 'general' && 'সাধারণ'}
                        {notice.category === 'exam' && 'পরীক্ষা'}
                        {notice.category === 'holiday' && 'ছুটি'}
                        {notice.category === 'event' && 'অনুষ্ঠান'}
                        {notice.category === 'admission' && 'ভর্তি'}
                      </Badge>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 font-bengali line-clamp-2 group-hover:text-[#4B0082] transition-colors">
                        {notice.title_bn || notice.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 font-bengali">
                        {notice.content_bn || notice.content}
                      </p>
                      <Link
                        to={`/website/notices/${notice.id}`}
                        className="inline-flex items-center text-[#4B0082] font-medium text-sm mt-3 hover:underline"
                      >
                        বিস্তারিত পড়ুন
                        <ArrowRight className="ml-1 w-4 h-4" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-[#4B0082] mb-4 font-bengali">
                মানুষ কি বলে
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.slice(0, 3).map((testimonial) => (
                <Card key={testimonial.id} className="border-0 shadow-md hover:shadow-xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      {testimonial.photo_url ? (
                        <img
                          src={testimonial.photo_url}
                          alt={testimonial.name}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center text-white font-bold text-xl">
                          {testimonial.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-gray-900 font-bengali">
                          {testimonial.name_bn || testimonial.name}
                        </h4>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                    <p className="text-gray-600 font-bengali italic">
                      "{testimonial.content_bn || testimonial.content}"
                    </p>
                    <div className="flex gap-1 mt-4">
                      {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                        <span key={i} className="text-yellow-400">★</span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#4B0082] to-[#6B2D8B] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-bengali">
            আপনার সন্তানের ভবিষ্যৎ গড়ুন
          </h2>
          <p className="text-xl opacity-80 mb-8 font-bengali">
            আজই ভর্তি হয়ে সেরা শিক্ষার সুযোগ নিন
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button asChild size="lg" className="bg-[#00D4FF] text-[#0D0221] hover:bg-[#00D4FF]/90">
              <Link to="/website/admissions">
                ভর্তি তথ্য দেখুন
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              <Link to="/website/contact">
                যোগাযোগ করুন
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
