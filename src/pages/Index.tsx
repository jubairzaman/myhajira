import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { AttendanceChart } from '@/components/dashboard/AttendanceChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Users, GraduationCap, UserCheck, Clock, XCircle, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { format } from 'date-fns';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  attendanceRate: number;
}

export default function Dashboard() {
  const { activeYear } = useAcademicYear();
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    presentToday: 0,
    lateToday: 0,
    absentToday: 0,
    attendanceRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeYear) {
      fetchDashboardStats();
    }
  }, [activeYear]);

  const fetchDashboardStats = async () => {
    if (!activeYear) return;
    setLoading(true);

    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      // Fetch total students count
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('academic_year_id', activeYear.id)
        .eq('is_active', true);

      // Fetch total teachers count
      const { count: teacherCount } = await supabase
        .from('teachers')
        .select('*', { count: 'exact', head: true })
        .eq('academic_year_id', activeYear.id)
        .eq('is_active', true);

      // Fetch student attendance for today
      const { data: studentAttendance } = await supabase
        .from('student_attendance')
        .select('status')
        .eq('academic_year_id', activeYear.id)
        .eq('attendance_date', today);

      // Fetch teacher attendance for today
      const { data: teacherAttendance } = await supabase
        .from('teacher_attendance')
        .select('status')
        .eq('academic_year_id', activeYear.id)
        .eq('attendance_date', today);

      const allAttendance = [
        ...(studentAttendance || []),
        ...(teacherAttendance || []),
      ];

      const presentCount = allAttendance.filter((a) => a.status === 'present').length;
      const lateCount = allAttendance.filter((a) => a.status === 'late').length;
      const totalActive = (studentCount || 0) + (teacherCount || 0);
      const totalPresent = presentCount + lateCount;
      const absentCount = totalActive - totalPresent;
      const attendanceRate = totalActive > 0 ? (totalPresent / totalActive) * 100 : 0;

      setStats({
        totalStudents: studentCount || 0,
        totalTeachers: teacherCount || 0,
        presentToday: presentCount,
        lateToday: lateCount,
        absentToday: absentCount > 0 ? absentCount : 0,
        attendanceRate: Math.round(attendanceRate * 10) / 10,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      titleBn: 'মোট শিক্ষার্থী',
      value: stats.totalStudents,
      icon: GraduationCap,
      variant: 'info' as const,
    },
    {
      title: 'Total Teachers',
      titleBn: 'মোট শিক্ষক',
      value: stats.totalTeachers,
      icon: Users,
      variant: 'default' as const,
    },
    {
      title: 'Present Today',
      titleBn: 'আজ উপস্থিত',
      value: stats.presentToday,
      icon: UserCheck,
      variant: 'success' as const,
    },
    {
      title: 'Late Today',
      titleBn: 'আজ বিলম্বিত',
      value: stats.lateToday,
      icon: Clock,
      variant: 'warning' as const,
    },
    {
      title: 'Absent Today',
      titleBn: 'আজ অনুপস্থিত',
      value: stats.absentToday,
      icon: XCircle,
      variant: 'destructive' as const,
    },
    {
      title: 'Attendance Rate',
      titleBn: 'উপস্থিতি হার',
      value: `${stats.attendanceRate}%`,
      icon: TrendingUp,
      variant: 'success' as const,
    },
  ];

  if (loading) {
    return (
      <MainLayout title="Dashboard" titleBn="ড্যাশবোর্ড">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard" titleBn="ড্যাশবোর্ড">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8 stagger-children">
        {statCards.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-6 sm:mb-8">
        <QuickActions />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <AttendanceChart />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>
    </MainLayout>
  );
}
