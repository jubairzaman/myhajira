import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, Plus, Pencil, Trash2, Save, GraduationCap, ClipboardList, Calendar, Loader2 } from 'lucide-react';
import { useClassesQuery } from '@/hooks/queries/useClassesQuery';
import {
  useFeeSettings,
  useUpsertFeeSettings,
  useClassMonthlyFees,
  useUpsertClassMonthlyFee,
  useExams,
  useCreateExam,
  useUpdateExam,
  useDeleteExam,
  type Exam,
} from '@/hooks/queries/useFeesQuery';
import { useBulkGenerateMonthlyFees, useBulkGenerateExamFees, useBulkGenerateAllMonthlyFees } from '@/hooks/queries/useBulkFeeGeneration';

// Bengali month names
const bengaliMonths = [
  { value: '01', label: 'জানুয়ারি' },
  { value: '02', label: 'ফেব্রুয়ারি' },
  { value: '03', label: 'মার্চ' },
  { value: '04', label: 'এপ্রিল' },
  { value: '05', label: 'মে' },
  { value: '06', label: 'জুন' },
  { value: '07', label: 'জুলাই' },
  { value: '08', label: 'আগস্ট' },
  { value: '09', label: 'সেপ্টেম্বর' },
  { value: '10', label: 'অক্টোবর' },
  { value: '11', label: 'নভেম্বর' },
  { value: '12', label: 'ডিসেম্বর' },
];

