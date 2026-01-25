import { useWebsiteSections } from '@/hooks/queries/useWebsiteCMS';
import { BookOpen, Eye, Users, Target, MapPin, Monitor, BookMarked, School } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function About() {
  const { data: sections } = useWebsiteSections('about');

  const introSection = sections?.find(s => s.section_type === 'introduction');
  const visionSection = sections?.find(s => s.section_type === 'vision_mission');
  const principalSection = sections?.find(s => s.section_type === 'principal_message');
  const facilitiesSection = sections?.find(s => s.section_type === 'facilities');

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
              <p className="text-lg text-gray-600 leading-relaxed font-bengali">
                {introSection.content_bn || introSection.content}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Vision & Mission */}
      {visionSection?.is_enabled && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#4B0082] font-bengali mb-4">
                {visionSection.title_bn || visionSection.title}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center mb-6">
                    <Eye className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#4B0082] mb-4 font-bengali">দৃষ্টিভঙ্গি</h3>
                  <p className="text-gray-600 font-bengali leading-relaxed">
                    জ্ঞান, দক্ষতা ও নৈতিকতায় সমৃদ্ধ ভবিষ্যৎ প্রজন্ম গড়ে তোলা যারা দেশ ও জাতির কল্যাণে নিবেদিত হবে।
                  </p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00D4FF] to-[#4B0082] flex items-center justify-center mb-6">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#4B0082] mb-4 font-bengali">লক্ষ্য</h3>
                  <p className="text-gray-600 font-bengali leading-relaxed">
                    মানসম্মত শিক্ষা প্রদান, সৃজনশীলতার বিকাশ এবং নৈতিক মূল্যবোধ সম্পন্ন আদর্শ নাগরিক তৈরি করা।
                  </p>
                </CardContent>
              </Card>
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
                  {principalSection.title_bn || principalSection.title}
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
                  <p className="text-lg text-gray-600 leading-relaxed font-bengali italic">
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
      {facilitiesSection?.is_enabled && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#4B0082] font-bengali mb-4">
                {facilitiesSection.title_bn || facilitiesSection.title}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: BookOpen, title: 'আধুনিক লাইব্রেরি', desc: 'বিশাল বই সংগ্রহ' },
                { icon: Monitor, title: 'কম্পিউটার ল্যাব', desc: 'আধুনিক প্রযুক্তি' },
                { icon: BookMarked, title: 'বিজ্ঞান ল্যাব', desc: 'হাতে-কলমে শিক্ষা' },
                { icon: MapPin, title: 'খেলার মাঠ', desc: 'বিস্তৃত মাঠ' },
              ].map((facility, index) => (
                <Card key={index} className="border-0 shadow-md hover:shadow-xl transition-all group hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <facility.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 font-bengali">{facility.title}</h3>
                    <p className="text-sm text-gray-600 font-bengali">{facility.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
