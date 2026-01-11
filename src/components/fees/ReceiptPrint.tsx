import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ReceiptData {
  receiptNumber: string;
  studentName: string;
  studentNameBn?: string;
  studentId: string;
  className: string;
  sectionName?: string;
  guardianMobile: string;
  feeType: string;
  feeMonth?: string;
  examName?: string;
  amountDue: number;
  lateFine: number;
  amountPaid: number;
  paymentDate: string;
  previousBalance?: number;
  remainingBalance?: number;
}

interface ReceiptPrintProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ReceiptData | null;
  schoolName?: string;
  schoolNameBn?: string;
}

const getFeeTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    admission: 'ভর্তি ফি',
    session: 'সেশন চার্জ',
    monthly: 'মাসিক বেতন',
    exam: 'পরীক্ষা ফি',
  };
  return labels[type] || type;
};

const formatMonth = (monthStr: string | undefined): string => {
  if (!monthStr) return '';
  try {
    const date = new Date(monthStr + '-01');
    return format(date, 'MMMM yyyy', { locale: bn });
  } catch {
    return monthStr;
  }
};

export function ReceiptPrint({ 
  open, 
  onOpenChange, 
  data, 
  schoolName = 'স্কুলের নাম',
  schoolNameBn = 'স্কুলের নাম'
}: ReceiptPrintProps) {
  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  const totalPaid = data.amountPaid;
  const grandTotal = data.amountDue + data.lateFine;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl print:max-w-none print:m-0 print:p-0">
        <DialogHeader className="no-print">
          <DialogTitle className="flex items-center justify-between">
            <span>রিসিপ্ট প্রিন্ট</span>
            <Button onClick={handlePrint} size="sm" className="gap-2">
              <Printer className="h-4 w-4" />
              প্রিন্ট করুন
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* Printable Receipt */}
        <div className="receipt-print-area bg-white p-6 print:p-8 border print:border-2 print:border-black">
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-4 mb-4">
            <h1 className="text-2xl font-bold font-bengali">{schoolNameBn}</h1>
            <p className="text-sm text-muted-foreground">{schoolName}</p>
            <div className="mt-2 inline-block bg-primary text-primary-foreground px-4 py-1 rounded text-sm font-medium">
              মানি রিসিপ্ট
            </div>
          </div>

          {/* Receipt Info */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
              <span className="text-muted-foreground">রিসিপ্ট নং:</span>
              <span className="font-mono font-bold ml-2">{data.receiptNumber}</span>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground">তারিখ:</span>
              <span className="font-medium ml-2">
                {format(new Date(data.paymentDate), 'dd MMMM yyyy', { locale: bn })}
              </span>
            </div>
          </div>

          {/* Student Info */}
          <div className="bg-muted/30 p-4 rounded-lg mb-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">শিক্ষার্থীর নাম:</span>
                <p className="font-medium font-bengali">{data.studentNameBn || data.studentName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">আইডি নম্বর:</span>
                <p className="font-mono font-medium">{data.studentId}</p>
              </div>
              <div>
                <span className="text-muted-foreground">শ্রেণী:</span>
                <p className="font-medium">
                  {data.className}
                  {data.sectionName && ` - ${data.sectionName}`}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">অভিভাবকের মোবাইল:</span>
                <p className="font-mono font-medium">{data.guardianMobile}</p>
              </div>
            </div>
          </div>

          {/* Fee Details */}
          <table className="w-full border-collapse mb-4">
            <thead>
              <tr className="bg-muted">
                <th className="border border-border p-2 text-left">বিবরণ</th>
                <th className="border border-border p-2 text-right w-32">টাকা</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-border p-2">
                  <span className="font-medium">{getFeeTypeLabel(data.feeType)}</span>
                  {data.feeMonth && (
                    <span className="text-muted-foreground ml-2">
                      ({formatMonth(data.feeMonth)})
                    </span>
                  )}
                  {data.examName && (
                    <span className="text-muted-foreground ml-2">
                      ({data.examName})
                    </span>
                  )}
                </td>
                <td className="border border-border p-2 text-right font-mono">
                  ৳ {data.amountDue.toLocaleString('bn-BD')}
                </td>
              </tr>
              {data.lateFine > 0 && (
                <tr>
                  <td className="border border-border p-2">বিলম্ব জরিমানা</td>
                  <td className="border border-border p-2 text-right font-mono text-destructive">
                    ৳ {data.lateFine.toLocaleString('bn-BD')}
                  </td>
                </tr>
              )}
              <tr className="bg-muted/50 font-medium">
                <td className="border border-border p-2">মোট</td>
                <td className="border border-border p-2 text-right font-mono">
                  ৳ {grandTotal.toLocaleString('bn-BD')}
                </td>
              </tr>
              <tr className="bg-green-50 font-bold text-green-700">
                <td className="border border-border p-2">পরিশোধিত</td>
                <td className="border border-border p-2 text-right font-mono">
                  ৳ {totalPaid.toLocaleString('bn-BD')}
                </td>
              </tr>
              {(grandTotal - totalPaid) > 0 && (
                <tr className="bg-amber-50 text-amber-700">
                  <td className="border border-border p-2">বাকি</td>
                  <td className="border border-border p-2 text-right font-mono font-medium">
                    ৳ {(grandTotal - totalPaid).toLocaleString('bn-BD')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Amount in Words */}
          <div className="bg-muted/30 p-3 rounded text-sm mb-6">
            <span className="text-muted-foreground">কথায়:</span>
            <span className="font-medium ml-2">
              {convertToWords(totalPaid)} টাকা মাত্র
            </span>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 mt-12 pt-4">
            <div className="text-center">
              <div className="border-t border-black pt-2">
                <p className="text-sm font-medium">আদায়কারীর স্বাক্ষর</p>
              </div>
            </div>
            <div className="text-center">
              <div className="border-t border-black pt-2">
                <p className="text-sm font-medium">অধ্যক্ষের স্বাক্ষর</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-4 border-t text-xs text-muted-foreground">
            <p>এটি কম্পিউটার জেনারেটেড রিসিপ্ট</p>
            <p className="mt-1">Powered by আমার হাজিরা</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to convert numbers to Bengali words
function convertToWords(num: number): string {
  const ones = ['', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়'];
  const tens = ['', 'দশ', 'বিশ', 'ত্রিশ', 'চল্লিশ', 'পঞ্চাশ', 'ষাট', 'সত্তর', 'আশি', 'নব্বই'];
  const teens = ['দশ', 'এগার', 'বার', 'তের', 'চৌদ্দ', 'পনের', 'ষোল', 'সতের', 'আঠার', 'উনিশ'];
  
  if (num === 0) return 'শূন্য';
  if (num < 0) return 'ঋণাত্মক ' + convertToWords(Math.abs(num));
  
  let words = '';
  
  if (num >= 10000000) {
    words += convertToWords(Math.floor(num / 10000000)) + ' কোটি ';
    num %= 10000000;
  }
  
  if (num >= 100000) {
    words += convertToWords(Math.floor(num / 100000)) + ' লক্ষ ';
    num %= 100000;
  }
  
  if (num >= 1000) {
    words += convertToWords(Math.floor(num / 1000)) + ' হাজার ';
    num %= 1000;
  }
  
  if (num >= 100) {
    words += ones[Math.floor(num / 100)] + 'শ ';
    num %= 100;
  }
  
  if (num >= 20) {
    words += tens[Math.floor(num / 10)];
    if (num % 10 > 0) {
      words += ' ' + ones[num % 10];
    }
  } else if (num >= 10) {
    words += teens[num - 10];
  } else if (num > 0) {
    words += ones[num];
  }
  
  return words.trim();
}
