import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  titleBn?: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
}

const variantStyles = {
  default: 'bg-card',
  success: 'bg-gradient-to-br from-success/10 to-success/5 border-success/20',
  warning: 'bg-gradient-to-br from-warning/10 to-warning/5 border-warning/20',
  destructive: 'bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20',
  info: 'bg-gradient-to-br from-info/10 to-info/5 border-info/20',
};

const iconStyles = {
  default: 'bg-primary/10 text-primary',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  destructive: 'bg-destructive/20 text-destructive',
  info: 'bg-info/20 text-info',
};

export function StatCard({ title, titleBn, value, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <div className={cn('card-stat border', variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {titleBn && (
            <p className="text-xs text-muted-foreground/70 font-bengali">{titleBn}</p>
          )}
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-3xl font-bold text-foreground animate-count-up">{value}</p>
        {trend && (
          <p className={cn(
            'text-sm mt-1 flex items-center gap-1',
            trend.isPositive ? 'text-success' : 'text-destructive'
          )}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
            <span className="text-muted-foreground">from yesterday</span>
          </p>
        )}
      </div>
    </div>
  );
}
