import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useResultConfig, useUpsertResultConfig, useGradingScales } from '@/hooks/queries/useResultModule';
import { useClassesQuery } from '@/hooks/queries/useClassesQuery';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Settings2 } from 'lucide-react';

export default function ResultConfig() {
  const { activeYear } = useAcademicYear();
  const { data: classes } = useClassesQuery();
  const { data: gradingScales } = useGradingScales();
  const { toast } = useToast();
  const upsertConfig = useUpsertResultConfig();

  const [selectedClass, setSelectedClass] = useState('');
  const { data: config, isLoading } = useResultConfig(selectedClass || undefined);

  const [form, setForm] = useState({
    grading_scale_id: '',
    absent_as_zero: false,
    grace_marks: 0,
    grace_marks_enabled: false,
    practical_must_pass: true,
    optional_subject_bonus: false,
  });

  useEffect(() => {
    if (config) {
      setForm({
        grading_scale_id: config.grading_scale_id || '',
        absent_as_zero: config.absent_as_zero,
        grace_marks: Number(config.grace_marks),
        grace_marks_enabled: config.grace_marks_enabled,
        practical_must_pass: config.practical_must_pass,
        optional_subject_bonus: config.optional_subject_bonus,
      });
    } else {
      setForm({ grading_scale_id: '', absent_as_zero: false, grace_marks: 0, grace_marks_enabled: false, practical_must_pass: true, optional_subject_bonus: false });
    }
  }, [config]);

  const handleSave = async () => {
    if (!activeYear?.id || !selectedClass) return;
    try {
      await upsertConfig.mutateAsync({
        academic_year_id: activeYear.id,
        class_id: selectedClass,
        ...form,
        grading_scale_id: form.grading_scale_id || undefined,
      });
      toast({ title: 'কনফিগারেশন সেভ হয়েছে' });
    } catch {
      toast({ title: 'সেভ ব্যর্থ', variant: 'destructive' });
    }
  };

  return (
    <MainLayout title="Result Configuration" titleBn="ফলাফল কনফিগারেশন">
      <div className="space-y-6 max-w-2xl">
        <div>
          <Label>শ্রেণী নির্বাচন করুন</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-64"><SelectValue placeholder="নির্বাচন" /></SelectTrigger>
            <SelectContent>{classes?.map(c => <SelectItem key={c.id} value={c.id}>{c.name} {c.name_bn && `(${c.name_bn})`}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        {selectedClass && isLoading && <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>}

        {selectedClass && !isLoading && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Settings2 className="w-5 h-5" /> ফলাফল সেটিংস</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>গ্রেডিং স্কেল</Label>
                <Select value={form.grading_scale_id} onValueChange={v => setForm({ ...form, grading_scale_id: v })}>
                  <SelectTrigger><SelectValue placeholder="নির্বাচন" /></SelectTrigger>
                  <SelectContent>
                    {gradingScales?.map(gs => <SelectItem key={gs.id} value={gs.id}>{gs.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>অনুপস্থিত = ০ নম্বর</Label>
                    <p className="text-xs text-muted-foreground">অনুপস্থিত শিক্ষার্থীকে ০ হিসেবে গণনা করা হবে</p>
                  </div>
                  <Switch checked={form.absent_as_zero} onCheckedChange={v => setForm({ ...form, absent_as_zero: v })} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>গ্রেস মার্কস চালু</Label>
                    <p className="text-xs text-muted-foreground">ফেল শিক্ষার্থীদের জন্য অতিরিক্ত নম্বর</p>
                  </div>
                  <Switch checked={form.grace_marks_enabled} onCheckedChange={v => setForm({ ...form, grace_marks_enabled: v })} />
                </div>

                {form.grace_marks_enabled && (
                  <div>
                    <Label>গ্রেস মার্কস পরিমাণ</Label>
                    <Input type="number" value={form.grace_marks} onChange={e => setForm({ ...form, grace_marks: +e.target.value })} className="w-32" />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <Label>ব্যবহারিক পাস আবশ্যক</Label>
                    <p className="text-xs text-muted-foreground">ব্যবহারিকে পাস না করলে বিষয়ে ফেল</p>
                  </div>
                  <Switch checked={form.practical_must_pass} onCheckedChange={v => setForm({ ...form, practical_must_pass: v })} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>ঐচ্ছিক বিষয় বোনাস</Label>
                    <p className="text-xs text-muted-foreground">ঐচ্ছিক বিষয়ের অতিরিক্ত নম্বর GPA তে যোগ</p>
                  </div>
                  <Switch checked={form.optional_subject_bonus} onCheckedChange={v => setForm({ ...form, optional_subject_bonus: v })} />
                </div>
              </div>

              <Button onClick={handleSave} disabled={upsertConfig.isPending}>
                {upsertConfig.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" /> সেভ করুন
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
