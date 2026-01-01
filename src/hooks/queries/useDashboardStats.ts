import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendanceRate: number;
}

export function useDashboardStats(academicYearId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard-stats', academicYearId],
    queryFn: async (): Promise<DashboardStats> => {
      if (!academicYearId) {
        throw new Error('Academic year ID is required');
      }

      const today = format(new Date(), 'yyyy-MM-dd');

      // Use the optimized database function
      const { data, error } = await supabase.rpc('get_dashboard_stats', {
        p_academic_year_id: academicYearId,
        p_date: today,
      });

      if (error) {
        console.error('Dashboard stats error:', error);
        throw error;
      }

      const stats = data as {
        total_students: number;
        total_teachers: number;
        present_count: number;
        late_count: number;
        absent_count: number;
      };

      const totalActive = stats.total_students + stats.total_teachers;
      const totalPresent = stats.present_count + stats.late_count;
      const attendanceRate = totalActive > 0 ? (totalPresent / totalActive) * 100 : 0;

      return {
        totalStudents: stats.total_students,
        totalTeachers: stats.total_teachers,
        presentCount: stats.present_count,
        lateCount: stats.late_count,
        absentCount: totalActive - totalPresent > 0 ? totalActive - totalPresent : 0,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
      };
    },
    enabled: !!academicYearId,
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}