export default function FeeSettings() {
  // Fee Settings State
  const { data: feeSettings, isLoading: isLoadingSettings } = useFeeSettings();
  const upsertSettings = useUpsertFeeSettings();

  const [monthlyDueDate, setMonthlyDueDate] = useState(10);
  const [lateFineAmount, setLateFineAmount] = useState(50);
  const [lateFineEnabled, setLateFineEnabled] = useState(false);
  const [receiptCopyMode, setReceiptCopyMode] = useState<'single' | 'dual'>('dual');

  // Class Monthly Fees State
  const { data: classes, isLoading: isLoadingClasses } = useClassesQuery();
  const { data: classMonthlyFees, isLoading: isLoadingClassFees } = useClassMonthlyFees();
  const upsertClassFee = useUpsertClassMonthlyFee();
  const [classFees, setClassFees] = useState<Record<string, { amount: number; admissionFee: number; sessionCharge: number }>>({});

  // Exams State
  const { data: exams, isLoading: isLoadingExams } = useExams();
  const createExam = useCreateExam();
  const updateExam = useUpdateExam();
  const deleteExam = useDeleteExam();

  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [examName, setExamName] = useState('');
  const [examNameBn, setExamNameBn] = useState('');
  const [examFee, setExamFee] = useState(0);
  
  // Bulk fee generation state
  const [bulkMonth, setBulkMonth] = useState('');
  const [bulkYear, setBulkYear] = useState(new Date().getFullYear().toString());
  const [bulkClassId, setBulkClassId] = useState<string>('all');
  const [bulkExamId, setBulkExamId] = useState<string>('');
  
  const bulkGenerateMonthly = useBulkGenerateMonthlyFees();
  const bulkGenerateExam = useBulkGenerateExamFees();
  const bulkGenerateAllMonths = useBulkGenerateAllMonthlyFees();

  // Load Fee Settings
  useEffect(() => {
    if (feeSettings) {
      setMonthlyDueDate(feeSettings.monthly_due_date);
      setLateFineAmount(Number(feeSettings.late_fine_amount));
      setLateFineEnabled(feeSettings.late_fine_enabled);
      setReceiptCopyMode((feeSettings as any).receipt_copy_mode || 'dual');
    }
  }, [feeSettings]);

  // Load Class Monthly Fees
  useEffect(() => {
    if (classMonthlyFees) {
      const fees: Record<string, { amount: number; admissionFee: number; sessionCharge: number }> = {};
      classMonthlyFees.forEach((cf) => {
        fees[cf.class_id] = {
          amount: Number(cf.amount),
          admissionFee: Number(cf.admission_fee),
          sessionCharge: Number(cf.session_charge),
        };
      });
      setClassFees(fees);
    }
  }, [classMonthlyFees]);

  const handleSaveSettings = () => {
    upsertSettings.mutate({
      monthly_due_date: monthlyDueDate,
      late_fine_amount: lateFineAmount,
      late_fine_enabled: lateFineEnabled,
      receipt_copy_mode: receiptCopyMode,
    } as any);
  };

  const handleSaveClassFee = (classId: string) => {
    const fee = classFees[classId] || { amount: 0, admissionFee: 0, sessionCharge: 0 };
    upsertClassFee.mutate({ 
      classId, 
      amount: fee.amount,
      admissionFee: fee.admissionFee,
      sessionCharge: fee.sessionCharge
    });
  };

  const handleOpenExamDialog = (exam?: Exam) => {
    if (exam) {
      setEditingExam(exam);
      setExamName(exam.name);
      setExamNameBn(exam.name_bn || '');
      setExamFee(Number(exam.exam_fee_amount));
    } else {
      setEditingExam(null);
      setExamName('');
      setExamNameBn('');
      setExamFee(0);
    }
    setExamDialogOpen(true);
  };

  const handleSaveExam = () => {
    if (!examName.trim()) return;

    if (editingExam) {
      updateExam.mutate({
        id: editingExam.id,
        name: examName,
        name_bn: examNameBn || undefined,
        exam_fee_amount: examFee,
      });
    } else {
      createExam.mutate({
        name: examName,
        name_bn: examNameBn || undefined,
        exam_fee_amount: examFee,
      });
    }
    setExamDialogOpen(false);
  };

  const handleDeleteExam = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত এই পরীক্ষা মুছে ফেলতে চান?')) {
      deleteExam.mutate(id);
    }
  };
  
  const handleBulkGenerateMonthly = () => {
    if (!bulkMonth || !bulkYear) return;
    const month = `${bulkYear}-${bulkMonth}`;
    bulkGenerateMonthly.mutate({
      month,
      classId: bulkClassId === 'all' ? undefined : bulkClassId,
    });
  };
  
  const handleBulkGenerateExam = () => {
    if (!bulkExamId) return;
    bulkGenerateExam.mutate({
      examId: bulkExamId,
      classId: bulkClassId === 'all' ? undefined : bulkClassId,
    });
  };

  const sortedClasses = classes?.slice().sort((a, b) => a.grade_order - b.grade_order) || [];

  const isLoading = isLoadingSettings || isLoadingClasses || isLoadingClassFees || isLoadingExams;

  return (
    <MainLayout title="ফি সেটিংস">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">ফি সেটিংস</h1>
            <p className="text-muted-foreground">Fee Settings</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-6">
            {/* Late Fine Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  বিলম্ব জরিমানা সেটিংস
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-5">
                  <div className="flex items-center justify-between md:col-span-1">
                    <Label htmlFor="late-fine-enabled">জরিমানা সক্রিয়</Label>
                    <Switch
                      id="late-fine-enabled"
                      checked={lateFineEnabled}
                      onCheckedChange={setLateFineEnabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="due-date">মাসিক বকেয়া তারিখ</Label>
                    <Input
                      id="due-date"
                      type="number"
                      min={1}
                      max={31}
                      value={monthlyDueDate}
                      onChange={(e) => setMonthlyDueDate(Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fine-amount">জরিমানা পরিমাণ (টাকা)</Label>
                    <Input
                      id="fine-amount"
                      type="number"
                      min={0}
                      value={lateFineAmount}
                      onChange={(e) => setLateFineAmount(Number(e.target.value))}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleSaveSettings}
                      disabled={upsertSettings.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      সংরক্ষণ করুন
                    </Button>
                  </div>
                  <div className="flex items-center gap-3 md:col-span-1">
                    <Label>রিসিপ্ট কপি</Label>
                    <Select value={receiptCopyMode} onValueChange={(v) => setReceiptCopyMode(v as 'single' | 'dual')}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dual">২ কপি</SelectItem>
                        <SelectItem value="single">১ কপি</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Class-wise Fees */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  শ্রেণী ভিত্তিক ফি
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>শ্রেণী</TableHead>
                      <TableHead>ভর্তি ফি (টাকা)</TableHead>
                      <TableHead>সেশন চার্জ (টাকা)</TableHead>
                      <TableHead>মাসিক ফি (টাকা)</TableHead>
                      <TableHead className="w-24">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedClasses.map((cls) => (
                      <TableRow key={cls.id}>
                        <TableCell>
                          <span className="font-medium">{cls.name}</span>
                          {cls.name_bn && (
                            <span className="text-muted-foreground ml-2">({cls.name_bn})</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            className="w-28"
                            value={classFees[cls.id]?.admissionFee || 0}
                            onChange={(e) =>
                              setClassFees((prev) => ({
                                ...prev,
                                [cls.id]: {
                                  ...prev[cls.id],
                                  admissionFee: Number(e.target.value),
                                  amount: prev[cls.id]?.amount || 0,
                                  sessionCharge: prev[cls.id]?.sessionCharge || 0,
                                },
                              }))
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            className="w-28"
                            value={classFees[cls.id]?.sessionCharge || 0}
                            onChange={(e) =>
                              setClassFees((prev) => ({
                                ...prev,
                                [cls.id]: {
                                  ...prev[cls.id],
                                  sessionCharge: Number(e.target.value),
                                  amount: prev[cls.id]?.amount || 0,
                                  admissionFee: prev[cls.id]?.admissionFee || 0,
                                },
                              }))
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            className="w-28"
                            value={classFees[cls.id]?.amount || 0}
                            onChange={(e) =>
                              setClassFees((prev) => ({
                                ...prev,
                                [cls.id]: {
                                  ...prev[cls.id],
                                  amount: Number(e.target.value),
                                  admissionFee: prev[cls.id]?.admissionFee || 0,
                                  sessionCharge: prev[cls.id]?.sessionCharge || 0,
                                },
                              }))
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSaveClassFee(cls.id)}
                            disabled={upsertClassFee.isPending}
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Exams */}
            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ClipboardList className="w-5 h-5" />
                  পরীক্ষা ও ফি
                </CardTitle>
                <Button size="sm" onClick={() => handleOpenExamDialog()}>
                  <Plus className="w-4 h-4 mr-2" />
                  নতুন পরীক্ষা
                </Button>
              </CardHeader>
              <CardContent>
                {exams && exams.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>পরীক্ষার নাম</TableHead>
                        <TableHead>পরীক্ষার নাম (বাংলা)</TableHead>
                        <TableHead>ফি (টাকা)</TableHead>
                        <TableHead>স্ট্যাটাস</TableHead>
                        <TableHead className="w-24">অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exams.map((exam) => (
                        <TableRow key={exam.id}>
                          <TableCell className="font-medium">{exam.name}</TableCell>
                          <TableCell>{exam.name_bn || '-'}</TableCell>
                          <TableCell>৳ {Number(exam.exam_fee_amount).toLocaleString()}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                exam.is_active
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                              }`}
                            >
                              {exam.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleOpenExamDialog(exam)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive"
                                onClick={() => handleDeleteExam(exam.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    কোন পরীক্ষা যুক্ত করা হয়নি। উপরে "নতুন পরীক্ষা" বাটনে ক্লিক করুন।
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Bulk Fee Generation */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  বাল্ক ফি তৈরি
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Generate All Months at Once */}
                <div className="p-4 border rounded-lg space-y-4 bg-primary/5">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    সব মাসের ফি একসাথে তৈরি করুন
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    শিক্ষাবর্ষের সব মাসের জন্য সব শিক্ষার্থীর মাসিক ফি রেকর্ড একসাথে তৈরি করুন।
                    শিক্ষার্থীর ভর্তির মাস থেকে ফি গণনা শুরু হবে এবং কাস্টম ফি থাকলে সেটি ব্যবহার হবে।
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>শ্রেণী (ঐচ্ছিক)</Label>
                      <Select value={bulkClassId} onValueChange={setBulkClassId}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">সকল শ্রেণী</SelectItem>
                          {sortedClasses.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name} {cls.name_bn && `(${cls.name_bn})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={() => bulkGenerateAllMonths.mutate({ 
                          classId: bulkClassId === 'all' ? undefined : bulkClassId 
                        })}
                        disabled={bulkGenerateAllMonths.isPending}
                        className="w-full"
                        variant="default"
                      >
                        {bulkGenerateAllMonths.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        সব মাসের ফি তৈরি করুন
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Monthly Fee Generation - Single Month */}
                <div className="p-4 border rounded-lg space-y-4">
                  <h4 className="font-medium">নির্দিষ্ট মাসের ফি তৈরি করুন</h4>
                  <p className="text-sm text-muted-foreground">
                    নির্দিষ্ট একটি মাসের জন্য সব শিক্ষার্থীর মাসিক ফি রেকর্ড তৈরি করুন
                  </p>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label>মাস</Label>
                      <Select value={bulkMonth} onValueChange={setBulkMonth}>
                        <SelectTrigger>
                          <SelectValue placeholder="মাস নির্বাচন" />
                        </SelectTrigger>
                        <SelectContent>
                          {bengaliMonths.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>বছর</Label>
                      <Select value={bulkYear} onValueChange={setBulkYear}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[2024, 2025, 2026].map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>শ্রেণী (ঐচ্ছিক)</Label>
                      <Select value={bulkClassId} onValueChange={setBulkClassId}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">সকল শ্রেণী</SelectItem>
                          {sortedClasses.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name} {cls.name_bn && `(${cls.name_bn})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        onClick={handleBulkGenerateMonthly}
                        disabled={!bulkMonth || bulkGenerateMonthly.isPending}
                        className="w-full"
                        variant="outline"
                      >
                        {bulkGenerateMonthly.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4 mr-2" />
                        )}
                        তৈরি করুন
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Exam Fee Generation */}
                {exams && exams.length > 0 && (
                  <div className="p-4 border rounded-lg space-y-4">
                    <h4 className="font-medium">পরীক্ষা ফি তৈরি করুন</h4>
                    <p className="text-sm text-muted-foreground">
                      নির্দিষ্ট পরীক্ষার জন্য সব শিক্ষার্থীর পরীক্ষা ফি রেকর্ড একসাথে তৈরি করুন
                    </p>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>পরীক্ষা</Label>
                        <Select value={bulkExamId} onValueChange={setBulkExamId}>
                          <SelectTrigger>
                            <SelectValue placeholder="পরীক্ষা নির্বাচন" />
                          </SelectTrigger>
                          <SelectContent>
                            {exams.filter(e => e.is_active).map((exam) => (
                              <SelectItem key={exam.id} value={exam.id}>
                                {exam.name_bn || exam.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>শ্রেণী (ঐচ্ছিক)</Label>
                        <Select value={bulkClassId} onValueChange={setBulkClassId}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">সকল শ্রেণী</SelectItem>
                            {sortedClasses.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.name} {cls.name_bn && `(${cls.name_bn})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <Button 
                          onClick={handleBulkGenerateExam}
                          disabled={!bulkExamId || bulkGenerateExam.isPending}
                          className="w-full"
                        >
                          {bulkGenerateExam.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Plus className="w-4 h-4 mr-2" />
                          )}
                          তৈরি করুন
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Exam Dialog */}
        <Dialog open={examDialogOpen} onOpenChange={setExamDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingExam ? 'পরীক্ষা সম্পাদনা' : 'নতুন পরীক্ষা যুক্ত করুন'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="exam-name">পরীক্ষার নাম (English)</Label>
                <Input
                  id="exam-name"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  placeholder="Half Yearly"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exam-name-bn">পরীক্ষার নাম (বাংলা)</Label>
                <Input
                  id="exam-name-bn"
                  value={examNameBn}
                  onChange={(e) => setExamNameBn(e.target.value)}
                  placeholder="অর্ধ-বার্ষিক"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="exam-fee">পরীক্ষা ফি (টাকা)</Label>
                <Input
                  id="exam-fee"
                  type="number"
                  min={0}
                  value={examFee}
                  onChange={(e) => setExamFee(Number(e.target.value))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setExamDialogOpen(false)}>
                বাতিল
              </Button>
              <Button onClick={handleSaveExam} disabled={!examName.trim()}>
                সংরক্ষণ করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
