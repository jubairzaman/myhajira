import { useEffect, useState, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { bn } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { ReportHeader } from './ReportHeader';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
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
      // Fetch teacher info with shift
      const { data: teacherData } = await supabase
        .from('teachers')
        .select(`
          id,
          name,
          name_bn,
          designation,
          mobile,
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

      // Fetch attendance records
      const { data: attendanceData } = await supabase
        .from('teacher_attendance')
        .select('attendance_date, status, punch_in_time, late_minutes')
        .eq('teacher_id', teacherId)
        .eq('academic_year_id', academicYearId)
        .gte('attendance_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('attendance_date', format(monthEnd, 'yyyy-MM-dd'))
        .order('attendance_date');

      setAttendance(attendanceData || []);

      // Calculate summary (counting working days as days with any attendance record or expected)
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

    // Real-time subscription
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-500 hover:bg-green-600">উপস্থিত</Badge>;
      case 'late':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">বিলম্ব</Badge>;
      case 'absent':
        return <Badge variant="destructive">অনুপস্থিত</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const formatPunchTime = (punchTime: string | null) => {
    if (!punchTime) return '-';
    try {
      return format(new Date(punchTime), 'hh:mm a', { locale: bn });
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

  return (
    <div className="report-container p-6 bg-background print:bg-white print:p-0">
      <ReportHeader
        title="শিক্ষক মাসিক উপস্থিতি রিপোর্ট"
        academicYear={academicYearName}
        month={format(month, 'MMMM yyyy', { locale: bn })}
      />

      {/* Teacher Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-muted/30 rounded-lg print:bg-gray-50 print:border print:border-gray-300">
        <div>
          <span className="text-sm text-muted-foreground print:text-gray-600">নাম:</span>
          <p className="font-semibold text-foreground print:text-black">
            {teacher.name_bn || teacher.name}
          </p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground print:text-gray-600">পদবী:</span>
          <p className="font-semibold text-foreground print:text-black">
            {teacher.designation}
          </p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground print:text-gray-600">শিফট:</span>
          <p className="font-semibold text-foreground print:text-black">
            {teacher.shift_name_bn || teacher.shift_name}
          </p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground print:text-gray-600">মোবাইল:</span>
          <p className="font-semibold text-foreground print:text-black">
            {teacher.mobile}
          </p>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="border rounded-lg overflow-hidden print:border-black">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted print:bg-gray-100">
              <TableHead className="font-bold text-foreground print:text-black">তারিখ</TableHead>
              <TableHead className="font-bold text-foreground print:text-black">বার</TableHead>
              <TableHead className="font-bold text-foreground print:text-black">প্রবেশ সময়</TableHead>
              <TableHead className="font-bold text-foreground print:text-black">অবস্থা</TableHead>
              <TableHead className="font-bold text-foreground print:text-black">বিলম্ব (মিনিট)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {daysInMonth.map((day) => {
              const record = getAttendanceForDate(day);
              const dayOfWeek = day.getDay();

              return (
                <TableRow key={day.toISOString()} className="print:border-gray-300">
                  <TableCell className="font-medium print:text-black">
                    {format(day, 'dd', { locale: bn })}
                  </TableCell>
                  <TableCell className="print:text-black">
                    {dayNames[dayOfWeek]}
                  </TableCell>
                  <TableCell className="print:text-black">
                    {record ? formatPunchTime(record.punch_in_time) : '-'}
                  </TableCell>
                  <TableCell>
                    {record ? getStatusBadge(record.status) : (
                      <span className="text-muted-foreground print:text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="print:text-black">
                    {record?.late_minutes ? (
                      <span className="text-yellow-600 font-medium">{record.late_minutes}</span>
                    ) : '-'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mt-6 p-4 bg-muted/30 rounded-lg print:bg-gray-50 print:border print:border-gray-300">
          <h3 className="text-lg font-bold mb-4 text-foreground print:text-black">মাসিক সারাংশ</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-background rounded-lg print:bg-white print:border">
              <p className="text-2xl font-bold text-foreground print:text-black">
                {summary.totalWorkingDays}
              </p>
              <p className="text-sm text-muted-foreground print:text-gray-600">মোট কার্যদিবস</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg print:border print:border-green-300">
              <p className="text-2xl font-bold text-green-600">
                {summary.totalPresent}
              </p>
              <p className="text-sm text-green-700">উপস্থিত দিন</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg print:border print:border-yellow-300">
              <p className="text-2xl font-bold text-yellow-600">
                {summary.totalLate}
              </p>
              <p className="text-sm text-yellow-700">বিলম্ব দিন</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg print:border print:border-red-300">
              <p className="text-2xl font-bold text-red-600">
                {summary.totalAbsent}
              </p>
              <p className="text-sm text-red-700">অনুপস্থিত দিন</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg print:border print:border-orange-300">
              <p className="text-2xl font-bold text-orange-600">
                {summary.totalLateMinutes}
              </p>
              <p className="text-sm text-orange-700">মোট বিলম্ব মিনিট</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
