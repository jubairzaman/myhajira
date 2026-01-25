import { useWebsiteSections } from '@/hooks/queries/useWebsiteCMS';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, CheckCircle } from 'lucide-react';

export default function Admissions() {
  const { data: sections } = useWebsiteSections('admissions');
  const processSection = sections?.find(s => s.section_type === 'process');
  const steps = (processSection?.metadata as any)?.steps || [];

  return (
    <div>
      <section className="bg-gradient-to-r from-[#4B0082] to-[#6B2D8B] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold font-bengali mb-4">ভর্তি তথ্য</h1>
          <p className="text-lg opacity-80">Admissions</p>
        </div>
      </section>

      {processSection?.is_enabled && steps.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#4B0082] font-bengali mb-4">{processSection.title_bn || processSection.title}</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
            </div>
            <div className="max-w-3xl mx-auto">
              {steps.map((step: any, index: number) => (
                <div key={index} className="flex gap-4 mb-8 last:mb-0">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center text-white font-bold text-lg">{step.step}</div>
                    {index < steps.length - 1 && <div className="w-0.5 h-full bg-gray-200 mt-2" />}
                  </div>
                  <Card className="flex-1 border-0 shadow-md"><CardContent className="p-4">
                    <h3 className="font-bold text-lg text-[#4B0082] font-bengali">{step.title_bn || step.title}</h3>
                  </CardContent></Card>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#4B0082] font-bengali mb-4">প্রয়োজনীয় ডকুমেন্ট</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {['জন্ম নিবন্ধন সনদ', 'পূর্ববর্তী শ্রেণীর মার্কশিট', 'টিসি/ছাড়পত্র', 'পাসপোর্ট সাইজ ছবি (৪ কপি)', 'অভিভাবকের এনআইডি কপি'].map((doc, i) => (
              <Card key={i} className="border-0 shadow-sm"><CardContent className="p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-bengali">{doc}</span>
              </CardContent></Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
