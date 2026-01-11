import { useState } from 'react';
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
  Clock
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useClassesQuery } from '@/hooks/queries/useClassesQuery';
import { 
  useClassCollectionReport, 
  useMonthlyCollectionSummary, 
  useDefaulterList,
  useFeeCollectionStats 
} from '@/hooks/queries/useFeeReports';

const FeeReports = () => {
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedFeeType, setSelectedFeeType] = useState<string>('');

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

  const getFeeTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      admission: 'ভর্তি ফি',
      session: 'সেশন চার্জ',
      monthly: 'মাসিক বেতন',
      exam: 'পরীক্ষা ফি',
    };
    return labels[type] || type;
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
        <Tabs defaultValue="class-report" className="print-area">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 no-print">
            <TabsList>
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

            <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
              <Printer className="h-4 w-4" />
              প্রিন্ট করুন
            </Button>
          </div>

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
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="সব শ্রেণী" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">সব শ্রেণী</SelectItem>
                      {classes?.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name_bn || cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedFeeType} onValueChange={setSelectedFeeType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="সব ফি টাইপ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">সব ফি টাইপ</SelectItem>
                      <SelectItem value="admission">ভর্তি ফি</SelectItem>
                      <SelectItem value="session">সেশন চার্জ</SelectItem>
                      <SelectItem value="monthly">মাসিক বেতন</SelectItem>
                      <SelectItem value="exam">পরীক্ষা ফি</SelectItem>
                    </SelectContent>
                  </Select>
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
                                {format(new Date(record.feeMonth + '-01'), 'MMM yyyy', { locale: bn })}
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
