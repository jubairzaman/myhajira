import { Clock, UserCheck, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  name: string;
  nameBn: string;
  type: 'student' | 'teacher';
  status: 'present' | 'late' | 'absent';
  time: string;
  class?: string;
  designation?: string;
}

const activities: Activity[] = [
  { id: '1', name: 'Mohammad Rafiq', nameBn: 'মোহাম্মদ রফিক', type: 'student', status: 'present', time: '08:15', class: 'Class 10-A' },
  { id: '2', name: 'Fatima Begum', nameBn: 'ফাতিমা বেগম', type: 'teacher', status: 'late', time: '08:35', designation: 'Senior Teacher' },
  { id: '3', name: 'Abdul Karim', nameBn: 'আব্দুল করিম', type: 'student', status: 'present', time: '08:20', class: 'Class 8-B' },
  { id: '4', name: 'Nasreen Akter', nameBn: 'নাসরীন আক্তার', type: 'student', status: 'late', time: '08:45', class: 'Class 9-C' },
  { id: '5', name: 'Shahidul Islam', nameBn: 'শহীদুল ইসলাম', type: 'teacher', status: 'present', time: '08:00', designation: 'Assistant Teacher' },
];

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
  return (
    <div className="card-elevated p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
          <p className="text-sm text-muted-foreground font-bengali">সাম্প্রতিক কার্যকলাপ</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span>Live</span>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => {
          const status = statusConfig[activity.status];
          const Icon = status.icon;

          return (
            <div
              key={activity.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', status.bg)}>
                <Icon className={cn('w-5 h-5', status.color)} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-foreground truncate">{activity.name}</p>
                  <span className={cn(
                    'text-xs px-2 py-0.5 rounded-full',
                    activity.type === 'student' ? 'bg-primary/10 text-primary' : 'bg-info/10 text-info'
                  )}>
                    {activity.type === 'student' ? 'Student' : 'Teacher'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-bengali">{activity.nameBn}</p>
                <p className="text-xs text-muted-foreground">
                  {activity.class || activity.designation}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{activity.time}</p>
                <p className={cn('text-xs font-bengali', status.color)}>{status.labelBn}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
