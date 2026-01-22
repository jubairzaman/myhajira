import { useState, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
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
import {
  Search,
  CreditCard,
  Phone,
  GraduationCap,
  Receipt,
  Printer,
  Plus,
  Minus,
  CheckCircle2,
  XCircle,
  Package,
  ShoppingCart,
  X,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { toast } from 'sonner';
import {
  useSearchStudent,
  useStudentFeeRecords,
  useCollectMultipleFees,
  useCreateFeeRecord,
  type StudentWithFees,
  type StudentFeeRecord,
} from '@/hooks/queries/useFeeCollection';
import { useFeeSettings } from '@/hooks/queries/useFeesQuery';
import { ReceiptPrint, type ReceiptData } from '@/components/fees/ReceiptPrint';
import { 
  useActiveProducts, 
  useSellProduct,
  type InventoryProduct 
} from '@/hooks/queries/useInventory';
import { cn } from '@/lib/utils';

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

// Cart item interface
interface CartItem {
  id: string;
  type: 'fee' | 'product';
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  lateFine: number;
  total: number;
  feeRecord?: StudentFeeRecord;
  product?: InventoryProduct;
}

export default function FeeCollection() {
  const { activeYear } = useAcademicYear();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentWithFees | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Success dialog state
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [lastPaymentData, setLastPaymentData] = useState<{
    receiptNumber: string;
    totalAmount: number;
  } | null>(null);
  
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
  const collectMultipleFees = useCollectMultipleFees();
  const createFeeRecord = useCreateFeeRecord();
  
  // Inventory hooks
  const { data: activeProducts } = useActiveProducts();
  const sellProduct = useSellProduct();

  // Calculate cart totals
  const cartSubtotal = cart.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const cartLateFines = cart.reduce((sum, item) => sum + item.lateFine, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);

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

  // Clear cart when student changes
  useEffect(() => {
    setCart([]);
  }, [selectedStudent?.id]);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    searchMutation.mutate(searchTerm, {
      onSuccess: (student) => {
        setSelectedStudent(student);
        setCart([]);
      },
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Fee type label helper
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
      case 'product':
        return 'পণ্য বিক্রয়';
      default:
        return type;
    }
  };

  // Get fee label with month/exam name
  const getFeeLabel = (record: StudentFeeRecord) => {
    if (record.fee_type === 'monthly' && record.fee_month) {
      try {
        const date = new Date(record.fee_month);
        return format(date, 'MMMM yyyy', { locale: bn });
      } catch {
        return record.fee_month;
      }
    }
    if (record.fee_type === 'exam' && record.exam) {
      return record.exam.name_bn || record.exam.name;
    }
    return getFeeTypeLabel(record.fee_type);
  };

  // Toggle fee in cart
  const toggleFeeInCart = (record: StudentFeeRecord) => {
    const existingIndex = cart.findIndex(
      item => item.type === 'fee' && item.id === record.id
    );
    
    if (existingIndex >= 0) {
      // Remove from cart
      setCart(cart.filter((_, i) => i !== existingIndex));
    } else {
      // Add to cart
      const remaining = Number(record.amount_due) - Number(record.amount_paid);
      
      // Calculate late fine for monthly fees
      let lateFine = Number(record.late_fine) || 0;
      
      if (feeSettings?.late_fine_enabled && record.fee_type === 'monthly' && record.fee_month) {
        const today = new Date();
        const feeMonthDate = new Date(record.fee_month);
        const dueDate = new Date(feeMonthDate.getFullYear(), feeMonthDate.getMonth(), feeSettings.monthly_due_date);
        
        if (today > dueDate && Number(record.late_fine) === 0) {
          lateFine = Number(feeSettings.late_fine_amount);
        }
      }
      
      setCart([...cart, {
        id: record.id,
        type: 'fee',
        name: getFeeTypeLabel(record.fee_type),
        description: getFeeLabel(record),
        quantity: 1,
        unitPrice: remaining,
        lateFine,
        total: remaining + lateFine,
        feeRecord: record,
      }]);
    }
  };

  // Add product to cart
  const addProductToCart = (product: InventoryProduct) => {
    const existingIndex = cart.findIndex(
      item => item.type === 'product' && item.id === product.id
    );
    
    if (existingIndex >= 0) {
      const updated = [...cart];
      const newQty = updated[existingIndex].quantity + 1;
      if (newQty <= product.stock_quantity) {
        updated[existingIndex].quantity = newQty;
        updated[existingIndex].total = newQty * product.unit_price;
        setCart(updated);
      }
    } else {
      setCart([...cart, {
        id: product.id,
        type: 'product',
        name: product.name_bn || product.name,
        quantity: 1,
        unitPrice: product.unit_price,
        lateFine: 0,
        total: product.unit_price,
        product,
      }]);
    }
  };

  // Update product quantity in cart
  const updateProductQuantity = (productId: string, delta: number) => {
    const updated = cart.map(item => {
      if (item.type === 'product' && item.id === productId) {
        const product = item.product!;
        const newQty = Math.max(0, Math.min(item.quantity + delta, product.stock_quantity));
        if (newQty === 0) return null;
        return {
          ...item,
          quantity: newQty,
          total: newQty * item.unitPrice,
        };
      }
      return item;
    }).filter(Boolean) as CartItem[];
    setCart(updated);
  };

  // Remove item from cart
  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (cart.length === 0 || !selectedStudent) return;
    setIsProcessing(true);

    try {
      const feeItems = cart.filter(i => i.type === 'fee');
      const productItems = cart.filter(i => i.type === 'product');

      // 1. Sell products first
      for (const item of productItems) {
        if (item.product) {
          await sellProduct.mutateAsync({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.unit_price,
            studentId: selectedStudent.id,
          });
        }
      }

      // 2. Collect fees
      let receiptNumber = `RCP-${Date.now()}`;
      if (feeItems.length > 0) {
        const recordsToCollect = feeItems.map(item => ({
          id: item.id,
          amountToPay: item.unitPrice,
        }));

        const lateFines: Record<string, number> = {};
        feeItems.forEach(item => {
          lateFines[item.id] = item.lateFine;
        });

        const result = await collectMultipleFees.mutateAsync({
          records: recordsToCollect,
          lateFines,
        });
        receiptNumber = result.receiptNumber;
      }

      // 3. Prepare receipt data
      const receiptItems = [
        ...feeItems.map(item => ({
          feeType: item.feeRecord?.fee_type || 'monthly',
          feeMonth: item.feeRecord?.fee_month || undefined,
          examName: item.feeRecord?.exam?.name_bn || item.feeRecord?.exam?.name || undefined,
          amountDue: item.unitPrice,
          lateFine: item.lateFine,
          amountPaid: item.total,
        })),
        ...productItems.map(item => ({
          feeType: 'product',
          examName: `${item.name} x${item.quantity}`,
          amountDue: item.total,
          lateFine: 0,
          amountPaid: item.total,
        })),
      ];

      setReceiptData({
        receiptNumber,
        paymentDate: new Date().toISOString(),
        studentName: selectedStudent.name,
        studentNameBn: selectedStudent.name_bn || undefined,
        className: selectedStudent.class?.name || '',
        classNameBn: selectedStudent.class?.name_bn || undefined,
        sectionName: selectedStudent.section?.name || undefined,
        studentId: selectedStudent.student_id_number || undefined,
        guardianMobile: selectedStudent.guardian_mobile || undefined,
        feeType: 'multiple',
        amountDue: cartSubtotal,
        amountPaid: cartTotal,
        lateFine: cartLateFines,
        items: receiptItems,
      });

      // 4. Show success dialog
      setLastPaymentData({ receiptNumber, totalAmount: cartTotal });
      setSuccessDialogOpen(true);

    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('পেমেন্ট প্রক্রিয়ায় সমস্যা হয়েছে');
    } finally {
      setIsProcessing(false);
    }
  };

  // Print and continue
  const handlePrintAndContinue = () => {
    setReceiptOpen(true);
    setTimeout(() => {
      window.print();
      resetToSearch();
    }, 200);
  };

  // Exit without print
  const handleExitWithoutPrint = () => {
    resetToSearch();
  };

  // Reset to search screen
  const resetToSearch = () => {
    setSuccessDialogOpen(false);
    setSelectedStudent(null);
    setCart([]);
    setSearchTerm('');
    setReceiptData(null);
    setLastPaymentData(null);
    
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // Go back to search
  const handleBackToSearch = () => {
    setSelectedStudent(null);
    setCart([]);
    setSearchTerm('');
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
  };

  // Add new fee
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

  const monthlyFeeStatus = getMonthlyFeeStatus();
  const otherFees = feeRecords?.filter(r => r.fee_type !== 'monthly') || [];

  // Check if fee is in cart
  const isFeeInCart = (recordId: string) => {
    return cart.some(item => item.type === 'fee' && item.id === recordId);
  };

  // Get product quantity in cart
  const getProductQtyInCart = (productId: string) => {
    const item = cart.find(i => i.type === 'product' && i.id === productId);
    return item?.quantity || 0;
  };

  return (
    <MainLayout title="ফি আদায়">
      <div className="h-[calc(100vh-100px)]">
        {/* Search Screen */}
        {!selectedStudent && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-full max-w-xl space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-10 h-10 text-primary" />
                </div>
                <h1 className="text-3xl font-bold">ফি আদায়</h1>
                <p className="text-muted-foreground mt-2">
                  Student ID বা RFID কার্ড পাঞ্চ করুন
                </p>
              </div>

              <Card className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <Input
                        ref={searchInputRef}
                        placeholder="Student ID বা RFID Card পাঞ্চ করুন..."
                        value={searchTerm}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSearchTerm(value);
                          if (value.length >= 10 && /^\d+$/.test(value)) {
                            setTimeout(() => {
                              if (value === e.target.value) {
                                handleSearch();
                              }
                            }, 300);
                          }
                        }}
                        onKeyPress={handleKeyPress}
                        className="text-lg h-14 font-mono"
                        autoFocus
                      />
                      {searchMutation.isPending && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </div>
                    <Button
                      onClick={handleSearch}
                      disabled={searchMutation.isPending || !searchTerm.trim()}
                      size="lg"
                      className="px-8 h-14"
                    >
                      <Search className="w-5 h-5" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3 text-center flex items-center justify-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    RFID রিডারে কার্ড পাঞ্চ করুন
                  </p>
                </CardContent>
              </Card>

              {searchMutation.isSuccess && !selectedStudent && (
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-lg font-medium">কোন শিক্ষার্থী পাওয়া যায়নি</p>
                  <p className="text-sm text-muted-foreground">সঠিক ID দিয়ে আবার চেষ্টা করুন</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* POS View - Two Column Layout */}
        {selectedStudent && (
          <div className="flex h-full gap-4">
            {/* Left Panel - Selection Area */}
            <div className="flex-1 overflow-auto pr-2">
              {/* Student Header */}
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToSearch}
                  className="shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <Avatar className="w-14 h-14 border-2 border-primary/20">
                  <AvatarImage src={selectedStudent.photo_url || undefined} />
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {selectedStudent.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold truncate">
                    {selectedStudent.name_bn || selectedStudent.name}
                  </h2>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" />
                      {selectedStudent.class?.name_bn || selectedStudent.class?.name}
                      {selectedStudent.section && ` (${selectedStudent.section.name})`}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      {selectedStudent.guardian_mobile}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="font-mono shrink-0">
                  {selectedStudent.student_id_number}
                </Badge>
              </div>

              {/* Monthly Fees Grid */}
              <Card className="mb-4">
                <CardHeader className="py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Receipt className="w-4 h-4" />
                      মাসিক বেতন
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAddFeeDialogOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      নতুন ফি
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  {isLoadingRecords ? (
                    <div className="grid grid-cols-6 gap-2">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                      {monthlyFeeStatus.map(({ month, label, status, record }) => {
                        const isInCart = record ? isFeeInCart(record.id) : false;
                        const isClickable = record && status !== 'paid';
                        const remaining = record ? Number(record.amount_due) - Number(record.amount_paid) : 0;
                        
                        return (
                          <button
                            key={month}
                            onClick={() => isClickable && toggleFeeInCart(record)}
                            disabled={!isClickable}
                            className={cn(
                              "p-3 rounded-lg border-2 text-center transition-all",
                              status === 'paid' && "bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700 opacity-60",
                              status === 'unpaid' && !isInCart && "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 hover:border-red-400 cursor-pointer",
                              status === 'partial' && !isInCart && "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 hover:border-amber-400 cursor-pointer",
                              !status && "bg-muted/30 border-muted",
                              isInCart && "bg-primary border-primary text-primary-foreground ring-2 ring-primary/50"
                            )}
                          >
                            <div className="font-bengali text-sm font-medium">{label}</div>
                            {status === 'paid' && <CheckCircle2 className="w-5 h-5 mx-auto mt-1 text-green-600" />}
                            {status !== 'paid' && record && (
                              <div className={cn(
                                "text-xs mt-1 font-bold",
                                isInCart ? "text-primary-foreground" : "text-destructive"
                              )}>
                                ৳{remaining.toLocaleString()}
                              </div>
                            )}
                            {!record && <span className="text-xs text-muted-foreground">—</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Other Fees */}
              {otherFees.length > 0 && (
                <Card className="mb-4">
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">অন্যান্য ফি</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {otherFees.map(record => {
                        const isInCart = isFeeInCart(record.id);
                        const isClickable = record.status !== 'paid';
                        const remaining = Number(record.amount_due) - Number(record.amount_paid);
                        
                        return (
                          <button
                            key={record.id}
                            onClick={() => isClickable && toggleFeeInCart(record)}
                            disabled={!isClickable}
                            className={cn(
                              "p-3 rounded-lg border-2 text-center transition-all",
                              record.status === 'paid' && "bg-green-100 border-green-300 dark:bg-green-900/30 opacity-60",
                              record.status !== 'paid' && !isInCart && "bg-muted hover:bg-muted/80 cursor-pointer",
                              isInCart && "bg-primary border-primary text-primary-foreground"
                            )}
                          >
                            <div className="font-medium text-sm">{getFeeTypeLabel(record.fee_type)}</div>
                            {record.exam && (
                              <div className={cn(
                                "text-xs",
                                isInCart ? "text-primary-foreground/80" : "text-muted-foreground"
                              )}>
                                {record.exam.name_bn || record.exam.name}
                              </div>
                            )}
                            <div className={cn(
                              "text-sm font-bold mt-1",
                              isInCart ? "text-primary-foreground" : ""
                            )}>
                              ৳{remaining.toLocaleString()}
                            </div>
                            {record.status === 'paid' && (
                              <CheckCircle2 className="w-4 h-4 mx-auto mt-1 text-green-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Products Grid */}
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    পণ্য বিক্রয়
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeProducts && activeProducts.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {activeProducts.map(product => {
                        const qtyInCart = getProductQtyInCart(product.id);
                        
                        return (
                          <div
                            key={product.id}
                            className={cn(
                              "p-3 rounded-lg border-2 text-center transition-all",
                              qtyInCart > 0 && "bg-primary/10 border-primary"
                            )}
                          >
                            <div className="font-medium text-sm truncate">
                              {product.name_bn || product.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ৳{product.unit_price.toLocaleString()}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => updateProductQuantity(product.id, -1)}
                                disabled={qtyInCart === 0}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-8 text-center font-bold">{qtyInCart}</span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => addProductToCart(product)}
                                disabled={qtyInCart >= product.stock_quantity}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              স্টক: {product.stock_quantity}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">কোন পণ্য নেই</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Panel - Shopping Cart */}
            <div className="w-80 shrink-0 bg-card border rounded-lg flex flex-col h-full">
              {/* Cart Header */}
              <div className="p-4 border-b bg-muted/50 rounded-t-lg">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  কার্ট
                  {cart.length > 0 && (
                    <Badge variant="secondary">{cart.length}</Badge>
                  )}
                </h3>
              </div>

              {/* Cart Items */}
              <ScrollArea className="flex-1 p-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>কার্ট খালি</p>
                    <p className="text-sm">বাম দিক থেকে আইটেম সিলেক্ট করুন</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cart.map(item => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{item.name}</div>
                          {item.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {item.description}
                            </div>
                          )}
                          {item.type === 'product' && item.quantity > 1 && (
                            <div className="text-xs text-muted-foreground">
                              {item.quantity} × ৳{item.unitPrice.toLocaleString()}
                            </div>
                          )}
                          {item.lateFine > 0 && (
                            <div className="text-xs text-destructive">
                              জরিমানা: ৳{item.lateFine.toLocaleString()}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold">৳{item.total.toLocaleString()}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-destructive hover:text-destructive"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Cart Footer */}
              <div className="border-t p-4 space-y-3 bg-muted/30 rounded-b-lg">
                {cart.length > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>সাবটোটাল</span>
                      <span>৳{cartSubtotal.toLocaleString()}</span>
                    </div>
                    {cartLateFines > 0 && (
                      <div className="flex justify-between text-sm text-destructive">
                        <span>জরিমানা</span>
                        <span>৳{cartLateFines.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>মোট</span>
                      <span className="text-primary">৳{cartTotal.toLocaleString()}</span>
                    </div>
                  </>
                )}

                <Button
                  className="w-full h-14 text-lg"
                  size="lg"
                  disabled={cart.length === 0 || isProcessing}
                  onClick={handleCheckout}
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      💰 আদায় করুন
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Success Dialog */}
        <Dialog open={successDialogOpen} onOpenChange={() => {}}>
          <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
            <div className="text-center py-6">
              {/* Success Animation */}
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                ফি আদায় সম্পন্ন!
              </h2>
              
              <div className="bg-muted/50 rounded-lg p-4 mb-6">
                <div className="text-sm text-muted-foreground">রিসিপ্ট নম্বর</div>
                <div className="font-mono font-bold text-lg">
                  {lastPaymentData?.receiptNumber}
                </div>
                <div className="text-3xl font-bold text-primary mt-2">
                  ৳ {lastPaymentData?.totalAmount.toLocaleString()}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button
                  size="lg"
                  className="w-full h-14 text-lg gap-2"
                  onClick={handlePrintAndContinue}
                >
                  <Printer className="w-5 h-5" />
                  🖨️ প্রিন্ট করুন
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  onClick={handleExitWithoutPrint}
                >
                  <X className="w-4 h-4 mr-2" />
                  এক্সিট (প্রিন্ট ছাড়া)
                </Button>
              </div>
            </div>
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
