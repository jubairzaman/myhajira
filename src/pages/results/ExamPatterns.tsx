import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useExamPatterns, useCreateExamPattern, useDeleteExamPattern, useCreateExamTerm, useCreateTermExam } from '@/hooks/queries/useResultModule';
import { useClassesQuery } from '@/hooks/queries/useClassesQuery';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Plus, Trash2, Layers } from 'lucide-react';

export default function ExamPatterns() {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const { data: patterns, isLoading } = useExamPatterns(selectedClass || undefined);
  const { data: classes } = useClassesQuery();
  const { activeYear } = useAcademicYear();
  const createPattern = useCreateExamPattern();
  const deletePattern = useDeleteExamPattern();
  const createTerm = useCreateExamTerm();
  const createTermExam = useCreateTermExam();
  const { toast } = useToast();

  const { data: exams } = useQuery({
    queryKey: ['exams', activeYear?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('exams').select('*').eq('academic_year_id', activeYear!.id).eq('is_active', true);
      if (error) throw error;
      return data;
    },
    enabled: !!activeYear?.id,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ name: '', name_bn: '', pattern_type: 'term_based' });

  // Term dialog
  const [termDialog, setTermDialog] = useState<{ open: boolean; patternId: string }>({ open: false, patternId: '' });
  const [termForm, setTermForm] = useState({ name: '', name_bn: '', weight: 100 });

  // Link exam dialog
  const [linkDialog, setLinkDialog] = useState<{ open: boolean; termId: string }>({ open: false, termId: '' });
  const [linkExamId, setLinkExamId] = useState('');

  const handleCreatePattern = async () => {
    if (!activeYear?.id || !selectedClass || !form.name) return;
    try {
      await createPattern.mutateAsync({ academic_year_id: activeYear.id, class_id: selectedClass, ...form });
      toast({ title: 'পরীক্ষা প্যাটার্ন তৈরি হয়েছে' });
      setIsOpen(false);
      setForm({ name: '', name_bn: '', pattern_type: 'term_based' });
    } catch {
      toast({ title: 'ব্যর্থ', variant: 'destructive' });
    }
  };

  const handleCreateTerm = async () => {
    if (!termForm.name) return;
    try {
      await createTerm.mutateAsync({ exam_pattern_id: termDialog.patternId, ...termForm });
      toast({ title: 'টার্ম যোগ হয়েছে' });
      setTermDialog({ open: false, patternId: '' });
      setTermForm({ name: '', name_bn: '', weight: 100 });
    } catch {
      toast({ title: 'ব্যর্থ', variant: 'destructive' });
    }
  };

  const handleLinkExam = async () => {
    if (!linkExamId) return;
    try {
      await createTermExam.mutateAsync({ term_id: linkDialog.termId, exam_id: linkExamId });
      toast({ title: 'পরীক্ষা যোগ হয়েছে' });
      setLinkDialog({ open: false, termId: '' });
      setLinkExamId('');
    } catch {
      toast({ title: 'ব্যর্থ', variant: 'destructive' });
    }
  };

  return (
    <MainLayout title="Exam Patterns" titleBn="পরীক্ষা প্যাটার্ন">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-64"><SelectValue placeholder="শ্রেণী নির্বাচন" /></SelectTrigger>
            <SelectContent>
              {classes?.map(cls => <SelectItem key={cls.id} value={cls.id}>{cls.name} {cls.name_bn && `(${cls.name_bn})`}</SelectItem>)}
            </SelectContent>
          </Select>

          {selectedClass && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> নতুন প্যাটার্ন</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>নতুন পরীক্ষা প্যাটার্ন</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label>নাম *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Term Based System" /></div>
                  <div><Label>নাম (বাংলা)</Label><Input value={form.name_bn} onChange={e => setForm({ ...form, name_bn: e.target.value })} /></div>
                  <div>
                    <Label>প্যাটার্ন ধরন</Label>
                    <Select value={form.pattern_type} onValueChange={v => setForm({ ...form, pattern_type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="term_based">টার্ম ভিত্তিক (Term1 + Term2 + Final)</SelectItem>
                        <SelectItem value="direct">সরাসরি (100 নম্বর)</SelectItem>
                        <SelectItem value="weighted">ওয়েটেড (শতাংশ ভিত্তিক)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>বাতিল</Button>
                    <Button onClick={handleCreatePattern} disabled={createPattern.isPending}>তৈরি করুন</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Term Dialog */}
        <Dialog open={termDialog.open} onOpenChange={o => setTermDialog({ ...termDialog, open: o })}>
          <DialogContent>
            <DialogHeader><DialogTitle>নতুন টার্ম যোগ করুন</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>টার্মের নাম *</Label><Input value={termForm.name} onChange={e => setTermForm({ ...termForm, name: e.target.value })} placeholder="e.g., Half Yearly" /></div>
              <div><Label>ওজন (শতাংশ)</Label><Input type="number" value={termForm.weight} onChange={e => setTermForm({ ...termForm, weight: +e.target.value })} /></div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setTermDialog({ open: false, patternId: '' })}>বাতিল</Button>
                <Button onClick={handleCreateTerm} disabled={createTerm.isPending}>যোগ করুন</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Link Exam Dialog */}
        <Dialog open={linkDialog.open} onOpenChange={o => setLinkDialog({ ...linkDialog, open: o })}>
          <DialogContent>
            <DialogHeader><DialogTitle>পরীক্ষা যুক্ত করুন</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Select value={linkExamId} onValueChange={setLinkExamId}>
                <SelectTrigger><SelectValue placeholder="পরীক্ষা নির্বাচন" /></SelectTrigger>
                <SelectContent>
                  {exams?.map(ex => <SelectItem key={ex.id} value={ex.id}>{ex.name} {ex.name_bn && `(${ex.name_bn})`}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setLinkDialog({ open: false, termId: '' })}>বাতিল</Button>
                <Button onClick={handleLinkExam} disabled={createTermExam.isPending}>যুক্ত করুন</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {!selectedClass && <Card><CardContent className="py-12 text-center text-muted-foreground">একটি শ্রেণী নির্বাচন করুন</CardContent></Card>}
        {selectedClass && isLoading && <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>}

        {selectedClass && !isLoading && patterns?.map(pattern => (
          <Card key={pattern.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>{pattern.name}</CardTitle>
                  {pattern.name_bn && <p className="text-sm text-muted-foreground font-bengali">{pattern.name_bn}</p>}
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Badge>{pattern.pattern_type === 'term_based' ? 'টার্ম ভিত্তিক' : pattern.pattern_type === 'direct' ? 'সরাসরি' : 'ওয়েটেড'}</Badge>
                <Badge variant="outline">v{pattern.version}</Badge>
                <Button size="sm" variant="outline" onClick={() => setTermDialog({ open: true, patternId: pattern.id })}>
                  <Plus className="w-3 h-3 mr-1" /> টার্ম
                </Button>
                <Button size="icon" variant="ghost" onClick={() => deletePattern.mutateAsync(pattern.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              {(pattern as any).exam_terms?.length > 0 ? (
                <Accordion type="multiple">
                  {(pattern as any).exam_terms.sort((a: any, b: any) => a.display_order - b.display_order).map((term: any) => (
                    <AccordionItem key={term.id} value={term.id}>
                      <AccordionTrigger>
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{term.name}</span>
                          <Badge variant="outline">ওজন: {term.weight}%</Badge>
                          <Badge variant="secondary">{term.term_exams?.length || 0} পরীক্ষা</Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pl-4">
                          {term.term_exams?.map((te: any) => (
                            <div key={te.id} className="flex items-center gap-2 p-2 border rounded">
                              <span>{te.exam?.name}</span>
                              {te.exam?.name_bn && <span className="text-muted-foreground font-bengali">({te.exam.name_bn})</span>}
                            </div>
                          ))}
                          <Button size="sm" variant="outline" onClick={() => setLinkDialog({ open: true, termId: term.id })}>
                            <Plus className="w-3 h-3 mr-1" /> পরীক্ষা যোগ
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-center text-muted-foreground py-4">কোন টার্ম নেই। টার্ম যোগ করুন।</p>
              )}
            </CardContent>
          </Card>
        ))}

        {selectedClass && !isLoading && (!patterns || patterns.length === 0) && (
          <Card><CardContent className="py-12 text-center text-muted-foreground">কোন প্যাটার্ন পাওয়া যায়নি</CardContent></Card>
        )}
      </div>
    </MainLayout>
  );
}
