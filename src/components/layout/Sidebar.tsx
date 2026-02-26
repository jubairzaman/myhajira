import { useState, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
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
  Tv,
  Wallet,
  Package,
  Globe,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { supabase } from '@/integrations/supabase/client';

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
    href: '/dashboard',
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
    label: 'Fees',
    labelBn: 'ফি ম্যানেজমেন্ট',
    icon: Wallet,
    children: [
      { label: 'Fee Settings', labelBn: 'ফি সেটিংস', icon: ChevronRight, href: '/fees/settings' },
      { label: 'Fee Collection', labelBn: 'ফি আদায়', icon: ChevronRight, href: '/fees/collection' },
      { label: 'Fee Reports', labelBn: 'ফি রিপোর্ট', icon: ChevronRight, href: '/fees/reports' },
    ],
  },
  {
    label: 'Inventory',
    labelBn: 'ইনভেন্টরি',
    icon: Package,
    href: '/inventory',
  },
  {
    label: 'Website CMS',
    labelBn: 'ওয়েবসাইট',
    icon: Globe,
    children: [
      { label: 'Settings', labelBn: 'সেটিংস', icon: ChevronRight, href: '/website/admin/settings' },
      { label: 'Navigation', labelBn: 'ন্যাভিগেশন', icon: ChevronRight, href: '/website/admin/navigation' },
      { label: 'Home Page', labelBn: 'হোম পেজ', icon: ChevronRight, href: '/website/admin/home-page' },
      { label: 'Button Links', labelBn: 'বাটন লিংক', icon: ChevronRight, href: '/website/admin/cta-buttons' },
      { label: 'Popup Notice', labelBn: 'পপআপ নোটিশ', icon: ChevronRight, href: '/website/admin/popup-notice' },
      { label: 'Hero Slides', labelBn: 'হিরো স্লাইড', icon: ChevronRight, href: '/website/admin/hero-slides' },
      { label: 'About', labelBn: 'আমাদের সম্পর্কে', icon: ChevronRight, href: '/website/admin/about' },
      { label: 'Academics', labelBn: 'শিক্ষা কার্যক্রম', icon: ChevronRight, href: '/website/admin/academics' },
      { label: 'Admissions', labelBn: 'ভর্তি তথ্য', icon: ChevronRight, href: '/website/admin/admissions' },
      { label: 'Notices', labelBn: 'নোটিশ', icon: ChevronRight, href: '/website/admin/notices' },
      { label: 'Results', labelBn: 'ফলাফল', icon: ChevronRight, href: '/website/admin/results' },
      { label: 'Alumni', labelBn: 'প্রাক্তন ছাত্র', icon: ChevronRight, href: '/website/admin/alumni' },
      { label: 'Testimonials', labelBn: 'অভিভাবক মতামত', icon: ChevronRight, href: '/website/admin/parent-testimonials' },
      { label: 'Contacts', labelBn: 'বার্তা', icon: ChevronRight, href: '/website/admin/contacts' },
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
      { label: 'Admission Documents', labelBn: 'ভর্তি ডকুমেন্ট', icon: FileText, href: '/settings/documents' },
      { label: 'Devices', labelBn: 'ডিভাইস', icon: Cpu, href: '/devices' },
      { label: 'SMS Settings', labelBn: 'এসএমএস সেটিংস', icon: MessageSquare, href: '/sms' },
      { label: 'Monitor Display', labelBn: 'মনিটর ডিসপ্লে', icon: Tv, href: '/settings/monitor' },
      { label: 'User Management', labelBn: 'ইউজার ম্যানেজমেন্ট', icon: ChevronRight, href: '/settings/users' },
      { label: 'System Settings', labelBn: 'সিস্টেম সেটিংস', icon: Settings, href: '/settings' },
    ],
  },
  {
    label: 'Help',
    labelBn: 'সাহায্য',
    icon: HelpCircle,
    children: [
      { label: 'Documentation', labelBn: 'ডকুমেন্টেশন', icon: ChevronRight, href: '/help/documentation' },
      { label: 'Contact', labelBn: 'যোগাযোগ', icon: ChevronRight, href: '/help/contact' },
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
  const queryClient = useQueryClient();
  const { signOut } = useAuth();
  const { activeYear } = useAcademicYear();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

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

  // Prefetch data on link hover for faster navigation
  const handlePrefetch = useCallback((href?: string) => {
    if (!href || !activeYear?.id) return;
    
    if (href === '/students') {
      queryClient.prefetchQuery({
        queryKey: ['students', activeYear.id],
        queryFn: async () => {
          const { data } = await supabase
            .from('students')
            .select(`
              id, name, name_bn, student_id_number, guardian_mobile, blood_group, photo_url, is_active,
              shift:shifts(id, name),
              class:classes(id, name),
              section:sections(id, name),
              rfid_card:rfid_cards_students(card_number)
            `)
            .eq('academic_year_id', activeYear.id)
            .eq('is_active', true)
            .order('name');
          return data;
        },
        staleTime: 5 * 60 * 1000,
      });
    } else if (href === '/teachers') {
      queryClient.prefetchQuery({
        queryKey: ['teachers', activeYear.id],
        queryFn: async () => {
          const { data } = await supabase
            .from('teachers')
            .select(`
              id, name, name_bn, designation, mobile, blood_group, photo_url, is_active,
              shift:shifts(id, name),
              rfid_card:rfid_cards_teachers(card_number)
            `)
            .eq('academic_year_id', activeYear.id)
            .eq('is_active', true)
            .order('name');
          return data;
        },
        staleTime: 5 * 60 * 1000,
      });
    }
  }, [queryClient, activeYear?.id]);

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
        onMouseEnter={() => handlePrefetch(item.href)}
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
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 sidebar-scroll">
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