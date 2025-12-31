import { useState, useEffect } from 'react';
import { Clock, UserCheck, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { format } from 'date-fns';

interface Activity {
  id: string;
  name: string;
  nameBn: string | null;
  type: 'student' | 'teacher';
  status: 'present' | 'late' | 'absent';
  time: string;
  class?: string;
  designation?: string;
}

const statusConfig = {
  present: {
    icon: UserCheck,
    color: 'text-success',
    bg: 'bg-success/10',
    label: 'Present',
    labelBn: 'উপস্থিত',
  },
  late: {
    icon: Clock,
    color: 'text-warning',
    bg: 'bg-warning/10',
    label: 'Late',
    labelBn: 'বিলম্বিত',
  },
  absent: {
    icon: XCircle,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    label: 'Absent',
    labelBn: 'অনুপস্থিত',
  },
};

export function RecentActivity() {
  const { activeYear } = useAcademicYear();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeYear) {
      fetchRecentActivity();
    }
  }, [activeYear]);

  // Real-time subscription
  useEffect(() => {
    if (!activeYear) return;

    const studentChannel = supabase
      .channel('student-attendance-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'student_attendance',
        },
        () => {
          fetchRecentActivity();
        }
      )
      .subscribe();

    const teacherChannel = supabase
      .channel('teacher-attendance-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'teacher_attendance',
        },
        () => {
          fetchRecentActivity();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(studentChannel);
      supabase.removeChannel(teacherChannel);
    };
  }, [activeYear]);

  const fetchRecentActivity = async () => {
    if (!activeYear) return;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      // Fetch recent student attendance
      const { data: studentData } = await supabase
        .from('student_attendance')
        .select(`
          id, punch_time, status,
          student:students(name, name_bn, classes(name))
        `)
        .eq('academic_year_id', activeYear.id)
        .eq('attendance_date', today)
        .order('punch_time', { ascending: false })
        .limit(5);

      // Fetch recent teacher attendance
      const { data: teacherData } = await supabase
        .from('teacher_attendance')
        .select(`
          id, punch_in_time, status,
          teacher:teachers(name, name_bn, designation)
        `)
        .eq('academic_year_id', activeYear.id)
        .eq('attendance_date', today)
        .order('punch_in_time', { ascending: false })
        .limit(5);

      const studentActivities: Activity[] = (studentData || []).map((record: any) => ({
        id: `student-${record.id}`,
        name: record.student?.name || 'Unknown',
        nameBn: record.student?.name_bn,
        type: 'student' as const,
        status: record.status as 'present' | 'late' | 'absent',
        time: format(new Date(record.punch_time), 'hh:mm a'),
        class: record.student?.classes?.name,
      }));

      const teacherActivities: Activity[] = (teacherData || []).map((record: any) => ({
        id: `teacher-${record.id}`,
        name: record.teacher?.name || 'Unknown',
        nameBn: record.teacher?.name_bn,
        type: 'teacher' as const,
        status: record.status as 'present' | 'late' | 'absent',
        time: record.punch_in_time ? format(new Date(record.punch_in_time), 'hh:mm a') : '-',
        designation: record.teacher?.designation,
      }));

      // Combine and sort by most recent
      const combined = [...studentActivities, ...teacherActivities]
        .slice(0, 8);

      setActivities(combined);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card-elevated p-6">
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="card-elevated p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-foreground">Recent Activity</h3>
          <p className="text-xs sm:text-sm text-muted-foreground font-bengali">সাম্প্রতিক কার্যকলাপ</p>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No activity yet today</p>
            <p className="text-xs font-bengali">আজ কোন কার্যকলাপ নেই</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const status = statusConfig[activity.status];
            const Icon = status.icon;

            return (
              <div
                key={activity.id}
                className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 rounded-lg hover:bg-muted/50 transition-colors animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn('w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0', status.bg)}>
                  <Icon className={cn('w-4 h-4 sm:w-5 sm:h-5', status.color)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground text-sm truncate">{activity.name}</p>
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 hidden sm:inline',
                      activity.type === 'student' ? 'bg-primary/10 text-primary' : 'bg-info/10 text-info'
                    )}>
                      {activity.type === 'student' ? 'Student' : 'Teacher'}
                    </span>
                  </div>
                  {activity.nameBn && (
                    <p className="text-xs text-muted-foreground font-bengali truncate">{activity.nameBn}</p>
                  )}
                  <p className="text-xs text-muted-foreground truncate">
                    {activity.class || activity.designation}
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-xs sm:text-sm font-medium text-foreground">{activity.time}</p>
                  <p className={cn('text-xs font-bengali', status.color)}>{status.labelBn}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
