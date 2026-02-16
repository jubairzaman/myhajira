import { useState } from 'react';
import { useWebsiteAboutContent, useWebsiteFacilities } from '@/hooks/queries/useWebsiteCMSNew';
import { BookOpen, Eye, Users, Target, MapPin, Monitor, BookMarked, School, Building, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const iconMap: Record<string, React.ElementType> = {
  BookOpen, Eye, Users, Target, MapPin, Monitor, BookMarked, School, Building,
};

function TruncatedText({ text, className = '' }: { text: string; className?: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      <p className={`${className} ${!expanded ? 'line-clamp-4' : ''}`}>
        {text}
      </p>
      {!expanded && (
        <div
          className="absolute bottom-0 left-0 right-0 h-12 cursor-pointer flex items-end justify-center pb-1"
          style={{
            background: 'linear-gradient(to top, white 30%, transparent 100%)',
          }}
          onClick={() => setExpanded(true)}
        >
          <span className="text-sm text-[#4B0082] font-medium flex items-center gap-1 font-bengali">
            আরও দেখুন <ChevronDown className="w-4 h-4" />
          </span>
        </div>
      )}
    </div>
  );
}

export default function About() {
  const { data: aboutContent } = useWebsiteAboutContent();
  const { data: facilities } = useWebsiteFacilities(true);

  const introSection = aboutContent?.find(s => s.section_key === 'intro');
  const visionSection = aboutContent?.find(s => s.section_key === 'vision');
  const missionSection = aboutContent?.find(s => s.section_key === 'mission');
  const principalSection = aboutContent?.find(s => s.section_key === 'principal');

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-[#4B0082] to-[#6B2D8B] text-white py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-bengali mb-2">আমাদের সম্পর্কে</h1>
          <p className="text-sm sm:text-base opacity-80">About Us</p>
        </div>
      </section>

      {/* Introduction */}
      {introSection?.is_enabled && (
        <section className="py-8 sm:py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-2xl bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <School className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#4B0082] mb-3 sm:mb-6 font-bengali">
                {introSection.title_bn || introSection.title}
              </h2>
              <TruncatedText
                text={introSection.content_bn || introSection.content || ''}
                className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed font-bengali whitespace-pre-line"
              />
            </div>
          </div>
        </section>
      )}

      {/* Vision & Mission */}
      {(visionSection?.is_enabled || missionSection?.is_enabled) && (
        <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6 sm:mb-10 lg:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#4B0082] font-bengali mb-3">
                দৃষ্টিভঙ্গি ও লক্ষ্য
              </h2>
              <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto">
              {visionSection?.is_enabled && (
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center mb-4 sm:mb-6">
                      <Eye className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#4B0082] mb-3 sm:mb-4 font-bengali">
                      {visionSection.title_bn || visionSection.title || 'দৃষ্টিভঙ্গি'}
                    </h3>
                    <TruncatedText
                      text={visionSection.content_bn || visionSection.content || ''}
                      className="text-sm sm:text-base text-gray-600 font-bengali leading-relaxed whitespace-pre-line"
                    />
                  </CardContent>
                </Card>
              )}

              {missionSection?.is_enabled && (
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-4 sm:p-6 lg:p-8">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-2xl bg-gradient-to-br from-[#00D4FF] to-[#4B0082] flex items-center justify-center mb-4 sm:mb-6">
                      <Target className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#4B0082] mb-3 sm:mb-4 font-bengali">
                      {missionSection.title_bn || missionSection.title || 'লক্ষ্য'}
                    </h3>
                    <TruncatedText
                      text={missionSection.content_bn || missionSection.content || ''}
                      className="text-sm sm:text-base text-gray-600 font-bengali leading-relaxed whitespace-pre-line"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Principal's Message */}
      {principalSection?.is_enabled && (
        <section className="py-8 sm:py-12 lg:py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-6 sm:mb-10 lg:mb-12">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#4B0082] font-bengali mb-3">
                  {principalSection.title_bn || principalSection.title || 'অধ্যক্ষের বাণী'}
                </h2>
                <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
              </div>

              <div className="flex flex-col md:flex-row items-start gap-6 sm:gap-8">
                {/* Principal Photo + Name Card */}
                <div className="flex-shrink-0 mx-auto md:mx-0">
                  {principalSection.image_url ? (
                    <div className="text-center">
                      <img
                        src={principalSection.image_url}
                        alt="Principal"
                        className="w-36 h-36 sm:w-44 sm:h-44 lg:w-48 lg:h-48 rounded-2xl object-cover shadow-lg mx-auto"
                      />
                      <div className="mt-3 bg-gradient-to-r from-[#4B0082] to-[#6B2D8B] text-white rounded-xl px-4 py-2.5 shadow-md">
                        <p className="font-bold text-sm sm:text-base font-bengali">অধ্যক্ষ</p>
                        <p className="text-xs sm:text-sm opacity-80">Principal</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-36 h-36 sm:w-44 sm:h-44 lg:w-48 lg:h-48 rounded-2xl bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center mx-auto">
                        <Users className="w-16 h-16 sm:w-20 sm:h-20 text-white" />
                      </div>
                      <div className="mt-3 bg-gradient-to-r from-[#4B0082] to-[#6B2D8B] text-white rounded-xl px-4 py-2.5 shadow-md">
                        <p className="font-bold text-sm sm:text-base font-bengali">অধ্যক্ষ</p>
                        <p className="text-xs sm:text-sm opacity-80">Principal</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quote */}
                <div className="flex-1">
                  <TruncatedText
                    text={`"${principalSection.content_bn || principalSection.content}"`}
                    className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed font-bengali italic whitespace-pre-line"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Facilities */}
      {facilities && facilities.length > 0 && (
        <section className="py-8 sm:py-12 lg:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-6 sm:mb-10 lg:mb-12">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#4B0082] font-bengali mb-3">সুবিধাসমূহ</h2>
              <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {facilities.map((facility) => {
                const Icon = iconMap[facility.icon || 'Building'] || Building;
                return (
                  <Card key={facility.id} className="border-0 shadow-md hover:shadow-xl transition-all group hover:-translate-y-1">
                    <CardContent className="p-3 sm:p-4 lg:p-6 text-center">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4 group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                      </div>
                      <h3 className="font-bold text-xs sm:text-sm lg:text-base text-gray-900 mb-1 sm:mb-2 font-bengali">{facility.title_bn || facility.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 font-bengali line-clamp-2">{facility.description_bn || facility.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
