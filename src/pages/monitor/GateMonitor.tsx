import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { Clock, UserCheck, Trophy, ArrowRight, RefreshCw, Loader2, CreditCard, Bug, X, Send, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NewsScroller } from '@/components/monitor/NewsScroller';
import { VideoPlayer } from '@/components/monitor/VideoPlayer';

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
  isLoading?: boolean;
}

interface TopStudent {
  id: string;
  name: string;
  name_bn: string | null;
  photo_url: string | null;
  class_name: string | null;
  present_days: number;
}

interface CachedStudent {
  id: string;
  name: string;
  name_bn: string | null;
  photo_url: string | null;
  class_name: string | null;
  section_name: string | null;
  shift_name: string | null;
}

interface CachedTeacher {
  id: string;
  name: string;
  name_bn: string | null;
  photo_url: string | null;
  designation: string | null;
  shift_name: string | null;
}

interface NewsItem {
  id: string;
  title: string;
  title_bn: string | null;
}

interface ScrollerSettings {
  fontSize: number;
  fontFamily: string;
  speed: number;
  bgColor: string;
  textColor: string;
  bulletColor: string;
}

interface VideoItem {
  id: string;
  title: string;
  video_url: string;
}

// Memoized TimeDisplay component - prevents entire GateMonitor from re-rendering every second
const TimeDisplay = memo(function TimeDisplay() {
  const [time, setTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
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

  return (
    <div className="text-left sm:text-right">
      <p className="text-2xl sm:text-4xl font-bold font-mono">{formatTime(time)}</p>
      <p className="text-white/60 font-bengali text-xs sm:text-base">{formatDate(time)}</p>
    </div>
  );
});

export default function GateMonitor() {
  const { activeYear } = useAcademicYear();
  const [latestPunches, setLatestPunches] = useState<PunchRecord[]>([]);
  const [topStudents, setTopStudents] = useState<TopStudent[]>([]);
  const [isIdle, setIsIdle] = useState(true);
  const [idleTimer, setIdleTimer] = useState<NodeJS.Timeout | null>(null);
  
  // TV Display states
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [videoItems, setVideoItems] = useState<VideoItem[]>([]);
  const [monitorLogo, setMonitorLogo] = useState<string | null>(null);
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [scrollerSettings, setScrollerSettings] = useState<ScrollerSettings>({
    fontSize: 24,
    fontFamily: 'Hind Siliguri',
    speed: 50,
    bgColor: '#991B1B',
    textColor: '#FFFFFF',
    bulletColor: '#FDE047',
  });
  
  // Local cache for instant lookup
  const studentCacheRef = useRef<Map<string, CachedStudent>>(new Map());
  const teacherCacheRef = useRef<Map<string, CachedTeacher>>(new Map());
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [cacheStats, setCacheStats] = useState({ students: 0, teachers: 0 });
  
  // Punch queue for rapid punches
  const punchQueueRef = useRef<string[]>([]);
  const isProcessingQueueRef = useRef(false);
  
  // USB RFID Reader states
  const [isScanning, setIsScanning] = useState(false);
  const cardBufferRef = useRef('');
  const bufferTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Debug state
  const [showDebug, setShowDebug] = useState(false);
  const [lastKeypress, setLastKeypress] = useState('');
  const [cardBuffer, setCardBuffer] = useState('');
  const [lastScannedCard, setLastScannedCard] = useState('');
  const [lastApiResponse, setLastApiResponse] = useState('');
  const [manualCardInput, setManualCardInput] = useState('');

  // Load cache and monitor settings on mount
  useEffect(() => {
    loadCache();
    loadMonitorSettings();
    
    // Refresh cache every 5 minutes
    const refreshInterval = setInterval(loadCache, 5 * 60 * 1000);
    // Refresh monitor settings every minute
    const settingsInterval = setInterval(loadMonitorSettings, 60 * 1000);
    
    return () => {
      clearInterval(refreshInterval);
      clearInterval(settingsInterval);
    };
  }, []);

  // Load monitor settings (news, videos, logo, scroller settings)
  const loadMonitorSettings = async () => {
    try {
      // Fetch logos and scroller settings
      const { data: settings } = await supabase
        .from('system_settings')
        .select('monitor_logo_url, school_logo_url, scroller_font_size, scroller_font_family, scroller_speed, scroller_bg_color, scroller_text_color, scroller_bullet_color')
        .limit(1)
        .maybeSingle();
      
      if (settings) {
        setMonitorLogo(settings.monitor_logo_url);
        setSchoolLogo(settings.school_logo_url);
        
        // Update scroller settings
        setScrollerSettings({
          fontSize: settings.scroller_font_size ?? 24,
          fontFamily: settings.scroller_font_family ?? 'Hind Siliguri',
          speed: settings.scroller_speed ?? 50,
          bgColor: settings.scroller_bg_color ?? '#991B1B',
          textColor: settings.scroller_text_color ?? '#FFFFFF',
          bulletColor: settings.scroller_bullet_color ?? '#FDE047',
        });
      }

      // Fetch active news
      const { data: news } = await supabase
        .from('monitor_news')
        .select('id, title, title_bn')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      setNewsItems(news || []);

      // Fetch active videos
      const { data: videos } = await supabase
        .from('monitor_videos')
        .select('id, title, video_url')
        .eq('is_active', true)
        .order('display_order', { ascending: true });
      
      setVideoItems(videos || []);
    } catch (error) {
      console.error('[GateMonitor] Error loading monitor settings:', error);
    }
  };

  // Load all students and teachers with their RFID cards into cache
  const loadCache = async () => {
    console.log('[GateMonitor] Loading cache...');
    
    try {
      // Load students with RFID cards
      const { data: studentCards, error: studentError } = await supabase
        .from('rfid_cards_students')
        .select(`
          card_number,
          student:students(
            id, name, name_bn, photo_url,
            classes(name),
            sections(name),
            shifts(name)
          )
        `)
        .eq('is_active', true);

      if (studentError) throw studentError;

      // Load teachers with RFID cards
      const { data: teacherCards, error: teacherError } = await supabase
        .from('rfid_cards_teachers')
        .select(`
          card_number,
          teacher:teachers(
            id, name, name_bn, photo_url, designation,
            shifts(name)
          )
        `)
        .eq('is_active', true);

      if (teacherError) throw teacherError;

      // Build student cache with multiple card number formats
      const studentCache = new Map<string, CachedStudent>();
      (studentCards || []).forEach((card: any) => {
        if (card.student) {
          const cached: CachedStudent = {
            id: card.student.id,
            name: card.student.name,
            name_bn: card.student.name_bn,
            photo_url: card.student.photo_url,
            class_name: card.student.classes?.name || null,
            section_name: card.student.sections?.name || null,
            shift_name: card.student.shifts?.name || null,
          };
          
          // Store with multiple formats for flexible lookup
          const cardNum = card.card_number;
          studentCache.set(cardNum, cached);
          studentCache.set(cardNum.toLowerCase(), cached);
          studentCache.set(cardNum.toUpperCase(), cached);
          studentCache.set(cardNum.replace(/^0+/, ''), cached); // Without leading zeros
          studentCache.set(cardNum.padStart(10, '0'), cached); // Padded to 10 digits
        }
      });
      studentCacheRef.current = studentCache;

      // Build teacher cache
      const teacherCache = new Map<string, CachedTeacher>();
      (teacherCards || []).forEach((card: any) => {
        if (card.teacher) {
          const cached: CachedTeacher = {
            id: card.teacher.id,
            name: card.teacher.name,
            name_bn: card.teacher.name_bn,
            photo_url: card.teacher.photo_url,
            designation: card.teacher.designation,
            shift_name: card.teacher.shifts?.name || null,
          };
          
          const cardNum = card.card_number;
          teacherCache.set(cardNum, cached);
          teacherCache.set(cardNum.toLowerCase(), cached);
          teacherCache.set(cardNum.toUpperCase(), cached);
          teacherCache.set(cardNum.replace(/^0+/, ''), cached);
          teacherCache.set(cardNum.padStart(10, '0'), cached);
        }
      });
      teacherCacheRef.current = teacherCache;

      setCacheStats({
        students: studentCards?.length || 0,
        teachers: teacherCards?.length || 0,
      });
      setCacheLoaded(true);
      console.log(`[GateMonitor] Cache loaded: ${studentCards?.length || 0} students, ${teacherCards?.length || 0} teachers`);
    } catch (error) {
      console.error('[GateMonitor] Cache loading failed:', error);
      toast.error('ক্যাশ লোড ব্যর্থ হয়েছে');
    }
  };

  // Realtime subscription for instant punch updates
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const channel = supabase
      .channel('punch_logs_realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'punch_logs',
          filter: `punch_date=eq.${today}`
        },
        async (payload) => {
          console.log('[GateMonitor] Realtime punch received:', payload);
          const log = payload.new as any;
          
          // Only process student punches
          if (log.person_type !== 'student') return;
          
          // Try cache first for instant update
          const cached = lookupInCache(log.card_number);
          if (cached && cached.type === 'student') {
            const studentData = cached.data as CachedStudent;
            const newPunch: PunchRecord = {
              id: log.id,
              person_id: log.person_id,
              person_type: 'student',
              name: studentData.name,
              name_bn: studentData.name_bn,
              photo_url: studentData.photo_url,
              class_name: studentData.class_name,
              section_name: studentData.section_name,
              punch_time: log.punch_time,
              status: 'present',
            };
            
            // Add to front, avoid duplicates by ID prefix
            setLatestPunches(prev => {
              const filtered = prev.filter(p => 
                !p.id.startsWith('local-') || p.person_id !== log.person_id
              );
              return [newPunch, ...filtered].slice(0, 20);
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchLatestPunches();
    fetchTopStudents();
  }, [activeYear]);

  // Lookup in cache - try multiple formats
  const lookupInCache = (cardNumber: string): { type: 'student' | 'teacher'; data: CachedStudent | CachedTeacher } | null => {
    // Try student cache first
    const student = studentCacheRef.current.get(cardNumber) 
      || studentCacheRef.current.get(cardNumber.toLowerCase())
      || studentCacheRef.current.get(cardNumber.toUpperCase())
      || studentCacheRef.current.get(cardNumber.replace(/^0+/, ''))
      || studentCacheRef.current.get(cardNumber.padStart(10, '0'));
    
    if (student) {
      return { type: 'student', data: student };
    }

    // Try teacher cache
    const teacher = teacherCacheRef.current.get(cardNumber)
      || teacherCacheRef.current.get(cardNumber.toLowerCase())
      || teacherCacheRef.current.get(cardNumber.toUpperCase())
      || teacherCacheRef.current.get(cardNumber.replace(/^0+/, ''))
      || teacherCacheRef.current.get(cardNumber.padStart(10, '0'));
    
    if (teacher) {
      return { type: 'teacher', data: teacher };
    }

    return null;
  };

  // Play success sound
  const playSuccessSound = () => {
    try {
      const audio = new Audio('/sounds/beep.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Ignore audio play errors (autoplay restrictions)
      });
    } catch {
      // Ignore audio errors
    }
  };

  // Show punch display for 15 seconds then go back to idle
  const showPunchDisplayTemporarily = () => {
    // Clear any existing timer
    if (idleTimer) {
      clearTimeout(idleTimer);
    }
    
    // Set to active mode (not idle)
    setIsIdle(false);
    
    // Go back to idle after 15 seconds
    const timer = setTimeout(() => {
      setIsIdle(true);
    }, 15000);
    setIdleTimer(timer);
  };

  // Process card - INSTANT from cache, background API
  const processCard = useCallback(async (cardNumber: string) => {
    if (!cardNumber || cardNumber.length < 4) return;
    
    console.log('[GateMonitor] Processing RFID card:', cardNumber);
    setLastScannedCard(cardNumber);
    setIsScanning(false);
    
    const punchTime = new Date().toISOString();
    
    // INSTANT LOOKUP from cache
    const cached = lookupInCache(cardNumber);
    
    if (cached) {
      // *** INSTANT UI UPDATE (< 1ms) ***
      const newPunch: PunchRecord = {
        id: 'local-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
        person_id: cached.data.id,
        person_type: cached.type,
        name: cached.data.name,
        name_bn: cached.data.name_bn,
        photo_url: cached.data.photo_url,
        class_name: cached.type === 'student' 
          ? (cached.data as CachedStudent).class_name 
          : (cached.data as CachedTeacher).designation,
        section_name: cached.type === 'student' 
          ? (cached.data as CachedStudent).section_name 
          : null,
        punch_time: punchTime,
        status: 'present', // Optimistic - will be updated by realtime if different
      };
      
      // Add to UI immediately
      setLatestPunches(prev => [newPunch, ...prev].slice(0, 20));
      
      // Show punch display temporarily (15 seconds then back to idle)
      showPunchDisplayTemporarily();
      
      // Success feedback
      playSuccessSound();
      setLastApiResponse(`✅ ${cached.data.name} - উপস্থিত`);
      toast.success(`${cached.data.name}`, {
        description: cached.type === 'student' 
          ? `${(cached.data as CachedStudent).class_name || ''} ${(cached.data as CachedStudent).section_name || ''}`
          : (cached.data as CachedTeacher).designation || 'শিক্ষক',
        duration: 2000,
      });
      
      // *** BACKGROUND API CALL (fire-and-forget) ***
      supabase.functions.invoke('process-punch', {
        body: {
          card_number: cardNumber,
          device_ip: 'USB-READER',
          punch_time: punchTime
        }
      }).then(({ data, error }) => {
        if (error) {
          console.error('[GateMonitor] Background API error:', error);
        } else {
          console.log('[GateMonitor] Background API success:', data);
        }
      }).catch(err => {
        console.error('[GateMonitor] Background API failed:', err);
      });
      
    } else {
      // Card not found in cache - try direct API lookup as fallback
      console.log('[GateMonitor] Card not in cache, trying API fallback...');
      
      try {
        const { data, error } = await supabase.functions.invoke('process-punch', {
          body: {
            card_number: cardNumber,
            device_ip: 'USB-READER',
            punch_time: punchTime
          }
        });

        if (error) throw error;

        if (data?.success && data?.person) {
          const newPunch: PunchRecord = {
            id: 'api-' + Date.now(),
            person_id: data.person.id,
            person_type: data.person.type,
            name: data.person.name,
            name_bn: data.person.name_bn,
            photo_url: data.person.photo_url,
            class_name: data.person.class_name || data.person.designation,
            section_name: data.person.section_name,
            punch_time: punchTime,
            status: data.status || 'present',
          };
          
          setLatestPunches(prev => [newPunch, ...prev].slice(0, 20));
          showPunchDisplayTemporarily();
          playSuccessSound();
          setLastApiResponse(`✅ ${data.person.name} - ${data.status || 'উপস্থিত'}`);
          toast.success(`${data.person.name}`, {
            description: data.person.class_name || data.person.designation,
            duration: 2000,
          });
        } else {
          setLastApiResponse(`❌ কার্ড পাওয়া যায়নি: ${cardNumber}`);
          toast.error('অজানা কার্ড', { description: `কার্ড: ${cardNumber}` });
        }
      } catch (err) {
        console.error('[GateMonitor] API error:', err);
        setLastApiResponse(`❌ API ত্রুটি: ${err}`);
        toast.error('সার্ভার ত্রুটি');
      }
    }
  }, []);

  // Queue management for rapid punches
  const addToQueue = useCallback((cardNumber: string) => {
    punchQueueRef.current.push(cardNumber);
    processQueue();
  }, []);

  const processQueue = useCallback(async () => {
    if (isProcessingQueueRef.current || punchQueueRef.current.length === 0) return;
    
    isProcessingQueueRef.current = true;
    
    while (punchQueueRef.current.length > 0) {
      const cardNumber = punchQueueRef.current.shift();
      if (cardNumber) {
        await processCard(cardNumber);
        // Small delay between rapid punches
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    isProcessingQueueRef.current = false;
  }, [processCard]);

  // Manual test function
  const handleManualTest = () => {
    if (manualCardInput.trim()) {
      addToQueue(manualCardInput.trim());
      setManualCardInput('');
    }
  };

  // USB RFID Reader keyboard input handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focused on input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      // Track for debug
      setLastKeypress(e.key);
      
      // Enter key = submit card
      if (e.key === 'Enter') {
        if (cardBufferRef.current.length >= 4) {
          const cardNumber = cardBufferRef.current;
          cardBufferRef.current = '';
          setCardBuffer('');
          addToQueue(cardNumber);
        }
        return;
      }
      
      // Alphanumeric characters only
      if (/^[a-zA-Z0-9]$/.test(e.key)) {
        if (cardBufferRef.current.length === 0) {
          setIsScanning(true);
        }
        cardBufferRef.current += e.key;
        setCardBuffer(cardBufferRef.current);
        
        // Clear previous timeout
        if (bufferTimeoutRef.current) {
          clearTimeout(bufferTimeoutRef.current);
        }
        
        // Auto-process after 300ms of inactivity (faster fallback)
        bufferTimeoutRef.current = setTimeout(() => {
          if (cardBufferRef.current.length >= 4) {
            const cardNumber = cardBufferRef.current;
            cardBufferRef.current = '';
            setCardBuffer('');
            addToQueue(cardNumber);
          } else {
            cardBufferRef.current = '';
            setCardBuffer('');
            setIsScanning(false);
          }
        }, 300);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (bufferTimeoutRef.current) {
        clearTimeout(bufferTimeoutRef.current);
      }
    };
  }, [addToQueue]);

  // Cleanup idle timer on unmount
  useEffect(() => {
    return () => {
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, [idleTimer]);

  // OPTIMIZED: Single query with joins instead of N+1
  const fetchLatestPunches = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Single optimized query with joins - replaces 40+ sequential calls
      const { data: punchLogs, error } = await supabase
        .from('punch_logs')
        .select(`
          id,
          person_id,
          person_type,
          punch_time,
          punch_date
        `)
        .eq('punch_date', today)
        .eq('person_type', 'student')
        .order('punch_time', { ascending: false })
        .limit(20);

      if (error) throw error;

      if (!punchLogs || punchLogs.length === 0) {
        setLatestPunches([]);
        return;
      }

      // Get unique student IDs
      const studentIds = [...new Set(punchLogs.map(log => log.person_id))];

      // Single query for all students
      const { data: students } = await supabase
        .from('students')
        .select(`
          id, name, name_bn, photo_url,
          classes(name),
          sections(name)
        `)
        .in('id', studentIds);

      // Single query for all attendance records
      const { data: attendanceRecords } = await supabase
        .from('student_attendance')
        .select('student_id, status')
        .in('student_id', studentIds)
        .eq('attendance_date', today);

      // Build lookup maps
      const studentMap = new Map((students || []).map(s => [s.id, s]));
      const attendanceMap = new Map((attendanceRecords || []).map(a => [a.student_id, a.status]));

      // Build punches array
      const punches: PunchRecord[] = punchLogs
        .map(log => {
          const student = studentMap.get(log.person_id);
          if (!student) return null;

          return {
            id: log.id,
            person_id: log.person_id,
            person_type: 'student',
            name: student.name,
            name_bn: student.name_bn,
            photo_url: student.photo_url,
            class_name: (student as any).classes?.name || null,
            section_name: (student as any).sections?.name || null,
            punch_time: log.punch_time,
            status: attendanceMap.get(log.person_id) || 'present',
          };
        })
        .filter((p): p is NonNullable<typeof p> => p !== null) as PunchRecord[];

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

  const formatPunchTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const latestPunch = latestPunches[0];
  const hasVideos = videoItems.length > 0;
  // Idle mode: when no punch for 15 seconds
  const showVideoMode = isIdle && hasVideos;

  return (
    <div className="monitor-display h-screen flex flex-col overflow-hidden">
      {/* Debug Panel Toggle */}
      <Button
        variant="outline"
        size="sm"
        className="fixed top-4 right-4 z-50 bg-black/50 border-white/20 text-white hover:bg-black/70"
        onClick={() => setShowDebug(!showDebug)}
      >
        {showDebug ? <X className="h-4 w-4 mr-1" /> : <Bug className="h-4 w-4 mr-1" />}
        {showDebug ? 'বন্ধ করুন' : 'Debug'}
      </Button>

      {/* Debug Panel */}
      {showDebug && (
        <div className="fixed top-14 right-4 z-50 w-80 bg-black/90 border border-white/20 rounded-lg shadow-lg p-4 text-white">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <Bug className="h-4 w-4" /> Debug Panel
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/60">Cache Status:</span>
              <code className={cn(
                "px-2 py-0.5 rounded",
                cacheLoaded ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
              )}>
                {cacheLoaded ? `${cacheStats.students}S / ${cacheStats.teachers}T` : 'Loading...'}
              </code>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Mode:</span>
              <code className="bg-white/10 px-2 py-0.5 rounded">{isIdle ? 'Idle' : 'Active'}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">News Items:</span>
              <code className="bg-white/10 px-2 py-0.5 rounded">{newsItems.length}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Video Items:</span>
              <code className="bg-white/10 px-2 py-0.5 rounded">{videoItems.length}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Last Keypress:</span>
              <code className="bg-white/10 px-2 py-0.5 rounded">{lastKeypress || '-'}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Card Buffer:</span>
              <code className="bg-white/10 px-2 py-0.5 rounded">{cardBuffer || '-'}</code>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Last Card:</span>
              <code className="bg-white/10 px-2 py-0.5 rounded">{lastScannedCard || '-'}</code>
            </div>
            <div className="pt-2 border-t border-white/20">
              <span className="text-white/60 block mb-1">Last Response:</span>
              <div className="bg-white/10 px-2 py-1 rounded text-xs break-all">
                {lastApiResponse || '-'}
              </div>
            </div>
            <div className="pt-2 border-t border-white/20">
              <span className="text-white/60 block mb-1">Manual Test:</span>
              <div className="flex gap-2">
                <Input
                  placeholder="কার্ড নম্বর"
                  value={manualCardInput}
                  onChange={(e) => setManualCardInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualTest()}
                  className="h-8 text-sm bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
                <Button size="sm" onClick={handleManualTest} className="h-8">
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="pt-2 border-t border-white/20">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={loadCache}
                className="w-full text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" /> Refresh Cache
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-b border-white/10 gap-3">
        <div className="flex items-center gap-3 sm:gap-4">
          {monitorLogo ? (
            <img src={monitorLogo} alt="Logo" className="h-10 sm:h-14 w-auto object-contain" />
          ) : (
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-lg sm:text-2xl font-bold font-bengali">আমার হাজিরা</h1>
            <p className="text-white/60 text-xs sm:text-base">Amar Hajira - Gate Monitor</p>
          </div>
        </div>

        <TimeDisplay />
      </header>

      {/* Main Content - Two Column Layout */}
      <main className="flex-1 flex flex-col lg:flex-row min-h-0">
        {/* Left: Main Display Area */}
        <div className="flex-1 relative min-h-0">
          {/* Scanning Indicator */}
          {isScanning && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40">
              <div className="bg-blue-500/90 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-pulse">
                <CreditCard className="h-8 w-8" />
                <span className="text-xl font-bold">স্ক্যান হচ্ছে...</span>
              </div>
            </div>
          )}

          {/* Content based on mode */}
          {isIdle ? (
            // IDLE MODE: Video + Scroller (or Top Students if no videos)
            hasVideos ? (
              <div className="absolute inset-0 flex flex-col">
                {/* Video Player - fills remaining space */}
                <div className="flex-1 relative min-h-0">
                  <VideoPlayer 
                    videos={videoItems} 
                    hideControls={true}
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                
                {/* News Scroller - Fixed at bottom */}
                {newsItems.length > 0 && (
                  <div className="shrink-0">
                    <NewsScroller 
                      items={newsItems} 
                      logoUrl={monitorLogo} 
                      schoolLogoUrl={schoolLogo}
                      settings={scrollerSettings}
                    />
                  </div>
                )}
              </div>
            ) : (
              // Idle without videos: Show Top Students
              <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
                <div className="text-center mb-6 sm:mb-8">
                  <Trophy className="h-12 w-12 sm:h-16 sm:w-16 text-yellow-400 mx-auto mb-3 sm:mb-4" />
                  <h2 className="text-xl sm:text-3xl font-bold font-bengali">এই মাসের সেরা শিক্ষার্থী</h2>
                  <p className="text-white/60 text-sm sm:text-base">Top Attendance This Month</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6 w-full max-w-4xl">
                  {topStudents.map((student, index) => (
                    <div
                      key={student.id}
                      className={cn(
                        "bg-white/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-6 text-center border transition-all",
                        index === 0 ? "border-yellow-500/50 bg-yellow-500/10" : "border-white/10"
                      )}
                    >
                      <div className="relative inline-block mb-2 sm:mb-4">
                        {student.photo_url ? (
                          <img
                            src={student.photo_url}
                            alt={student.name}
                            className="w-12 h-12 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white/20"
                          />
                        ) : (
                          <div className="w-12 h-12 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg sm:text-2xl font-bold">
                            {student.name.charAt(0)}
                          </div>
                        )}
                        {index === 0 && (
                          <Trophy className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-5 w-5 sm:h-8 sm:w-8 text-yellow-400 drop-shadow-lg" />
                        )}
                      </div>
                      <h3 className="font-bold font-bengali text-xs sm:text-base truncate">{student.name_bn || student.name}</h3>
                      <p className="text-white/60 text-xs">{student.class_name}</p>
                      <p className="text-green-400 font-bold mt-1 sm:mt-2 text-sm sm:text-lg">{student.present_days} দিন</p>
                    </div>
                  ))}
                </div>

                <p className="mt-6 sm:mt-8 text-white/40 animate-pulse font-bengali text-sm sm:text-base">
                  কার্ড স্ক্যান করুন...
                </p>
              </div>
            )
          ) : (
            // ACTIVE MODE: Show Latest Punch (NO SCROLLER)
            <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
              {latestPunch ? (
                <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
                  <div className="relative mb-4 sm:mb-8">
                    {latestPunch.photo_url ? (
                      <img
                        src={latestPunch.photo_url}
                        alt={latestPunch.name}
                        className="w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 rounded-full object-cover border-4 border-white/20 shadow-2xl"
                      />
                    ) : (
                      <div className="w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl sm:text-6xl lg:text-8xl font-bold shadow-2xl">
                        {latestPunch.name.charAt(0)}
                      </div>
                    )}
                    <div className={cn(
                      "absolute -bottom-2 -right-2 sm:-bottom-4 sm:-right-4 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center shadow-lg",
                      latestPunch.status === 'present' ? 'bg-green-500' :
                      latestPunch.status === 'late' ? 'bg-yellow-500' :
                      'bg-red-500'
                    )}>
                      <UserCheck className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10" />
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-bengali mb-2 text-center px-4">
                    {latestPunch.name_bn || latestPunch.name}
                  </h2>

                  <div className="flex items-center gap-2 sm:gap-4 text-white/80 text-base sm:text-xl lg:text-2xl mb-4 sm:mb-6">
                    {latestPunch.class_name && (
                      <span className="font-bengali">{latestPunch.class_name}</span>
                    )}
                    {latestPunch.section_name && (
                      <>
                        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="font-bengali">{latestPunch.section_name}</span>
                      </>
                    )}
                  </div>

                  <div className={cn(
                    "px-6 sm:px-10 py-2 sm:py-4 rounded-full text-lg sm:text-2xl font-bold",
                    latestPunch.status === 'present' ? 'bg-green-500/20 text-green-400' :
                    latestPunch.status === 'late' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  )}>
                    {latestPunch.status === 'present' ? 'উপস্থিত' :
                     latestPunch.status === 'late' ? 'বিলম্ব' : 'অনুপস্থিত'}
                  </div>

                  <p className="mt-4 sm:mt-6 text-white/60 text-lg sm:text-2xl font-mono">
                    {formatPunchTime(latestPunch.punch_time)}
                  </p>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <CreditCard className="h-16 w-16 sm:h-24 sm:w-24 text-white/20 mx-auto mb-4" />
                    <p className="text-white/40 text-lg sm:text-2xl font-bengali">
                      কার্ড স্ক্যান করুন
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Recent Punches Sidebar - ALWAYS VISIBLE */}
        <div className="w-full lg:w-80 bg-white/5 backdrop-blur-sm border-l border-white/10 flex flex-col min-h-0 max-h-full">
          <div className="p-3 sm:p-4 border-b border-white/10 flex items-center justify-between shrink-0">
            <h3 className="font-bold font-bengali text-sm sm:text-base">সাম্প্রতিক পাঞ্চ</h3>
            <span className="text-white/40 text-xs sm:text-sm">{latestPunches.length} জন</span>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            {latestPunches.slice(0, 15).map((punch) => (
              <div
                key={punch.id}
                className="p-2 sm:p-3 border-b border-white/5 flex items-center gap-2 sm:gap-3 hover:bg-white/5 transition-colors"
              >
                {punch.photo_url ? (
                  <img
                    src={punch.photo_url}
                    alt={punch.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-white/20 shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs sm:text-sm font-bold shrink-0">
                    {punch.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium font-bengali truncate text-xs sm:text-sm">{punch.name_bn || punch.name}</p>
                  <p className="text-white/40 text-xs truncate">
                    {punch.class_name} {punch.section_name}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs sm:text-sm font-mono">{formatPunchTime(punch.punch_time)}</p>
                  <div className={cn(
                    "inline-block w-2 h-2 rounded-full mt-1",
                    punch.status === 'present' ? 'bg-green-500' :
                    punch.status === 'late' ? 'bg-yellow-500' :
                    'bg-red-500'
                  )} />
                </div>
              </div>
            ))}

            {latestPunches.length === 0 && (
              <div className="p-6 sm:p-8 text-center text-white/40">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" />
                <p className="font-bengali text-xs sm:text-sm">আজকের কোনো পাঞ্চ নেই</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Status */}
      <footer className="p-3 sm:p-4 border-t border-white/10 flex items-center justify-between text-xs sm:text-sm text-white/60 shrink-0">
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            cacheLoaded ? "bg-green-500" : "bg-yellow-500 animate-pulse"
          )} />
          <span>{cacheLoaded ? 'সিস্টেম প্রস্তুত' : 'ক্যাশ লোড হচ্ছে...'}</span>
          {cacheLoaded && (
            <span className="text-white/40">({cacheStats.students} শিক্ষার্থী)</span>
          )}
        </div>
        <button
          onClick={() => setIsIdle(!isIdle)}
          className="hover:text-white transition-colors font-bengali"
        >
          {isIdle ? 'লাইভ দেখুন' : hasVideos ? 'ভিডিও দেখুন' : 'টপ দেখুন'}
        </button>
      </footer>
    </div>
  );
}
