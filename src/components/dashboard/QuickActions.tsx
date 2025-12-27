import { Link } from 'react-router-dom';
import { 
  UserPlus, 
  GraduationCap, 
  Monitor, 
  FileText, 
  Settings,
  Cpu,
  MessageSquare,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  label: string;
  labelBn: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

const actions: QuickAction[] = [
  { 
    label: 'Add Student', 
    labelBn: 'শিক্ষার্থী যোগ', 
    icon: GraduationCap, 
    href: '/students/new',
    color: 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground',
  },
  { 
    label: 'Add Teacher', 
    labelBn: 'শিক্ষক যোগ', 
    icon: UserPlus, 
    href: '/teachers/new',
    color: 'bg-info/10 text-info hover:bg-info hover:text-info-foreground',
  },
  { 
    label: 'Gate Monitor', 
    labelBn: 'গেট মনিটর', 
    icon: Monitor, 
    href: '/monitor/gate',
    color: 'bg-success/10 text-success hover:bg-success hover:text-success-foreground',
  },
  { 
    label: 'Reports', 
    labelBn: 'রিপোর্ট', 
    icon: FileText, 
    href: '/reports',
    color: 'bg-warning/10 text-warning hover:bg-warning hover:text-warning-foreground',
  },
  { 
    label: 'Devices', 
    labelBn: 'ডিভাইস', 
    icon: Cpu, 
    href: '/devices',
    color: 'bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground',
  },
  { 
    label: 'SMS Settings', 
    labelBn: 'এসএমএস সেটিংস', 
    icon: MessageSquare, 
    href: '/sms',
    color: 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground',
  },
  { 
    label: 'Academic Year', 
    labelBn: 'শিক্ষাবর্ষ', 
    icon: Calendar, 
    href: '/academic-year',
    color: 'bg-info/10 text-info hover:bg-info hover:text-info-foreground',
  },
  { 
    label: 'Settings', 
    labelBn: 'সেটিংস', 
    icon: Settings, 
    href: '/settings',
    color: 'bg-muted text-muted-foreground hover:bg-foreground hover:text-background',
  },
];

export function QuickActions() {
  return (
    <div className="card-elevated p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <p className="text-sm text-muted-foreground font-bengali">দ্রুত কার্যক্রম</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.label}
              to={action.href}
              className={cn(
                'flex flex-col items-center gap-3 p-4 rounded-xl transition-all duration-300 group animate-fade-in-up',
                action.color
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Icon className="w-6 h-6 transition-transform group-hover:scale-110" />
              <div className="text-center">
                <p className="text-sm font-medium">{action.label}</p>
                <p className="text-xs opacity-80 font-bengali">{action.labelBn}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
