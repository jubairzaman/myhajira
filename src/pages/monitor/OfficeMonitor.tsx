import { useState, useEffect } from 'react';
import { Clock, UserCheck, AlertTriangle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock late teachers
const lateTeachers = [
  {
    id: '1',
    name: 'Dr. Mohammad Hasan',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hasan',
    designation: 'Head Teacher',
    punchTime: '09:15 AM',
    lateMinutes: 15,
  },
  {
    id: '2',
    name: 'Fatima Begum',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fatimab',
    designation: 'Senior Teacher',
    punchTime: '09:25 AM',
    lateMinutes: 25,
  },
  {
    id: '3',
    name: 'Shahidul Islam',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shahid',
    designation: 'Assistant Teacher',
    punchTime: '09:10 AM',
    lateMinutes: 10,
  },
];

// Mock teacher punches
const recentPunches = [
  { id: '1', name: 'Dr. Kamal Ahmed', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=kamal', time: '08:00 AM', status: 'present' as const },
  { id: '2', name: 'Nasreen Akter', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nasreen2', time: '08:05 AM', status: 'present' as const },
  { id: '3', name: 'Rezaul Karim', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rezaul', time: '08:02 AM', status: 'present' as const },
  { id: '4', name: 'Sabina Yeasmin', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sabina', time: '08:08 AM', status: 'present' as const },
];

export default function OfficeMonitor() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // Stats
  const totalTeachers = 48;
  const presentToday = 42;
  const lateToday = lateTeachers.length;
  const absentToday = totalTeachers - presentToday;

  return (
    <div className="monitor-display">
      {/* Header */}
      <header className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-bengali">আমার হাজিরা</h1>
            <p className="text-white/60">Amar Hajira - Office Monitor</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-4xl font-bold font-mono">{formatTime(currentTime)}</p>
          <p className="text-white/60 font-bengali">{formatDate(currentTime)}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left - Stats */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white mb-4">Today's Summary</h2>
            
            <div className="monitor-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Teachers</p>
                  <p className="text-white/60 text-xs font-bengali">মোট শিক্ষক</p>
                </div>
                <p className="text-4xl font-bold text-white">{totalTeachers}</p>
              </div>
            </div>

            <div className="monitor-card-success">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Present Today</p>
                  <p className="text-white/60 text-xs font-bengali">আজ উপস্থিত</p>
                </div>
                <p className="text-4xl font-bold text-success">{presentToday}</p>
              </div>
            </div>

            <div className="monitor-card-warning">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Late Today</p>
                  <p className="text-white/60 text-xs font-bengali">আজ বিলম্বিত</p>
                </div>
                <p className="text-4xl font-bold text-warning">{lateToday}</p>
              </div>
            </div>

            <div className="monitor-card border-destructive/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Absent Today</p>
                  <p className="text-white/60 text-xs font-bengali">আজ অনুপস্থিত</p>
                </div>
                <p className="text-4xl font-bold text-destructive">{absentToday}</p>
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

            <div className="space-y-4">
              {lateTeachers.map((teacher, index) => (
                <div
                  key={teacher.id}
                  className="monitor-card-warning flex items-center gap-4 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <img
                    src={teacher.photo}
                    alt={teacher.name}
                    className="w-16 h-16 rounded-full border-2 border-warning/50"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{teacher.name}</h3>
                    <p className="text-white/60 text-sm">{teacher.designation}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-warning">{teacher.lateMinutes}</p>
                    <p className="text-warning/80 text-xs font-bengali">মিনিট বিলম্ব</p>
                    <p className="text-white/40 text-xs">{teacher.punchTime}</p>
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

            <div className="space-y-3">
              {recentPunches.map((punch, index) => (
                <div
                  key={punch.id}
                  className="monitor-card flex items-center gap-4 animate-slide-in-right"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <img
                    src={punch.photo}
                    alt={punch.name}
                    className="w-12 h-12 rounded-full border border-white/20"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-white">{punch.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-white">{punch.time}</p>
                    <p className="text-success text-xs">Present</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-black/30 backdrop-blur-sm border-t border-white/10">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-white/60 text-sm">Auto-refresh enabled</span>
          </div>
          <p className="text-white/40 text-sm">Developed by Jubair Zaman</p>
          <p className="text-white/60 text-sm">Office / Principal Monitor</p>
        </div>
      </footer>
    </div>
  );
}
