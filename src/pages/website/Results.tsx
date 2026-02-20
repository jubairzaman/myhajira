import { useState } from 'react';
import { FileText, Download, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWebsiteResults } from '@/hooks/queries/useWebsiteCMS';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function Results() {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<string>('');
  
  const { data: results, isLoading } = useWebsiteResults(true);

  // Get unique classes and exams from results
  const { data: classes } = useQuery({
    queryKey: ['website-result-classes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, name_bn')
        .eq('is_active', true)
        .order('grade_order');
      if (error) throw error;
      return data;
    },
  });

  const { data: exams } = useQuery({
    queryKey: ['website-result-exams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exams')
        .select('id, name, name_bn')
        .eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });

  const filteredResults = results?.filter(result => {
    const matchesClass = !selectedClass || selectedClass === 'all' || result.class_id === selectedClass;
    const matchesExam = !selectedExam || selectedExam === 'all' || result.exam_id === selectedExam;
    return matchesClass && matchesExam;
  }) || [];

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-[#4B0082] to-[#6B2D8B] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold font-bengali mb-4">পরীক্ষার ফলাফল</h1>
          <p className="text-lg opacity-80">Exam Results</p>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="flex-1">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="শ্রেণী নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব শ্রেণী</SelectItem>
                  {classes?.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name_bn || cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder="পরীক্ষা নির্বাচন করুন" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব পরীক্ষা</SelectItem>
                  {exams?.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name_bn || exam.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              variant="outline" 
              onClick={() => { setSelectedClass('all'); setSelectedExam('all'); }}
            >
              রিসেট
            </Button>
          </div>
        </div>
      </section>

      {/* Results List */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-[#4B0082]/30 border-t-[#4B0082] rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 font-bengali">লোড হচ্ছে...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-bengali text-lg">কোনো ফলাফল পাওয়া যায়নি</p>
              <p className="text-gray-400 text-sm mt-2">অনুগ্রহ করে শ্রেণী ও পরীক্ষা নির্বাচন করুন</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {filteredResults.map((result) => (
                <Card key={result.id} className="border-0 shadow-md hover:shadow-xl transition-all overflow-hidden">
                  <div className="bg-gradient-to-r from-[#4B0082] to-[#6B2D8B] p-4">
                    <FileText className="w-10 h-10 text-white mb-2" />
                    <h3 className="font-bold text-white text-lg font-bengali">
                      {result.class?.name_bn || result.class?.name}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {result.exam?.name_bn || result.exam?.name}
                    </p>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 mb-4">
                      শিক্ষাবর্ষ: {result.academic_year?.name}
                    </p>
                    <Button asChild className="w-full bg-[#4B0082] hover:bg-[#4B0082]/90">
                      <a href={result.pdf_url} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 w-4 h-4" />
                        ফলাফল দেখুন / ডাউনলোড
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
