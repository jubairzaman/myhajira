import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useSubjects } from '@/hooks/queries/useResultModule';
import { useClassesQuery } from '@/hooks/queries/useClassesQuery';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Printer, BarChart3 } from 'lucide-react';

export default function Tabulation() {
  const { activeYear } = useAcademicYear();
  const { data: classes } = useClassesQuery();

  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');

  const { data: exams } = useQuery({
    queryKey: ['exams', activeYear?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('exams').select('*').eq('academic_year_id', activeYear!.id).eq('is_active', true);
      if (error) throw error;
      return data;
    },
    enabled: !!activeYear?.id,
  });

  const { data: sections } = useQuery({
    queryKey: ['sections', selectedClass],
    queryFn: async () => {
      const { data, error } = await supabase.from('sections').select('*').eq('class_id', selectedClass).eq('is_active', true);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedClass,
  });

  const { data: subjects } = useSubjects(selectedClass || undefined);

  const { data: allMarks, isLoading } = useQuery({
    queryKey: ['tabulation-marks', selectedExam, selectedClass, selectedSection],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marks_entries')
        .select('*, student:students(id, name, name_bn, student_id_number)')
        .eq('exam_id', selectedExam)
        .eq('class_id', selectedClass)
        .eq('section_id', selectedSection)
        .is('component_id', null);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedExam && !!selectedClass && !!selectedSection,
  });

  const allFiltersSet = selectedExam && selectedClass && selectedSection;

  // Build tabulation data
  const studentMap = new Map<string, { student: any; marks: Record<string, { marks: number | null; is_absent: boolean }> }>();

  allMarks?.forEach(m => {
    if (!studentMap.has(m.student_id)) {
      studentMap.set(m.student_id, { student: m.student, marks: {} });
    }
    studentMap.get(m.student_id)!.marks[m.subject_id] = {
      marks: m.marks !== null ? Number(m.marks) : null,
      is_absent: m.is_absent,
    };
  });

  const tabulationRows = Array.from(studentMap.values()).sort((a, b) => {
    const totalA = Object.values(a.marks).reduce((sum, m) => sum + (m.marks || 0), 0);
    const totalB = Object.values(b.marks).reduce((sum, m) => sum + (m.marks || 0), 0);
    return totalB - totalA;
  });

  const handlePrint = () => window.print();

  return (
    <MainLayout title="Tabulation Sheet" titleBn="ট্যাবুলেশন শিট">
      <div className="space-y-6">
        <Card className="print:hidden">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>পরীক্ষা</Label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger><SelectValue placeholder="নির্বাচন" /></SelectTrigger>
                  <SelectContent>{exams?.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>শ্রেণী</Label>
                <Select value={selectedClass} onValueChange={v => { setSelectedClass(v); setSelectedSection(''); }}>
                  <SelectTrigger><SelectValue placeholder="নির্বাচন" /></SelectTrigger>
                  <SelectContent>{classes?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>শাখা</Label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger><SelectValue placeholder="নির্বাচন" /></SelectTrigger>
                  <SelectContent>{sections?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                {allFiltersSet && (
                  <Button onClick={handlePrint}><Printer className="w-4 h-4 mr-2" /> প্রিন্ট</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {!allFiltersSet && <Card><CardContent className="py-12 text-center text-muted-foreground">সকল ফিল্টার নির্বাচন করুন</CardContent></Card>}

        {allFiltersSet && isLoading && <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>}

        {allFiltersSet && !isLoading && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" /> ট্যাবুলেশন শিট ({tabulationRows.length} শিক্ষার্থী)
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10">ক্রম</TableHead>
                    <TableHead className="sticky left-12 bg-background z-10">আইডি</TableHead>
                    <TableHead className="sticky left-24 bg-background z-10 min-w-[150px]">নাম</TableHead>
                    {subjects?.map(sub => (
                      <TableHead key={sub.id} className="text-center min-w-[80px]">
                        <div>
                          <p className="text-xs">{sub.name}</p>
                          <p className="text-[10px] text-muted-foreground">({sub.full_marks})</p>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-center font-bold">মোট</TableHead>
                    <TableHead className="text-center">মেধা</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tabulationRows.map((row, idx) => {
                    const total = Object.values(row.marks).reduce((sum, m) => sum + (m.marks || 0), 0);
                    const hasFail = subjects?.some(sub => {
                      const m = row.marks[sub.id];
                      return m && !m.is_absent && m.marks !== null && m.marks < Number(sub.pass_marks);
                    });

                    return (
                      <TableRow key={row.student.id} className={hasFail ? 'bg-red-50 dark:bg-red-950/10' : ''}>
                        <TableCell className="sticky left-0 bg-background">{idx + 1}</TableCell>
                        <TableCell className="sticky left-12 bg-background text-xs">{row.student.student_id_number || '-'}</TableCell>
                        <TableCell className="sticky left-24 bg-background">
                          <p className="font-medium text-sm">{row.student.name}</p>
                          {row.student.name_bn && <p className="text-xs text-muted-foreground font-bengali">{row.student.name_bn}</p>}
                        </TableCell>
                        {subjects?.map(sub => {
                          const m = row.marks[sub.id];
                          const isFail = m && !m.is_absent && m.marks !== null && m.marks < Number(sub.pass_marks);
                          return (
                            <TableCell key={sub.id} className={`text-center ${isFail ? 'text-red-600 font-bold' : ''}`}>
                              {m?.is_absent ? <Badge variant="secondary" className="text-[10px]">অনু.</Badge> :
                               m?.marks !== null && m?.marks !== undefined ? m.marks : '-'}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center font-bold">{total}</TableCell>
                        <TableCell className="text-center">
                          {hasFail ? <Badge variant="destructive" className="text-xs">ফেল</Badge> :
                           <Badge className="text-xs">{idx + 1}</Badge>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
