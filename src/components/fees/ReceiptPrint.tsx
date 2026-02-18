import { format } from 'date-fns';
import { bn } from 'date-fns/locale';
import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Single fee item for itemized receipts
export interface ReceiptFeeItem {
  feeType: string;
  feeMonth?: string;
  examName?: string;
  amountDue: number;
  lateFine: number;
  amountPaid: number;
}

export interface ReceiptData {
  receiptNumber: string;
  studentName: string;
  studentNameBn?: string;
  studentId?: string;
  className: string;
  classNameBn?: string;
  sectionName?: string;
  guardianMobile?: string;
  feeType: string;
  feeMonth?: string;
  examName?: string;
  amountDue: number;
  lateFine: number;
  amountPaid: number;
  paymentDate: string;
  previousBalance?: number;
  remainingBalance?: number;
  items?: ReceiptFeeItem[];
  collectorName?: string;
}

interface ReceiptPrintProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ReceiptData | null;
  schoolName?: string;
  schoolNameBn?: string;
  copyMode?: 'single' | 'dual';
}

const getFeeTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    admission: 'ভর্তি ফি',
    session: 'সেশন চার্জ',
    monthly: 'মাসিক বেতন',
    exam: 'পরীক্ষা ফি',
    product: 'পণ্য বিক্রয়',
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

// Convert number to Bengali words
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
    if (num % 10 > 0) words += ' ' + ones[num % 10];
  } else if (num >= 10) {
    words += teens[num - 10];
  } else if (num > 0) {
    words += ones[num];
  }
  
  return words.trim();
}

// Group fee items by type, merging monthly fees into one row with all months listed
function groupFeeItems(items: ReceiptFeeItem[]): { description: string; amountDue: number; lateFine: number; amountPaid: number }[] {
  const grouped: { description: string; amountDue: number; lateFine: number; amountPaid: number }[] = [];
  const monthlyItems = items.filter(i => i.feeType === 'monthly');
  const otherItems = items.filter(i => i.feeType !== 'monthly');

  if (monthlyItems.length > 0) {
    const months = monthlyItems
      .map(i => formatMonth(i.feeMonth))
      .filter(Boolean)
      .join(', ');
    grouped.push({
      description: `${getFeeTypeLabel('monthly')}${months ? ` - ${months}` : ''}`,
      amountDue: monthlyItems.reduce((s, i) => s + i.amountDue, 0),
      lateFine: monthlyItems.reduce((s, i) => s + i.lateFine, 0),
      amountPaid: monthlyItems.reduce((s, i) => s + i.amountPaid, 0),
    });
  }

  otherItems.forEach(item => {
    grouped.push({
      description: `${getFeeTypeLabel(item.feeType)}${item.examName ? ` - ${item.examName}` : ''}${item.feeMonth ? ` - ${formatMonth(item.feeMonth)}` : ''}`,
      amountDue: item.amountDue,
      lateFine: item.lateFine,
      amountPaid: item.amountPaid,
    });
  });

  return grouped;
}

