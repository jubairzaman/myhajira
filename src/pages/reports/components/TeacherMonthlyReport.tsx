import { useEffect, useState, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { bn } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { ReportHeader } from './ReportHeader';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface TeacherMonthlyReportProps {
  teacherId: string;
  month: Date;
  academicYearId: string;
  academicYearName: string;
}

interface TeacherInfo {
  id: string;
  name: string;
  name_bn: string | null;
  designation: string;
  mobile: string;
  shift_name: string;
  shift_name_bn: string | null;
}

interface AttendanceRecord {
  attendance_date: string;
  status: string;
  punch_in_time: string | null;
  late_minutes: number | null;
}

interface Summary {
  totalWorkingDays: number;
  totalPresent: number;
  totalLate: number;
  totalAbsent: number;
  totalLateMinutes: number;
}

const dayNames: { [key: number]: string } = {
  0: 'রবি',
  1: 'সোম',
  2: 'মঙ্গল',
  3: 'বুধ',
  4: 'বৃহ',
  5: 'শুক্র',
  6: 'শনি',
};

const toBengaliNum = (n: number | string): string => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

export function TeacherMonthlyReport({
  teacherId,
  month,
  academicYearId,
  academicYearName,
}: TeacherMonthlyReportProps) {
  const [teacher, setTeacher] = useState<TeacherInfo | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: teacherData } = await supabase
        .from('teachers')
        .select(`
          id, name, name_bn, designation, mobile,
          shifts:shift_id (name, name_bn)
        `)
        .eq('id', teacherId)
        .single();

      if (teacherData) {
        setTeacher({
          id: teacherData.id,
          name: teacherData.name,
          name_bn: teacherData.name_bn,
          designation: teacherData.designation,
          mobile: teacherData.mobile,
          shift_name: (teacherData.shifts as any)?.name || '',
          shift_name_bn: (teacherData.shifts as any)?.name_bn,
        });
      }

      const { data: attendanceData } = await supabase
        .from('teacher_attendance')
        .select('attendance_date, status, punch_in_time, late_minutes')
        .eq('teacher_id', teacherId)
        .eq('academic_year_id', academicYearId)
        .gte('attendance_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('attendance_date', format(monthEnd, 'yyyy-MM-dd'))
        .order('attendance_date');

      setAttendance(attendanceData || []);

      const totalPresent = (attendanceData || []).filter(a => a.status === 'present').length;
      const totalLate = (attendanceData || []).filter(a => a.status === 'late').length;
      const totalAbsent = (attendanceData || []).filter(a => a.status === 'absent').length;
      const totalLateMinutes = (attendanceData || []).reduce((sum, a) => sum + (a.late_minutes || 0), 0);
      const totalWorkingDays = totalPresent + totalLate + totalAbsent;

      setSummary({
        totalWorkingDays,
        totalPresent,
        totalLate,
        totalAbsent,
        totalLateMinutes,
      });
    } catch (error) {
      console.error('Error fetching teacher report:', error);
    } finally {
      setLoading(false);
    }
  }, [teacherId, academicYearId, month]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel(`teacher-attendance-${teacherId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teacher_attendance',
          filter: `teacher_id=eq.${teacherId}`,
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData, teacherId]);

  const getAttendanceForDate = (date: Date): AttendanceRecord | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return attendance.find(a => a.attendance_date === dateStr);
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return 'উপস্থিত';
      case 'late': return 'বিলম্বে';
      case 'absent': return 'অনুপস্থিত';
      default: return '—';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'present': return 'erp-status-present';
      case 'late': return 'erp-status-late';
      case 'absent': return 'erp-status-absent';
      default: return '';
    }
  };

  const formatPunchTime = (punchTime: string | null) => {
    if (!punchTime) return '—';
    try {
      return format(new Date(punchTime), 'hh:mm a');
    } catch {
      return punchTime;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        শিক্ষকের তথ্য পাওয়া যায়নি
      </div>
    );
  }

  const now = new Date();
  const monthNameBn = format(month, 'MMMM yyyy', { locale: bn });

  return (
    <div className="report-container erp-report p-6 bg-background print:bg-white print:p-0">
      <ReportHeader
        title="শিক্ষক মাসিক উপস্থিতি রিপোর্ট"
        academicYear={academicYearName}
        month={monthNameBn}
      />

      {/* Teacher Info — Boxed Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg erp-info-box print:grid-cols-4 print:gap-[3mm] print:mb-[5mm] print:p-[3mm]">
        <div>
          <span className="text-sm text-muted-foreground print:text-[8pt] print:text-[#666]">নাম (Name)</span>
          <p className="font-semibold text-foreground print:text-black print:text-[9.5pt]">
            {teacher.name_bn || teacher.name}
          </p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground print:text-[8pt] print:text-[#666]">পদবী (Designation)</span>
          <p className="font-semibold text-foreground print:text-black print:text-[9.5pt]">
            {teacher.designation}
          </p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground print:text-[8pt] print:text-[#666]">শিফট (Shift)</span>
          <p className="font-semibold text-foreground print:text-black print:text-[9.5pt]">
            {teacher.shift_name_bn || teacher.shift_name}
          </p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground print:text-[8pt] print:text-[#666]">মোবাইল (Mobile)</span>
          <p className="font-semibold text-foreground print:text-black print:text-[9.5pt]">
            {teacher.mobile}
          </p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="border overflow-hidden print:border-[#666] print:rounded-none rounded-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted print:bg-[#f0f0f0]">
              <TableHead className="font-bold text-foreground print:text-black w-[8%] text-center">ক্র.নং</TableHead>
              <TableHead className="font-bold text-foreground print:text-black w-[18%]">তারিখ</TableHead>
              <TableHead className="font-bold text-foreground print:text-black w-[18%]">বার</TableHead>
              <TableHead className="font-bold text-foreground print:text-black w-[20%] text-center">প্রবেশ সময়</TableHead>
              <TableHead className="font-bold text-foreground print:text-black w-[22%]">অবস্থা</TableHead>
              <TableHead className="font-bold text-foreground print:text-black w-[14%] text-center">বিলম্ব (মি.)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {daysInMonth.map((day, idx) => {
              const record = getAttendanceForDate(day);
              const dayOfWeek = day.getDay();
              const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;

              return (
                <TableRow 
                  key={day.toISOString()} 
                  className={isWeekend ? 'bg-muted/20 print:bg-[#f9f9f9]' : 'print:border-[#bbb]'}
                >
                  <TableCell className="text-center print:text-black font-medium">
                    {toBengaliNum(idx + 1)}
                  </TableCell>
                  <TableCell className="font-medium print:text-black">
                    {toBengaliNum(format(day, 'dd'))} {format(day, 'MMM', { locale: bn })}
                  </TableCell>
                  <TableCell className="print:text-black">
                    {dayNames[dayOfWeek]}
                  </TableCell>
                  <TableCell className="text-center print:text-black">
                    {record ? formatPunchTime(record.punch_in_time) : '—'}
                  </TableCell>
                  <TableCell className={`font-semibold ${record ? getStatusClass(record.status) : ''}`}>
                    {record ? getStatusText(record.status) : (
                      <span className="text-muted-foreground print:text-[#bbb]">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center print:text-black">
                    {record?.late_minutes ? (
                      <span className="text-yellow-600 font-medium erp-status-late">{toBengaliNum(record.late_minutes)}</span>
                    ) : '—'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Monthly Summary — ERP Style */}
      {summary && (
        <div className="mt-6 erp-summary print:mt-[5mm]">
          <h3 className="text-lg font-bold mb-4 text-foreground print:text-black print:text-[10pt] print:mb-[3mm] print:border-b print:border-[#ccc] print:pb-[2mm]">
            মাসিক সারাংশ (Monthly Summary)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 print:grid-cols-5 print:gap-[3mm]">
            <div className="text-center p-3 bg-background rounded-lg print:bg-[#fafafa] print:border print:border-[#ccc] print:rounded-none print:p-[3mm]">
              <p className="text-2xl font-bold text-foreground print:text-black print:text-[14pt]">
                {toBengaliNum(summary.totalWorkingDays)}
              </p>
              <p className="text-sm text-muted-foreground print:text-[8pt] print:text-[#444]">মোট কার্যদিবস</p>
              <p className="text-xs text-muted-foreground print:text-[7pt] print:text-[#888]">Working Days</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg print:bg-[#fafafa] print:border print:border-[#ccc] print:rounded-none print:p-[3mm]" style={{ borderBottom: '2pt solid #16a34a' }}>
              <p className="text-2xl font-bold text-green-600 print:text-black print:text-[14pt]">
                {toBengaliNum(summary.totalPresent)}
              </p>
              <p className="text-sm text-green-700 print:text-[8pt] print:text-[#444]">উপস্থিত দিন</p>
              <p className="text-xs text-green-600 print:text-[7pt] print:text-[#888]">Present</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg print:bg-[#fafafa] print:border print:border-[#ccc] print:rounded-none print:p-[3mm]" style={{ borderBottom: '2pt solid #999' }}>
              <p className="text-2xl font-bold text-yellow-600 print:text-black print:text-[14pt]">
                {toBengaliNum(summary.totalLate)}
              </p>
              <p className="text-sm text-yellow-700 print:text-[8pt] print:text-[#444]">বিলম্ব দিন</p>
              <p className="text-xs text-yellow-600 print:text-[7pt] print:text-[#888]">Late</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg print:bg-[#fafafa] print:border print:border-[#ccc] print:rounded-none print:p-[3mm]" style={{ borderBottom: '2pt solid #dc2626' }}>
              <p className="text-2xl font-bold text-red-600 print:text-black print:text-[14pt]">
                {toBengaliNum(summary.totalAbsent)}
              </p>
              <p className="text-sm text-red-700 print:text-[8pt] print:text-[#444]">অনুপস্থিত দিন</p>
              <p className="text-xs text-red-600 print:text-[7pt] print:text-[#888]">Absent</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg print:bg-[#fafafa] print:border print:border-[#ccc] print:rounded-none print:p-[3mm]" style={{ borderBottom: '2pt solid #ea580c' }}>
              <p className="text-2xl font-bold text-orange-600 print:text-black print:text-[14pt]">
                {toBengaliNum(summary.totalLateMinutes)}
              </p>
              <p className="text-sm text-orange-700 print:text-[8pt] print:text-[#444]">মোট বিলম্ব মিনিট</p>
              <p className="text-xs text-orange-600 print:text-[7pt] print:text-[#888]">Late Minutes</p>
            </div>
          </div>
        </div>
      )}

      {/* Print Footer */}
      <div className="hidden print:flex erp-report-footer">
        <div>Generated by <strong>Amar Hajira Smart</strong></div>
        <div>তৈরির তারিখ: {toBengaliNum(format(now, 'dd'))}/{toBengaliNum(format(now, 'MM'))}/{toBengaliNum(format(now, 'yyyy'))} — {format(now, 'hh:mm a')}</div>
      </div>
    </div>
  );
}
