import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useSubjects, useCreateSubject, useDeleteSubject } from '@/hooks/queries/useResultModule';
import { useClassesQuery } from '@/hooks/queries/useClassesQuery';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, BookOpen } from 'lucide-react';

interface ComponentRow {
  name: string;
  name_bn: string;
  full_marks: number;
  pass_marks: number;
  is_required_for_pass: boolean;
  display_order: number;
}

export default function SubjectManagement() {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const { data: subjects, isLoading } = useSubjects(selectedClass || undefined);
  const { data: classes } = useClassesQuery();
  const createSubject = useCreateSubject();
  const deleteSubject = useDeleteSubject();
  const { activeYear } = useAcademicYear();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    name: '', name_bn: '', subject_code: '', subject_type: 'mandatory',
    full_marks: 100, pass_marks: 33, has_components: false,
  });
  const [components, setComponents] = useState<ComponentRow[]>([]);

  const handleCreate = async () => {
    if (!activeYear?.id || !selectedClass || !form.name) return;
    try {
      await createSubject.mutateAsync({
        academic_year_id: activeYear.id,
        class_id: selectedClass,
        ...form,
        components: form.has_components ? components : undefined,
      });
      toast({ title: 'বিষয় তৈরি হয়েছে' });
      setIsOpen(false);
      setForm({ name: '', name_bn: '', subject_code: '', subject_type: 'mandatory', full_marks: 100, pass_marks: 33, has_components: false });
      setComponents([]);
    } catch {
      toast({ title: 'তৈরি করতে ব্যর্থ', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('মুছে ফেলতে চান?')) return;
    try {
      await deleteSubject.mutateAsync(id);
      toast({ title: 'মুছে ফেলা হয়েছে' });
    } catch {
      toast({ title: 'মুছে ফেলতে ব্যর্থ', variant: 'destructive' });
    }
  };

  return (
    <MainLayout title="Subject Management" titleBn="বিষয় ব্যবস্থাপনা">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-64"><SelectValue placeholder="শ্রেণী নির্বাচন করুন" /></SelectTrigger>
            <SelectContent>
              {classes?.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name} {cls.name_bn && `(${cls.name_bn})`}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedClass && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button><Plus className="w-4 h-4 mr-2" /> বিষয় যোগ করুন</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>নতুন বিষয় যোগ করুন</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>বিষয়ের নাম (English) *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
                    <div><Label>বিষয়ের নাম (বাংলা)</Label><Input value={form.name_bn} onChange={e => setForm({ ...form, name_bn: e.target.value })} /></div>
                    <div><Label>বিষয় কোড</Label><Input value={form.subject_code} onChange={e => setForm({ ...form, subject_code: e.target.value })} placeholder="e.g., BAN101" /></div>
                    <div>
                      <Label>বিষয়ের ধরন</Label>
                      <Select value={form.subject_type} onValueChange={v => setForm({ ...form, subject_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mandatory">বাধ্যতামূলক</SelectItem>
                          <SelectItem value="optional">ঐচ্ছিক</SelectItem>
                          <SelectItem value="additional">অতিরিক্ত</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label>পূর্ণ নম্বর</Label><Input type="number" value={form.full_marks} onChange={e => setForm({ ...form, full_marks: +e.target.value })} /></div>
                    <div><Label>পাস নম্বর</Label><Input type="number" value={form.pass_marks} onChange={e => setForm({ ...form, pass_marks: +e.target.value })} /></div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch checked={form.has_components} onCheckedChange={v => setForm({ ...form, has_components: v })} />
                    <Label>কম্পোনেন্ট আছে (MCQ/CQ/Practical/Viva)</Label>
                  </div>

                  {form.has_components && (
                    <div>
                      <Label className="text-base font-semibold">কম্পোনেন্ট সমূহ</Label>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>নাম</TableHead>
                            <TableHead>পূর্ণ নম্বর</TableHead>
                            <TableHead>পাস নম্বর</TableHead>
                            <TableHead>পাসের জন্য আবশ্যক</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {components.map((c, i) => (
                            <TableRow key={i}>
                              <TableCell><Input value={c.name} onChange={e => { const nc = [...components]; nc[i].name = e.target.value; setComponents(nc); }} /></TableCell>
                              <TableCell><Input type="number" value={c.full_marks} onChange={e => { const nc = [...components]; nc[i].full_marks = +e.target.value; setComponents(nc); }} className="w-20" /></TableCell>
                              <TableCell><Input type="number" value={c.pass_marks} onChange={e => { const nc = [...components]; nc[i].pass_marks = +e.target.value; setComponents(nc); }} className="w-20" /></TableCell>
                              <TableCell><Switch checked={c.is_required_for_pass} onCheckedChange={v => { const nc = [...components]; nc[i].is_required_for_pass = v; setComponents(nc); }} /></TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <Button variant="outline" size="sm" className="mt-2" onClick={() => setComponents([...components, { name: '', name_bn: '', full_marks: 0, pass_marks: 0, is_required_for_pass: false, display_order: components.length }])}>
                        + কম্পোনেন্ট যোগ করুন
                      </Button>
                    </div>
                  )}

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>বাতিল</Button>
                    <Button onClick={handleCreate} disabled={createSubject.isPending}>
                      {createSubject.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      তৈরি করুন
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {!selectedClass && (
          <Card><CardContent className="py-12 text-center text-muted-foreground">একটি শ্রেণী নির্বাচন করুন</CardContent></Card>
        )}

        {selectedClass && isLoading && (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
        )}

        {selectedClass && !isLoading && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" /> বিষয় তালিকা ({subjects?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>বিষয়</TableHead>
                    <TableHead>কোড</TableHead>
                    <TableHead>ধরন</TableHead>
                    <TableHead>পূর্ণ নম্বর</TableHead>
                    <TableHead>পাস নম্বর</TableHead>
                    <TableHead>কম্পোনেন্ট</TableHead>
                    <TableHead className="text-right">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subjects?.map(sub => (
                    <TableRow key={sub.id}>
                      <TableCell>
                        <p className="font-medium">{sub.name}</p>
                        {sub.name_bn && <p className="text-sm text-muted-foreground font-bengali">{sub.name_bn}</p>}
                      </TableCell>
                      <TableCell>{sub.subject_code || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={sub.subject_type === 'mandatory' ? 'default' : 'secondary'}>
                          {sub.subject_type === 'mandatory' ? 'বাধ্যতামূলক' : sub.subject_type === 'optional' ? 'ঐচ্ছিক' : 'অতিরিক্ত'}
                        </Badge>
                      </TableCell>
                      <TableCell>{sub.full_marks}</TableCell>
                      <TableCell>{sub.pass_marks}</TableCell>
                      <TableCell>
                        {sub.has_components ? (
                          <div className="flex flex-wrap gap-1">
                            {(sub as any).subject_components?.map((c: any) => (
                              <Badge key={c.id} variant="outline" className="text-xs">{c.name} ({c.full_marks})</Badge>
                            ))}
                          </div>
                        ) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" onClick={() => handleDelete(sub.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!subjects || subjects.length === 0) && (
                    <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">কোন বিষয় পাওয়া যায়নি</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
