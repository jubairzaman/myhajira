import { useWebsiteAboutContent, useWebsiteFacilities } from '@/hooks/queries/useWebsiteCMSNew';
import { BookOpen, Eye, Users, Target, MapPin, Monitor, BookMarked, School, Building } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const iconMap: Record<string, React.ElementType> = {
  BookOpen, Eye, Users, Target, MapPin, Monitor, BookMarked, School, Building,
};

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
      <section className="bg-gradient-to-r from-[#4B0082] to-[#6B2D8B] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold font-bengali mb-4">আমাদের সম্পর্কে</h1>
          <p className="text-lg opacity-80">About Us</p>
        </div>
      </section>

      {/* Introduction */}
      {introSection?.is_enabled && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center mx-auto mb-6">
                <School className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-[#4B0082] mb-6 font-bengali">
                {introSection.title_bn || introSection.title}
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed font-bengali whitespace-pre-line">
                {introSection.content_bn || introSection.content}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Vision & Mission */}
      {(visionSection?.is_enabled || missionSection?.is_enabled) && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#4B0082] font-bengali mb-4">
                দৃষ্টিভঙ্গি ও লক্ষ্য
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {visionSection?.is_enabled && (
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center mb-6">
                      <Eye className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#4B0082] mb-4 font-bengali">
                      {visionSection.title_bn || visionSection.title || 'দৃষ্টিভঙ্গি'}
                    </h3>
                    <p className="text-gray-600 font-bengali leading-relaxed whitespace-pre-line">
                      {visionSection.content_bn || visionSection.content}
                    </p>
                  </CardContent>
                </Card>
              )}

              {missionSection?.is_enabled && (
                <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00D4FF] to-[#4B0082] flex items-center justify-center mb-6">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#4B0082] mb-4 font-bengali">
                      {missionSection.title_bn || missionSection.title || 'লক্ষ্য'}
                    </h3>
                    <p className="text-gray-600 font-bengali leading-relaxed whitespace-pre-line">
                      {missionSection.content_bn || missionSection.content}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Principal's Message */}
      {principalSection?.is_enabled && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#4B0082] font-bengali mb-4">
                  {principalSection.title_bn || principalSection.title || 'অধ্যক্ষের বাণী'}
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                {principalSection.image_url ? (
                  <img
                    src={principalSection.image_url}
                    alt="Principal"
                    className="w-48 h-48 rounded-2xl object-cover shadow-lg"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center">
                    <Users className="w-20 h-20 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-lg text-gray-600 leading-relaxed font-bengali italic whitespace-pre-line">
                    "{principalSection.content_bn || principalSection.content}"
                  </p>
                  <div className="mt-6">
                    <p className="font-bold text-[#4B0082] font-bengali">অধ্যক্ষ</p>
                    <p className="text-gray-500">Principal</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Facilities */}
      {facilities && facilities.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#4B0082] font-bengali mb-4">সুবিধাসমূহ</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {facilities.map((facility) => {
                const Icon = iconMap[facility.icon || 'Building'] || Building;
                return (
                  <Card key={facility.id} className="border-0 shadow-md hover:shadow-xl transition-all group hover:-translate-y-1">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="font-bold text-gray-900 mb-2 font-bengali">{facility.title_bn || facility.title}</h3>
                      <p className="text-sm text-gray-600 font-bengali">{facility.description_bn || facility.description}</p>
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
