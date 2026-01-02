import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

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
    label: 'Structure',
    labelBn: 'কাঠামো',
    icon: Building2,
    children: [
      { label: 'Shifts', labelBn: 'শিফট', icon: ChevronRight, href: '/shifts' },
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
    label: 'Reports',
    labelBn: 'রিপোর্ট',
    icon: FileText,
    href: '/reports',
  },
  {
    label: 'Settings',
    labelBn: 'সেটিংস',
    icon: Settings,
    children: [
      { label: 'Academic Year', labelBn: 'শিক্ষাবর্ষ', icon: Calendar, href: '/academic-year' },
      { label: 'School Calendar', labelBn: 'স্কুল ক্যালেন্ডার', icon: Calendar, href: '/calendar' },
      { label: 'Devices', labelBn: 'ডিভাইস', icon: Cpu, href: '/devices' },
      { label: 'SMS Settings', labelBn: 'এসএমএস সেটিংস', icon: MessageSquare, href: '/sms' },
      { label: 'System Settings', labelBn: 'সিস্টেম সেটিংস', icon: Settings, href: '/settings' },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Structure', 'Attendance', 'Live Monitor', 'Settings']);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleExpand = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return location.pathname === href;
  };

  const handleNavClick = () => {
    if (onClose) {
      onClose();
    }
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
        onClick={handleNavClick}
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
    <aside className={cn(
      "fixed left-0 top-0 h-full w-64 bg-sidebar text-sidebar-foreground flex flex-col z-50 transition-transform duration-300",
      // Mobile: hidden by default, shown when isOpen
      "lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg">আমার হাজিরা</h1>
              <p className="text-xs opacity-70">Amar Hajira</p>
            </div>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => renderNavItem(item))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <button onClick={handleLogout} className="nav-item w-full text-red-300 hover:text-red-200 hover:bg-red-500/20">
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