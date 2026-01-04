import { useEffect, useState, useCallback } from 'react';
import { format, getDaysInMonth, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
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

interface StudentMonthlyReportProps {
  studentId: string;
  month: Date;
  academicYearId: string;
  academicYearName: string;
}

interface StudentInfo {
  id: string;
  name: string;
  name_bn: string | null;
  student_id_number: string | null;
  guardian_mobile: string;
  class_name: string;
  class_name_bn: string | null;
  section_name: string;
  section_name_bn: string | null;
}

interface AttendanceRecord {
  attendance_date: string;
  status: string;
  punch_time: string | null;
}

interface Summary {
  totalWorkingDays: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  attendancePercentage: number;
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

export function StudentMonthlyReport({ 
  studentId, 
  month, 
  academicYearId,
  academicYearName 
}: StudentMonthlyReportProps) {
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch student info with class and section
      const { data: studentData } = await supabase
        .from('students')
        .select(`
          id,
          name,
          name_bn,
          student_id_number,
          guardian_mobile,
          class_id,
          classes:class_id (name, name_bn),
          sections:section_id (name, name_bn)
        `)
        .eq('id', studentId)
        .single();

      if (studentData) {
        setStudent({
          id: studentData.id,
          name: studentData.name,
          name_bn: studentData.name_bn,
          student_id_number: studentData.student_id_number,
          guardian_mobile: studentData.guardian_mobile,
          class_name: (studentData.classes as any)?.name || '',
          class_name_bn: (studentData.classes as any)?.name_bn,
          section_name: (studentData.sections as any)?.name || '',
          section_name_bn: (studentData.sections as any)?.name_bn,
        });
      }

      const classId = studentData?.class_id;

      // Fetch attendance records
      const { data: attendanceData } = await supabase
        .from('student_attendance')
        .select('attendance_date, status, punch_time')
        .eq('student_id', studentId)
        .eq('academic_year_id', academicYearId)
        .gte('attendance_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('attendance_date', format(monthEnd, 'yyyy-MM-dd'))
        .order('attendance_date');

      setAttendance(attendanceData || []);

      // Calculate working days using the database function
      const { data: workingDaysData } = await supabase.rpc('get_working_days_count', {
        p_start_date: format(monthStart, 'yyyy-MM-dd'),
        p_end_date: format(monthEnd, 'yyyy-MM-dd'),
        p_class_id: classId,
        p_academic_year_id: academicYearId,
      });

      const totalWorkingDays = workingDaysData || 0;
      const totalPresent = (attendanceData || []).filter(a => a.status === 'present').length;
      const totalLate = (attendanceData || []).filter(a => a.status === 'late').length;
      const totalAbsent = (attendanceData || []).filter(a => a.status === 'absent').length;
      const attendancePercentage = totalWorkingDays > 0 
        ? Math.round(((totalPresent + totalLate) / totalWorkingDays) * 100) 
        : 0;

      setSummary({
        totalWorkingDays,
        totalPresent,
        totalAbsent,
        totalLate,
        attendancePercentage,
      });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  }, [studentId, academicYearId, month]);

  useEffect(() => {
    fetchData();

    // Real-time subscription
    const channel = supabase
      .channel(`student-attendance-${studentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_attendance',
          filter: `student_id=eq.${studentId}`,
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData, studentId]);

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

  if (!student) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        শিক্ষার্থীর তথ্য পাওয়া যায়নি
      </div>
    );
  }

  return (
    <div className="report-container p-6 bg-background print:bg-white print:p-0">
      <ReportHeader
        title="শিক্ষার্থী মাসিক উপস্থিতি রিপোর্ট"
        academicYear={academicYearName}
        month={format(month, 'MMMM yyyy', { locale: bn })}
      />

      {/* Student Info */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6 p-4 bg-muted/30 rounded-lg print:bg-gray-50 print:border print:border-gray-300">
        <div>
          <span className="text-sm text-muted-foreground print:text-gray-600">নাম:</span>
          <p className="font-semibold text-foreground print:text-black">
            {student.name_bn || student.name}
          </p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground print:text-gray-600">শ্রেণী:</span>
          <p className="font-semibold text-foreground print:text-black">
            {student.class_name_bn || student.class_name}
          </p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground print:text-gray-600">শাখা:</span>
          <p className="font-semibold text-foreground print:text-black">
            {student.section_name_bn || student.section_name}
          </p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground print:text-gray-600">রোল:</span>
          <p className="font-semibold text-foreground print:text-black">
            {student.student_id_number || '-'}
          </p>
        </div>
        <div>
          <span className="text-sm text-muted-foreground print:text-gray-600">অভিভাবকের মোবাইল:</span>
          <p className="font-semibold text-foreground print:text-black">
            {student.guardian_mobile}
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
              <TableHead className="font-bold text-foreground print:text-black">অবস্থা</TableHead>
              <TableHead className="font-bold text-foreground print:text-black">পাঞ্চ সময়</TableHead>
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
                  <TableCell>
                    {record ? getStatusBadge(record.status) : (
                      <span className="text-muted-foreground print:text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell className="print:text-black">
                    {record ? formatPunchTime(record.punch_time) : '-'}
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
              <p className="text-sm text-green-700">উপস্থিত</p>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg print:border print:border-yellow-300">
              <p className="text-2xl font-bold text-yellow-600">
                {summary.totalLate}
              </p>
              <p className="text-sm text-yellow-700">বিলম্ব</p>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg print:border print:border-red-300">
              <p className="text-2xl font-bold text-red-600">
                {summary.totalAbsent}
              </p>
              <p className="text-sm text-red-700">অনুপস্থিত</p>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg print:border print:border-blue-300">
              <p className="text-2xl font-bold text-blue-600">
                {summary.attendancePercentage}%
              </p>
              <p className="text-sm text-blue-700">উপস্থিতি হার</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
