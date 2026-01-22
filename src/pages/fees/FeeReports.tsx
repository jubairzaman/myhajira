import { useState, useRef } from 'react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { 
  Printer, 
  FileText, 
  Users, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Wallet,
  Clock,
  MessageSquare,
  Loader2,
  Search,
  User,
  CheckCircle,
  XCircle,
  MinusCircle,
  Download,
  Calendar
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useClassesQuery } from '@/hooks/queries/useClassesQuery';
import { 
  useClassCollectionReport, 
  useMonthlyCollectionSummary, 
  useDefaulterList,
  useFeeCollectionStats 
} from '@/hooks/queries/useFeeReports';
import { useStudentFeeHistory, useSearchStudentsForFee, useAcademicYears } from '@/hooks/queries/useStudentFeeHistory';
import { useSendBulkFeeDueSms } from '@/hooks/queries/useFeeDueSms';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const FeeReports = () => {
  const { activeYear } = useAcademicYear();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedFeeType, setSelectedFeeType] = useState<string>('');
  
  // Student report states
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>('');
  
  // PDF export ref
  const reportRef = useRef<HTMLDivElement>(null);

  const { data: academicYears } = useAcademicYears();
  const { data: classes, isLoading: classesLoading } = useClassesQuery();
  const { data: stats, isLoading: statsLoading } = useFeeCollectionStats();
  const { data: classReport, isLoading: classReportLoading } = useClassCollectionReport(
    selectedClass || null, 
    selectedMonth || null
  );
  const { data: monthlySummary, isLoading: monthlySummaryLoading } = useMonthlyCollectionSummary(
    selectedMonth || null
  );
  const { data: defaulters, isLoading: defaultersLoading } = useDefaulterList(
    selectedClass || undefined,
    selectedFeeType || undefined
  );
  const { data: searchResults, isLoading: searchLoading } = useSearchStudentsForFee(studentSearchTerm);
  // Use selected academic year or active year for fee history
  const yearIdForHistory = selectedAcademicYearId || activeYear?.id || null;
  const { data: studentFeeHistory, isLoading: studentHistoryLoading } = useStudentFeeHistory(
    selectedStudentId, 
    yearIdForHistory
  );
  const sendBulkSms = useSendBulkFeeDueSms();

  const handleSendBulkSms = async () => {
    if (!defaulters || defaulters.length === 0) return;
    
    // For now, we'll show a toast explaining the feature
    // Full implementation would require fetching guardian_mobile for each student
    const studentIds = [...new Set(defaulters.map(d => d.studentId))];
    
    // Fetch guardian mobiles for these students
    const { data: students } = await supabase
      .from('students')
      .select('id, name, name_bn, guardian_mobile, class:classes(name)')
      .in('id', studentIds);
    
    if (!students || students.length === 0) return;
    
    const smsData = students
      .filter((s: any) => s.guardian_mobile)
      .map((s: any) => {
        const studentDefaulters = defaulters.filter(d => d.studentId === s.id);
        const totalDue = studentDefaulters.reduce((sum, d) => sum + d.remaining, 0);
        return {
          studentId: s.id,
          studentName: s.name_bn || s.name,
          className: s.class?.name || '',
          dueAmount: totalDue,
          guardianMobile: s.guardian_mobile,
        };
      });
    
    if (smsData.length === 0) {
      return;
    }
    
    sendBulkSms.mutate({ students: smsData });
  };

  // Generate last 12 months
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy', { locale: bn }),
    };
  });

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = () => {
    // Using browser print to PDF functionality
    toast({
      title: "PDF এক্সপোর্ট",
      description: "প্রিন্ট ডায়ালগ থেকে 'Save as PDF' নির্বাচন করুন",
    });
    window.print();
  };

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setShowSearchResults(false);
    setStudentSearchTerm('');
    // Reset academic year to current when selecting new student
    setSelectedAcademicYearId('');
  };

  // Get selected academic year name
  const getSelectedYearName = () => {
    if (!selectedAcademicYearId) return activeYear?.name || '';
    return academicYears?.find(y => y.id === selectedAcademicYearId)?.name || '';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">পরিশোধিত</Badge>;
      case 'partial':
        return <Badge className="bg-amber-100 text-amber-800">আংশিক</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800">অপরিশোধিত</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial':
        return <MinusCircle className="h-4 w-4 text-amber-600" />;
      default:
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getFeeTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      admission: 'ভর্তি ফি',
      session: 'সেশন চার্জ',
      monthly: 'মাসিক বেতন',
      exam: 'পরীক্ষা ফি',
    };
    return labels[type] || type;
  };

  const formatMonth = (monthStr: string | null): string => {
    if (!monthStr) return '-';
    try {
      const date = new Date(monthStr + '-01');
      return format(date, 'MMMM yyyy', { locale: bn });
    } catch {
      return monthStr;
    }
  };

  return (
    <MainLayout title="ফি রিপোর্ট">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 no-print">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))
          ) : stats ? (
            <>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">মোট বকেয়া</p>
                    <p className="text-xl font-bold">৳ {stats.totalDue.toLocaleString('bn-BD')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">মোট আদায়</p>
                    <p className="text-xl font-bold text-green-600">৳ {stats.totalPaid.toLocaleString('bn-BD')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Wallet className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">অবশিষ্ট</p>
                    <p className="text-xl font-bold text-amber-600">৳ {stats.totalRemaining.toLocaleString('bn-BD')}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">বকেয়াদার</p>
                    <p className="text-xl font-bold text-red-600">{stats.unpaidCount + stats.partialCount}</p>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        {/* Reports Tabs */}
        <Tabs defaultValue="student-report" className="print-area">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 no-print">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="student-report" className="gap-2">
                <User className="h-4 w-4" />
                শিক্ষার্থী রিপোর্ট
              </TabsTrigger>
              <TabsTrigger value="class-report" className="gap-2">
                <FileText className="h-4 w-4" />
                শ্রেণী রিপোর্ট
              </TabsTrigger>
              <TabsTrigger value="monthly-summary" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                মাসিক সারাংশ
              </TabsTrigger>
              <TabsTrigger value="defaulters" className="gap-2">
                <AlertTriangle className="h-4 w-4" />
                বকেয়া তালিকা
              </TabsTrigger>
            </TabsList>

            <div className="flex gap-2">
              <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
                <Printer className="h-4 w-4" />
                প্রিন্ট
              </Button>
              <Button onClick={handleExportPdf} variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>

          {/* Student Report Tab */}
          <TabsContent value="student-report">
            <Card className="student-fee-report" ref={reportRef}>
              <CardHeader className="no-print">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5" />
                  শিক্ষার্থী ফি রিপোর্ট
                </CardTitle>
                <div className="flex flex-col md:flex-row gap-4 mt-4">
                  {/* Student Search */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="শিক্ষার্থীর আইডি বা নাম দিয়ে খুঁজুন..."
                      value={studentSearchTerm}
                      onChange={(e) => {
                        setStudentSearchTerm(e.target.value);
                        setShowSearchResults(true);
                      }}
                      className="pl-10"
                      onFocus={() => setShowSearchResults(true)}
                    />
                    
                    {/* Search Results Dropdown */}
                    {showSearchResults && studentSearchTerm.length >= 2 && (
                      <div className="absolute z-10 top-full left-0 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-64 overflow-y-auto">
                        {searchLoading ? (
                          <div className="p-4 text-center text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                            খোঁজা হচ্ছে...
                          </div>
                        ) : searchResults && searchResults.length > 0 ? (
                          searchResults.map((student) => (
                            <button
                              key={student.id}
                              className="w-full p-3 text-left hover:bg-muted flex items-center gap-3 border-b last:border-b-0"
                              onClick={() => handleSelectStudent(student.id)}
                            >
                              <div className="flex-1">
                                <p className="font-medium">{student.nameBn || student.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {student.studentIdNumber} • {student.className}
                                  {student.sectionName && ` - ${student.sectionName}`}
                                </p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-muted-foreground">
                            কোনো শিক্ষার্থী পাওয়া যায়নি
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Academic Year Selector */}
                  {selectedStudentId && (
                    <Select 
                      value={selectedAcademicYearId || activeYear?.id || ''} 
                      onValueChange={setSelectedAcademicYearId}
                    >
                      <SelectTrigger className="w-48">
                        <Calendar className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="শিক্ষাবর্ষ" />
                      </SelectTrigger>
                      <SelectContent>
                        {academicYears?.map((year) => (
                          <SelectItem key={year.id} value={year.id}>
                            {year.name} {year.is_active && '(বর্তমান)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!selectedStudentId ? (
                  <p className="text-center text-muted-foreground py-8">
                    শিক্ষার্থী খুঁজে নির্বাচন করুন
                  </p>
                ) : studentHistoryLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-32" />
                    <Skeleton className="h-64" />
                  </div>
                ) : studentFeeHistory ? (
                  <div className="space-y-6" ref={reportRef}>
                    {/* Student Info Header - For Print */}
                    <div className="print-header hidden print:block text-center mb-6">
                      <h1 className="text-xl font-bold">শিক্ষার্থী ফি রিপোর্ট</h1>
                      <p className="text-sm text-muted-foreground">শিক্ষাবর্ষ: {getSelectedYearName()}</p>
                    </div>

                    {/* Student Profile Card */}
                    <div className="flex flex-col md:flex-row gap-6 p-4 bg-muted/30 rounded-lg">
                      {studentFeeHistory.photoUrl && (
                        <img 
                          src={studentFeeHistory.photoUrl} 
                          alt="Student Photo"
                          className="w-24 h-28 object-cover rounded-lg border print:w-20 print:h-24"
                        />
                      )}
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">নাম</p>
                          <p className="font-medium">{studentFeeHistory.studentNameBn || studentFeeHistory.studentName}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">আইডি</p>
                          <p className="font-mono font-medium">{studentFeeHistory.studentIdNumber || '-'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">শ্রেণী</p>
                          <p className="font-medium">
                            {studentFeeHistory.classNameBn || studentFeeHistory.className}
                            {studentFeeHistory.sectionName && ` - ${studentFeeHistory.sectionName}`}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">অভিভাবকের মোবাইল</p>
                          <p className="font-mono font-medium">{studentFeeHistory.guardianMobile}</p>
                        </div>
                      </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">মোট ফি</p>
                        <p className="text-xl font-bold text-blue-700">
                          ৳ {studentFeeHistory.totalDue.toLocaleString('bn-BD')}
                        </p>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">জরিমানা</p>
                        <p className="text-xl font-bold text-amber-700">
                          ৳ {studentFeeHistory.totalLateFine.toLocaleString('bn-BD')}
                        </p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">পরিশোধিত</p>
                        <p className="text-xl font-bold text-green-700">
                          ৳ {studentFeeHistory.totalPaid.toLocaleString('bn-BD')}
                        </p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg text-center">
                        <p className="text-sm text-muted-foreground">বাকি</p>
                        <p className="text-xl font-bold text-red-700">
                          ৳ {studentFeeHistory.totalRemaining.toLocaleString('bn-BD')}
                        </p>
                      </div>
                    </div>

                    {/* Fee Records Table */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ফি টাইপ</TableHead>
                          <TableHead>মাস/পরীক্ষা</TableHead>
                          <TableHead className="text-right">ফি</TableHead>
                          <TableHead className="text-right">জরিমানা</TableHead>
                          <TableHead className="text-right">পরিশোধিত</TableHead>
                          <TableHead className="text-right">বাকি</TableHead>
                          <TableHead className="text-center">স্ট্যাটাস</TableHead>
                          <TableHead className="text-center no-print">রিসিপ্ট</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentFeeHistory.records.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">
                              {getFeeTypeLabel(record.feeType)}
                            </TableCell>
                            <TableCell>
                              {record.feeType === 'monthly' 
                                ? formatMonth(record.feeMonth)
                                : record.feeType === 'exam'
                                  ? record.examName || '-'
                                  : '-'
                              }
                            </TableCell>
                            <TableCell className="text-right font-mono">
                              ৳ {record.amountDue.toLocaleString('bn-BD')}
                            </TableCell>
                            <TableCell className="text-right font-mono text-amber-600">
                              ৳ {record.lateFine.toLocaleString('bn-BD')}
                            </TableCell>
                            <TableCell className="text-right font-mono text-green-600">
                              ৳ {record.amountPaid.toLocaleString('bn-BD')}
                            </TableCell>
                            <TableCell className="text-right font-mono text-red-600">
                              ৳ {record.remaining.toLocaleString('bn-BD')}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                {getStatusIcon(record.status)}
                                <span className="hidden md:inline text-xs">
                                  {record.status === 'paid' ? 'পরিশোধিত' : record.status === 'partial' ? 'আংশিক' : 'অপরিশোধিত'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-mono text-xs no-print">
                              {record.receiptNumber || '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    {/* Print Footer */}
                    <div className="hidden print:block mt-8 pt-4 border-t">
                      <div className="grid grid-cols-2 gap-8 mt-12">
                        <div className="text-center">
                          <div className="border-t border-black pt-2">
                            <p className="text-sm">অভিভাবকের স্বাক্ষর</p>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="border-t border-black pt-2">
                            <p className="text-sm">অফিস সিল ও স্বাক্ষর</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-center text-xs text-muted-foreground mt-8">
                        প্রিন্ট তারিখ: {format(new Date(), 'dd MMMM yyyy', { locale: bn })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    শিক্ষার্থীর তথ্য পাওয়া যায়নি
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Class Report */}
          <TabsContent value="class-report">
            <Card>
              <CardHeader className="no-print">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  শ্রেণী ভিত্তিক আদায় রিপোর্ট
                </CardTitle>
                <div className="flex gap-4 mt-4">
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="শ্রেণী নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes?.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name_bn || cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="মাস নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedClass ? (
                  <p className="text-center text-muted-foreground py-8">
                    শ্রেণী নির্বাচন করুন
                  </p>
                ) : classReportLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : classReport && classReport.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>শিক্ষার্থী</TableHead>
                          <TableHead>আইডি</TableHead>
                          <TableHead className="text-right">বকেয়া</TableHead>
                          <TableHead className="text-right">জরিমানা</TableHead>
                          <TableHead className="text-right">পরিশোধিত</TableHead>
                          <TableHead className="text-right">অবশিষ্ট</TableHead>
                          <TableHead className="text-center">স্ট্যাটাস</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {classReport.map((record) => (
                          <TableRow key={record.studentId}>
                            <TableCell className="font-medium">
                              {record.studentNameBn || record.studentName}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {record.studentIdNumber || '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              ৳ {record.totalDue.toLocaleString('bn-BD')}
                            </TableCell>
                            <TableCell className="text-right text-amber-600">
                              ৳ {record.totalLateFine.toLocaleString('bn-BD')}
                            </TableCell>
                            <TableCell className="text-right text-green-600 font-medium">
                              ৳ {record.totalPaid.toLocaleString('bn-BD')}
                            </TableCell>
                            <TableCell className="text-right text-red-600 font-medium">
                              ৳ {record.remaining.toLocaleString('bn-BD')}
                            </TableCell>
                            <TableCell className="text-center">
                              {getStatusBadge(record.status)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {/* Summary */}
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-sm text-muted-foreground">মোট বকেয়া</p>
                          <p className="font-bold">
                            ৳ {classReport.reduce((sum, r) => sum + r.totalDue, 0).toLocaleString('bn-BD')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">মোট জরিমানা</p>
                          <p className="font-bold text-amber-600">
                            ৳ {classReport.reduce((sum, r) => sum + r.totalLateFine, 0).toLocaleString('bn-BD')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">মোট আদায়</p>
                          <p className="font-bold text-green-600">
                            ৳ {classReport.reduce((sum, r) => sum + r.totalPaid, 0).toLocaleString('bn-BD')}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">মোট অবশিষ্ট</p>
                          <p className="font-bold text-red-600">
                            ৳ {classReport.reduce((sum, r) => sum + r.remaining, 0).toLocaleString('bn-BD')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    কোনো রেকর্ড পাওয়া যায়নি
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monthly Summary */}
          <TabsContent value="monthly-summary">
            <Card>
              <CardHeader className="no-print">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  মাসিক আদায় সারাংশ
                </CardTitle>
                <div className="mt-4">
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="মাস নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m) => (
                        <SelectItem key={m.value} value={m.value}>
                          {m.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {!selectedMonth ? (
                  <p className="text-center text-muted-foreground py-8">
                    মাস নির্বাচন করুন
                  </p>
                ) : monthlySummaryLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : monthlySummary && monthlySummary.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>শ্রেণী</TableHead>
                        <TableHead className="text-center">শিক্ষার্থী</TableHead>
                        <TableHead className="text-right">মোট বকেয়া</TableHead>
                        <TableHead className="text-right">মোট আদায়</TableHead>
                        <TableHead className="text-center">আদায় হার</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlySummary.map((row) => (
                        <TableRow key={row.classId}>
                          <TableCell className="font-medium">
                            {row.classNameBn || row.className}
                          </TableCell>
                          <TableCell className="text-center">
                            {row.totalStudents}
                          </TableCell>
                          <TableCell className="text-right">
                            ৳ {row.totalDue.toLocaleString('bn-BD')}
                          </TableCell>
                          <TableCell className="text-right text-green-600 font-medium">
                            ৳ {row.totalPaid.toLocaleString('bn-BD')}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              className={
                                row.collectionRate >= 80 
                                  ? 'bg-green-100 text-green-800' 
                                  : row.collectionRate >= 50 
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-red-100 text-red-800'
                              }
                            >
                              {row.collectionRate.toFixed(1)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    এই মাসের জন্য কোনো মাসিক ফি রেকর্ড নেই
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Defaulters List */}
          <TabsContent value="defaulters">
            <Card>
              <CardHeader className="no-print">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  বকেয়া তালিকা
                </CardTitle>
                <div className="flex gap-4 mt-4">
                  <Select value={selectedClass || 'all'} onValueChange={(val) => setSelectedClass(val === 'all' ? '' : val)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="সব শ্রেণী" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব শ্রেণী</SelectItem>
                      {classes?.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name_bn || cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedFeeType || 'all'} onValueChange={(val) => setSelectedFeeType(val === 'all' ? '' : val)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="সব ফি টাইপ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">সব ফি টাইপ</SelectItem>
                      <SelectItem value="admission">ভর্তি ফি</SelectItem>
                      <SelectItem value="session">সেশন চার্জ</SelectItem>
                      <SelectItem value="monthly">মাসিক বেতন</SelectItem>
                      <SelectItem value="exam">পরীক্ষা ফি</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendBulkSms}
                    disabled={!defaulters?.length || sendBulkSms.isPending}
                  >
                    {sendBulkSms.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <MessageSquare className="w-4 h-4 mr-2" />
                    )}
                    বকেয়া SMS
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {defaultersLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-12" />
                    ))}
                  </div>
                ) : defaulters && defaulters.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>শিক্ষার্থী</TableHead>
                        <TableHead>শ্রেণী</TableHead>
                        <TableHead>ফি টাইপ</TableHead>
                        <TableHead className="text-right">বকেয়া</TableHead>
                        <TableHead className="text-right">পরিশোধিত</TableHead>
                        <TableHead className="text-right">অবশিষ্ট</TableHead>
                        <TableHead className="text-center">
                          <Clock className="h-4 w-4 inline" /> দিন
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {defaulters.map((record, index) => (
                        <TableRow key={`${record.studentId}-${record.feeType}-${index}`}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{record.studentNameBn || record.studentName}</p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {record.studentIdNumber}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {record.className}
                            {record.sectionName && ` - ${record.sectionName}`}
                          </TableCell>
                          <TableCell>
                            {getFeeTypeLabel(record.feeType)}
                            {record.feeMonth && (
                              <span className="text-xs text-muted-foreground block">
                                {formatMonth(record.feeMonth)}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            ৳ {record.amountDue.toLocaleString('bn-BD')}
                          </TableCell>
                          <TableCell className="text-right text-green-600">
                            ৳ {record.amountPaid.toLocaleString('bn-BD')}
                          </TableCell>
                          <TableCell className="text-right text-red-600 font-medium">
                            ৳ {record.remaining.toLocaleString('bn-BD')}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={record.daysOverdue > 30 ? 'destructive' : 'secondary'}>
                              {record.daysOverdue}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    কোনো বকেয়াদার নেই 🎉
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default FeeReports;
