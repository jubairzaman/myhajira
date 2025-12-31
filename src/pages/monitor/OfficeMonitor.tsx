import { useState, useEffect } from 'react';
import { Clock, UserCheck, AlertTriangle, Users, LogIn, LogOut, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { format } from 'date-fns';

interface TeacherPunch {
  id: string;
  name: string;
  name_bn: string | null;
  photo_url: string | null;
  designation: string;
  punch_in_time: string | null;
  punch_out_time: string | null;
  late_minutes: number;
  status: string;
}

export default function OfficeMonitor() {
  const { activeYear } = useAcademicYear();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentPunches, setRecentPunches] = useState<TeacherPunch[]>([]);
  const [lateTeachers, setLateTeachers] = useState<TeacherPunch[]>([]);
  const [stats, setStats] = useState({ total: 0, present: 0, late: 0, absent: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'late' | 'recent'>('stats');

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch data on load
  useEffect(() => {
    if (activeYear) {
      fetchAttendance();
      fetchTotalTeachers();
    }
  }, [activeYear]);

  // Real-time subscription
  useEffect(() => {
    if (!activeYear) return;

    const channel = supabase
      .channel('teacher-attendance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teacher_attendance',
        },
        () => {
          fetchAttendance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeYear]);

  const fetchTotalTeachers = async () => {
    if (!activeYear) return;
    const { count } = await supabase
      .from('teachers')
      .select('*', { count: 'exact', head: true })
      .eq('academic_year_id', activeYear.id)
      .eq('is_active', true);
    
    setStats(prev => ({ ...prev, total: count || 0 }));
  };

  const fetchAttendance = async () => {
    if (!activeYear) return;
    setLoading(true);

    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('teacher_attendance')
        .select(`
          id, punch_in_time, punch_out_time, late_minutes, status,
          teacher:teachers(id, name, name_bn, photo_url, designation)
        `)
        .eq('academic_year_id', activeYear.id)
        .eq('attendance_date', today)
        .order('punch_in_time', { ascending: false });

      if (error) throw error;

      const punches: TeacherPunch[] = (data || []).map((record: any) => ({
        id: record.id,
        name: record.teacher?.name || 'Unknown',
        name_bn: record.teacher?.name_bn,
        photo_url: record.teacher?.photo_url,
        designation: record.teacher?.designation || '',
        punch_in_time: record.punch_in_time,
        punch_out_time: record.punch_out_time,
        late_minutes: record.late_minutes || 0,
        status: record.status,
      }));

      setRecentPunches(punches.slice(0, 10));
      setLateTeachers(punches.filter(p => p.status === 'late'));

      const present = punches.filter(p => p.status === 'present').length;
      const late = punches.filter(p => p.status === 'late').length;
      
      setStats(prev => ({
        ...prev,
        present: present + late,
        late,
        absent: prev.total - (present + late),
      }));
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('bn-BD', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPunchTime = (timestamp: string | null) => {
    if (!timestamp) return '-';
    return format(new Date(timestamp), 'hh:mm a');
  };

  const formatDesignation = (designation: string) => {
    return designation
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="monitor-display">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-white/10 gap-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center">
            <Users className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold font-bengali">আমার হাজিরা</h1>
            <p className="text-white/60 text-xs sm:text-base">Amar Hajira - Office Monitor</p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-2xl sm:text-4xl font-bold font-mono">{formatTime(currentTime)}</p>
          <p className="text-white/60 font-bengali text-xs sm:text-base">{formatDate(currentTime)}</p>
        </div>
      </header>

      {/* Mobile Tab Navigation */}
      <div className="flex lg:hidden border-b border-white/10">
        <button
          onClick={() => setActiveTab('stats')}
          className={cn(
            'flex-1 py-3 text-sm font-medium transition-colors',
            activeTab === 'stats' ? 'text-white border-b-2 border-primary' : 'text-white/60'
          )}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab('late')}
          className={cn(
            'flex-1 py-3 text-sm font-medium transition-colors',
            activeTab === 'late' ? 'text-white border-b-2 border-warning' : 'text-white/60'
          )}
        >
          Late ({lateTeachers.length})
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={cn(
            'flex-1 py-3 text-sm font-medium transition-colors',
            activeTab === 'recent' ? 'text-white border-b-2 border-success' : 'text-white/60'
          )}
        >
          Recent
        </button>
      </div>

      {/* Main Content */}
      <main className="p-4 sm:p-8 pb-24">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 sm:w-12 sm:h-12 text-white/40 animate-spin" />
          </div>
        ) : (
          <>
            {/* Desktop: 3-column layout */}
            <div className="hidden lg:grid grid-cols-3 gap-8">
              {/* Left - Stats */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-white mb-4">Today's Summary</h2>
                
                <div className="monitor-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Total Teachers</p>
                      <p className="text-white/60 text-xs font-bengali">মোট শিক্ষক</p>
                    </div>
                    <p className="text-4xl font-bold text-white">{stats.total}</p>
                  </div>
                </div>

                <div className="monitor-card-success">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Present Today</p>
                      <p className="text-white/60 text-xs font-bengali">আজ উপস্থিত</p>
                    </div>
                    <p className="text-4xl font-bold text-success">{stats.present}</p>
                  </div>
                </div>

                <div className="monitor-card-warning">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Late Today</p>
                      <p className="text-white/60 text-xs font-bengali">আজ বিলম্বিত</p>
                    </div>
                    <p className="text-4xl font-bold text-warning">{stats.late}</p>
                  </div>
                </div>

                <div className="monitor-card border-destructive/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Absent Today</p>
                      <p className="text-white/60 text-xs font-bengali">আজ অনুপস্থিত</p>
                    </div>
                    <p className="text-4xl font-bold text-destructive">{stats.absent}</p>
                  </div>
                </div>
              </div>

              {/* Center - Late Teachers */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <AlertTriangle className="w-6 h-6 text-warning" />
                  <div>
                    <h2 className="text-xl font-semibold text-white">Late Teachers Today</h2>
                    <p className="text-white/60 text-sm font-bengali">আজকের বিলম্বিত শিক্ষক</p>
                  </div>
                </div>

                <div className="space-y-4 max-h-[500px] overflow-y-auto">
                  {lateTeachers.map((teacher, index) => (
                    <div
                      key={teacher.id}
                      className="monitor-card-warning flex items-center gap-4 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <img
                        src={teacher.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.id}`}
                        alt={teacher.name}
                        className="w-16 h-16 rounded-full border-2 border-warning/50 object-cover bg-white/10"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">{teacher.name}</h3>
                        <p className="text-white/60 text-sm">{formatDesignation(teacher.designation)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-warning">{teacher.late_minutes}</p>
                        <p className="text-warning/80 text-xs font-bengali">মিনিট বিলম্ব</p>
                        <p className="text-white/40 text-xs">{formatPunchTime(teacher.punch_in_time)}</p>
                      </div>
                    </div>
                  ))}

                  {lateTeachers.length === 0 && (
                    <div className="monitor-card-success text-center py-8">
                      <UserCheck className="w-12 h-12 mx-auto text-success mb-4" />
                      <p className="text-white font-semibold">No Late Teachers Today!</p>
                      <p className="text-white/60 font-bengali">আজ কোন শিক্ষক বিলম্বে আসেননি</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right - Recent Punches */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Recent Punches</h2>
                    <p className="text-white/60 text-sm font-bengali">সাম্প্রতিক উপস্থিতি</p>
                  </div>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {recentPunches.map((punch, index) => (
                    <div
                      key={punch.id}
                      className="monitor-card flex items-center gap-4 animate-slide-in-right"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <img
                        src={punch.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${punch.id}`}
                        alt={punch.name}
                        className="w-12 h-12 rounded-full border border-white/20 object-cover bg-white/10"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{punch.name}</h3>
                        <p className="text-white/40 text-xs">{formatDesignation(punch.designation)}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-success text-sm">
                          <LogIn className="w-3 h-3" />
                          {formatPunchTime(punch.punch_in_time)}
                        </div>
                        {punch.punch_out_time && (
                          <div className="flex items-center gap-1 text-info text-xs">
                            <LogOut className="w-3 h-3" />
                            {formatPunchTime(punch.punch_out_time)}
                          </div>
                        )}
                        <p className={cn(
                          'text-xs mt-1',
                          punch.status === 'present' ? 'text-success' : 'text-warning'
                        )}>
                          {punch.status === 'present' ? 'On Time' : 'Late'}
                        </p>
                      </div>
                    </div>
                  ))}

                  {recentPunches.length === 0 && (
                    <div className="monitor-card text-center py-8">
                      <Clock className="w-12 h-12 mx-auto text-white/40 mb-4" />
                      <p className="text-white/60">No punches yet today</p>
                      <p className="text-white/40 text-sm font-bengali">আজ কোন উপস্থিতি নেই</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile: Tab-based content */}
            <div className="lg:hidden">
              {activeTab === 'stats' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="monitor-card">
                    <p className="text-white/60 text-xs">Total</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                    <p className="text-white/60 text-xs font-bengali">মোট শিক্ষক</p>
                  </div>
                  <div className="monitor-card-success">
                    <p className="text-white/60 text-xs">Present</p>
                    <p className="text-2xl font-bold text-success">{stats.present}</p>
                    <p className="text-white/60 text-xs font-bengali">আজ উপস্থিত</p>
                  </div>
                  <div className="monitor-card-warning">
                    <p className="text-white/60 text-xs">Late</p>
                    <p className="text-2xl font-bold text-warning">{stats.late}</p>
                    <p className="text-white/60 text-xs font-bengali">আজ বিলম্বিত</p>
                  </div>
                  <div className="monitor-card border-destructive/50">
                    <p className="text-white/60 text-xs">Absent</p>
                    <p className="text-2xl font-bold text-destructive">{stats.absent}</p>
                    <p className="text-white/60 text-xs font-bengali">আজ অনুপস্থিত</p>
                  </div>
                </div>
              )}

              {activeTab === 'late' && (
                <div className="space-y-3">
                  {lateTeachers.map((teacher, index) => (
                    <div
                      key={teacher.id}
                      className="monitor-card-warning flex items-center gap-3 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <img
                        src={teacher.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.id}`}
                        alt={teacher.name}
                        className="w-12 h-12 rounded-full border-2 border-warning/50 object-cover bg-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">{teacher.name}</h3>
                        <p className="text-white/60 text-xs truncate">{formatDesignation(teacher.designation)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold text-warning">{teacher.late_minutes}m</p>
                        <p className="text-white/40 text-xs">{formatPunchTime(teacher.punch_in_time)}</p>
                      </div>
                    </div>
                  ))}

                  {lateTeachers.length === 0 && (
                    <div className="monitor-card-success text-center py-8">
                      <UserCheck className="w-10 h-10 mx-auto text-success mb-3" />
                      <p className="text-white font-semibold text-sm">No Late Teachers!</p>
                      <p className="text-white/60 font-bengali text-xs">আজ কোন শিক্ষক বিলম্বে আসেননি</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'recent' && (
                <div className="space-y-3">
                  {recentPunches.map((punch, index) => (
                    <div
                      key={punch.id}
                      className="monitor-card flex items-center gap-3 animate-slide-in-right"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <img
                        src={punch.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${punch.id}`}
                        alt={punch.name}
                        className="w-10 h-10 rounded-full border border-white/20 object-cover bg-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white text-sm truncate">{punch.name}</h3>
                        <p className="text-white/40 text-xs truncate">{formatDesignation(punch.designation)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 text-success text-xs">
                          <LogIn className="w-3 h-3" />
                          {formatPunchTime(punch.punch_in_time)}
                        </div>
                        <p className={cn(
                          'text-xs',
                          punch.status === 'present' ? 'text-success' : 'text-warning'
                        )}>
                          {punch.status === 'present' ? 'On Time' : 'Late'}
                        </p>
                      </div>
                    </div>
                  ))}

                  {recentPunches.length === 0 && (
                    <div className="monitor-card text-center py-8">
                      <Clock className="w-10 h-10 mx-auto text-white/40 mb-3" />
                      <p className="text-white/60 text-sm">No punches yet today</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-black/30 backdrop-blur-sm border-t border-white/10">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-white/60 text-xs sm:text-sm">Real-time</span>
          </div>
          <p className="text-white/40 text-xs sm:text-sm hidden sm:block">Developed by Jubair Zaman</p>
          <p className="text-white/60 text-xs sm:text-sm">Office Monitor</p>
        </div>
      </footer>
    </div>
  );
}
