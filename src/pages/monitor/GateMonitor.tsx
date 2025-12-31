import { useState, useEffect } from 'react';
import { Clock, UserCheck, Trophy, ArrowRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { format } from 'date-fns';

interface PunchRecord {
  id: string;
  person_id: string;
  person_type: string;
  name: string;
  name_bn: string | null;
  photo_url: string | null;
  class_name: string | null;
  section_name: string | null;
  punch_time: string;
  status?: string;
}

interface TopStudent {
  id: string;
  name: string;
  name_bn: string | null;
  photo_url: string | null;
  class_name: string | null;
  present_days: number;
}

export default function GateMonitor() {
  const { activeYear } = useAcademicYear();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [latestPunches, setLatestPunches] = useState<PunchRecord[]>([]);
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [isIdle, setIsIdle] = useState(false);
  const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchLatestPunches();
    fetchTopStudents();
  }, [activeYear]);

  // RULE 3: Real-time subscription for new punches from punch_logs table
  // Every punch event must appear instantly - no filtering, no deduplication
  useEffect(() => {
    const channel = supabase
      .channel('punch-logs-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'punch_logs',
        },
        async (payload) => {
          console.log('New punch received:', payload);
          // Fetch full details and add to display immediately
          await fetchPunchDetails(payload.new as any);
          resetIdleTimer();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeYear]);

  // Idle timer management
  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  const resetIdleTimer = () => {
    if (idleTimer) clearTimeout(idleTimer);
    setIsIdle(false);
    const timer = setTimeout(() => {
      setIsIdle(true);
    }, 30000); // 30 seconds idle
    setIdleTimer(timer);
  };

  const fetchPunchDetails = async (punchLog: any) => {
    if (punchLog.person_type !== 'student') return;

    try {
      const { data: student } = await supabase
        .from('students')
        .select(`
          id, name, name_bn, photo_url,
          classes(name),
          sections(name)
        `)
        .eq('id', punchLog.person_id)
        .single();

      if (student) {
        // Get the attendance status for this student today
        const today = format(new Date(), 'yyyy-MM-dd');
        const { data: attendance } = await supabase
          .from('student_attendance')
          .select('status')
          .eq('student_id', student.id)
          .eq('attendance_date', today)
          .maybeSingle();

        const newPunch: PunchRecord = {
          id: punchLog.id,
          person_id: punchLog.person_id,
          person_type: 'student',
          name: student.name,
          name_bn: student.name_bn,
          photo_url: student.photo_url,
          class_name: (student as any).classes?.name,
          section_name: (student as any).sections?.name,
          punch_time: punchLog.punch_time,
          status: attendance?.status || 'present',
        };

        // Add to beginning of list (no deduplication - show every punch)
        setLatestPunches(prev => [newPunch, ...prev].slice(0, 20));
      }
    } catch (error) {
      console.error('Error fetching punch details:', error);
    }
  };

  const fetchLatestPunches = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // RULE 3: Monitor data comes from punch_logs table (all punches, no filtering)
      const { data: punchLogs, error } = await supabase
        .from('punch_logs')
        .select('*')
        .eq('punch_date', today)
        .eq('person_type', 'student')
        .order('punch_time', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Fetch student details for each punch
      const punches: PunchRecord[] = [];
      for (const log of punchLogs || []) {
        const { data: student } = await supabase
          .from('students')
          .select(`
            id, name, name_bn, photo_url,
            classes(name),
            sections(name)
          `)
          .eq('id', log.person_id)
          .single();

        if (student) {
          // Get attendance status
          const { data: attendance } = await supabase
            .from('student_attendance')
            .select('status')
            .eq('student_id', student.id)
            .eq('attendance_date', today)
            .maybeSingle();

          punches.push({
            id: log.id,
            person_id: log.person_id,
            person_type: 'student',
            name: student.name,
            name_bn: student.name_bn,
            photo_url: student.photo_url,
            class_name: (student as any).classes?.name,
            section_name: (student as any).sections?.name,
            punch_time: log.punch_time,
            status: attendance?.status || 'present',
          });
        }
      }

      setLatestPunches(punches);
    } catch (error) {
      console.error('Error fetching punches:', error);
    }
  };

  const fetchTopStudents = async () => {
    if (!activeYear) return;

    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      
      const { data, error } = await supabase
        .from('student_attendance')
        .select(`
          student_id,
          student:students(
            id, name, name_bn, photo_url,
            class:classes(name)
          )
        `)
        .eq('academic_year_id', activeYear.id)
        .gte('attendance_date', format(startOfMonth, 'yyyy-MM-dd'))
        .in('status', ['present', 'late']);

      if (error) throw error;

      // Count attendance per student
      const attendanceCount: Record<string, { student: any; count: number }> = {};
      (data || []).forEach((record: any) => {
        if (record.student) {
          const studentId = record.student_id;
          if (!attendanceCount[studentId]) {
            attendanceCount[studentId] = { student: record.student, count: 0 };
          }
          attendanceCount[studentId].count++;
        }
      });

      // Sort by attendance count and take top 5
      const topList: TopStudent[] = Object.values(attendanceCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((item) => ({
          id: item.student.id,
          name: item.student.name,
          name_bn: item.student.name_bn,
          photo_url: item.student.photo_url,
          class_name: item.student.class?.name,
          present_days: item.count,
        }));

      setTopStudents(topList);
    } catch (error) {
      console.error('Error fetching top students:', error);
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

  const formatPunchTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const latestPunch = latestPunches[0];

  return (
    <div className="monitor-display">
      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-white/10 gap-3">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center">
            <UserCheck className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
          </div>
          <div>
            <h1 className="text-lg sm:text-2xl font-bold font-bengali">আমার হাজিরা</h1>
            <p className="text-white/60 text-xs sm:text-base">Amar Hajira - Gate Monitor</p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-2xl sm:text-4xl font-bold font-mono">{formatTime(currentTime)}</p>
          <p className="text-white/60 font-bengali text-xs sm:text-base">{formatDate(currentTime)}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 sm:p-8 pb-24">
        {!isIdle && latestPunch ? (
          // Real-time Punch Display - RULE 3: Every punch appears instantly
          <div className="max-w-2xl mx-auto">
            <div
              className={cn(
                'rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-center animate-scale-in',
                latestPunch.status === 'present' ? 'monitor-card-success' : 
                latestPunch.status === 'late' ? 'monitor-card-warning' : 'monitor-card'
              )}
            >
              {/* Photo */}
              <div className="relative inline-block mb-4 sm:mb-6">
                <img
                  src={latestPunch.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${latestPunch.person_id}`}
                  alt={latestPunch.name}
                  className="w-24 h-24 sm:w-40 sm:h-40 rounded-full border-4 border-white/20 shadow-2xl object-cover bg-white/10"
                />
                <div
                  className={cn(
                    'absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-8 h-8 sm:w-12 sm:h-12 rounded-full flex items-center justify-center',
                    latestPunch.status === 'present' ? 'bg-success' : 
                    latestPunch.status === 'late' ? 'bg-warning' : 'bg-destructive'
                  )}
                >
                  {latestPunch.status === 'present' ? (
                    <UserCheck className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  ) : (
                    <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  )}
                </div>
              </div>

              {/* Name */}
              <h2 className="text-2xl sm:text-4xl font-bold text-white mb-1 sm:mb-2">{latestPunch.name}</h2>
              {latestPunch.name_bn && (
                <p className="text-lg sm:text-2xl text-white/80 font-bengali mb-2 sm:mb-4">{latestPunch.name_bn}</p>
              )}

              {/* Class */}
              <p className="text-base sm:text-xl text-white/60 mb-4 sm:mb-6">
                {latestPunch.class_name || 'Unknown Class'} 
                {latestPunch.section_name && ` - ${latestPunch.section_name}`}
              </p>

              {/* Time & Status */}
              <div className="flex items-center justify-center gap-4 sm:gap-8">
                <div className="text-center">
                  <p className="text-xl sm:text-3xl font-bold font-mono text-white">
                    {formatPunchTime(latestPunch.punch_time)}
                  </p>
                  <p className="text-white/60 text-xs sm:text-base">Punch Time</p>
                </div>
                <div className="w-px h-8 sm:h-12 bg-white/20" />
                <div className="text-center">
                  <p
                    className={cn(
                      'text-lg sm:text-2xl font-bold',
                      latestPunch.status === 'present' ? 'text-success' : 
                      latestPunch.status === 'late' ? 'text-warning' : 'text-destructive'
                    )}
                  >
                    {latestPunch.status === 'present' ? 'উপস্থিত' : 
                     latestPunch.status === 'late' ? 'বিলম্ব' : 'অনুপস্থিত'}
                  </p>
                  <p className="text-white/60 text-xs sm:text-base">
                    {latestPunch.status === 'present' ? 'Present' : 
                     latestPunch.status === 'late' ? 'Late' : 'Absent'}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Punches - RULE 3: All punches shown, no deduplication */}
            {latestPunches.length > 1 && (
              <div className="mt-6 sm:mt-8">
                <h3 className="text-white/60 text-center mb-3 sm:mb-4 text-sm sm:text-base">Recent Punches</h3>
                <div className="flex justify-center gap-2 sm:gap-4 flex-wrap">
                  {latestPunches.slice(1, 8).map((punch, index) => (
                    <div
                      key={`${punch.id}-${index}`}
                      className="flex items-center gap-1.5 sm:gap-2 bg-white/5 rounded-full px-2 sm:px-4 py-1.5 sm:py-2"
                    >
                      <img
                        src={punch.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${punch.person_id}`}
                        alt={punch.name}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                      />
                      <span className="text-white/80 text-xs sm:text-sm truncate max-w-[80px] sm:max-w-none">{punch.name}</span>
                      <span className={cn(
                        'text-xs px-1.5 sm:px-2 py-0.5 rounded-full hidden sm:inline',
                        punch.status === 'present' ? 'bg-success/20 text-success' : 
                        punch.status === 'late' ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive'
                      )}>
                        {formatPunchTime(punch.punch_time)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : isIdle && topStudents.length > 0 ? (
          // Idle Mode - Top Attendance Students
          <div>
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 sm:gap-3 bg-warning/20 px-4 sm:px-6 py-2 sm:py-3 rounded-full mb-3 sm:mb-4">
                <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-warning" />
                <h2 className="text-lg sm:text-2xl font-bold text-warning font-bengali">
                  🏆 এই মাসের সর্বোচ্চ উপস্থিত শিক্ষার্থীরা
                </h2>
              </div>
              <p className="text-white/60 text-sm sm:text-base">Top Attendance Students This Month</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 max-w-6xl mx-auto">
              {topStudents.map((student, index) => (
                <div
                  key={student.id}
                  className="monitor-card text-center animate-fade-in-up p-3 sm:p-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative inline-block mb-2 sm:mb-4">
                    <img
                      src={student.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`}
                      alt={student.name}
                      className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-2 border-warning/50 object-cover bg-white/10"
                    />
                    <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-warning text-warning-foreground flex items-center justify-center font-bold text-sm sm:text-lg">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="font-semibold text-white text-sm sm:text-lg truncate">{student.name}</h3>
                  {student.name_bn && (
                    <p className="text-white/60 font-bengali text-xs sm:text-sm mb-1 sm:mb-2 truncate">{student.name_bn}</p>
                  )}
                  <p className="text-white/40 text-xs sm:text-sm mb-2 sm:mb-3">{student.class_name || 'Unknown'}</p>
                  <div className="bg-success/20 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
                    <p className="text-success font-bold text-sm sm:text-base">{student.present_days} Days</p>
                    <p className="text-success/70 text-xs font-bengali">উপস্থিতি</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // No data state
          <div className="text-center">
            <div className="monitor-card max-w-md mx-auto p-8 sm:p-12">
              <RefreshCw className="w-12 h-12 sm:w-16 sm:h-16 text-white/40 mx-auto mb-4 sm:mb-6" />
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Waiting for Punches</h2>
              <p className="text-white/60 font-bengali">পাঞ্চের জন্য অপেক্ষা করা হচ্ছে...</p>
              <p className="text-white/40 text-xs sm:text-sm mt-3 sm:mt-4">
                Students will appear here when they punch their RFID cards
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-black/30 backdrop-blur-sm border-t border-white/10">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto gap-2 sm:gap-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-white/60 text-xs sm:text-sm">System Online</span>
            <span className="text-white/40 text-xs sm:text-sm ml-2 sm:ml-4">
              Today: {latestPunches.length} punches
            </span>
          </div>
          <p className="text-white/40 text-xs sm:text-sm hidden sm:block">Developed by Jubair Zaman</p>
          <button
            onClick={() => setIsIdle(!isIdle)}
            className="flex items-center gap-2 text-white/60 hover:text-white text-xs sm:text-sm"
          >
            {isIdle ? 'Show Live Punch' : 'Show Top Students'}
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
