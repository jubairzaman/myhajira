import { MainLayout } from '@/components/layout/MainLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { AttendanceChart } from '@/components/dashboard/AttendanceChart';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { Users, GraduationCap, UserCheck, Clock, XCircle, TrendingUp } from 'lucide-react';

const stats = [
  {
    title: 'Total Students',
    titleBn: 'মোট শিক্ষার্থী',
    value: 1250,
    icon: GraduationCap,
    variant: 'info' as const,
    trend: { value: 5, isPositive: true },
  },
  {
    title: 'Total Teachers',
    titleBn: 'মোট শিক্ষক',
    value: 48,
    icon: Users,
    variant: 'default' as const,
  },
  {
    title: 'Present Today',
    titleBn: 'আজ উপস্থিত',
    value: 1142,
    icon: UserCheck,
    variant: 'success' as const,
    trend: { value: 2.5, isPositive: true },
  },
  {
    title: 'Late Today',
    titleBn: 'আজ বিলম্বিত',
    value: 58,
    icon: Clock,
    variant: 'warning' as const,
    trend: { value: 8, isPositive: false },
  },
  {
    title: 'Absent Today',
    titleBn: 'আজ অনুপস্থিত',
    value: 50,
    icon: XCircle,
    variant: 'destructive' as const,
  },
  {
    title: 'Attendance Rate',
    titleBn: 'উপস্থিতি হার',
    value: '91.4%',
    icon: TrendingUp,
    variant: 'success' as const,
    trend: { value: 1.2, isPositive: true },
  },
];

export default function Dashboard() {
  return (
    <MainLayout title="Dashboard" titleBn="ড্যাশবোর্ড">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8 stagger-children">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <QuickActions />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
