import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export interface Activity {
  id: string;
  name: string;
  nameBn: string | null;
  type: 'student' | 'teacher';
  status: 'present' | 'late' | 'absent';
  time: string;
  class?: string;
  designation?: string;
  punchTime: Date;
}

export function useRecentActivity(academicYearId: string | undefined) {
  return useQuery({
    queryKey: ['recent-activity', academicYearId],
    queryFn: async () => {
      if (!academicYearId) return [];

      const today = format(new Date(), 'yyyy-MM-dd');

      // Fetch both in parallel
      const [studentResult, teacherResult] = await Promise.all([
        supabase
          .from('student_attendance')
          .select(`
            id, punch_time, status,
            student:students(name, name_bn, classes(name))
          `)
          .eq('academic_year_id', academicYearId)
          .eq('attendance_date', today)
          .order('punch_time', { ascending: false })
          .limit(5),
        supabase
          .from('teacher_attendance')
          .select(`
            id, punch_in_time, status,
            teacher:teachers(name, name_bn, designation)
          `)
          .eq('academic_year_id', academicYearId)
          .eq('attendance_date', today)
          .order('punch_in_time', { ascending: false })
          .limit(5),
      ]);

      const studentActivities: Activity[] = (studentResult.data || []).map((record: any) => ({
        id: `student-${record.id}`,
        name: record.student?.name || 'Unknown',
        nameBn: record.student?.name_bn,
        type: 'student' as const,
        status: record.status as 'present' | 'late' | 'absent',
        time: format(new Date(record.punch_time), 'hh:mm a'),
        class: record.student?.classes?.name,
        punchTime: new Date(record.punch_time),
      }));

      const teacherActivities: Activity[] = (teacherResult.data || []).map((record: any) => ({
        id: `teacher-${record.id}`,
        name: record.teacher?.name || 'Unknown',
        nameBn: record.teacher?.name_bn,
        type: 'teacher' as const,
        status: record.status as 'present' | 'late' | 'absent',
        time: record.punch_in_time ? format(new Date(record.punch_in_time), 'hh:mm a') : '-',
        designation: record.teacher?.designation,
        punchTime: record.punch_in_time ? new Date(record.punch_in_time) : new Date(0),
      }));

      // Combine and sort by most recent punch time
      return [...studentActivities, ...teacherActivities]
        .sort((a, b) => b.punchTime.getTime() - a.punchTime.getTime())
        .slice(0, 8);
    },
    enabled: !!academicYearId,
    staleTime: 30 * 1000, // 30 seconds - refresh more frequently for activity
    refetchInterval: 30 * 1000, // Auto refetch every 30 seconds
  });
}
