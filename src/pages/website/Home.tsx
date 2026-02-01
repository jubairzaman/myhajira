import { Link } from 'react-router-dom';
import { GraduationCap, Users, Award, Heart, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useWebsiteSettings, useWebsiteSections, useWebsiteTestimonials } from '@/hooks/queries/useWebsiteCMS';
import { HeroSlider } from '@/components/website/HeroSlider';
import { AlumniBubbles } from '@/components/website/AlumniBubbles';
import { ParentTestimonials } from '@/components/website/ParentTestimonials';

const iconMap: Record<string, React.ElementType> = {
  GraduationCap,
  Users,
  Award,
  Heart,
};

export default function Home() {
  const { data: settings } = useWebsiteSettings();
  const { data: sections } = useWebsiteSections('home');
  const { data: testimonials } = useWebsiteTestimonials(true);

  const featuresSection = sections?.find(s => s.section_type === 'features');
  const statsSection = sections?.find(s => s.section_type === 'stats');

  const featureItems = (featuresSection?.metadata as any)?.items || [];
  const statsItems = (statsSection?.metadata as any)?.items || [];

  // Get colors from settings or use defaults
  const primaryColor = settings?.primary_color || '#4B0082';
  const primaryColorLight = settings?.primary_color ? adjustColorBrightness(settings.primary_color, 30) : '#6B2D8B';
  const ctaColor = settings?.cta_button_color || settings?.secondary_color || '#00D4FF';
  const secondaryBtnColor = settings?.secondary_button_color || primaryColor;
  const darkBg = '#0D0221';

  return (
    <div className="overflow-hidden">
      {/* Hero Section with Slider and Notices */}
      <HeroSlider />

      {/* Features Section */}
      {featuresSection?.is_enabled && featureItems.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 
                className="text-3xl md:text-4xl font-bold mb-4 font-bengali"
                style={{ color: primaryColor }}
              >
                {featuresSection.title_bn || featuresSection.title || 'কেন আমাদের বেছে নেবেন'}
              </h2>
              <div 
                className="w-24 h-1 mx-auto rounded-full"
                style={{ 
                  background: `linear-gradient(to right, ${primaryColor}, ${ctaColor})`
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featureItems.map((item: any, index: number) => {
                const Icon = iconMap[item.icon] || GraduationCap;
                return (
                  <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-md hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                      <div 
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                        style={{ 
                          background: `linear-gradient(to bottom right, ${primaryColor}, ${primaryColorLight})`
                        }}
                      >
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
        <section 
          className="py-16 md:py-20 text-white relative overflow-hidden"
          style={{
            background: `linear-gradient(to right, ${primaryColor}, ${primaryColorLight})`
          }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            <div 
              className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full blur-3xl"
              style={{ backgroundColor: `${ctaColor}1a` }}
            />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {statsItems.map((item: any, index: number) => (
                <div key={index} className="text-center">
                  <div 
                    className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-lg"
                    style={{ color: ctaColor }}
                  >
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

      {/* Alumni Bubbles Section */}
      <AlumniBubbles compact />

      {/* Parent Testimonials */}
      <ParentTestimonials />

      {/* General Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 
                className="text-3xl md:text-4xl font-bold mb-4 font-bengali"
                style={{ color: primaryColor }}
              >
                মানুষ কি বলে
              </h2>
              <div 
                className="w-24 h-1 mx-auto rounded-full"
                style={{
                  background: `linear-gradient(to right, ${primaryColor}, ${ctaColor})`
                }}
              />
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
                        <div 
                          className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl"
                          style={{
                            background: `linear-gradient(to bottom right, ${primaryColor}, ${primaryColorLight})`
                          }}
                        >
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
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
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
      <section 
        className="py-16 md:py-20 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(to right, ${primaryColor}, ${primaryColorLight})`
        }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
            style={{ backgroundColor: `${ctaColor}1a` }}
          />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-bengali">
            আপনার সন্তানের ভবিষ্যৎ গড়ুন
          </h2>
          <p className="text-xl opacity-80 mb-8 font-bengali">
            আজই ভর্তি হয়ে সেরা শিক্ষার সুযোগ নিন
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Button 
              asChild 
              size="lg" 
              className="shadow-lg"
              style={{ 
                backgroundColor: ctaColor,
                color: darkBg,
                boxShadow: `0 10px 25px -5px ${ctaColor}4d`
              }}
            >
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

// Helper function to adjust color brightness
function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}