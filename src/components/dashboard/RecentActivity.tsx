import { useEffect, useState, useCallback } from 'react';
import { Clock, UserCheck, XCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useRecentActivity, Activity } from '@/hooks/queries/useRecentActivity';
import { format } from 'date-fns';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
  const { data: activities = [], isLoading } = useRecentActivity(activeYear?.id);

  // Optimized real-time subscription - just invalidate cache instead of refetching
  useEffect(() => {
    if (!activeYear) return;

    const channel = supabase
      .channel('attendance-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'student_attendance',
        },
        () => {
          // Invalidate the query to trigger a refetch
          queryClient.invalidateQueries({ queryKey: ['recent-activity', activeYear.id] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'teacher_attendance',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['recent-activity', activeYear.id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeYear, queryClient]);

  if (isLoading) {
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
