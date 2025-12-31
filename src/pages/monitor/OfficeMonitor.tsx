import { useState, useEffect } from 'react';
import { Clock, UserCheck, AlertTriangle, Users, LogIn, LogOut, RefreshCw, UserX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { format } from 'date-fns';

interface TeacherPunch {
  id: string;
  teacher_id: string;
  name: string;
  name_bn: string | null;
  photo_url: string | null;
  designation: string;
  punch_time: string;
  is_punch_in: boolean;
}

interface TeacherAttendance {
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

interface AbsentTeacher {
  id: string;
  name: string;
  name_bn: string | null;
  photo_url: string | null;
  designation: string;
}

export default function OfficeMonitor() {
  const { activeYear } = useAcademicYear();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [recentPunches, setRecentPunches] = useState<TeacherPunch[]>([]);
  const [lateTeachers, setLateTeachers] = useState<TeacherAttendance[]>([]);
  const [absentTeachers, setAbsentTeachers] = useState<AbsentTeacher[]>([]);
  const [stats, setStats] = useState({ total: 0, present: 0, late: 0, absent: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'late' | 'absent' | 'recent'>('stats');

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
      fetchAllData();
    }
  }, [activeYear]);

  // RULE 3: Real-time subscription for punch_logs table (teachers)
  useEffect(() => {
    const channel = supabase
      .channel('teacher-punch-logs-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'punch_logs',
        },
        async (payload) => {
          const newPunch = payload.new as any;
          if (newPunch.person_type === 'teacher') {
            console.log('New teacher punch received:', newPunch);
            await fetchPunchDetails(newPunch);
            // Also refresh attendance data
            fetchAttendance();
            fetchAbsentTeachers();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeYear]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchRecentPunches(),
      fetchAttendance(),
      fetchTotalTeachers(),
      fetchAbsentTeachers(),
    ]);
    setLoading(false);
  };

  const fetchPunchDetails = async (punchLog: any) => {
    try {
      const { data: teacher } = await supabase
        .from('teachers')
        .select('id, name, name_bn, photo_url, designation')
        .eq('id', punchLog.person_id)
        .single();

      if (teacher) {
        // Determine if this is punch in or out based on attendance record
        const today = format(new Date(), 'yyyy-MM-dd');
        const { data: attendance } = await supabase
          .from('teacher_attendance')
          .select('punch_in_time, punch_out_time')
          .eq('teacher_id', teacher.id)
          .eq('attendance_date', today)
          .maybeSingle();

        const isPunchIn = !attendance?.punch_in_time || (attendance?.punch_in_time && !attendance?.punch_out_time);

        const newPunch: TeacherPunch = {
          id: punchLog.id,
          teacher_id: teacher.id,
          name: teacher.name,
          name_bn: teacher.name_bn,
          photo_url: teacher.photo_url,
          designation: teacher.designation,
          punch_time: punchLog.punch_time,
          is_punch_in: isPunchIn,
        };

        // Add to beginning of list
        setRecentPunches(prev => [newPunch, ...prev].slice(0, 20));
      }
    } catch (error) {
      console.error('Error fetching teacher punch details:', error);
    }
  };

  const fetchRecentPunches = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // RULE 3: Get all punch events from punch_logs table
      const { data: punchLogs, error } = await supabase
        .from('punch_logs')
        .select('*')
        .eq('punch_date', today)
        .eq('person_type', 'teacher')
        .order('punch_time', { ascending: false })
        .limit(20);

      if (error) throw error;

      const punches: TeacherPunch[] = [];
      for (const log of punchLogs || []) {
        const { data: teacher } = await supabase
          .from('teachers')
          .select('id, name, name_bn, photo_url, designation')
          .eq('id', log.person_id)
          .single();

        if (teacher) {
          // Determine punch type
          const { data: attendance } = await supabase
            .from('teacher_attendance')
            .select('punch_in_time, punch_out_time')
            .eq('teacher_id', teacher.id)
            .eq('attendance_date', today)
            .maybeSingle();

          // Check if this punch time matches punch_in or punch_out
          const isPunchIn = attendance?.punch_in_time && 
            new Date(attendance.punch_in_time).getTime() === new Date(log.punch_time).getTime();

          punches.push({
            id: log.id,
            teacher_id: teacher.id,
            name: teacher.name,
            name_bn: teacher.name_bn,
            photo_url: teacher.photo_url,
            designation: teacher.designation,
            punch_time: log.punch_time,
            is_punch_in: isPunchIn || !attendance?.punch_out_time,
          });
        }
      }

      setRecentPunches(punches);
    } catch (error) {
      console.error('Error fetching recent punches:', error);
    }
  };

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

      const attendance: TeacherAttendance[] = (data || []).map((record: any) => ({
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

      setLateTeachers(attendance.filter(a => a.status === 'late'));

      const present = attendance.filter(a => a.status === 'present').length;
      const late = attendance.filter(a => a.status === 'late').length;
      
      setStats(prev => ({
        ...prev,
        present: present + late,
        late,
      }));
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  // RULE 7: Fetch teachers who have not punched by cutoff time
  const fetchAbsentTeachers = async () => {
    if (!activeYear) return;

    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      // Get all active teachers
      const { data: allTeachers } = await supabase
        .from('teachers')
        .select('id, name, name_bn, photo_url, designation')
        .eq('academic_year_id', activeYear.id)
        .eq('is_active', true);

      // Get teachers who have attendance today
      const { data: attendanceToday } = await supabase
        .from('teacher_attendance')
        .select('teacher_id')
        .eq('attendance_date', today);

      const presentTeacherIds = new Set((attendanceToday || []).map(a => a.teacher_id));

      // Filter out teachers who haven't punched
      const absent = (allTeachers || [])
        .filter(t => !presentTeacherIds.has(t.id))
        .map(t => ({
          id: t.id,
          name: t.name,
          name_bn: t.name_bn,
          photo_url: t.photo_url,
          designation: t.designation,
        }));

      setAbsentTeachers(absent);
      setStats(prev => ({
        ...prev,
        absent: absent.length,
      }));
    } catch (error) {
      console.error('Error fetching absent teachers:', error);
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
    return format(new Date(timestamp), 'hh:mm:ss a');
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
            'flex-1 py-3 text-xs font-medium transition-colors',
            activeTab === 'stats' ? 'text-white border-b-2 border-primary' : 'text-white/60'
          )}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab('late')}
          className={cn(
            'flex-1 py-3 text-xs font-medium transition-colors',
            activeTab === 'late' ? 'text-white border-b-2 border-warning' : 'text-white/60'
          )}
        >
          Late ({lateTeachers.length})
        </button>
        <button
          onClick={() => setActiveTab('absent')}
          className={cn(
            'flex-1 py-3 text-xs font-medium transition-colors',
            activeTab === 'absent' ? 'text-white border-b-2 border-destructive' : 'text-white/60'
          )}
        >
          Absent ({absentTeachers.length})
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          className={cn(
            'flex-1 py-3 text-xs font-medium transition-colors',
            activeTab === 'recent' ? 'text-white border-b-2 border-success' : 'text-white/60'
          )}
        >
          Punches
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
            {/* Desktop: 4-column layout */}
            <div className="hidden lg:grid grid-cols-4 gap-6">
              {/* Stats */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-white mb-4">Today's Summary</h2>
                
                <div className="monitor-card">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Total</p>
                      <p className="text-white/60 text-xs font-bengali">মোট শিক্ষক</p>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.total}</p>
                  </div>
                </div>

                <div className="monitor-card-success">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Present</p>
                      <p className="text-white/60 text-xs font-bengali">উপস্থিত</p>
                    </div>
                    <p className="text-3xl font-bold text-success">{stats.present}</p>
                  </div>
                </div>

                <div className="monitor-card-warning">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Late</p>
                      <p className="text-white/60 text-xs font-bengali">বিলম্বিত</p>
                    </div>
                    <p className="text-3xl font-bold text-warning">{stats.late}</p>
                  </div>
                </div>

                <div className="monitor-card border-destructive/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Absent</p>
                      <p className="text-white/60 text-xs font-bengali">অনুপস্থিত</p>
                    </div>
                    <p className="text-3xl font-bold text-destructive">{stats.absent}</p>
                  </div>
                </div>
              </div>

              {/* Late Teachers */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <h2 className="text-lg font-semibold text-white">Late Today</h2>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto">
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
                        <p className="text-lg font-bold text-warning">{teacher.late_minutes}m</p>
                        <p className="text-white/40 text-xs">{formatPunchTime(teacher.punch_in_time)}</p>
                      </div>
                    </div>
                  ))}

                  {lateTeachers.length === 0 && (
                    <div className="monitor-card-success text-center py-6">
                      <UserCheck className="w-10 h-10 mx-auto text-success mb-2" />
                      <p className="text-white text-sm">No Late Teachers!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* RULE 7: Absent Teachers */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <UserX className="w-5 h-5 text-destructive" />
                  <h2 className="text-lg font-semibold text-white">Absent Today</h2>
                </div>

                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {absentTeachers.map((teacher, index) => (
                    <div
                      key={teacher.id}
                      className="monitor-card border-destructive/50 flex items-center gap-3 animate-fade-in-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <img
                        src={teacher.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.id}`}
                        alt={teacher.name}
                        className="w-12 h-12 rounded-full border-2 border-destructive/50 object-cover bg-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">{teacher.name}</h3>
                        <p className="text-white/60 text-xs truncate">{formatDesignation(teacher.designation)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium text-destructive">Absent</p>
                        <p className="text-white/40 text-xs font-bengali">অনুপস্থিত</p>
                      </div>
                    </div>
                  ))}

                  {absentTeachers.length === 0 && (
                    <div className="monitor-card-success text-center py-6">
                      <UserCheck className="w-10 h-10 mx-auto text-success mb-2" />
                      <p className="text-white text-sm">All Present!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Punches - RULE 3: All punches shown */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <Clock className="w-5 h-5 text-white" />
                  <h2 className="text-lg font-semibold text-white">Live Punches</h2>
                </div>

                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {recentPunches.map((punch, index) => (
                    <div
                      key={`${punch.id}-${index}`}
                      className="monitor-card flex items-center gap-3 animate-slide-in-right"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <img
                        src={punch.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${punch.teacher_id}`}
                        alt={punch.name}
                        className="w-10 h-10 rounded-full border border-white/20 object-cover bg-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white text-sm truncate">{punch.name}</h3>
                        <p className="text-white/40 text-xs truncate">{formatDesignation(punch.designation)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={cn(
                          'flex items-center gap-1 text-xs',
                          punch.is_punch_in ? 'text-success' : 'text-info'
                        )}>
                          {punch.is_punch_in ? <LogIn className="w-3 h-3" /> : <LogOut className="w-3 h-3" />}
                          {formatPunchTime(punch.punch_time)}
                        </div>
                      </div>
                    </div>
                  ))}

                  {recentPunches.length === 0 && (
                    <div className="monitor-card text-center py-6">
                      <Clock className="w-10 h-10 mx-auto text-white/40 mb-2" />
                      <p className="text-white/60 text-sm">No punches yet</p>
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
                    <p className="text-white/60 text-xs font-bengali">উপস্থিত</p>
                  </div>
                  <div className="monitor-card-warning">
                    <p className="text-white/60 text-xs">Late</p>
                    <p className="text-2xl font-bold text-warning">{stats.late}</p>
                    <p className="text-white/60 text-xs font-bengali">বিলম্বিত</p>
                  </div>
                  <div className="monitor-card border-destructive/50">
                    <p className="text-white/60 text-xs">Absent</p>
                    <p className="text-2xl font-bold text-destructive">{stats.absent}</p>
                    <p className="text-white/60 text-xs font-bengali">অনুপস্থিত</p>
                  </div>
                </div>
              )}

              {activeTab === 'late' && (
                <div className="space-y-3">
                  {lateTeachers.map((teacher, index) => (
                    <div
                      key={teacher.id}
                      className="monitor-card-warning flex items-center gap-3"
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
                      <UserCheck className="w-12 h-12 mx-auto text-success mb-4" />
                      <p className="text-white font-semibold">No Late Teachers!</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'absent' && (
                <div className="space-y-3">
                  {absentTeachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="monitor-card border-destructive/50 flex items-center gap-3"
                    >
                      <img
                        src={teacher.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.id}`}
                        alt={teacher.name}
                        className="w-12 h-12 rounded-full border-2 border-destructive/50 object-cover bg-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm truncate">{teacher.name}</h3>
                        <p className="text-white/60 text-xs truncate">{formatDesignation(teacher.designation)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium text-destructive">Absent</p>
                      </div>
                    </div>
                  ))}

                  {absentTeachers.length === 0 && (
                    <div className="monitor-card-success text-center py-8">
                      <UserCheck className="w-12 h-12 mx-auto text-success mb-4" />
                      <p className="text-white font-semibold">All Teachers Present!</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'recent' && (
                <div className="space-y-2">
                  {recentPunches.map((punch, index) => (
                    <div
                      key={`${punch.id}-${index}`}
                      className="monitor-card flex items-center gap-3"
                    >
                      <img
                        src={punch.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${punch.teacher_id}`}
                        alt={punch.name}
                        className="w-10 h-10 rounded-full border border-white/20 object-cover bg-white/10"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white text-sm truncate">{punch.name}</h3>
                        <p className="text-white/40 text-xs truncate">{formatDesignation(punch.designation)}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className={cn(
                          'flex items-center gap-1 text-xs',
                          punch.is_punch_in ? 'text-success' : 'text-info'
                        )}>
                          {punch.is_punch_in ? <LogIn className="w-3 h-3" /> : <LogOut className="w-3 h-3" />}
                          {formatPunchTime(punch.punch_time)}
                        </div>
                      </div>
                    </div>
                  ))}

                  {recentPunches.length === 0 && (
                    <div className="monitor-card text-center py-8">
                      <Clock className="w-12 h-12 mx-auto text-white/40 mb-4" />
                      <p className="text-white/60">No punches yet today</p>
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
            <span className="text-white/60 text-xs sm:text-sm">System Online</span>
            <span className="text-white/40 text-xs sm:text-sm ml-2 sm:ml-4">
              {recentPunches.length} punches today
            </span>
          </div>
          <p className="text-white/40 text-xs sm:text-sm hidden sm:block">Developed by Jubair Zaman</p>
        </div>
      </footer>
    </div>
  );
}
