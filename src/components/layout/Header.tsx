import { ReactNode, useState, useEffect } from 'react';
import { Bell, Search, User, Calendar, LogOut, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  title: string;
  titleBn?: string;
  children?: ReactNode;
}

interface Notification {
  id: string;
  person_name: string;
  person_type: string;
  punch_time: string;
  status?: string;
}

export function Header({ title, titleBn, children }: HeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const currentDate = new Date().toLocaleDateString('bn-BD', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Fetch recent punch logs for notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const { data: punchLogs, error } = await supabase
        .from('punch_logs')
        .select('id, person_id, person_type, punch_time')
        .eq('punch_date', today)
        .order('punch_time', { ascending: false })
        .limit(5);

      if (error) throw error;

      const notifs: Notification[] = [];
      for (const log of punchLogs || []) {
        if (log.person_type === 'student') {
          const { data: student } = await supabase
            .from('students')
            .select('name')
            .eq('id', log.person_id)
            .single();
          
          if (student) {
            notifs.push({
              id: log.id,
              person_name: student.name,
              person_type: 'student',
              punch_time: log.punch_time,
            });
          }
        } else {
          const { data: teacher } = await supabase
            .from('teachers')
            .select('name')
            .eq('id', log.person_id)
            .single();
          
          if (teacher) {
            notifs.push({
              id: log.id,
              person_name: teacher.name,
              person_type: 'teacher',
              punch_time: log.punch_time,
            });
          }
        }
      }
      setNotifications(notifs);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Real-time subscription for new punches
  useEffect(() => {
    const channel = supabase
      .channel('header-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'punch_logs',
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const formatPunchTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const userEmail = user?.email || 'user@example.com';
  const userName = user?.user_metadata?.full_name || userEmail.split('@')[0];

  return (
    <header className="h-14 sm:h-16 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu button slot */}
        {children}
        
        <div>
          <h1 className="text-lg sm:text-xl font-semibold text-foreground">{title}</h1>
          {titleBn && (
            <p className="text-xs sm:text-sm text-muted-foreground font-bengali hidden sm:block">{titleBn}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Date Display */}
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
          <Calendar className="w-4 h-4" />
          <span className="font-bengali">{currentDate}</span>
        </div>

        {/* Search */}
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10 w-64 bg-muted/50 border-0"
          />
        </div>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative w-9 h-9 sm:w-10 sm:h-10"
              onClick={fetchNotifications}
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b">
              <h4 className="font-semibold">Notifications</h4>
              <p className="text-sm text-muted-foreground font-bengali">সাম্প্রতিক কার্যক্রম</p>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto text-muted-foreground" />
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div key={notif.id} className="p-3 border-b last:border-0 hover:bg-muted/50">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{notif.person_name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {notif.person_type === 'student' ? 'Student' : 'Teacher'}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Punched at {formatPunchTime(notif.punch_time)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No notifications</p>
                  <p className="text-xs font-bengali">কোনো বিজ্ঞপ্তি নেই</p>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-9 h-9 sm:w-10 sm:h-10">
              <User className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="flex items-center gap-2 text-destructive focus:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}