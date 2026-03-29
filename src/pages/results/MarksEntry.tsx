import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useMarksEntries, useBulkUpsertMarks, useSubmitMarks, useApproveMarks, useSubjects } from '@/hooks/queries/useResultModule';
import { useClassesQuery } from '@/hooks/queries/useClassesQuery';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Save, Send, CheckCircle, AlertTriangle } from 'lucide-react';

interface MarkRow {
  student_id: string;
  student_name: string;
  student_name_bn: string;
  student_id_number: string;
  marks: number | null;
  is_absent: boolean;
  existing_status?: string;
}

export default function MarksEntry() {
  const { activeYear } = useAcademicYear();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: classes } = useClassesQuery();

  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [markRows, setMarkRows] = useState<MarkRow[]>([]);

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

  const { data: students } = useQuery({
    queryKey: ['students-for-marks', activeYear?.id, selectedClass, selectedSection],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, name_bn, student_id_number')
        .eq('academic_year_id', activeYear!.id)
        .eq('class_id', selectedClass)
        .eq('section_id', selectedSection)
        .eq('is_active', true)
        .order('name');
      if (error) throw error;
      return data;
    },
    enabled: !!activeYear?.id && !!selectedClass && !!selectedSection,
  });

  const { data: existingMarks } = useMarksEntries(
    selectedExam || undefined,
    selectedClass || undefined,
    selectedSection || undefined,
    selectedSubject || undefined
  );

  const bulkUpsert = useBulkUpsertMarks();
  const submitMarks = useSubmitMarks();
  const approveMarks = useApproveMarks();

  // Build mark rows when students/existing marks change
  useEffect(() => {
    if (!students) return;
    const rows: MarkRow[] = students.map(s => {
      const existing = existingMarks?.find(m => m.student_id === s.id && !m.component_id);
      return {
        student_id: s.id,
        student_name: s.name,
        student_name_bn: s.name_bn || '',
        student_id_number: s.student_id_number || '',
        marks: existing ? Number(existing.marks) : null,
        is_absent: existing?.is_absent || false,
        existing_status: existing?.status,
      };
    });
    setMarkRows(rows);
  }, [students, existingMarks]);

  const selectedSubjectData = subjects?.find(s => s.id === selectedSubject);
  const allFiltersSet = selectedExam && selectedClass && selectedSection && selectedSubject;

  const handleSaveDraft = async () => {
    if (!activeYear?.id || !user?.id) return;
    const entries = markRows.map(r => ({
      academic_year_id: activeYear.id,
      exam_id: selectedExam,
      class_id: selectedClass,
      section_id: selectedSection,
      subject_id: selectedSubject,
      student_id: r.student_id,
      component_id: null as string | null,
      marks: r.is_absent ? null : r.marks,
      is_absent: r.is_absent,
      entered_by: user.id,
      status: 'draft',
    }));
    try {
      await bulkUpsert.mutateAsync(entries);
      toast({ title: 'ড্রাফট সেভ হয়েছে' });
    } catch {
      toast({ title: 'সেভ ব্যর্থ', variant: 'destructive' });
    }
  };

  const handleSubmit = async () => {
    if (!confirm('সাবমিট করলে আর এডিট করা যাবে না। নিশ্চিত?')) return;
    // Save first then submit
    await handleSaveDraft();
    try {
      await submitMarks.mutateAsync({ examId: selectedExam, subjectId: selectedSubject, classId: selectedClass, sectionId: selectedSection });
      toast({ title: 'মার্কস সাবমিট হয়েছে' });
    } catch {
      toast({ title: 'সাবমিট ব্যর্থ', variant: 'destructive' });
    }
  };

  const handleApprove = async () => {
    if (!user?.id) return;
    try {
      await approveMarks.mutateAsync({ examId: selectedExam, subjectId: selectedSubject, classId: selectedClass, sectionId: selectedSection, approvedBy: user.id });
      toast({ title: 'মার্কস অনুমোদিত হয়েছে' });
    } catch {
      toast({ title: 'অনুমোদন ব্যর্থ', variant: 'destructive' });
    }
  };

  const updateMark = (idx: number, value: string) => {
    const num = value === '' ? null : Number(value);
    if (num !== null && selectedSubjectData && num > Number(selectedSubjectData.full_marks)) {
      toast({ title: `সর্বোচ্চ ${selectedSubjectData.full_marks} নম্বর দেওয়া যাবে`, variant: 'destructive' });
      return;
    }
    setMarkRows(prev => prev.map((r, i) => i === idx ? { ...r, marks: num, is_absent: false } : r));
  };

  const toggleAbsent = (idx: number, absent: boolean) => {
    setMarkRows(prev => prev.map((r, i) => i === idx ? { ...r, is_absent: absent, marks: absent ? null : r.marks } : r));
  };

  const currentStatus = markRows[0]?.existing_status || 'new';
  const isLocked = currentStatus === 'approved';

  return (
    <MainLayout title="Marks Entry" titleBn="নম্বর এন্ট্রি">
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label>পরীক্ষা *</Label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger><SelectValue placeholder="নির্বাচন" /></SelectTrigger>
                  <SelectContent>{exams?.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>শ্রেণী *</Label>
                <Select value={selectedClass} onValueChange={v => { setSelectedClass(v); setSelectedSection(''); setSelectedSubject(''); }}>
                  <SelectTrigger><SelectValue placeholder="নির্বাচন" /></SelectTrigger>
                  <SelectContent>{classes?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>শাখা *</Label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger><SelectValue placeholder="নির্বাচন" /></SelectTrigger>
                  <SelectContent>{sections?.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>বিষয় *</Label>
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger><SelectValue placeholder="নির্বাচন" /></SelectTrigger>
                  <SelectContent>{subjects?.map(s => <SelectItem key={s.id} value={s.id}>{s.name} {s.name_bn && `(${s.name_bn})`}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status & Actions */}
        {allFiltersSet && (
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={currentStatus === 'approved' ? 'default' : currentStatus === 'submitted' ? 'secondary' : 'outline'}>
                {currentStatus === 'approved' ? '✅ অনুমোদিত' : currentStatus === 'submitted' ? '📤 সাবমিটেড' : currentStatus === 'draft' ? '📝 ড্রাফট' : '🆕 নতুন'}
              </Badge>
              {selectedSubjectData && <Badge variant="outline">পূর্ণ নম্বর: {selectedSubjectData.full_marks}</Badge>}
            </div>
            <div className="flex gap-2">
              {!isLocked && (
                <>
                  <Button variant="outline" onClick={handleSaveDraft} disabled={bulkUpsert.isPending}>
                    <Save className="w-4 h-4 mr-2" /> ড্রাফট সেভ
                  </Button>
                  <Button onClick={handleSubmit} disabled={submitMarks.isPending}>
                    <Send className="w-4 h-4 mr-2" /> সাবমিট
                  </Button>
                </>
              )}
              {currentStatus === 'submitted' && (
                <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" /> অনুমোদন
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Marks Table */}
        {allFiltersSet && (
          <Card>
            <CardHeader><CardTitle>নম্বর তালিকা ({markRows.length} শিক্ষার্থী)</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>আইডি</TableHead>
                    <TableHead>শিক্ষার্থীর নাম</TableHead>
                    <TableHead className="w-32">নম্বর</TableHead>
                    <TableHead className="w-24">অনুপস্থিত</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {markRows.map((row, idx) => (
                    <TableRow key={row.student_id} className={row.is_absent ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="text-xs">{row.student_id_number || '-'}</TableCell>
                      <TableCell>
                        <p className="font-medium">{row.student_name}</p>
                        {row.student_name_bn && <p className="text-xs text-muted-foreground font-bengali">{row.student_name_bn}</p>}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          max={selectedSubjectData ? Number(selectedSubjectData.full_marks) : 100}
                          value={row.marks ?? ''}
                          onChange={e => updateMark(idx, e.target.value)}
                          disabled={isLocked || row.is_absent}
                          className="w-24"
                          placeholder="নম্বর"
                        />
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={row.is_absent}
                          onCheckedChange={v => toggleAbsent(idx, v)}
                          disabled={isLocked}
                        />
                      </TableCell>
                      <TableCell>
                        {row.marks !== null && selectedSubjectData && Number(row.marks) < Number(selectedSubjectData.pass_marks) && !row.is_absent && (
                          <Badge variant="destructive" className="text-xs"><AlertTriangle className="w-3 h-3 mr-1" /> ফেল</Badge>
                        )}
                        {row.marks !== null && selectedSubjectData && Number(row.marks) >= Number(selectedSubjectData.pass_marks) && (
                          <Badge className="text-xs bg-green-600">পাস</Badge>
                        )}
                        {row.is_absent && <Badge variant="secondary" className="text-xs">অনুপস্থিত</Badge>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {!allFiltersSet && (
          <Card><CardContent className="py-12 text-center text-muted-foreground">পরীক্ষা, শ্রেণী, শাখা এবং বিষয় নির্বাচন করুন</CardContent></Card>
        )}
      </div>
    </MainLayout>
  );
}
