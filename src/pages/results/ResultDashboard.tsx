import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useResultPublishStatus, useUpdatePublishStatus } from '@/hooks/queries/useResultModule';
import { useClassesQuery } from '@/hooks/queries/useClassesQuery';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { BarChart3, BookOpen, Award, Layers, PenLine, Eye, Lock, Unlock, GraduationCap, ClipboardCheck } from 'lucide-react';

export default function ResultDashboard() {
  const { activeYear } = useAcademicYear();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: classes } = useClassesQuery();

  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  const { data: exams } = useQuery({
    queryKey: ['exams', activeYear?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('exams').select('*').eq('academic_year_id', activeYear!.id).eq('is_active', true);
      if (error) throw error;
      return data;
    },
    enabled: !!activeYear?.id,
  });

  const { data: publishStatuses } = useResultPublishStatus(selectedExam || undefined, selectedClass || undefined);
  const updatePublish = useUpdatePublishStatus();

  const handlePublishAction = async (status: string) => {
    if (!activeYear?.id || !selectedExam || !selectedClass || !user?.id) return;
    try {
      await updatePublish.mutateAsync({
        academic_year_id: activeYear.id,
        exam_id: selectedExam,
        class_id: selectedClass,
        status,
        published_by: user.id,
      });
      toast({ title: `স্ট্যাটাস পরিবর্তন: ${status}` });
    } catch {
      toast({ title: 'ব্যর্থ', variant: 'destructive' });
    }
  };

  const currentStatus = publishStatuses?.[0]?.status || 'draft';

  const quickLinks = [
    { label: 'গ্রেডিং স্কেল', labelBn: 'Grading Scales', icon: Award, href: '/results/grading-scales', color: 'text-amber-600' },
    { label: 'বিষয় ব্যবস্থাপনা', labelBn: 'Subject Management', icon: BookOpen, href: '/results/subjects', color: 'text-blue-600' },
    { label: 'পরীক্ষা প্যাটার্ন', labelBn: 'Exam Patterns', icon: Layers, href: '/results/exam-patterns', color: 'text-purple-600' },
    { label: 'নম্বর এন্ট্রি', labelBn: 'Marks Entry', icon: PenLine, href: '/results/marks-entry', color: 'text-green-600' },
    { label: 'ফলাফল কনফিগ', labelBn: 'Result Config', icon: ClipboardCheck, href: '/results/config', color: 'text-indigo-600' },
    { label: 'ট্যাবুলেশন', labelBn: 'Tabulation', icon: BarChart3, href: '/results/tabulation', color: 'text-red-600' },
  ];

  return (
    <MainLayout title="Result Management" titleBn="ফলাফল ব্যবস্থাপনা">
      <div className="space-y-6">
        {/* Quick Links */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickLinks.map(link => (
            <Link key={link.href} to={link.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="pt-6 flex flex-col items-center text-center gap-2">
                  <link.icon className={`w-8 h-8 ${link.color}`} />
                  <p className="font-medium text-sm font-bengali">{link.label}</p>
                  <p className="text-xs text-muted-foreground">{link.labelBn}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Publish Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" /> ফলাফল প্রকাশ নিয়ন্ত্রণ
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <Label>পরীক্ষা</Label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger><SelectValue placeholder="নির্বাচন" /></SelectTrigger>
                  <SelectContent>{exams?.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>শ্রেণী</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger><SelectValue placeholder="নির্বাচন" /></SelectTrigger>
                  <SelectContent>{classes?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Badge className="h-8" variant={
                  currentStatus === 'published' ? 'default' :
                  currentStatus === 'finalized' ? 'secondary' :
                  currentStatus === 'reviewed' ? 'outline' : 'outline'
                }>
                  {currentStatus === 'published' ? '🟢 প্রকাশিত' :
                   currentStatus === 'finalized' ? '🔒 চূড়ান্ত' :
                   currentStatus === 'reviewed' ? '👁 পর্যালোচিত' : '📝 ড্রাফট'}
                </Badge>
              </div>
            </div>

            {selectedExam && selectedClass && (
              <div className="flex gap-2 flex-wrap">
                {currentStatus !== 'reviewed' && currentStatus !== 'finalized' && currentStatus !== 'published' && (
                  <Button variant="outline" onClick={() => handlePublishAction('reviewed')}>
                    <Eye className="w-4 h-4 mr-2" /> পর্যালোচনা
                  </Button>
                )}
                {(currentStatus === 'reviewed' || currentStatus === 'draft') && currentStatus !== 'finalized' && currentStatus !== 'published' && (
                  <Button variant="outline" onClick={() => handlePublishAction('finalized')}>
                    <Lock className="w-4 h-4 mr-2" /> চূড়ান্ত করুন
                  </Button>
                )}
                {currentStatus === 'finalized' && (
                  <Button onClick={() => handlePublishAction('published')} className="bg-green-600 hover:bg-green-700">
                    <GraduationCap className="w-4 h-4 mr-2" /> প্রকাশ করুন
                  </Button>
                )}
                {currentStatus === 'published' && (
                  <Button variant="destructive" onClick={() => handlePublishAction('finalized')}>
                    <Unlock className="w-4 h-4 mr-2" /> প্রকাশ বাতিল
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Publish Status */}
        {publishStatuses && publishStatuses.length > 0 && (
          <Card>
            <CardHeader><CardTitle>সাম্প্রতিক স্ট্যাটাস</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>পরীক্ষা</TableHead>
                    <TableHead>শ্রেণী</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead>প্রকাশের তারিখ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {publishStatuses.map(ps => (
                    <TableRow key={ps.id}>
                      <TableCell>{exams?.find(e => e.id === ps.exam_id)?.name || '-'}</TableCell>
                      <TableCell>{classes?.find(c => c.id === ps.class_id)?.name || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={ps.status === 'published' ? 'default' : 'secondary'}>{ps.status}</Badge>
                      </TableCell>
                      <TableCell>{ps.published_at ? new Date(ps.published_at).toLocaleDateString('bn-BD') : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
