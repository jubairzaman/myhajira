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

interface ClassMonthlyReportProps {
  classId: string;
  sectionId: string;
  month: Date;
  academicYearId: string;
  academicYearName: string;
  className: string;
  sectionName: string;
}

interface StudentWithAttendance {
  id: string;
  name: string;
  name_bn: string | null;
  student_id_number: string | null;
  attendance: { [date: string]: string };
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
}

export function ClassMonthlyReport({
  classId,
  sectionId,
  month,
  academicYearId,
  academicYearName,
  className,
  sectionName,
}: ClassMonthlyReportProps) {
  const [students, setStudents] = useState<StudentWithAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch students in class/section
      const { data: studentsData } = await supabase
        .from('students')
        .select('id, name, name_bn, student_id_number')
        .eq('class_id', classId)
        .eq('section_id', sectionId)
        .eq('is_active', true)
        .order('student_id_number');

      if (!studentsData || studentsData.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // Fetch all attendance for the month
      const studentIds = studentsData.map(s => s.id);
      const { data: attendanceData } = await supabase
        .from('student_attendance')
        .select('student_id, attendance_date, status')
        .in('student_id', studentIds)
        .eq('academic_year_id', academicYearId)
        .gte('attendance_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('attendance_date', format(monthEnd, 'yyyy-MM-dd'));

      // Map attendance to students
      const studentsWithAttendance: StudentWithAttendance[] = studentsData.map(student => {
        const studentAttendance = (attendanceData || []).filter(a => a.student_id === student.id);
        const attendanceMap: { [date: string]: string } = {};
        
        studentAttendance.forEach(a => {
          attendanceMap[a.attendance_date] = a.status;
        });

        const totalPresent = studentAttendance.filter(a => a.status === 'present').length;
        const totalLate = studentAttendance.filter(a => a.status === 'late').length;
        const totalAbsent = studentAttendance.filter(a => a.status === 'absent').length;

        return {
          ...student,
          attendance: attendanceMap,
          totalPresent: totalPresent + totalLate, // Late counts as present
          totalAbsent,
          totalLate,
        };
      });

      setStudents(studentsWithAttendance);
    } catch (error) {
      console.error('Error fetching class report:', error);
    } finally {
      setLoading(false);
    }
  }, [classId, sectionId, academicYearId, month]);

  useEffect(() => {
    fetchData();

    // Real-time subscription
    const channel = supabase
      .channel(`class-attendance-${classId}-${sectionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_attendance',
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData, classId, sectionId]);

  const getStatusSymbol = (status: string | undefined) => {
    switch (status) {
      case 'present':
        return <span className="text-green-600 font-bold">P</span>;
      case 'late':
        return <span className="text-yellow-600 font-bold">L</span>;
      case 'absent':
        return <span className="text-red-600 font-bold">A</span>;
      default:
        return <span className="text-gray-400">-</span>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        এই শ্রেণী/শাখায় কোনো শিক্ষার্থী পাওয়া যায়নি
      </div>
    );
  }

  return (
    <div className="report-container class-register p-6 bg-background print:bg-white print:p-0">
      <ReportHeader
        title="শ্রেণী মাসিক উপস্থিতি রেজিস্টার"
        subtitle={`${className} - ${sectionName}`}
        academicYear={academicYearName}
        month={format(month, 'MMMM yyyy', { locale: bn })}
      />

      {/* Legend */}
      <div className="flex gap-6 mb-4 text-sm print:text-xs">
        <span className="flex items-center gap-2">
          <span className="w-6 h-6 bg-green-100 border border-green-300 flex items-center justify-center text-green-600 font-bold rounded">P</span>
          <span>= উপস্থিত (Present)</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-6 h-6 bg-yellow-100 border border-yellow-300 flex items-center justify-center text-yellow-600 font-bold rounded">L</span>
          <span>= বিলম্ব (Late)</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-6 h-6 bg-red-100 border border-red-300 flex items-center justify-center text-red-600 font-bold rounded">A</span>
          <span>= অনুপস্থিত (Absent)</span>
        </span>
      </div>

      {/* Attendance Register Table */}
      <div className="border rounded-lg overflow-x-auto print:border-black">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow className="bg-muted print:bg-gray-100">
              <TableHead className="font-bold text-foreground print:text-black sticky left-0 bg-muted print:bg-gray-100 z-10 min-w-[60px]">
                রোল
              </TableHead>
              <TableHead className="font-bold text-foreground print:text-black sticky left-[60px] bg-muted print:bg-gray-100 z-10 min-w-[150px]">
                নাম
              </TableHead>
              {daysInMonth.map((day) => (
                <TableHead 
                  key={day.toISOString()} 
                  className="font-bold text-foreground print:text-black text-center min-w-[35px] px-1"
                >
                  {format(day, 'd')}
                </TableHead>
              ))}
              <TableHead className="font-bold text-foreground print:text-black text-center bg-green-50 print:bg-green-100 min-w-[50px]">
                উপ
              </TableHead>
              <TableHead className="font-bold text-foreground print:text-black text-center bg-red-50 print:bg-red-100 min-w-[50px]">
                অনু
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id} className="print:border-gray-300">
                <TableCell className="font-medium print:text-black sticky left-0 bg-background print:bg-white z-10">
                  {student.student_id_number || '-'}
                </TableCell>
                <TableCell className="print:text-black sticky left-[60px] bg-background print:bg-white z-10">
                  {student.name_bn || student.name}
                </TableCell>
                {daysInMonth.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const status = student.attendance[dateStr];
                  return (
                    <TableCell key={day.toISOString()} className="text-center px-1">
                      {getStatusSymbol(status)}
                    </TableCell>
                  );
                })}
                <TableCell className="text-center font-bold text-green-600 bg-green-50 print:bg-green-100">
                  {student.totalPresent}
                </TableCell>
                <TableCell className="text-center font-bold text-red-600 bg-red-50 print:bg-red-100">
                  {student.totalAbsent}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary Row */}
      <div className="mt-4 p-4 bg-muted/30 rounded-lg print:bg-gray-50 print:border">
        <div className="flex gap-8 text-sm">
          <span>
            মোট শিক্ষার্থী: <strong className="text-foreground print:text-black">{students.length}</strong>
          </span>
          <span>
            মোট তারিখ: <strong className="text-foreground print:text-black">{daysInMonth.length}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
