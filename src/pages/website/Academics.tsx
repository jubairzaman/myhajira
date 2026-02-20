import { useWebsitePrograms, useWebsiteMethodologies } from '@/hooks/queries/useWebsiteCMSNew';
import { useWebsiteAcademics } from '@/hooks/queries/useWebsiteCMS';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, BookOpen, GraduationCap, Lightbulb, Award, Trophy } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  BookOpen,
  GraduationCap,
  Lightbulb,
  Award,
  Trophy,
};

export default function Academics() {
  const { data: programs } = useWebsitePrograms(true);
  const { data: methodologies } = useWebsiteMethodologies(true);
  const { data: academics } = useWebsiteAcademics(true);

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-[#4B0082] to-[#6B2D8B] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold font-bengali mb-4">শিক্ষা কার্যক্রম</h1>
          <p className="text-lg opacity-80">Academics</p>
        </div>
      </section>

      {/* Programs - Dynamic from Database */}
      {programs && programs.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#4B0082] font-bengali mb-4">
                শিক্ষা স্তর
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto font-bengali">
                আমাদের বিদ্যালয়ে প্রাথমিক থেকে উচ্চ মাধ্যমিক স্তর পর্যন্ত শিক্ষা কার্যক্রম পরিচালিত হয়
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
              {programs.map((program) => {
                const Icon = iconMap[program.icon || 'GraduationCap'] || GraduationCap;
                return (
                  <Card key={program.id} className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden group">
                    <div 
                      className="p-6 text-white"
                      style={{ 
                        background: `linear-gradient(135deg, ${program.color_from || '#4B0082'}, ${program.color_to || '#6B2D8B'})` 
                      }}
                    >
                      <Icon className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="text-2xl font-bold font-bengali">{program.level_bn || program.level}</h3>
                    </div>
                    <CardContent className="p-6">
                      <p className="text-gray-600 font-bengali font-medium">{program.grades_bn || program.grades}</p>
                      {program.description_bn && (
                        <p className="text-sm text-gray-500 mt-2 font-bengali">{program.description_bn}</p>
                      )}
                      {!program.description_bn && program.description && (
                        <p className="text-sm text-gray-500 mt-2">{program.description}</p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Teaching Methodology - Dynamic from Database */}
      {methodologies && methodologies.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#4B0082] font-bengali mb-4">
                  শিক্ষাদান পদ্ধতি
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {methodologies.map((method) => {
                  const Icon = iconMap[method.icon || 'Lightbulb'] || Lightbulb;
                  return (
                    <Card key={method.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 font-bengali">{method.title_bn || method.title}</h3>
                          <p className="text-sm text-gray-600 font-bengali">{method.description_bn || method.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Curriculum & Syllabus - From website_academics */}
      {academics && academics.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#4B0082] font-bengali mb-4">
                পাঠ্যক্রম ও সিলেবাস
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto font-bengali">
                জাতীয় পাঠ্যক্রম অনুসরণ করে শ্রেণীভিত্তিক সিলেবাস
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 max-w-5xl mx-auto">
              {academics.map((academic) => (
                <Card key={academic.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 font-bengali">
                      {academic.title_bn || academic.title}
                    </h3>
                    {academic.description && (
                      <p className="text-sm text-gray-600 mb-4 font-bengali">
                        {academic.description_bn || academic.description}
                      </p>
                    )}
                    {academic.syllabus_pdf_url && (
                      <Button asChild variant="outline" size="sm" className="w-full">
                        <a href={academic.syllabus_pdf_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4 mr-2" />
                          সিলেবাস ডাউনলোড
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-[#4B0082] to-[#6B2D8B] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 font-bengali">
            আপনার সন্তানকে সেরা শিক্ষা দিন
          </h2>
          <p className="text-lg opacity-80 mb-8 font-bengali">
            আজই ভর্তি হয়ে আমাদের সাথে যুক্ত হোন
          </p>
          <Button asChild size="lg" className="bg-[#00D4FF] text-[#0D0221] hover:bg-[#00D4FF]/90">
            <a href="/admissions">ভর্তি তথ্য দেখুন</a>
          </Button>
        </div>
      </section>
    </div>
  );
}
