import { useWebsiteSections, useWebsiteAcademics } from '@/hooks/queries/useWebsiteCMS';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, BookOpen, GraduationCap, Lightbulb } from 'lucide-react';

export default function Academics() {
  const { data: sections } = useWebsiteSections('academics');
  const { data: academics } = useWebsiteAcademics(true);

  const programsSection = sections?.find(s => s.section_type === 'programs');
  const methodologySection = sections?.find(s => s.section_type === 'methodology');
  const curriculumSection = sections?.find(s => s.section_type === 'curriculum');

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-[#4B0082] to-[#6B2D8B] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold font-bengali mb-4">শিক্ষা কার্যক্রম</h1>
          <p className="text-lg opacity-80">Academics</p>
        </div>
      </section>

      {/* Programs */}
      {programsSection?.is_enabled && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#4B0082] font-bengali mb-4">
                {programsSection.title_bn || programsSection.title}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto font-bengali">
                {programsSection.content_bn || programsSection.content}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { level: 'প্রাথমিক', grades: 'প্রথম - পঞ্চম শ্রেণী', color: 'from-blue-500 to-blue-600' },
                { level: 'নিম্ন মাধ্যমিক', grades: 'ষষ্ঠ - অষ্টম শ্রেণী', color: 'from-purple-500 to-purple-600' },
                { level: 'মাধ্যমিক', grades: 'নবম - দশম শ্রেণী', color: 'from-indigo-500 to-indigo-600' },
              ].map((program, index) => (
                <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                  <div className={`bg-gradient-to-r ${program.color} p-6 text-white`}>
                    <GraduationCap className="w-12 h-12 mb-4" />
                    <h3 className="text-2xl font-bold font-bengali">{program.level}</h3>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-gray-600 font-bengali">{program.grades}</p>
                    <p className="text-sm text-gray-500 mt-2">জাতীয় পাঠ্যক্রম অনুসরণ</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Teaching Methodology */}
      {methodologySection?.is_enabled && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-[#4B0082] font-bengali mb-4">
                  {methodologySection.title_bn || methodologySection.title}
                </h2>
                <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { icon: Lightbulb, title: 'সৃজনশীল শিক্ষা', desc: 'সৃজনশীল পদ্ধতিতে শিক্ষাদান' },
                  { icon: BookOpen, title: 'হাতে-কলমে শিক্ষা', desc: 'প্র্যাক্টিক্যাল ক্লাস ও ল্যাব' },
                  { icon: GraduationCap, title: 'ব্যক্তিগত মনোযোগ', desc: 'ছোট ব্যাচে বিশেষ যত্ন' },
                  { icon: Lightbulb, title: 'আধুনিক প্রযুক্তি', desc: 'মাল্টিমিডিয়া ক্লাসরুম' },
                ].map((method, index) => (
                  <Card key={index} className="border-0 shadow-md">
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center flex-shrink-0">
                        <method.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 font-bengali">{method.title}</h3>
                        <p className="text-sm text-gray-600 font-bengali">{method.desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Curriculum & Syllabus */}
      {curriculumSection?.is_enabled && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#4B0082] font-bengali mb-4">
                {curriculumSection.title_bn || curriculumSection.title}
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
              <p className="text-gray-600 mt-4 max-w-2xl mx-auto font-bengali">
                {curriculumSection.content_bn || curriculumSection.content}
              </p>
            </div>

            {academics && academics.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
            )}
          </div>
        </section>
      )}
    </div>
  );
}
