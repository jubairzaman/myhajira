import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { AttendanceChart } from '@/components/dashboard/AttendanceChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Users, GraduationCap, UserCheck, Clock, XCircle, TrendingUp } from 'lucide-react';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useDashboardStats } from '@/hooks/queries/useDashboardStats';
import { DashboardSkeleton } from '@/components/skeletons/DashboardSkeleton';

export default function Dashboard() {
  const { activeYear, loading: yearLoading } = useAcademicYear();
  const { data: stats, isLoading: statsLoading, isFetching } = useDashboardStats(activeYear?.id);

  const isInitialLoad = yearLoading || (statsLoading && !stats);

  const statCards = [
    {
      title: 'Total Students',
      titleBn: 'মোট শিক্ষার্থী',
      value: stats?.totalStudents ?? 0,
      icon: GraduationCap,
      variant: 'info' as const,
    },
    {
      title: 'Total Teachers',
      titleBn: 'মোট শিক্ষক',
      value: stats?.totalTeachers ?? 0,
      icon: Users,
      variant: 'default' as const,
    },
    {
      title: 'Present Today',
      titleBn: 'আজ উপস্থিত',
      value: stats?.presentCount ?? 0,
      icon: UserCheck,
      variant: 'success' as const,
    },
    {
      title: 'Late Today',
      titleBn: 'আজ বিলম্বিত',
      value: stats?.lateCount ?? 0,
      icon: Clock,
      variant: 'warning' as const,
    },
    {
      title: 'Absent Today',
      titleBn: 'আজ অনুপস্থিত',
      value: stats?.absentCount ?? 0,
      icon: XCircle,
      variant: 'destructive' as const,
    },
    {
      title: 'Attendance Rate',
      titleBn: 'উপস্থিতি হার',
      value: `${stats?.attendanceRate ?? 0}%`,
      icon: TrendingUp,
      variant: 'success' as const,
    },
  ];

  // Show skeleton only on initial load
  if (isInitialLoad) {
    return (
      <MainLayout title="Dashboard" titleBn="ড্যাশবোর্ড">
        <DashboardSkeleton />
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Dashboard" titleBn="ড্যাশবোর্ড">
      {/* Stats Grid */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8 stagger-children ${isFetching ? 'opacity-70' : ''}`}>
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
