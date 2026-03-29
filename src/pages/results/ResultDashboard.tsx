import { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useResultPublishStatus, useUpdatePublishStatus, useSubjects, useExamPatterns, useGradingScales, useResultConfig } from '@/hooks/queries/useResultModule';
import { useClassesQuery } from '@/hooks/queries/useClassesQuery';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import {
  BarChart3, BookOpen, Award, Layers, PenLine, Eye, Lock, Unlock,
  GraduationCap, ClipboardCheck, Users, CheckCircle2, AlertTriangle,
  XCircle, Clock, TrendingUp, FileText, Printer, ArrowRight,
  Info, Zap, Target, Shield, ChevronRight
} from 'lucide-react';

export default function ResultDashboard() {
  const { activeYear } = useAcademicYear();
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: classes } = useClassesQuery();
  const { data: gradingScales } = useGradingScales();

  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  // Fetch exams
  const { data: exams } = useQuery({
    queryKey: ['exams', activeYear?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('exams').select('*').eq('academic_year_id', activeYear!.id).eq('is_active', true);
      if (error) throw error;
      return data;
    },
    enabled: !!activeYear?.id,
  });

  // Fetch all students count
  const { data: studentStats } = useQuery({
    queryKey: ['result-student-stats', activeYear?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('students')
        .select('id', { count: 'exact', head: true })
        .eq('academic_year_id', activeYear!.id)
        .eq('is_active', true);
      if (error) throw error;
      return { total: count || 0 };
    },
    enabled: !!activeYear?.id,
  });

  // Fetch marks entries stats
  const { data: marksStats } = useQuery({
    queryKey: ['result-marks-stats', activeYear?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marks_entries')
        .select('status, is_absent')
        .eq('academic_year_id', activeYear!.id);
      if (error) throw error;

      const total = data?.length || 0;
      const draft = data?.filter(m => m.status === 'draft').length || 0;
      const submitted = data?.filter(m => m.status === 'submitted').length || 0;
      const approved = data?.filter(m => m.status === 'approved').length || 0;
      const absent = data?.filter(m => m.is_absent).length || 0;

      return { total, draft, submitted, approved, absent };
    },
    enabled: !!activeYear?.id,
  });

  // Fetch subjects for selected class
  const { data: subjects } = useSubjects(selectedClass || undefined);

  // Fetch exam patterns for selected class
  const { data: examPatterns } = useExamPatterns(selectedClass || undefined);

  // Fetch result config for selected class
  const { data: resultConfig } = useResultConfig(selectedClass || undefined);

  // Publish status
  const { data: publishStatuses } = useResultPublishStatus(selectedExam || undefined, selectedClass || undefined);
  const { data: allPublishStatuses } = useResultPublishStatus();
  const updatePublish = useUpdatePublishStatus();

  // Compute dashboard metrics
  const completedEntries = (marksStats?.approved || 0) + (marksStats?.submitted || 0);
  const pendingEntries = marksStats?.draft || 0;
  const totalEntries = marksStats?.total || 0;
  const entryProgress = totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0;
  const approvalProgress = totalEntries > 0 ? Math.round(((marksStats?.approved || 0) / totalEntries) * 100) : 0;

  const publishedCount = allPublishStatuses?.filter(s => s.status === 'published').length || 0;
  const totalPublishable = (exams?.length || 0) * (classes?.length || 0);
  const resultReadyPct = totalPublishable > 0 ? Math.round((publishedCount / totalPublishable) * 100) : 0;

  const currentStatus = publishStatuses?.[0]?.status || 'draft';

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

  // Ranking rules from config
  const rankingPriority = resultConfig?.ranking_priority as string[] | null;

  return (
    <MainLayout title="Result Dashboard" titleBn="ফলাফল ড্যাশবোর্ড">
      <div className="space-y-6">

        {/* ═══════════════ STAT CARDS ═══════════════ */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatMini icon={Users} label="মোট শিক্ষার্থী" value={studentStats?.total || 0} color="text-blue-600" bg="bg-blue-50" />
          <StatMini icon={CheckCircle2} label="সম্পন্ন এন্ট্রি" value={completedEntries} color="text-green-600" bg="bg-green-50" />
          <StatMini icon={Clock} label="অমীমাংসিত এন্ট্রি" value={pendingEntries} color="text-amber-600" bg="bg-amber-50" />
          <StatMini icon={XCircle} label="অনুপস্থিত" value={marksStats?.absent || 0} color="text-red-600" bg="bg-red-50" />
          <StatMini icon={Shield} label="অনুমোদিত" value={marksStats?.approved || 0} color="text-indigo-600" bg="bg-indigo-50" />
          <StatMini icon={GraduationCap} label="প্রকাশিত" value={publishedCount} color="text-emerald-600" bg="bg-emerald-50" />
        </div>

        {/* ═══════════════ PROGRESS BARS ═══════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">নম্বর এন্ট্রি অগ্রগতি</span>
                <span className="font-bold text-primary">{entryProgress}%</span>
              </div>
              <Progress value={entryProgress} className="h-3" />
              <p className="text-xs text-muted-foreground mt-1">{completedEntries} / {totalEntries} সম্পন্ন</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">অনুমোদন অগ্রগতি</span>
                <span className="font-bold text-indigo-600">{approvalProgress}%</span>
              </div>
              <Progress value={approvalProgress} className="h-3" />
              <p className="text-xs text-muted-foreground mt-1">{marksStats?.approved || 0} / {totalEntries} অনুমোদিত</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium">ফলাফল প্রস্তুতি</span>
                <span className="font-bold text-emerald-600">{resultReadyPct}%</span>
              </div>
              <Progress value={resultReadyPct} className="h-3" />
              <p className="text-xs text-muted-foreground mt-1">{publishedCount} / {totalPublishable} প্রকাশিত</p>
            </CardContent>
          </Card>
        </div>

        {/* ═══════════════ QUICK ACTIONS ═══════════════ */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2"><Zap className="w-5 h-5 text-amber-500" /> দ্রুত কার্যক্রম</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <QuickActionBtn href="/results/marks-entry" icon={PenLine} label="নম্বর এন্ট্রি" color="bg-green-600 hover:bg-green-700" />
              <QuickActionBtn href="/results/marks-entry" icon={CheckCircle2} label="নম্বর অনুমোদন" color="bg-indigo-600 hover:bg-indigo-700" />
              <QuickActionBtn href="/results/tabulation" icon={BarChart3} label="ফলাফল তৈরি" color="bg-purple-600 hover:bg-purple-700" />
              <QuickActionBtn href="/results/tabulation" icon={Eye} label="ফলাফল প্রকাশ" color="bg-emerald-600 hover:bg-emerald-700" />
              <QuickActionBtn href="/results/tabulation" icon={Printer} label="রিপোর্ট প্রিন্ট" color="bg-blue-600 hover:bg-blue-700" />
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════ CLASS FILTER + EXAM STRUCTURE ═══════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Exam Structure Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Layers className="w-5 h-5 text-purple-600" /> পরীক্ষার কাঠামো</CardTitle>
              <CardDescription>শ্রেণী নির্বাচন করে কাঠামো দেখুন</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger><SelectValue placeholder="শ্রেণী নির্বাচন করুন" /></SelectTrigger>
                <SelectContent>{classes?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>

              {selectedClass && examPatterns && examPatterns.length > 0 ? (
                <div className="space-y-3">
                  {examPatterns.map(pattern => (
                    <div key={pattern.id} className="border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" className="text-xs">{pattern.pattern_type}</Badge>
                        <span className="font-semibold text-sm">{pattern.name}</span>
                      </div>
                      {pattern.exam_terms && pattern.exam_terms.length > 0 ? (
                        <div className="flex flex-wrap gap-2 items-center">
                          {(pattern.exam_terms as any[]).sort((a: any, b: any) => (a.display_order || 0) - (b.display_order || 0)).map((term: any, idx: number) => (
                            <div key={term.id} className="flex items-center gap-1">
                              <div className="border rounded-md px-3 py-2 bg-background text-center">
                                <p className="text-sm font-medium">{term.name}</p>
                                <p className="text-xs text-muted-foreground">{term.weight}%</p>
                              </div>
                              {idx < pattern.exam_terms.length - 1 && (
                                <span className="text-muted-foreground text-lg font-bold">+</span>
                              )}
                            </div>
                          ))}
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          <div className="border-2 border-primary/30 rounded-md px-3 py-2 bg-primary/5 text-center">
                            <p className="text-sm font-bold text-primary">চূড়ান্ত ফলাফল</p>
                            <p className="text-xs text-muted-foreground">100%</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">কোন টার্ম কনফিগার করা হয়নি</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : selectedClass ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">এই শ্রেণীর জন্য কোন পরীক্ষা প্যাটার্ন নেই</p>
                  <Link to="/results/exam-patterns" className="text-primary text-sm underline">প্যাটার্ন তৈরি করুন</Link>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Rules & Ranking Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Target className="w-5 h-5 text-red-600" /> পাস ও র‍্যাংকিং নিয়ম</CardTitle>
              <CardDescription>শ্রেণী ভিত্তিক ফলাফল গণনার নিয়ম</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedClass && resultConfig ? (
                <div className="space-y-4">
                  {/* Pass Rules */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4 text-amber-500" /> পাসের শর্ত
                    </h4>
                    <ul className="space-y-1.5 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${resultConfig.absent_as_zero ? 'bg-red-500' : 'bg-green-500'}`} />
                        অনুপস্থিত = {resultConfig.absent_as_zero ? '০ (শূন্য) নম্বর' : 'গণনা থেকে বাদ'}
                      </li>
                      {resultConfig.practical_must_pass && (
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500" />
                          ব্যবহারিক বিষয়ে পাস বাধ্যতামূলক
                        </li>
                      )}
                      {resultConfig.grace_marks_enabled && (
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          গ্রেস মার্কস: {resultConfig.grace_marks} নম্বর
                        </li>
                      )}
                      {resultConfig.optional_subject_bonus && (
                        <li className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                          ঐচ্ছিক বিষয়ে বোনাস পয়েন্ট সক্রিয়
                        </li>
                      )}
                      <li className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500" />
                        যেকোনো বিষয়ে ফেল → সামগ্রিক ফেল
                      </li>
                    </ul>
                  </div>
                  <Separator />
                  {/* Ranking Rules */}
                  <div>
                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-600" /> র‍্যাংকিং অগ্রাধিকার
                    </h4>
                    {rankingPriority && rankingPriority.length > 0 ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        {rankingPriority.map((rule: string, idx: number) => (
                          <div key={rule} className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {idx + 1}. {rule === 'gpa' ? 'GPA' : rule === 'total_marks' ? 'মোট নম্বর' : rule === 'roll_number' ? 'রোল নম্বর' : rule}
                            </Badge>
                            {idx < rankingPriority.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">ডিফল্ট: GPA → মোট নম্বর → রোল নম্বর</p>
                    )}
                  </div>
                  <Separator />
                  {/* Grading Scale */}
                  {resultConfig.grading_scale && (
                    <div>
                      <h4 className="text-sm font-semibold mb-1 flex items-center gap-1">
                        <Award className="w-4 h-4 text-amber-500" /> গ্রেডিং স্কেল
                      </h4>
                      <Badge>{(resultConfig.grading_scale as any).name}</Badge>
                    </div>
                  )}
                </div>
              ) : selectedClass ? (
                <div className="text-center py-6 text-muted-foreground">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">এই শ্রেণীর জন্য কোন কনফিগ নেই</p>
                  <Link to="/results/config" className="text-primary text-sm underline">কনফিগ করুন</Link>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">উপরে শ্রেণী নির্বাচন করুন</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ═══════════════ SUBJECTS FOR SELECTED CLASS ═══════════════ */}
        {selectedClass && subjects && subjects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><BookOpen className="w-5 h-5 text-blue-600" /> বিষয় তালিকা ({subjects.length} টি)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {subjects.map(sub => (
                  <div key={sub.id} className="border rounded-lg p-3 bg-muted/20 text-center">
                    <p className="font-medium text-sm">{sub.name}</p>
                    {sub.name_bn && <p className="text-xs text-muted-foreground">{sub.name_bn}</p>}
                    <div className="flex justify-center gap-2 mt-1.5">
                      <Badge variant="outline" className="text-[10px]">পূর্ণ: {sub.full_marks}</Badge>
                      <Badge variant="outline" className="text-[10px]">পাস: {sub.pass_marks}</Badge>
                    </div>
                    <Badge className="mt-1.5 text-[10px]" variant={sub.subject_type === 'compulsory' ? 'default' : 'secondary'}>
                      {sub.subject_type === 'compulsory' ? 'আবশ্যিক' : 'ঐচ্ছিক'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ═══════════════ PUBLISH CONTROL ═══════════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-600" /> ফলাফল প্রকাশ নিয়ন্ত্রণ
            </CardTitle>
            <CardDescription>পরীক্ষা এবং শ্রেণী নির্বাচন করে ফলাফল প্রকাশ পরিচালনা করুন</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>পরীক্ষা</Label>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger><SelectValue placeholder="পরীক্ষা নির্বাচন" /></SelectTrigger>
                  <SelectContent>{exams?.map(e => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>শ্রেণী</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger><SelectValue placeholder="শ্রেণী নির্বাচন" /></SelectTrigger>
                  <SelectContent>{classes?.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <StatusBadge status={currentStatus} />
              </div>
            </div>

            {selectedExam && selectedClass && (
              <div className="flex gap-2 flex-wrap">
                {currentStatus === 'draft' && (
                  <Button variant="outline" onClick={() => handlePublishAction('reviewed')}>
                    <Eye className="w-4 h-4 mr-2" /> পর্যালোচনা
                  </Button>
                )}
                {currentStatus === 'reviewed' && (
                  <Button variant="outline" onClick={() => handlePublishAction('finalized')}>
                    <Lock className="w-4 h-4 mr-2" /> চূড়ান্ত করুন
                  </Button>
                )}
                {currentStatus === 'finalized' && (
                  <Button onClick={() => handlePublishAction('published')} className="bg-green-600 hover:bg-green-700 text-white">
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

        {/* ═══════════════ NAVIGATION LINKS ═══════════════ */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2"><FileText className="w-5 h-5" /> মডিউল নেভিগেশন</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { label: 'গ্রেডিং স্কেল', icon: Award, href: '/results/grading-scales', desc: 'GPA নিয়ম সেটআপ' },
                { label: 'বিষয় ব্যবস্থাপনা', icon: BookOpen, href: '/results/subjects', desc: 'বিষয় ও কম্পোনেন্ট' },
                { label: 'পরীক্ষা প্যাটার্ন', icon: Layers, href: '/results/exam-patterns', desc: 'পরীক্ষা কাঠামো' },
                { label: 'ফলাফল কনফিগ', icon: ClipboardCheck, href: '/results/config', desc: 'পাস/র‍্যাংকিং নিয়ম' },
                { label: 'নম্বর এন্ট্রি', icon: PenLine, href: '/results/marks-entry', desc: 'নম্বর লিপিবদ্ধ' },
                { label: 'ট্যাবুলেশন', icon: BarChart3, href: '/results/tabulation', desc: 'ফলাফল ও রিপোর্ট' },
              ].map(link => (
                <Link key={link.href} to={link.href}>
                  <div className="border rounded-lg p-4 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <link.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{link.label}</p>
                        <p className="text-xs text-muted-foreground">{link.desc}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ═══════════════ RECENT PUBLISH STATUS TABLE ═══════════════ */}
        {allPublishStatuses && allPublishStatuses.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-lg">সাম্প্রতিক প্রকাশনা স্ট্যাটাস</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>পরীক্ষা</TableHead>
                    <TableHead>শ্রেণী</TableHead>
                    <TableHead>স্ট্যাটাস</TableHead>
                    <TableHead>তারিখ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPublishStatuses.slice(0, 10).map(ps => (
                    <TableRow key={ps.id}>
                      <TableCell>{exams?.find(e => e.id === ps.exam_id)?.name || '-'}</TableCell>
                      <TableCell>{classes?.find(c => c.id === ps.class_id)?.name || '-'}</TableCell>
                      <TableCell><StatusBadge status={ps.status} /></TableCell>
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

// ═══════════════ SUB-COMPONENTS ═══════════════

function StatMini({ icon: Icon, label, value, color, bg }: { icon: any; label: string; value: number | string; color: string; bg: string }) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
    published: { label: '🟢 প্রকাশিত', variant: 'default' },
    finalized: { label: '🔒 চূড়ান্ত', variant: 'secondary' },
    reviewed: { label: '👁 পর্যালোচিত', variant: 'outline' },
    draft: { label: '📝 ড্রাফট', variant: 'outline' },
  };
  const info = map[status] || map.draft;
  return <Badge variant={info.variant} className="h-7">{info.label}</Badge>;
}

function QuickActionBtn({ href, icon: Icon, label, color }: { href: string; icon: any; label: string; color: string }) {
  return (
    <Link to={href}>
      <Button className={`w-full ${color} text-white`} size="sm">
        <Icon className="w-4 h-4 mr-1.5" /> {label}
      </Button>
    </Link>
  );
}
