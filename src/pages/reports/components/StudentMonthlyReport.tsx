/**
 * Student Monthly Attendance Report — Professional A4 Print Engine
 * Paper: A4 Portrait (210mm × 297mm)
 * Margins: Top 20mm, Bottom 20mm, Left 15mm, Right 15mm
 * 
 * Developed by Jubair Zaman
 */

import { useEffect, useState, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { bn } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface StudentMonthlyReportProps {
  studentId: string;
  month: Date;
  academicYearId: string;
  academicYearName: string;
}

interface StudentInfo {
  id: string;
  name: string;
  name_bn: string | null;
  student_id_number: string | null;
  guardian_mobile: string;
  class_name: string;
  class_name_bn: string | null;
  section_name: string;
  section_name_bn: string | null;
}

interface AttendanceRecord {
  attendance_date: string;
  status: string;
  punch_time: string | null;
}

interface Summary {
  totalWorkingDays: number;
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  attendancePercentage: number;
}

interface SchoolSettings {
  school_name: string | null;
  school_name_bn: string | null;
  school_logo_url: string | null;
}

const DAY_NAMES_BN: Record<number, string> = {
  0: 'রবিবার',
  1: 'সোমবার',
  2: 'মঙ্গলবার',
  3: 'বুধবার',
  4: 'বৃহস্পতিবার',
  5: 'শুক্রবার',
  6: 'শনিবার',
};

const toBengaliNum = (n: number | string): string => {
  const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
};

export function StudentMonthlyReport({
  studentId,
  month,
  academicYearId,
  academicYearName,
}: StudentMonthlyReportProps) {
  const [student, setStudent] = useState<StudentInfo | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Parallel fetch: student, attendance, school settings
      const [studentRes, attendanceRes, settingsRes] = await Promise.all([
        supabase
          .from('students')
          .select(`
            id, name, name_bn, student_id_number, guardian_mobile, class_id,
            classes:class_id (name, name_bn),
            sections:section_id (name, name_bn)
          `)
          .eq('id', studentId)
          .single(),
        supabase
          .from('student_attendance')
          .select('attendance_date, status, punch_time')
          .eq('student_id', studentId)
          .eq('academic_year_id', academicYearId)
          .gte('attendance_date', format(monthStart, 'yyyy-MM-dd'))
          .lte('attendance_date', format(monthEnd, 'yyyy-MM-dd'))
          .order('attendance_date'),
        supabase
          .from('system_settings')
          .select('school_name, school_name_bn, school_logo_url')
          .limit(1)
          .single(),
      ]);

      if (studentRes.data) {
        const s = studentRes.data;
        setStudent({
          id: s.id,
          name: s.name,
          name_bn: s.name_bn,
          student_id_number: s.student_id_number,
          guardian_mobile: s.guardian_mobile,
          class_name: (s.classes as any)?.name || '',
          class_name_bn: (s.classes as any)?.name_bn,
          section_name: (s.sections as any)?.name || '',
          section_name_bn: (s.sections as any)?.name_bn,
        });
      }

      if (settingsRes.data) {
        setSettings(settingsRes.data);
      }

      const attData = attendanceRes.data || [];
      setAttendance(attData);

      // Working days count via DB function
      const { data: workingDaysData } = await supabase.rpc('get_working_days_count', {
        p_start_date: format(monthStart, 'yyyy-MM-dd'),
        p_end_date: format(monthEnd, 'yyyy-MM-dd'),
        p_class_id: studentRes.data?.class_id,
        p_academic_year_id: academicYearId,
      });

      const totalWorkingDays = workingDaysData || 0;
      const totalPresent = attData.filter((a) => a.status === 'present').length;
      const totalLate = attData.filter((a) => a.status === 'late').length;
      const totalAbsent = attData.filter((a) => a.status === 'absent').length;
      const attendancePercentage =
        totalWorkingDays > 0
          ? Math.round(((totalPresent + totalLate) / totalWorkingDays) * 100)
          : 0;

      setSummary({ totalWorkingDays, totalPresent, totalAbsent, totalLate, attendancePercentage });
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  }, [studentId, academicYearId, month]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel(`student-attendance-report-${studentId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_attendance',
          filter: `student_id=eq.${studentId}`,
        },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData, studentId]);

  const getAttendanceForDate = (date: Date): AttendanceRecord | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return attendance.find((a) => a.attendance_date === dateStr);
  };

  const formatPunchTime = (punchTime: string | null) => {
    if (!punchTime) return '—';
    try {
      return format(new Date(punchTime), 'hh:mm a');
    } catch {
      return punchTime;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present': return 'উপস্থিত';
      case 'late': return 'বিলম্বে';
      case 'absent': return 'অনুপস্থিত';
      default: return '—';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        শিক্ষার্থীর তথ্য পাওয়া যায়নি
      </div>
    );
  }

  const monthNameBn = format(month, 'MMMM yyyy', { locale: bn });
  const now = new Date();

  return (
    <div className="student-attendance-report">
      {/* ====== PAGE HEADER ====== */}
      <div className="sar-header">
        <div className="sar-header-row">
          {settings?.school_logo_url && (
            <img
              src={settings.school_logo_url}
              alt="Logo"
              className="sar-logo"
            />
          )}
          <div className="sar-header-center">
            <h1 className="sar-school-name-bn">
              {settings?.school_name_bn || 'বিদ্যালয়ের নাম'}
            </h1>
            {settings?.school_name && (
              <p className="sar-school-name-en">{settings.school_name}</p>
            )}
            <h2 className="sar-report-title">শিক্ষার্থী মাসিক উপস্থিতি রিপোর্ট</h2>
          </div>
          <div className="sar-header-right">
            <p>শিক্ষাবর্ষ: <strong>{academicYearName}</strong></p>
            <p>মাস: <strong>{monthNameBn}</strong></p>
          </div>
        </div>
        <div className="sar-divider" />
      </div>

      {/* ====== STUDENT INFO BOX ====== */}
      <div className="sar-student-info">
        <div className="sar-info-grid">
          <div className="sar-info-item">
            <span className="sar-info-label">নাম (Name)</span>
            <span className="sar-info-value">
              {student.name_bn || student.name}
              {student.name_bn && student.name && (
                <span className="sar-info-sub"> ({student.name})</span>
              )}
            </span>
          </div>
          <div className="sar-info-item">
            <span className="sar-info-label">শ্রেণী (Class)</span>
            <span className="sar-info-value">
              {student.class_name_bn || student.class_name}
            </span>
          </div>
          <div className="sar-info-item">
            <span className="sar-info-label">শাখা (Section)</span>
            <span className="sar-info-value">
              {student.section_name_bn || student.section_name}
            </span>
          </div>
          <div className="sar-info-item">
            <span className="sar-info-label">রোল / আইডি (Roll)</span>
            <span className="sar-info-value">
              {student.student_id_number || '—'}
            </span>
          </div>
          <div className="sar-info-item">
            <span className="sar-info-label">অভিভাবকের মোবাইল</span>
            <span className="sar-info-value">{student.guardian_mobile}</span>
          </div>
        </div>
      </div>

      {/* ====== ATTENDANCE TABLE ====== */}
      <table className="sar-table">
        <thead>
          <tr>
            <th className="sar-th-sl">ক্র.নং</th>
            <th className="sar-th-date">তারিখ</th>
            <th className="sar-th-day">বার</th>
            <th className="sar-th-status">অবস্থা</th>
            <th className="sar-th-time">পাঞ্চ সময়</th>
          </tr>
        </thead>
        <tbody>
          {daysInMonth.map((day, idx) => {
            const record = getAttendanceForDate(day);
            const dayOfWeek = day.getDay();
            const dateBn = toBengaliNum(format(day, 'dd'));
            const monthBn = format(day, 'MMM', { locale: bn });
            const statusClass = record
              ? record.status === 'absent'
                ? 'sar-status-absent'
                : record.status === 'late'
                ? 'sar-status-late'
                : 'sar-status-present'
              : '';

            return (
              <tr key={day.toISOString()} className={dayOfWeek === 5 || dayOfWeek === 6 ? 'sar-row-weekend' : ''}>
                <td className="sar-td-center">{toBengaliNum(idx + 1)}</td>
                <td className="sar-td-date">{dateBn} {monthBn}</td>
                <td>{DAY_NAMES_BN[dayOfWeek]}</td>
                <td className={`sar-td-status ${statusClass}`}>
                  {record ? getStatusText(record.status) : '—'}
                </td>
                <td className="sar-td-center">
                  {record ? formatPunchTime(record.punch_time) : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ====== MONTHLY SUMMARY ====== */}
      {summary && (
        <div className="sar-summary">
          <h3 className="sar-summary-title">মাসিক সারাংশ (Monthly Summary)</h3>
          <div className="sar-summary-grid">
            <div className="sar-summary-card">
              <span className="sar-summary-num">{toBengaliNum(summary.totalWorkingDays)}</span>
              <span className="sar-summary-label">মোট কার্যদিবস</span>
              <span className="sar-summary-label-en">Working Days</span>
            </div>
            <div className="sar-summary-card sar-card-present">
              <span className="sar-summary-num">{toBengaliNum(summary.totalPresent)}</span>
              <span className="sar-summary-label">উপস্থিত</span>
              <span className="sar-summary-label-en">Present</span>
            </div>
            <div className="sar-summary-card sar-card-late">
              <span className="sar-summary-num">{toBengaliNum(summary.totalLate)}</span>
              <span className="sar-summary-label">বিলম্ব</span>
              <span className="sar-summary-label-en">Late</span>
            </div>
            <div className="sar-summary-card sar-card-absent">
              <span className="sar-summary-num">{toBengaliNum(summary.totalAbsent)}</span>
              <span className="sar-summary-label">অনুপস্থিত</span>
              <span className="sar-summary-label-en">Absent</span>
            </div>
            <div className="sar-summary-card sar-card-rate">
              <span className="sar-summary-num">{toBengaliNum(summary.attendancePercentage)}%</span>
              <span className="sar-summary-label">উপস্থিতি হার</span>
              <span className="sar-summary-label-en">Attendance %</span>
            </div>
          </div>
        </div>
      )}

      {/* ====== FOOTER ====== */}
      <div className="sar-footer">
        <div className="sar-footer-left">
          Generated by <strong>Amar Hajira Smart</strong>
        </div>
        <div className="sar-footer-center">
          তৈরির তারিখ: {toBengaliNum(format(now, 'dd'))}/{toBengaliNum(format(now, 'MM'))}/{toBengaliNum(format(now, 'yyyy'))} — {format(now, 'hh:mm a')}
        </div>
      </div>
    </div>
  );
}