// Single receipt copy component
function ReceiptCopy({ 
  data, 
  schoolNameBn, 
  schoolName, 
  copyLabel,
  feeItems,
  totalDue,
  totalLateFine,
  totalPaid,
  grandTotal,
}: {
  data: ReceiptData;
  schoolNameBn: string;
  schoolName: string;
  copyLabel: string;
  feeItems: ReceiptFeeItem[];
  totalDue: number;
  totalLateFine: number;
  totalPaid: number;
  grandTotal: number;
}) {
  const remaining = grandTotal - totalPaid;
  const displayItems = groupFeeItems(feeItems);

  return (
    <div className="rcpt-copy">
      {/* Header */}
      <div className="rcpt-header">
        <div className="rcpt-school-name">{schoolNameBn}</div>
        <div className="rcpt-school-sub">{schoolName}</div>
        <div className="rcpt-title-badge">মানি রিসিপ্ট</div>
        <div className="rcpt-copy-label">{copyLabel}</div>
      </div>

      {/* Receipt meta row */}
      <div className="rcpt-meta">
        <div>
          <span className="rcpt-label">রিসিপ্ট নং:</span>
          <span className="rcpt-value-mono">{data.receiptNumber}</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span className="rcpt-label">তারিখ:</span>
          <span className="rcpt-value">
            {format(new Date(data.paymentDate), 'dd/MM/yyyy')}
          </span>
        </div>
      </div>

      {/* Student info */}
      <div className="rcpt-student-info">
        <div className="rcpt-info-row">
          <div className="rcpt-info-item">
            <span className="rcpt-label">নাম:</span>
            <span className="rcpt-value">{data.studentNameBn || data.studentName}</span>
          </div>
          {data.studentId && (
            <div className="rcpt-info-item">
              <span className="rcpt-label">আইডি:</span>
              <span className="rcpt-value-mono">{data.studentId}</span>
            </div>
          )}
        </div>
        <div className="rcpt-info-row">
          <div className="rcpt-info-item">
            <span className="rcpt-label">শ্রেণী:</span>
            <span className="rcpt-value">
              {data.classNameBn || data.className}
              {data.sectionName && ` (${data.sectionName})`}
            </span>
          </div>
          {data.guardianMobile && (
            <div className="rcpt-info-item">
              <span className="rcpt-label">মোবাইল:</span>
              <span className="rcpt-value-mono">{data.guardianMobile}</span>
            </div>
          )}
        </div>
      </div>

      {/* Fee breakdown table */}
      <table className="rcpt-table">
        <thead>
          <tr>
            <th className="rcpt-th rcpt-th-sl">ক্র.</th>
            <th className="rcpt-th rcpt-th-desc">বিবরণ</th>
            <th className="rcpt-th rcpt-th-amt">টাকা</th>
            {totalLateFine > 0 && <th className="rcpt-th rcpt-th-amt">জরিমানা</th>}
            <th className="rcpt-th rcpt-th-amt">পরিশোধ</th>
          </tr>
        </thead>
        <tbody>
          {displayItems.map((item, index) => (
            <tr key={index}>
              <td className="rcpt-td rcpt-td-center">{index + 1}</td>
              <td className="rcpt-td">{item.description}</td>
              <td className="rcpt-td rcpt-td-right rcpt-mono">
                {item.amountDue.toLocaleString('bn-BD')}/-
              </td>
              {totalLateFine > 0 && (
                <td className="rcpt-td rcpt-td-right rcpt-mono rcpt-fine">
                  {item.lateFine > 0 ? `${item.lateFine.toLocaleString('bn-BD')}/-` : '-'}
                </td>
              )}
              <td className="rcpt-td rcpt-td-right rcpt-mono rcpt-paid">
                {item.amountPaid.toLocaleString('bn-BD')}/-
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          {/* Subtotal */}
          <tr className="rcpt-subtotal-row">
            <td colSpan={2} className="rcpt-td rcpt-td-right" style={{ fontWeight: 600 }}>
              মোট:
            </td>
            <td className="rcpt-td rcpt-td-right rcpt-mono" style={{ fontWeight: 600 }}>
              {totalDue.toLocaleString('bn-BD')}/-
            </td>
            {totalLateFine > 0 && (
              <td className="rcpt-td rcpt-td-right rcpt-mono rcpt-fine" style={{ fontWeight: 600 }}>
                {totalLateFine.toLocaleString('bn-BD')}/-
              </td>
            )}
            <td className="rcpt-td rcpt-td-right rcpt-mono rcpt-paid" style={{ fontWeight: 700 }}>
              {totalPaid.toLocaleString('bn-BD')}/-
            </td>
          </tr>
          {/* Remaining */}
          {remaining > 0 && (
            <tr className="rcpt-remaining-row">
              <td colSpan={totalLateFine > 0 ? 4 : 3} className="rcpt-td rcpt-td-right" style={{ fontWeight: 600 }}>
                বাকি:
              </td>
              <td className="rcpt-td rcpt-td-right rcpt-mono" style={{ fontWeight: 700, color: '#b91c1c' }}>
                {remaining.toLocaleString('bn-BD')}/-
              </td>
            </tr>
          )}
        </tfoot>
      </table>

      {/* Amount in words */}
      <div className="rcpt-words">
        <span className="rcpt-label">কথায়:</span>{' '}
        <span style={{ fontWeight: 600 }}>{convertToWords(totalPaid)} টাকা মাত্র।</span>
      </div>

      {/* Signatures */}
      <div className="rcpt-signatures">
        <div className="rcpt-sig-block">
          <div className="rcpt-sig-line"></div>
          <div className="rcpt-sig-label">গ্রহীতার স্বাক্ষর</div>
        </div>
        <div className="rcpt-sig-block">
          {data.collectorName && (
            <div className="rcpt-collector-name">{data.collectorName}</div>
          )}
          <div className="rcpt-sig-line"></div>
          <div className="rcpt-sig-label">আদায়কারীর স্বাক্ষর ও সিল</div>
        </div>
        <div className="rcpt-sig-block">
          <div className="rcpt-sig-line"></div>
          <div className="rcpt-sig-label">অধ্যক্ষের স্বাক্ষর</div>
        </div>
      </div>

      <div className="rcpt-footer-note">
        এটি কম্পিউটার জেনারেটেড রিসিপ্ট | Powered by আমার হাজিরা
      </div>
    </div>
  );
}

export function ReceiptPrint({ 
  open, 
  onOpenChange, 
  data, 
  schoolName = 'School Name',
  schoolNameBn = 'স্কুলের নাম',
  copyMode = 'dual',
}: ReceiptPrintProps) {
  if (!data) return null;

  const handlePrint = () => {
    const printArea = document.querySelector('.rcpt-print-area');
    if (!printArea) return;

    const printWindow = window.open('', '_blank', 'width=800,height=1000');
    if (!printWindow) {
      toast.error('পপ-আপ ব্লক করা আছে। অনুগ্রহ করে পপ-আপ অনুমতি দিন।');
      return;
    }

    const styleEl = document.querySelector('.rcpt-print-area ~ style');
    const styles = styleEl ? styleEl.innerHTML : '';

    printWindow.document.write(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>রিসিপ্ট প্রিন্ট</title>
<style>
  @page { size: A4 portrait; margin: 10mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 210mm; background: #fff; }
  ${styles}
  .rcpt-print-area { padding: 0; width: 190mm; margin: 0 auto; }
</style>
</head><body>${printArea.outerHTML}</body></html>`);

    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 300);
    };
  };

  const feeItems = data.items && data.items.length > 0 
    ? data.items 
    : [{
        feeType: data.feeType,
        feeMonth: data.feeMonth,
        examName: data.examName,
        amountDue: data.amountDue,
        lateFine: data.lateFine,
        amountPaid: data.amountPaid,
      }];

  const totalDue = feeItems.reduce((sum, item) => sum + item.amountDue, 0);
  const totalLateFine = feeItems.reduce((sum, item) => sum + item.lateFine, 0);
  const totalPaid = feeItems.reduce((sum, item) => sum + item.amountPaid, 0);
  const grandTotal = totalDue + totalLateFine;

  const sharedProps = {
    data,
    schoolNameBn,
    schoolName,
    feeItems,
    totalDue,
    totalLateFine,
    totalPaid,
    grandTotal,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto print:max-w-none print:m-0 print:p-0 print:overflow-visible">
        <DialogHeader className="no-print">
          <DialogTitle className="flex items-center justify-between">
            <span>রিসিপ্ট প্রিন্ট</span>
            <Button onClick={handlePrint} size="sm" className="gap-2">
              <Printer className="h-4 w-4" />
              প্রিন্ট করুন
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* ====== PRINT AREA ====== */}
        <div className="rcpt-print-area">
          {/* Copy 1: Institution */}
          <ReceiptCopy {...sharedProps} copyLabel="প্রতিষ্ঠান কপি" />

          {/* Separator + Copy 2 for dual mode */}
          {copyMode === 'dual' && (
            <>
              <div className="rcpt-separator">
                <div className="rcpt-separator-line"></div>
                <span className="rcpt-separator-text">✂ এখান থেকে কাটুন</span>
                <div className="rcpt-separator-line"></div>
              </div>
              <ReceiptCopy {...sharedProps} copyLabel="শিক্ষার্থী কপি" />
            </>
          )}
        </div>

        {/* ====== PRINT STYLES ====== */}
        <style>{`
          /* ===== SCREEN PREVIEW ===== */
          .rcpt-print-area {
            background: #fff;
            color: #000;
            font-family: 'SolaimanLipi', 'Kalpurush', 'Noto Sans Bengali', sans-serif;
            font-size: 11px;
            line-height: 1.4;
            padding: 16px;
          }

          .rcpt-copy {
            padding: 12px 0;
          }

          /* Header */
          .rcpt-header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 6px;
            margin-bottom: 8px;
          }
          .rcpt-school-name {
            font-size: 18px;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .rcpt-school-sub {
            font-size: 10px;
            color: #555;
            margin-top: 1px;
          }
          .rcpt-title-badge {
            display: inline-block;
            margin-top: 4px;
            padding: 2px 16px;
            border: 1.5px solid #000;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 1px;
          }
          .rcpt-copy-label {
            font-size: 9px;
            color: #666;
            margin-top: 2px;
            font-style: italic;
          }

          /* Meta */
          .rcpt-meta {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            border-bottom: 1px solid #ccc;
            margin-bottom: 6px;
          }

          /* Labels */
          .rcpt-label {
            font-size: 10px;
            color: #555;
            margin-right: 4px;
          }
          .rcpt-value {
            font-weight: 600;
            font-size: 11px;
          }
          .rcpt-value-mono {
            font-weight: 700;
            font-size: 11px;
            font-family: 'Courier New', monospace;
          }

          /* Student info */
          .rcpt-student-info {
            background: #f8f8f8;
            border: 1px solid #ddd;
            padding: 6px 8px;
            margin-bottom: 8px;
          }
          .rcpt-info-row {
            display: flex;
            gap: 16px;
            margin-bottom: 2px;
          }
          .rcpt-info-item {
            flex: 1;
          }

          /* Table */
          .rcpt-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 6px;
          }
          .rcpt-th {
            background: #222;
            color: #fff;
            padding: 4px 6px;
            font-size: 10px;
            font-weight: 600;
            text-align: left;
            border: 1px solid #000;
          }
          .rcpt-th-sl { width: 28px; text-align: center; }
          .rcpt-th-desc { }
          .rcpt-th-amt { width: 80px; text-align: right; }
          
          .rcpt-td {
            padding: 3px 6px;
            font-size: 10.5px;
            border: 1px solid #999;
          }
          .rcpt-td-center { text-align: center; }
          .rcpt-td-right { text-align: right; }
          .rcpt-mono { font-family: 'Courier New', monospace; }
          .rcpt-fine { color: #b91c1c; }
          .rcpt-paid { color: #15803d; font-weight: 600; }

          .rcpt-subtotal-row {
            background: #f0f0f0;
          }
          .rcpt-remaining-row {
            background: #fff5f5;
          }

          /* Words */
          .rcpt-words {
            padding: 4px 8px;
            background: #f8f8f8;
            border: 1px solid #ddd;
            font-size: 10.5px;
            margin-bottom: 10px;
          }

          /* Signatures */
          .rcpt-signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 28px;
            gap: 12px;
          }
          .rcpt-sig-block {
            text-align: center;
            flex: 1;
          }
          .rcpt-collector-name {
            font-size: 9px;
            color: #333;
            margin-bottom: 2px;
          }
          .rcpt-sig-line {
            border-top: 1px solid #000;
            width: 100%;
            margin-bottom: 2px;
          }
          .rcpt-sig-label {
            font-size: 9px;
            color: #333;
          }

          /* Footer */
          .rcpt-footer-note {
            text-align: center;
            font-size: 8px;
            color: #888;
            margin-top: 6px;
            padding-top: 4px;
            border-top: 1px solid #ddd;
          }

          /* Separator */
          .rcpt-separator {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 10px 0;
          }
          .rcpt-separator-line {
            flex: 1;
            border-top: 1px dashed #999;
          }
          .rcpt-separator-text {
            font-size: 9px;
            color: #999;
            white-space: nowrap;
          }

          /* ===== PRINT STYLES (for new-window print) ===== */
          @media print {
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            .rcpt-print-area {
              width: 190mm !important;
              padding: 0 !important;
              margin: 0 auto !important;
            }
            .rcpt-copy {
              page-break-inside: avoid;
            }
            .rcpt-separator {
              page-break-after: avoid;
              page-break-before: avoid;
            }
            .rcpt-th {
              background: #000 !important;
              color: #fff !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .rcpt-student-info,
            .rcpt-words {
              background: #f5f5f5 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .rcpt-subtotal-row {
              background: #eee !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
