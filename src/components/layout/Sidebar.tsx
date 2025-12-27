import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  Monitor,
  Cpu,
  MessageSquare,
  FileText,
  Settings,
  Calendar,
  ChevronDown,
  ChevronRight,
  LogOut,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  labelBn?: string;
  icon: React.ElementType;
  href?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    labelBn: 'ড্যাশবোর্ড',
    icon: LayoutDashboard,
    href: '/',
  },
  {
    label: 'Academic Year',
    labelBn: 'শিক্ষাবর্ষ',
    icon: Calendar,
    href: '/academic-year',
  },
  {
    label: 'Structure',
    labelBn: 'কাঠামো',
    icon: Building2,
    children: [
      { label: 'Shifts', labelBn: 'শিফট', icon: ChevronRight, href: '/shifts' },
      { label: 'Panels', labelBn: 'প্যানেল', icon: ChevronRight, href: '/panels' },
      { label: 'Classes', labelBn: 'শ্রেণী', icon: ChevronRight, href: '/classes' },
      { label: 'Sections', labelBn: 'শাখা', icon: ChevronRight, href: '/sections' },
    ],
  },
  {
    label: 'Students',
    labelBn: 'শিক্ষার্থী',
    icon: GraduationCap,
    href: '/students',
  },
  {
    label: 'Teachers',
    labelBn: 'শিক্ষক',
    icon: Users,
    href: '/teachers',
  },
  {
    label: 'Attendance',
    labelBn: 'উপস্থিতি',
    icon: UserCheck,
    children: [
      { label: 'Student Attendance', labelBn: 'শিক্ষার্থী উপস্থিতি', icon: ChevronRight, href: '/attendance/students' },
      { label: 'Teacher Attendance', labelBn: 'শিক্ষক উপস্থিতি', icon: ChevronRight, href: '/attendance/teachers' },
      { label: 'Manual Entry', labelBn: 'ম্যানুয়াল এন্ট্রি', icon: ChevronRight, href: '/attendance/manual' },
    ],
  },
  {
    label: 'Live Monitor',
    labelBn: 'লাইভ মনিটর',
    icon: Monitor,
    children: [
      { label: 'Gate Monitor', labelBn: 'গেট মনিটর', icon: ChevronRight, href: '/monitor/gate' },
      { label: 'Office Monitor', labelBn: 'অফিস মনিটর', icon: ChevronRight, href: '/monitor/office' },
    ],
  },
  {
    label: 'Devices',
    labelBn: 'ডিভাইস',
    icon: Cpu,
    href: '/devices',
  },
  {
    label: 'SMS',
    labelBn: 'এসএমএস',
    icon: MessageSquare,
    href: '/sms',
  },
  {
    label: 'Reports',
    labelBn: 'রিপোর্ট',
    icon: FileText,
    href: '/reports',
  },
  {
    label: 'Settings',
    labelBn: 'সেটিংস',
    icon: Settings,
    href: '/settings',
  },
];

export function Sidebar() {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Structure', 'Attendance', 'Live Monitor']);

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return location.pathname === href;
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const Icon = item.icon;

    if (hasChildren) {
      return (
        <div key={item.label}>
          <button
            onClick={() => toggleExpand(item.label)}
            className={cn(
              'nav-item w-full justify-between',
              level > 0 && 'pl-10'
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5" />
              <div className="text-left">
                <span className="block text-sm">{item.label}</span>
                {item.labelBn && (
                  <span className="block text-xs opacity-70 font-bengali">{item.labelBn}</span>
                )}
              </div>
            </div>
            <ChevronDown
              className={cn('w-4 h-4 transition-transform', isExpanded && 'rotate-180')}
            />
          </button>
          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children?.map((child) => renderNavItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        to={item.href || '#'}
        className={cn(
          'nav-item',
          level > 0 && 'pl-10',
          isActive(item.href) && 'active'
        )}
      >
        <Icon className="w-5 h-5" />
        <div>
          <span className="block text-sm">{item.label}</span>
          {item.labelBn && level === 0 && (
            <span className="block text-xs opacity-70 font-bengali">{item.labelBn}</span>
          )}
        </div>
      </Link>
    );
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-sidebar text-sidebar-foreground flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">আমার হাজিরা</h1>
            <p className="text-xs opacity-70">Amar Hajira</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => renderNavItem(item))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <button className="nav-item w-full text-red-300 hover:text-red-200 hover:bg-red-500/20">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
        <p className="text-xs text-center mt-4 opacity-50">
          Developed by Jubair Zaman
        </p>
      </div>
    </aside>
  );
}
