import { useState, useEffect } from 'react';
import { Clock, UserCheck, Trophy, ArrowRight, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';

interface PunchRecord {
  id: string;
  name: string;
  name_bn: string | null;
  photo_url: string | null;
  class_name: string | null;
  section_name: string | null;
  punch_time: string;
  status: string;
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
    if (activeYear) {
      fetchLatestPunches();
      fetchTopStudents();
    }
  }, [activeYear]);

  // Real-time subscription for new punches
  useEffect(() => {
    if (!activeYear) return;

    const channel = supabase
      .channel('attendance-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'student_attendance',
        },
        () => {
          fetchLatestPunches();
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

  const fetchLatestPunches = async () => {
    if (!activeYear) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('student_attendance')
        .select(`
          id, punch_time, status,
          student:students(
            id, name, name_bn, photo_url,
            class:classes(name),
            section:sections(name)
          )
        `)
        .eq('academic_year_id', activeYear.id)
        .eq('attendance_date', today)
        .order('punch_time', { ascending: false })
        .limit(10);

      if (error) throw error;

      const punches: PunchRecord[] = (data || []).map((record: any) => ({
        id: record.id,
        name: record.student?.name || 'Unknown',
        name_bn: record.student?.name_bn,
        photo_url: record.student?.photo_url,
        class_name: record.student?.class?.name,
        section_name: record.student?.section?.name,
        punch_time: record.punch_time,
        status: record.status,
      }));

      setLatestPunches(punches);
    } catch (error) {
      console.error('Error fetching punches:', error);
    }
  };

  const fetchTopStudents = async () => {
    if (!activeYear) return;

    try {
      // Get attendance counts for this month
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
        .gte('attendance_date', startOfMonth.toISOString().split('T')[0])
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
      hour12: true,
    });
  };

  const latestPunch = latestPunches[0];

  return (
    <div className="monitor-display">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
            <UserCheck className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-bengali">আমার হাজিরা</h1>
            <p className="text-white/60">Amar Hajira - Gate Monitor</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-4xl font-bold font-mono">{formatTime(currentTime)}</p>
          <p className="text-white/60 font-bengali">{formatDate(currentTime)}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {!isIdle && latestPunch ? (
          // Real-time Punch Display
          <div className="max-w-2xl mx-auto">
            <div
              className={cn(
                'rounded-3xl p-8 text-center animate-scale-in',
                latestPunch.status === 'present' ? 'monitor-card-success' : 'monitor-card-warning'
              )}
            >
              {/* Photo */}
              <div className="relative inline-block mb-6">
                <img
                  src={latestPunch.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${latestPunch.id}`}
                  alt={latestPunch.name}
                  className="w-40 h-40 rounded-full border-4 border-white/20 shadow-2xl object-cover bg-white/10"
                />
                <div
                  className={cn(
                    'absolute -bottom-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center',
                    latestPunch.status === 'present' ? 'bg-success' : 'bg-warning'
                  )}
                >
                  {latestPunch.status === 'present' ? (
                    <UserCheck className="w-6 h-6 text-white" />
                  ) : (
                    <Clock className="w-6 h-6 text-white" />
                  )}
                </div>
              </div>

              {/* Name */}
              <h2 className="text-4xl font-bold text-white mb-2">{latestPunch.name}</h2>
              {latestPunch.name_bn && (
                <p className="text-2xl text-white/80 font-bengali mb-4">{latestPunch.name_bn}</p>
              )}

              {/* Class */}
              <p className="text-xl text-white/60 mb-6">
                {latestPunch.class_name || 'Unknown Class'} 
                {latestPunch.section_name && ` - ${latestPunch.section_name}`}
              </p>

              {/* Time & Status */}
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold font-mono text-white">
                    {formatPunchTime(latestPunch.punch_time)}
                  </p>
                  <p className="text-white/60">Punch Time</p>
                </div>
                <div className="w-px h-12 bg-white/20" />
                <div className="text-center">
                  <p
                    className={cn(
                      'text-2xl font-bold',
                      latestPunch.status === 'present' ? 'text-success' : 'text-warning'
                    )}
                  >
                    {latestPunch.status === 'present' ? 'উপস্থিত' : 'বিলম্ব'}
                  </p>
                  <p className="text-white/60">
                    {latestPunch.status === 'present' ? 'Present' : 'Late'}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Punches */}
            {latestPunches.length > 1 && (
              <div className="mt-8">
                <h3 className="text-white/60 text-center mb-4">Recent Arrivals</h3>
                <div className="flex justify-center gap-4 flex-wrap">
                  {latestPunches.slice(1, 6).map((punch) => (
                    <div
                      key={punch.id}
                      className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2"
                    >
                      <img
                        src={punch.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${punch.id}`}
                        alt={punch.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-white/80 text-sm">{punch.name}</span>
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        punch.status === 'present' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
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
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-warning/20 px-6 py-3 rounded-full mb-4">
                <Trophy className="w-6 h-6 text-warning" />
                <h2 className="text-2xl font-bold text-warning font-bengali">
                  🏆 এই মাসের সর্বোচ্চ উপস্থিত শিক্ষার্থীরা
                </h2>
              </div>
              <p className="text-white/60">Top Attendance Students This Month</p>
            </div>

            <div className="grid grid-cols-5 gap-6 max-w-6xl mx-auto">
              {topStudents.map((student, index) => (
                <div
                  key={student.id}
                  className="monitor-card text-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative inline-block mb-4">
                    <img
                      src={student.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`}
                      alt={student.name}
                      className="w-24 h-24 rounded-full border-2 border-warning/50 object-cover bg-white/10"
                    />
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-warning text-warning-foreground flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="font-semibold text-white text-lg">{student.name}</h3>
                  {student.name_bn && (
                    <p className="text-white/60 font-bengali text-sm mb-2">{student.name_bn}</p>
                  )}
                  <p className="text-white/40 text-sm mb-3">{student.class_name || 'Unknown'}</p>
                  <div className="bg-success/20 rounded-lg px-3 py-2">
                    <p className="text-success font-bold">{student.present_days} Days</p>
                    <p className="text-success/70 text-xs font-bengali">উপস্থিতি</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // No data state
          <div className="text-center">
            <div className="monitor-card max-w-md mx-auto p-12">
              <RefreshCw className="w-16 h-16 text-white/40 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-white mb-2">Waiting for Punches</h2>
              <p className="text-white/60 font-bengali">পাঞ্চের জন্য অপেক্ষা করা হচ্ছে...</p>
              <p className="text-white/40 text-sm mt-4">
                Students will appear here when they punch their RFID cards
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-black/30 backdrop-blur-sm border-t border-white/10">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-white/60 text-sm">System Online</span>
            <span className="text-white/40 text-sm ml-4">
              Today: {latestPunches.length} punches
            </span>
          </div>
          <p className="text-white/40 text-sm">Developed by Jubair Zaman</p>
          <button
            onClick={() => setIsIdle(!isIdle)}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm"
          >
            {isIdle ? 'Show Live Punch' : 'Show Top Students'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
