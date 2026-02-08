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

      const studentIds = studentsData.map(s => s.id);
      const { data: attendanceData } = await supabase
        .from('student_attendance')
        .select('student_id, attendance_date, status')
        .in('student_id', studentIds)
        .eq('academic_year_id', academicYearId)
        .gte('attendance_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('attendance_date', format(monthEnd, 'yyyy-MM-dd'));

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
          totalPresent: totalPresent + totalLate,
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
        return <span className="font-bold text-green-600 erp-status-present">P</span>;
      case 'late':
        return <span className="font-bold text-yellow-600 erp-status-late">L</span>;
      case 'absent':
        return <span className="font-bold text-red-600 erp-status-absent">A</span>;
      default:
        return <span className="text-muted-foreground print:text-[#bbb]">-</span>;
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

  const now = new Date();

  return (
    <div className="report-container class-register erp-report p-6 bg-background print:bg-white print:p-0">
      <ReportHeader
        title="শ্রেণী মাসিক উপস্থিতি রেজিস্টার"
        subtitle={`${className} - ${sectionName}`}
        academicYear={academicYearName}
        month={format(month, 'MMMM yyyy', { locale: bn })}
      />

      {/* Legend */}
      <div className="flex gap-6 mb-4 text-sm print:text-[8pt] print:gap-[5mm] print:mb-[3mm]">
        <span className="flex items-center gap-2">
          <span className="font-bold text-green-600 erp-status-present">P</span>
          <span>= উপস্থিত</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="font-bold text-yellow-600 erp-status-late">L</span>
          <span>= বিলম্ব</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="font-bold text-red-600 erp-status-absent">A</span>
          <span>= অনুপস্থিত</span>
        </span>
      </div>

      {/* Attendance Register Table */}
      <div className="border overflow-x-auto print:border-[#666] print:overflow-visible print:rounded-none rounded-lg">
        <Table className="min-w-max">
          <TableHeader>
            <TableRow className="bg-muted print:bg-[#f0f0f0]">
              <TableHead className="font-bold text-foreground print:text-black sticky left-0 bg-muted print:bg-[#f0f0f0] z-10 min-w-[60px] print:static">
                রোল
              </TableHead>
              <TableHead className="font-bold text-foreground print:text-black sticky left-[60px] bg-muted print:bg-[#f0f0f0] z-10 min-w-[150px] print:static">
                নাম
              </TableHead>
              {daysInMonth.map((day) => (
                <TableHead 
                  key={day.toISOString()} 
                  className="font-bold text-foreground print:text-black text-center min-w-[35px] px-1 print:min-w-0 print:px-[2mm]"
                >
                  {format(day, 'd')}
                </TableHead>
              ))}
              <TableHead className="font-bold text-foreground print:text-black text-center min-w-[50px]">
                উপ
              </TableHead>
              <TableHead className="font-bold text-foreground print:text-black text-center min-w-[50px]">
                অনু
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id} className="print:border-[#bbb]">
                <TableCell className="font-medium print:text-black sticky left-0 bg-background print:bg-white z-10 print:static">
                  {student.student_id_number || '-'}
                </TableCell>
                <TableCell className="print:text-black sticky left-[60px] bg-background print:bg-white z-10 print:static">
                  {student.name_bn || student.name}
                </TableCell>
                {daysInMonth.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const status = student.attendance[dateStr];
                  return (
                    <TableCell key={day.toISOString()} className="text-center px-1 print:px-[1mm]">
                      {getStatusSymbol(status)}
                    </TableCell>
                  );
                })}
                <TableCell className="text-center font-bold text-green-600 print:text-black">
                  {student.totalPresent}
                </TableCell>
                <TableCell className="text-center font-bold text-red-600 print:text-[#c00]">
                  {student.totalAbsent}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="mt-4 p-4 bg-muted/30 rounded-lg print:bg-[#fafafa] print:border print:border-[#ccc] print:rounded-none print:mt-[5mm] print:p-[3mm] erp-summary">
        <div className="flex gap-8 text-sm print:text-[9pt]">
          <span>মোট শিক্ষার্থী: <strong className="text-foreground print:text-black">{students.length}</strong></span>
          <span>মোট তারিখ: <strong className="text-foreground print:text-black">{daysInMonth.length}</strong></span>
        </div>
      </div>

      {/* Print Footer */}
      <div className="hidden print:flex erp-report-footer">
        <div>Generated by <strong>Amar Hajira Smart</strong></div>
        <div>তৈরির তারিখ: {format(now, 'dd/MM/yyyy')} — {format(now, 'hh:mm a')}</div>
      </div>
    </div>
  );
}
