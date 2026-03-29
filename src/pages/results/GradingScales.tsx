import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useGradingScales, useCreateGradingScale, useDeleteGradingScale } from '@/hooks/queries/useResultModule';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, Award } from 'lucide-react';

interface GradeRow {
  grade: string;
  grade_bn: string;
  min_marks: number;
  max_marks: number;
  point: number;
  remarks: string;
  remarks_bn: string;
  display_order: number;
}

const defaultBDGrades: GradeRow[] = [
  { grade: 'A+', grade_bn: 'এ+', min_marks: 80, max_marks: 100, point: 5.00, remarks: 'Outstanding', remarks_bn: 'অসাধারণ', display_order: 0 },
  { grade: 'A', grade_bn: 'এ', min_marks: 70, max_marks: 79, point: 4.00, remarks: 'Excellent', remarks_bn: 'চমৎকার', display_order: 1 },
  { grade: 'A-', grade_bn: 'এ-', min_marks: 60, max_marks: 69, point: 3.50, remarks: 'Very Good', remarks_bn: 'খুব ভালো', display_order: 2 },
  { grade: 'B', grade_bn: 'বি', min_marks: 50, max_marks: 59, point: 3.00, remarks: 'Good', remarks_bn: 'ভালো', display_order: 3 },
  { grade: 'C', grade_bn: 'সি', min_marks: 40, max_marks: 49, point: 2.00, remarks: 'Satisfactory', remarks_bn: 'সন্তোষজনক', display_order: 4 },
  { grade: 'D', grade_bn: 'ডি', min_marks: 33, max_marks: 39, point: 1.00, remarks: 'Pass', remarks_bn: 'পাস', display_order: 5 },
  { grade: 'F', grade_bn: 'এফ', min_marks: 0, max_marks: 32, point: 0.00, remarks: 'Fail', remarks_bn: 'অকৃতকার্য', display_order: 6 },
];

export default function GradingScales() {
  const { data: scales, isLoading } = useGradingScales();
  const createScale = useCreateGradingScale();
  const deleteScale = useDeleteGradingScale();
  const { activeYear } = useAcademicYear();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [scaleName, setScaleName] = useState('');
  const [scaleNameBn, setScaleNameBn] = useState('');
  const [grades, setGrades] = useState<GradeRow[]>(defaultBDGrades);

  const handleCreate = async () => {
    if (!activeYear?.id || !scaleName) return;
    try {
      await createScale.mutateAsync({
        academic_year_id: activeYear.id,
        name: scaleName,
        name_bn: scaleNameBn || undefined,
        grades,
      });
      toast({ title: 'গ্রেডিং স্কেল তৈরি হয়েছে' });
      setIsOpen(false);
      setScaleName('');
      setScaleNameBn('');
      setGrades(defaultBDGrades);
    } catch {
      toast({ title: 'তৈরি করতে ব্যর্থ', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('মুছে ফেলতে চান?')) return;
    try {
      await deleteScale.mutateAsync(id);
      toast({ title: 'মুছে ফেলা হয়েছে' });
    } catch {
      toast({ title: 'মুছে ফেলতে ব্যর্থ', variant: 'destructive' });
    }
  };

  const updateGrade = (idx: number, field: keyof GradeRow, value: string | number) => {
    setGrades(prev => prev.map((g, i) => i === idx ? { ...g, [field]: value } : g));
  };

  if (isLoading) {
    return (
      <MainLayout title="Grading Scales" titleBn="গ্রেডিং স্কেল">
        <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Grading Scales" titleBn="গ্রেডিং স্কেল">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="w-4 h-4 mr-2" /> নতুন স্কেল</Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>নতুন গ্রেডিং স্কেল তৈরি করুন</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>নাম (English)</Label><Input value={scaleName} onChange={e => setScaleName(e.target.value)} placeholder="e.g., Bangladesh National Grading" /></div>
                  <div><Label>নাম (বাংলা)</Label><Input value={scaleNameBn} onChange={e => setScaleNameBn(e.target.value)} placeholder="যেমন: জাতীয় গ্রেডিং" /></div>
                </div>

                <div>
                  <Label className="text-base font-semibold">গ্রেড পয়েন্ট সমূহ</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Grade</TableHead>
                        <TableHead>বাংলা</TableHead>
                        <TableHead>Min</TableHead>
                        <TableHead>Max</TableHead>
                        <TableHead>GPA</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {grades.map((g, i) => (
                        <TableRow key={i}>
                          <TableCell><Input value={g.grade} onChange={e => updateGrade(i, 'grade', e.target.value)} className="w-16" /></TableCell>
                          <TableCell><Input value={g.grade_bn} onChange={e => updateGrade(i, 'grade_bn', e.target.value)} className="w-16" /></TableCell>
                          <TableCell><Input type="number" value={g.min_marks} onChange={e => updateGrade(i, 'min_marks', +e.target.value)} className="w-16" /></TableCell>
                          <TableCell><Input type="number" value={g.max_marks} onChange={e => updateGrade(i, 'max_marks', +e.target.value)} className="w-16" /></TableCell>
                          <TableCell><Input type="number" step="0.01" value={g.point} onChange={e => updateGrade(i, 'point', +e.target.value)} className="w-20" /></TableCell>
                          <TableCell><Input value={g.remarks} onChange={e => updateGrade(i, 'remarks', e.target.value)} className="w-28" /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => setGrades([...grades, { grade: '', grade_bn: '', min_marks: 0, max_marks: 0, point: 0, remarks: '', remarks_bn: '', display_order: grades.length }])}>
                    + গ্রেড যোগ করুন
                  </Button>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>বাতিল</Button>
                  <Button onClick={handleCreate} disabled={createScale.isPending}>
                    {createScale.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    তৈরি করুন
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {scales?.map(scale => (
          <Card key={scale.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle className="text-lg">{scale.name}</CardTitle>
                  {scale.name_bn && <p className="text-sm text-muted-foreground font-bengali">{scale.name_bn}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <Badge variant={scale.is_active ? 'default' : 'secondary'}>{scale.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}</Badge>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(scale.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>গ্রেড</TableHead>
                    <TableHead>নম্বর রেঞ্জ</TableHead>
                    <TableHead>GPA</TableHead>
                    <TableHead>মন্তব্য</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(scale as any).grade_points?.sort((a: any, b: any) => a.display_order - b.display_order).map((gp: any) => (
                    <TableRow key={gp.id}>
                      <TableCell className="font-bold">{gp.grade} {gp.grade_bn && <span className="text-muted-foreground font-bengali">({gp.grade_bn})</span>}</TableCell>
                      <TableCell>{gp.min_marks} - {gp.max_marks}</TableCell>
                      <TableCell>{Number(gp.point).toFixed(2)}</TableCell>
                      <TableCell>{gp.remarks} {gp.remarks_bn && <span className="font-bengali">({gp.remarks_bn})</span>}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}

        {(!scales || scales.length === 0) && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              কোন গ্রেডিং স্কেল পাওয়া যায়নি। "নতুন স্কেল" বাটনে ক্লিক করুন।
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
