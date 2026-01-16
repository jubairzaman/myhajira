import { useState } from 'react';
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
} from 'lucide-react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import {
  useSearchStudent,
  useStudentFeeRecords,
  useCollectFee,
  useCreateFeeRecord,
  type StudentWithFees,
  type StudentFeeRecord,
} from '@/hooks/queries/useFeeCollection';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentWithFees | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<StudentFeeRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [lateFine, setLateFine] = useState(0);
  
  // Receipt print state
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  
  // Add new fee dialog state
  const [addFeeDialogOpen, setAddFeeDialogOpen] = useState(false);
  const [newFeeType, setNewFeeType] = useState<'monthly' | 'admission' | 'session' | 'exam'>('monthly');
  const [newFeeMonth, setNewFeeMonth] = useState('');
  const [newFeeYear, setNewFeeYear] = useState(new Date().getFullYear().toString());
  const [newFeeAmount, setNewFeeAmount] = useState(0);

  const searchMutation = useSearchStudent();
  const { data: feeRecords, isLoading: isLoadingRecords } = useStudentFeeRecords(
    selectedStudent?.id
  );
  const collectFee = useCollectFee();
  const createFeeRecord = useCreateFeeRecord();

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
    setLateFine(Number(record.late_fine) || 0);
    setPaymentDialogOpen(true);
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
    if (newFeeType === 'monthly' && newFeeMonth && newFeeYear) {
      feeMonth = `${newFeeYear}-${newFeeMonth}-01`;
    }
    
    createFeeRecord.mutate(
      {
        studentId: selectedStudent.id,
        feeType: newFeeType,
        amountDue: newFeeAmount,
        feeMonth,
      },
      {
        onSuccess: () => {
          setAddFeeDialogOpen(false);
          setNewFeeType('monthly');
          setNewFeeMonth('');
          setNewFeeAmount(0);
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

  // Calculate totals
  const totalDue = feeRecords?.reduce((sum, r) => sum + Number(r.amount_due), 0) || 0;
  const totalPaid = feeRecords?.reduce((sum, r) => sum + Number(r.amount_paid), 0) || 0;
  const totalRemaining = totalDue - totalPaid;

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
                <div className="flex items-start gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={selectedStudent.photo_url || undefined} />
                    <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                      {selectedStudent.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="py-4">
                  <div className="text-sm text-muted-foreground">মোট বকেয়া</div>
                  <div className="text-2xl font-bold text-primary">
                    ৳ {totalDue.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <div className="text-sm text-muted-foreground">মোট পরিশোধিত</div>
                  <div className="text-2xl font-bold text-green-600">
                    ৳ {totalPaid.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4">
                  <div className="text-sm text-muted-foreground">অবশিষ্ট বকেয়া</div>
                  <div className="text-2xl font-bold text-destructive">
                    ৳ {totalRemaining.toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fee Records Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  ফি রেকর্ড
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingRecords ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : feeRecords && feeRecords.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ফি এর ধরন</TableHead>
                        <TableHead>মাস/পরীক্ষা</TableHead>
                        <TableHead className="text-right">বকেয়া</TableHead>
                        <TableHead className="text-right">জরিমানা</TableHead>
                        <TableHead className="text-right">পরিশোধিত</TableHead>
                        <TableHead>স্ট্যাটাস</TableHead>
                        <TableHead>রিসিপ্ট</TableHead>
                        <TableHead className="w-24">অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feeRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="font-medium">
                            {getFeeTypeLabel(record.fee_type)}
                          </TableCell>
                          <TableCell>
                            {record.fee_type === 'exam' && record.exam
                              ? record.exam.name_bn || record.exam.name
                              : formatMonth(record.fee_month)}
                          </TableCell>
                          <TableCell className="text-right">
                            ৳ {Number(record.amount_due).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {Number(record.late_fine) > 0
                              ? `৳ ${Number(record.late_fine).toLocaleString()}`
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            ৳ {Number(record.amount_paid).toLocaleString()}
                          </TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                          <TableCell>
                            {record.receipt_number ? (
                              <span className="font-mono text-sm">{record.receipt_number}</span>
                            ) : (
                              '-'
                            )}
                          </TableCell>
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
            
            {/* Add New Fee Button */}
            {feeRecords && feeRecords.length > 0 && (
              <div className="flex justify-end">
                <Button onClick={() => setAddFeeDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  নতুন ফি যুক্ত করুন
                </Button>
              </div>
            )}
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
                  <Label htmlFor="late-fine">বিলম্ব জরিমানা (টাকা)</Label>
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
              
              <div className="space-y-2">
                <Label>বকেয়া পরিমাণ (টাকা)</Label>
                <Input
                  type="number"
                  min={0}
                  value={newFeeAmount}
                  onChange={(e) => setNewFeeAmount(Number(e.target.value))}
                  placeholder="টাকার পরিমাণ লিখুন"
                />
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
