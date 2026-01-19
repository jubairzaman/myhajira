import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Search,
  CreditCard,
  User,
  Phone,
  GraduationCap,
  Receipt,
  Printer,
  AlertCircle,
  Plus,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import {
  useSearchStudent,
  useStudentFeeRecords,
  useCollectFee,
  useCollectMultipleFees,
  useCreateFeeRecord,
  type StudentWithFees,
  type StudentFeeRecord,
} from '@/hooks/queries/useFeeCollection';
import { useFeeSettings } from '@/hooks/queries/useFeesQuery';
import { ReceiptPrint, type ReceiptData } from '@/components/fees/ReceiptPrint';

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

export default function FeeCollection() {
  const { activeYear } = useAcademicYear();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentWithFees | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<StudentFeeRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [lateFine, setLateFine] = useState(0);
  const [autoLateFineApplied, setAutoLateFineApplied] = useState(false);
  
  // Multi-select for batch payment
  const [selectedRecordIds, setSelectedRecordIds] = useState<Set<string>>(new Set());
  const [multiPaymentDialogOpen, setMultiPaymentDialogOpen] = useState(false);
  
  // Receipt print state
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  
  // Add new fee dialog state
  const [addFeeDialogOpen, setAddFeeDialogOpen] = useState(false);
  const [newFeeType, setNewFeeType] = useState<'monthly' | 'admission' | 'session' | 'exam'>('monthly');
  const [newFeeMonth, setNewFeeMonth] = useState('');
  const [newFeeYear, setNewFeeYear] = useState(new Date().getFullYear().toString());
  const [newFeeAmount, setNewFeeAmount] = useState(0);
  const [newFeeExamId, setNewFeeExamId] = useState('');
  
  // Class fees and exams
  const [classFee, setClassFee] = useState<{ amount: number; admission_fee: number; session_charge: number } | null>(null);
  const [exams, setExams] = useState<{ id: string; name: string; name_bn: string | null; exam_fee_amount: number }[]>([]);

  // Fee settings for late fine
  const { data: feeSettings } = useFeeSettings();

  const searchMutation = useSearchStudent();
  const { data: feeRecords, isLoading: isLoadingRecords } = useStudentFeeRecords(
    selectedStudent?.id
  );
  const collectFee = useCollectFee();
  const collectMultipleFees = useCollectMultipleFees();
  const createFeeRecord = useCreateFeeRecord();

  // Fetch class fees when student is selected
  useEffect(() => {
    const fetchClassFee = async () => {
      if (!selectedStudent?.class?.id || !activeYear?.id) {
        setClassFee(null);
        return;
      }

      const { data } = await supabase
        .from('class_monthly_fees')
        .select('amount, admission_fee, session_charge')
        .eq('class_id', selectedStudent.class.id)
        .eq('academic_year_id', activeYear.id)
        .maybeSingle();

      setClassFee(data);
    };

    fetchClassFee();
  }, [selectedStudent?.class?.id, activeYear?.id]);

  // Fetch exams
  useEffect(() => {
    const fetchExams = async () => {
      if (!activeYear?.id) return;

      const { data } = await supabase
        .from('exams')
        .select('id, name, name_bn, exam_fee_amount')
        .eq('academic_year_id', activeYear.id)
        .eq('is_active', true);

      setExams(data || []);
    };

    fetchExams();
  }, [activeYear?.id]);

  // Auto-fill amount when fee type or exam changes
  useEffect(() => {
    if (newFeeType === 'monthly' && classFee) {
      setNewFeeAmount(classFee.amount);
    } else if (newFeeType === 'admission' && classFee) {
      setNewFeeAmount(classFee.admission_fee);
    } else if (newFeeType === 'session' && classFee) {
      setNewFeeAmount(classFee.session_charge);
    } else if (newFeeType === 'exam' && newFeeExamId) {
      const exam = exams.find(e => e.id === newFeeExamId);
      if (exam) {
        setNewFeeAmount(exam.exam_fee_amount);
      }
    }
  }, [newFeeType, classFee, newFeeExamId, exams]);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    searchMutation.mutate(searchTerm, {
      onSuccess: (student) => {
        setSelectedStudent(student);
        if (!student) {
          // Show not found message handled in UI
        }
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleOpenPayment = (record: StudentFeeRecord) => {
    setSelectedRecord(record);
    const remaining = Number(record.amount_due) - Number(record.amount_paid);
    setPaymentAmount(remaining > 0 ? remaining : 0);
    
    // Auto-calculate late fine
    let autoFine = Number(record.late_fine) || 0;
    setAutoLateFineApplied(false);
    
    if (feeSettings?.late_fine_enabled && record.fee_type === 'monthly' && record.fee_month) {
      const today = new Date();
      const feeMonthDate = new Date(record.fee_month);
      const dueDate = new Date(feeMonthDate.getFullYear(), feeMonthDate.getMonth(), feeSettings.monthly_due_date);
      
      // If today is past the due date and no late fine already applied
      if (today > dueDate && Number(record.late_fine) === 0) {
        autoFine = Number(feeSettings.late_fine_amount);
        setAutoLateFineApplied(true);
      }
    }
    
    setLateFine(autoFine);
    setPaymentDialogOpen(true);
  };

  // Toggle record selection for multi-payment
  const toggleRecordSelection = (recordId: string) => {
    const newSelected = new Set(selectedRecordIds);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecordIds(newSelected);
  };

  // Get selected unpaid records
  const selectedUnpaidRecords = feeRecords?.filter(
    r => selectedRecordIds.has(r.id) && r.status !== 'paid'
  ) || [];

  // Calculate total for selected records
  const selectedTotal = selectedUnpaidRecords.reduce((sum, r) => {
    return sum + (Number(r.amount_due) - Number(r.amount_paid));
  }, 0);

  // Handle multi-payment
  const handleMultiPayment = () => {
    if (selectedUnpaidRecords.length === 0) return;

    const recordsToCollect = selectedUnpaidRecords.map(r => ({
      id: r.id,
      amountToPay: Number(r.amount_due) - Number(r.amount_paid),
    }));

    collectMultipleFees.mutate(
      { records: recordsToCollect },
      {
        onSuccess: (result) => {
          setMultiPaymentDialogOpen(false);
          setSelectedRecordIds(new Set());
          
          // Prepare receipt data for multi-item
          if (selectedStudent) {
            setReceiptData({
              receiptNumber: result.receiptNumber,
              paymentDate: new Date().toISOString(),
              studentName: selectedStudent.name,
              studentNameBn: selectedStudent.name_bn || undefined,
              className: selectedStudent.class?.name || '',
              classNameBn: selectedStudent.class?.name_bn || undefined,
              sectionName: selectedStudent.section?.name || undefined,
              studentId: selectedStudent.student_id_number || undefined,
              feeType: 'multiple',
              amountDue: selectedTotal,
              amountPaid: selectedTotal,
              lateFine: 0,
            });
            setReceiptOpen(true);
          }
        },
      }
    );
  };

  const handleCollectPayment = () => {
    if (!selectedRecord || paymentAmount <= 0) return;

    collectFee.mutate(
      {
        recordId: selectedRecord.id,
        amountPaid: paymentAmount,
        lateFine,
      },
      {
        onSuccess: (updatedRecord) => {
          setPaymentDialogOpen(false);
          setSelectedRecord(null);
          
          // Prepare receipt data for printing
          if (selectedStudent && updatedRecord) {
            setReceiptData({
              receiptNumber: updatedRecord.receipt_number || `RCP-${Date.now()}`,
              paymentDate: new Date().toISOString(),
              studentName: selectedStudent.name,
              studentNameBn: selectedStudent.name_bn || undefined,
              className: selectedStudent.class?.name || '',
              classNameBn: selectedStudent.class?.name_bn || undefined,
              sectionName: selectedStudent.section?.name || undefined,
              studentId: selectedStudent.student_id_number || undefined,
              feeType: updatedRecord.fee_type,
              feeMonth: updatedRecord.fee_month || undefined,
              amountDue: Number(updatedRecord.amount_due),
              amountPaid: Number(updatedRecord.amount_paid),
              lateFine: Number(updatedRecord.late_fine),
            });
            setReceiptOpen(true);
          }
        },
      }
    );
  };
  
  const handlePrintReceipt = (record: StudentFeeRecord) => {
    if (!selectedStudent) return;
    
    setReceiptData({
      receiptNumber: record.receipt_number || `RCP-${Date.now()}`,
      paymentDate: record.payment_date || new Date().toISOString(),
      studentName: selectedStudent.name,
      studentNameBn: selectedStudent.name_bn || undefined,
      className: selectedStudent.class?.name || '',
      classNameBn: selectedStudent.class?.name_bn || undefined,
      sectionName: selectedStudent.section?.name || undefined,
      studentId: selectedStudent.student_id_number || undefined,
      feeType: record.fee_type,
      feeMonth: record.fee_month || undefined,
      examName: record.exam?.name_bn || record.exam?.name || undefined,
      amountDue: Number(record.amount_due),
      amountPaid: Number(record.amount_paid),
      lateFine: Number(record.late_fine),
    });
    setReceiptOpen(true);
  };
  
  const handleAddNewFee = () => {
    if (!selectedStudent || newFeeAmount <= 0) return;
    
    let feeMonth: string | undefined;
    let examId: string | undefined;
    
    if (newFeeType === 'monthly' && newFeeMonth && newFeeYear) {
      feeMonth = `${newFeeYear}-${newFeeMonth}-01`;
    }
    
    if (newFeeType === 'exam') {
      examId = newFeeExamId;
    }
    
    createFeeRecord.mutate(
      {
        studentId: selectedStudent.id,
        feeType: newFeeType,
        amountDue: newFeeAmount,
        feeMonth,
        examId,
      },
      {
        onSuccess: () => {
          setAddFeeDialogOpen(false);
          setNewFeeType('monthly');
          setNewFeeMonth('');
          setNewFeeAmount(0);
          setNewFeeExamId('');
        },
      }
    );
  };

  const getFeeTypeLabel = (type: string) => {
    switch (type) {
      case 'monthly':
        return 'মাসিক ফি';
      case 'admission':
        return 'ভর্তি ফি';
      case 'session':
        return 'সেশন চার্জ';
      case 'exam':
        return 'পরীক্ষা ফি';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">পরিশোধিত</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">আংশিক</Badge>;
      case 'unpaid':
        return <Badge variant="destructive">বকেয়া</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatMonth = (dateStr: string | null) => {
    if (!dateStr) return '-';
    try {
      return format(new Date(dateStr), 'MMMM yyyy', { locale: bn });
    } catch {
      return dateStr;
    }
  };

  // Get monthly fee status for visual cards
  const getMonthlyFeeStatus = () => {
    if (!feeRecords) return [];
    const monthlyRecords = feeRecords.filter(r => r.fee_type === 'monthly');
    return bengaliMonths.map(month => {
      const record = monthlyRecords.find(r => {
        if (!r.fee_month) return false;
        return r.fee_month.substring(5, 7) === month.value;
      });
      return {
        month: month.value,
        label: month.label,
        status: record?.status || null,
        record
      };
    });
  };

  // Calculate totals
  const totalDue = feeRecords?.reduce((sum, r) => sum + Number(r.amount_due), 0) || 0;
  const totalPaid = feeRecords?.reduce((sum, r) => sum + Number(r.amount_paid), 0) || 0;
  const totalRemaining = totalDue - totalPaid;
  const monthlyFeeStatus = getMonthlyFeeStatus();

  return (
    <MainLayout title="ফি আদায়">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">ফি আদায়</h1>
            <p className="text-muted-foreground">Fee Collection</p>
          </div>
        </div>

        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5" />
              শিক্ষার্থী খুঁজুন
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Student ID বা RFID Card নম্বর দিন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-lg h-12"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={searchMutation.isPending}
                size="lg"
                className="px-8"
              >
                <Search className="w-5 h-5 mr-2" />
                খুঁজুন
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search Result */}
        {searchMutation.isPending && (
          <Card>
            <CardContent className="py-8">
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span>খুঁজছি...</span>
              </div>
            </CardContent>
          </Card>
        )}

        {searchMutation.isSuccess && !selectedStudent && (
          <Card>
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <AlertCircle className="w-12 h-12" />
                <p className="text-lg">কোন শিক্ষার্থী পাওয়া যায়নি</p>
                <p className="text-sm">সঠিক Student ID বা RFID নম্বর দিয়ে আবার চেষ্টা করুন</p>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedStudent && (
          <>
            {/* Student Info Card */}
            <Card>
              <CardContent className="py-6">
                <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                  <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
                    <AvatarImage src={selectedStudent.photo_url || undefined} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {selectedStudent.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <User className="w-4 h-4" />
                        নাম
                      </div>
                      <p className="font-semibold text-lg">{selectedStudent.name}</p>
                      {selectedStudent.name_bn && (
                        <p className="text-muted-foreground">{selectedStudent.name_bn}</p>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <GraduationCap className="w-4 h-4" />
                        শ্রেণী
                      </div>
                      <p className="font-semibold">
                        {selectedStudent.class?.name || '-'}
                        {selectedStudent.section && ` (${selectedStudent.section.name})`}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {selectedStudent.shift?.name || ''}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <CreditCard className="w-4 h-4" />
                        Student ID
                      </div>
                      <p className="font-semibold font-mono">
                        {selectedStudent.student_id_number || '-'}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm">
                        <Phone className="w-4 h-4" />
                        অভিভাবক মোবাইল
                      </div>
                      <p className="font-semibold">{selectedStudent.guardian_mobile}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Summary Cards */}
            <div className="grid gap-4 grid-cols-3">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="py-4 text-center">
                  <div className="text-sm text-muted-foreground">মোট বকেয়া</div>
                  <div className="text-xl sm:text-2xl font-bold text-primary">
                    ৳ {totalDue.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
                <CardContent className="py-4 text-center">
                  <div className="text-sm text-muted-foreground">মোট পরিশোধিত</div>
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    ৳ {totalPaid.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800">
                <CardContent className="py-4 text-center">
                  <div className="text-sm text-muted-foreground">অবশিষ্ট বকেয়া</div>
                  <div className="text-xl sm:text-2xl font-bold text-destructive">
                    ৳ {totalRemaining.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Fee Visual Cards */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  মাসিক ফি স্ট্যাটাস
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
                  {monthlyFeeStatus.map(({ month, label, status, record }) => (
                    <button
                      key={month}
                      type="button"
                      onClick={() => record && record.status !== 'paid' && handleOpenPayment(record)}
                      disabled={!record || status === 'paid'}
                      className={`
                        p-2 sm:p-3 rounded-lg border-2 text-center transition-all
                        ${status === 'paid' 
                          ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700' 
                          : status === 'partial'
                            ? 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700 cursor-pointer hover:border-yellow-500'
                            : status === 'unpaid'
                              ? 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700 cursor-pointer hover:border-red-500'
                              : 'bg-muted/50 border-muted-foreground/20'
                        }
                      `}
                    >
                      <div className="font-bengali text-xs sm:text-sm font-medium truncate">{label}</div>
                      <div className="mt-1">
                        {status === 'paid' && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-green-600" />}
                        {status === 'partial' && <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-yellow-600" />}
                        {status === 'unpaid' && <XCircle className="w-4 h-4 sm:w-5 sm:h-5 mx-auto text-red-600" />}
                        {!status && <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Fee Records Table */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Receipt className="w-5 h-5" />
                    সকল ফি রেকর্ড
                  </CardTitle>
                  <div className="flex gap-2">
                    {selectedUnpaidRecords.length > 0 && (
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={() => setMultiPaymentDialogOpen(true)}
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        নির্বাচিত ({selectedUnpaidRecords.length}) আদায় করুন
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => setAddFeeDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      নতুন ফি
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingRecords ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : feeRecords && feeRecords.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-10">
                            <input
                              type="checkbox"
                              className="rounded border-muted-foreground"
                              checked={feeRecords?.filter(r => r.status !== 'paid').every(r => selectedRecordIds.has(r.id)) || false}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedRecordIds(new Set(feeRecords?.filter(r => r.status !== 'paid').map(r => r.id) || []));
                                } else {
                                  setSelectedRecordIds(new Set());
                                }
                              }}
                            />
                          </TableHead>
                          <TableHead>ফি এর ধরন</TableHead>
                          <TableHead className="hidden sm:table-cell">মাস/পরীক্ষা</TableHead>
                          <TableHead className="text-right">বকেয়া</TableHead>
                          <TableHead className="text-right hidden md:table-cell">পরিশোধিত</TableHead>
                          <TableHead className="hidden lg:table-cell">স্ট্যাটাস</TableHead>
                          <TableHead className="w-24">অ্যাকশন</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feeRecords.map((record) => (
                          <TableRow key={record.id} className={selectedRecordIds.has(record.id) ? 'bg-primary/5' : ''}>
                            <TableCell>
                              {record.status !== 'paid' && (
                                <input
                                  type="checkbox"
                                  className="rounded border-muted-foreground"
                                  checked={selectedRecordIds.has(record.id)}
                                  onChange={() => toggleRecordSelection(record.id)}
                                />
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              <div>{getFeeTypeLabel(record.fee_type)}</div>
                              <div className="text-xs text-muted-foreground sm:hidden">
                                {record.fee_type === 'exam' && record.exam
                                  ? record.exam.name_bn || record.exam.name
                                  : formatMonth(record.fee_month)}
                              </div>
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {record.fee_type === 'exam' && record.exam
                                ? record.exam.name_bn || record.exam.name
                                : formatMonth(record.fee_month)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div>৳ {Number(record.amount_due).toLocaleString()}</div>
                              {Number(record.late_fine) > 0 && (
                                <div className="text-xs text-destructive">
                                  +৳{Number(record.late_fine)} জরিমানা
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right hidden md:table-cell">
                              ৳ {Number(record.amount_paid).toLocaleString()}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">{getStatusBadge(record.status)}</TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {record.status !== 'paid' && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleOpenPayment(record)}
                                  >
                                    আদায়
                                  </Button>
                                )}
                                {record.amount_paid > 0 && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handlePrintReceipt(record)}
                                  >
                                    <Printer className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>এই শিক্ষার্থীর কোন ফি রেকর্ড নেই</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => setAddFeeDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      নতুন ফি যুক্ত করুন
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        {/* Payment Dialog */}
        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ফি আদায়</DialogTitle>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <div className="text-sm text-muted-foreground">ফি এর ধরন</div>
                    <div className="font-semibold">{getFeeTypeLabel(selectedRecord.fee_type)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">মোট বকেয়া</div>
                    <div className="font-semibold">
                      ৳ {Number(selectedRecord.amount_due).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">পূর্বে পরিশোধিত</div>
                    <div className="font-semibold">
                      ৳ {Number(selectedRecord.amount_paid).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">অবশিষ্ট</div>
                    <div className="font-semibold text-destructive">
                      ৳{' '}
                      {(
                        Number(selectedRecord.amount_due) - Number(selectedRecord.amount_paid)
                      ).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment-amount">আদায়ের পরিমাণ (টাকা)</Label>
                  <Input
                    id="payment-amount"
                    type="number"
                    min={0}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="late-fine" className="flex items-center gap-2">
                    বিলম্ব জরিমানা (টাকা)
                    {autoLateFineApplied && (
                      <Badge variant="secondary" className="text-xs">স্বয়ংক্রিয়</Badge>
                    )}
                  </Label>
                  <Input
                    id="late-fine"
                    type="number"
                    min={0}
                    value={lateFine}
                    onChange={(e) => setLateFine(Number(e.target.value))}
                  />
                </div>

                <div className="p-4 bg-primary/10 rounded-lg">
                  <div className="text-sm text-muted-foreground">মোট আদায়</div>
                  <div className="text-2xl font-bold text-primary">
                    ৳ {(paymentAmount + lateFine).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                বাতিল
              </Button>
              <Button onClick={handleCollectPayment} disabled={collectFee.isPending}>
                <CreditCard className="w-4 h-4 mr-2" />
                আদায় করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Multi-Payment Dialog */}
        <Dialog open={multiPaymentDialogOpen} onOpenChange={setMultiPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>একাধিক ফি আদায়</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">নির্বাচিত আইটেম</div>
                <div className="font-semibold">{selectedUnpaidRecords.length}টি ফি রেকর্ড</div>
              </div>
              <div className="space-y-2">
                {selectedUnpaidRecords.map(record => (
                  <div key={record.id} className="flex justify-between p-2 border rounded">
                    <span>{getFeeTypeLabel(record.fee_type)}</span>
                    <span>৳ {(Number(record.amount_due) - Number(record.amount_paid)).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="text-sm text-muted-foreground">মোট আদায়</div>
                <div className="text-2xl font-bold text-primary">
                  ৳ {selectedTotal.toLocaleString()}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setMultiPaymentDialogOpen(false)}>
                বাতিল
              </Button>
              <Button onClick={handleMultiPayment} disabled={collectMultipleFees.isPending}>
                <CreditCard className="w-4 h-4 mr-2" />
                সব আদায় করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Add New Fee Dialog */}
        <Dialog open={addFeeDialogOpen} onOpenChange={setAddFeeDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>নতুন ফি যুক্ত করুন</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>ফি এর ধরন</Label>
                <Select 
                  value={newFeeType} 
                  onValueChange={(v) => setNewFeeType(v as typeof newFeeType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">মাসিক ফি</SelectItem>
                    <SelectItem value="admission">ভর্তি ফি</SelectItem>
                    <SelectItem value="session">সেশন চার্জ</SelectItem>
                    <SelectItem value="exam">পরীক্ষা ফি</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newFeeType === 'monthly' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>মাস</Label>
                    <Select value={newFeeMonth} onValueChange={setNewFeeMonth}>
                      <SelectTrigger>
                        <SelectValue placeholder="মাস নির্বাচন করুন" />
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
                    <Select value={newFeeYear} onValueChange={setNewFeeYear}>
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
                </div>
              )}
              
              {newFeeType === 'exam' && (
                <div className="space-y-2">
                  <Label>পরীক্ষা</Label>
                  <Select value={newFeeExamId} onValueChange={setNewFeeExamId}>
                    <SelectTrigger>
                      <SelectValue placeholder="পরীক্ষা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id}>
                          {exam.name_bn || exam.name} (৳{exam.exam_fee_amount})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="space-y-2">
                <Label>বকেয়া পরিমাণ (টাকা)</Label>
                <Input
                  type="number"
                  min={0}
                  value={newFeeAmount}
                  onChange={(e) => setNewFeeAmount(Number(e.target.value))}
                  placeholder="টাকার পরিমাণ লিখুন"
                />
                {classFee && (
                  <p className="text-xs text-muted-foreground">
                    {newFeeType === 'monthly' && `ডিফল্ট মাসিক ফি: ৳${classFee.amount}`}
                    {newFeeType === 'admission' && `ডিফল্ট ভর্তি ফি: ৳${classFee.admission_fee}`}
                    {newFeeType === 'session' && `ডিফল্ট সেশন চার্জ: ৳${classFee.session_charge}`}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddFeeDialogOpen(false)}>
                বাতিল
              </Button>
              <Button 
                onClick={handleAddNewFee} 
                disabled={createFeeRecord.isPending || newFeeAmount <= 0}
              >
                <Plus className="w-4 h-4 mr-2" />
                যুক্ত করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Receipt Print Dialog */}
        <ReceiptPrint 
          open={receiptOpen} 
          onOpenChange={setReceiptOpen} 
          data={receiptData}
        />
      </div>
    </MainLayout>
  );
}
