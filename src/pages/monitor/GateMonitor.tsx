import { useState, useEffect } from 'react';
import { Clock, UserCheck, Trophy, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock live punch data
const mockPunches = [
  {
    id: '1',
    name: 'Mohammad Rafiq',
    nameBangla: 'মোহাম্মদ রফিক',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rafiq',
    class: 'Class 10-A',
    time: '08:15 AM',
    status: 'present' as const,
  },
  {
    id: '2',
    name: 'Fatima Akter',
    nameBangla: 'ফাতিমা আক্তার',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatima2',
    class: 'Class 9-B',
    time: '08:35 AM',
    status: 'late' as const,
    lateMinutes: 5,
  },
  {
    id: '3',
    name: 'Abdul Karim',
    nameBangla: 'আব্দুল করিম',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=karim2',
    class: 'Class 8-A',
    time: '08:20 AM',
    status: 'present' as const,
  },
];

// Top attendance students
const topStudents = [
  { id: '1', name: 'Sakib Rahman', nameBangla: 'সাকিব রহমান', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sakib', class: 'Class 10-A', presentDays: 98 },
  { id: '2', name: 'Nusrat Jahan', nameBangla: 'নুসরাত জাহান', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nusrat', class: 'Class 9-A', presentDays: 97 },
  { id: '3', name: 'Imran Hossain', nameBangla: 'ইমরান হোসাইন', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=imran', class: 'Class 10-B', presentDays: 96 },
  { id: '4', name: 'Ayesha Siddiqua', nameBangla: 'আয়েশা সিদ্দিকা', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ayesha', class: 'Class 8-A', presentDays: 95 },
  { id: '5', name: 'Tanvir Ahmed', nameBangla: 'তানভীর আহমেদ', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tanvir', class: 'Class 9-B', presentDays: 95 },
];

export default function GateMonitor() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [latestPunch, setLatestPunch] = useState(mockPunches[0]);
  const [isIdle, setIsIdle] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulate idle mode after 5 seconds (for demo)
  useEffect(() => {
    const idleTimer = setTimeout(() => {
      setIsIdle(true);
    }, 10000);
    return () => clearTimeout(idleTimer);
  }, [latestPunch]);

  // Auto-slide for top students
  useEffect(() => {
    if (isIdle) {
      const slideTimer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.ceil(topStudents.length / 5));
      }, 5000);
      return () => clearInterval(slideTimer);
    }
  }, [isIdle]);

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
        {!isIdle ? (
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
                  src={latestPunch.photo}
                  alt={latestPunch.name}
                  className="w-40 h-40 rounded-full border-4 border-white/20 shadow-2xl"
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
              <p className="text-2xl text-white/80 font-bengali mb-4">{latestPunch.nameBangla}</p>

              {/* Class */}
              <p className="text-xl text-white/60 mb-6">{latestPunch.class}</p>

              {/* Time & Status */}
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold font-mono text-white">{latestPunch.time}</p>
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
                    {latestPunch.status === 'present' ? 'উপস্থিত' : `${latestPunch.lateMinutes} মিনিট বিলম্ব`}
                  </p>
                  <p className="text-white/60">
                    {latestPunch.status === 'present' ? 'Present' : 'Late'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
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
                      src={student.photo}
                      alt={student.name}
                      className="w-24 h-24 rounded-full border-2 border-warning/50"
                    />
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-warning text-warning-foreground flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="font-semibold text-white text-lg">{student.name}</h3>
                  <p className="text-white/60 font-bengali text-sm mb-2">{student.nameBangla}</p>
                  <p className="text-white/40 text-sm mb-3">{student.class}</p>
                  <div className="bg-success/20 rounded-lg px-3 py-2">
                    <p className="text-success font-bold">{student.presentDays} Days</p>
                    <p className="text-success/70 text-xs font-bengali">উপস্থিতি</p>
                  </div>
                </div>
              ))}
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
