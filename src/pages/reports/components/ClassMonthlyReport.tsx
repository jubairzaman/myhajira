import { useEffect, useState, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { bn } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface ClassMonthlyReportProps {
  classId: string;
  sectionId: string;
  month: Date;
  academicYearId: string;
  academicYearName: string;
  className: string;
  sectionName: string;
}

interface StudentWithAttendance {
  id: string;
  name: string;
  name_bn: string | null;
  student_id_number: string | null;
  attendance: { [date: string]: string };
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
}

interface SystemSettings {
  school_name: string | null;
  school_name_bn: string | null;
  school_logo_url: string | null;
  report_header_image_url: string | null;
}

export function ClassMonthlyReport({
  classId,
  sectionId,
  month,
  academicYearId,
  academicYearName,
  className,
  sectionName,
}: ClassMonthlyReportProps) {
  const [students, setStudents] = useState<StudentWithAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('system_settings')
        .select('school_name, school_name_bn, school_logo_url, report_header_image_url')
        .limit(1)
        .single();
      if (data) setSettings(data as SystemSettings);
    };
    fetchSettings();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: studentsData } = await supabase
        .from('students')
        .select('id, name, name_bn, student_id_number')
        .eq('class_id', classId)
        .eq('section_id', sectionId)
        .eq('is_active', true)
        .order('student_id_number');

      if (!studentsData || studentsData.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      const studentIds = studentsData.map(s => s.id);
      const { data: attendanceData } = await supabase
        .from('student_attendance')
        .select('student_id, attendance_date, status')
        .in('student_id', studentIds)
        .eq('academic_year_id', academicYearId)
        .gte('attendance_date', format(monthStart, 'yyyy-MM-dd'))
        .lte('attendance_date', format(monthEnd, 'yyyy-MM-dd'));

      const studentsWithAttendance: StudentWithAttendance[] = studentsData.map(student => {
        const studentAttendance = (attendanceData || []).filter(a => a.student_id === student.id);
        const attendanceMap: { [date: string]: string } = {};
        
        studentAttendance.forEach(a => {
          attendanceMap[a.attendance_date] = a.status;
        });

        const totalPresent = studentAttendance.filter(a => a.status === 'present').length;
        const totalLate = studentAttendance.filter(a => a.status === 'late').length;
        const totalAbsent = studentAttendance.filter(a => a.status === 'absent').length;

        return {
          ...student,
          attendance: attendanceMap,
          totalPresent: totalPresent + totalLate,
          totalAbsent,
          totalLate,
        };
      });

      setStudents(studentsWithAttendance);
    } catch (error) {
      console.error('Error fetching class report:', error);
    } finally {
      setLoading(false);
    }
  }, [classId, sectionId, academicYearId, month]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel(`class-attendance-${classId}-${sectionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'student_attendance',
        },
        () => {
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData, classId, sectionId]);

  const getStatusSymbol = (status: string | undefined) => {
    switch (status) {
      case 'present':
        return 'P';
      case 'late':
        return 'L';
      case 'absent':
        return 'A';
      default:
        return '-';
    }
  };

  const getStatusClass = (status: string | undefined) => {
    switch (status) {
      case 'present':
        return 'cmr-status-present';
      case 'late':
        return 'cmr-status-late';
      case 'absent':
        return 'cmr-status-absent';
      default:
        return 'cmr-status-none';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        এই শ্রেণী/শাখায় কোনো শিক্ষার্থী পাওয়া যায়নি
      </div>
    );
  }

  const now = new Date();
  // Count unique dates that have at least one attendance record
  const workingDays = new Set(
    students.flatMap(s => Object.keys(s.attendance))
  ).size;

  return (
    <>
      <style>{`
        .cmr-print-report {
          font-family: 'Hind Siliguri', 'Inter', Arial, sans-serif;
          color: #1a1a1a;
          background: #fff;
        }

        /* Screen styles */
        @media screen {
          .cmr-print-report {
            max-width: 210mm;
            margin: 0 auto;
            padding: 24px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }
        }

        /* ---- HEADER ---- */
        .cmr-header {
          text-align: center;
          margin-bottom: 8px;
        }
        .cmr-header-img {
          max-height: 80px;
          width: auto;
          margin: 0 auto 4px;
          display: block;
          object-fit: contain;
        }
        .cmr-school-name {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          line-height: 1.3;
          letter-spacing: 0.5px;
        }
        .cmr-school-sub {
          font-size: 11px;
          color: #555;
          margin: 0;
        }
        .cmr-report-title {
          font-size: 14px;
          font-weight: 600;
          margin: 6px 0 2px;
          letter-spacing: 0.3px;
        }
        .cmr-meta-row {
          display: flex;
          justify-content: center;
          gap: 24px;
          font-size: 11px;
          color: #333;
          margin: 2px 0;
        }
        .cmr-meta-row strong {
          color: #000;
        }
        .cmr-divider {
          border: none;
          border-top: 1.5px solid #222;
          margin: 6px 0;
        }

        /* ---- LEGEND ---- */
        .cmr-legend {
          display: flex;
          gap: 16px;
          font-size: 10px;
          margin-bottom: 6px;
          color: #333;
        }
        .cmr-legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        /* ---- TABLE ---- */
        .cmr-table-wrap {
          overflow-x: auto;
        }
        .cmr-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9px;
          line-height: 1.2;
        }
        .cmr-table th,
        .cmr-table td {
          border: 1px solid #bbb;
          padding: 2px 1px;
          text-align: center;
          vertical-align: middle;
        }
        .cmr-table thead th {
          background: #f0f0f0;
          font-weight: 700;
          font-size: 8.5px;
          color: #111;
        }
        .cmr-table .cmr-col-roll {
          width: 32px;
          min-width: 32px;
        }
        .cmr-table .cmr-col-name {
          min-width: 90px;
          max-width: 130px;
          text-align: left;
          padding-left: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .cmr-table .cmr-col-day {
          width: 18px;
          min-width: 18px;
          max-width: 22px;
          padding: 2px 0;
        }
        .cmr-table .cmr-col-summary {
          width: 28px;
          min-width: 28px;
          font-weight: 700;
        }
        .cmr-table tbody tr:nth-child(even) {
          background: #fafafa;
        }
        .cmr-table tbody tr:hover {
          background: #f5f5f5;
        }

        /* Status colors (screen) */
        .cmr-status-present { color: #16a34a; font-weight: 700; }
        .cmr-status-late { color: #ca8a04; font-weight: 700; }
        .cmr-status-absent { color: #dc2626; font-weight: 700; }
        .cmr-status-none { color: #ccc; }
        .cmr-summary-p { color: #16a34a; }
        .cmr-summary-a { color: #dc2626; }

        /* ---- FOOTER ---- */
        .cmr-footer-divider {
          border: none;
          border-top: 1px solid #999;
          margin: 8px 0 4px;
        }
        .cmr-footer {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 8.5px;
          color: #555;
        }
        .cmr-footer-left {
          text-align: left;
        }
        .cmr-footer-right {
          text-align: right;
        }
        .cmr-signature-line {
          display: inline-block;
          width: 120px;
          border-top: 1px solid #333;
          margin-top: 24px;
          padding-top: 2px;
          text-align: center;
          font-size: 9px;
          color: #333;
        }

        /* ====================== */
        /*  PRINT STYLES          */
        /* ====================== */
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 10mm 10mm 10mm;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            margin: 0 !important;
            padding: 0 !important;
          }

          .cmr-print-report {
            padding: 0;
            border: none;
            border-radius: 0;
            max-width: none;
            width: 100%;
            box-shadow: none;
          }

          /* Hide UI elements */
          .cmr-no-print {
            display: none !important;
          }

          /* Prevent blank last page */
          .cmr-print-report::after {
            content: '';
            display: block;
            height: 0;
            page-break-after: avoid;
          }

          .cmr-table {
            page-break-inside: avoid;
          }
          .cmr-table thead {
            display: table-header-group;
          }
          .cmr-table tr {
            page-break-inside: avoid;
          }

          /* Print-safe colors */
          .cmr-status-present { color: #000 !important; }
          .cmr-status-late { color: #555 !important; }
          .cmr-status-absent { color: #000 !important; font-style: italic; }
          .cmr-status-none { color: #ccc !important; }
          .cmr-summary-p { color: #000 !important; }
          .cmr-summary-a { color: #000 !important; }

          .cmr-table tbody tr:nth-child(even) {
            background: #f5f5f5 !important;
          }
          .cmr-table thead th {
            background: #e8e8e8 !important;
          }

          .cmr-footer {
            position: relative;
            bottom: 0;
          }
        }
      `}</style>

      <div className="cmr-print-report">
        {/* ===== HEADER ===== */}
        <div className="cmr-header">
          {settings?.report_header_image_url ? (
            <img
              src={settings.report_header_image_url}
              alt="Header"
              className="cmr-header-img"
            />
          ) : (
            <>
              <h1 className="cmr-school-name">
                {settings?.school_name_bn || settings?.school_name || 'বিদ্যালয়ের নাম'}
              </h1>
              {settings?.school_name && settings?.school_name_bn && (
                <p className="cmr-school-sub">{settings.school_name}</p>
              )}
            </>
          )}
          <h2 className="cmr-report-title">মাসিক উপস্থিতি রেজিস্টার</h2>
          <div className="cmr-meta-row">
            <span>{className} — {sectionName}</span>
            <span>মাস: <strong>{format(month, 'MMMM yyyy', { locale: bn })}</strong></span>
            <span>শিক্ষাবর্ষ: <strong>{academicYearName}</strong></span>
          </div>
          <div className="cmr-meta-row">
            <span>মোট শিক্ষার্থী: <strong>{students.length}</strong></span>
            <span>কার্যদিবস: <strong>{workingDays}</strong></span>
          </div>
        </div>

        <hr className="cmr-divider" />

        {/* Legend */}
        <div className="cmr-legend">
          <span className="cmr-legend-item"><strong className="cmr-status-present">P</strong> = উপস্থিত</span>
          <span className="cmr-legend-item"><strong className="cmr-status-late">L</strong> = বিলম্ব</span>
          <span className="cmr-legend-item"><strong className="cmr-status-absent">A</strong> = অনুপস্থিত</span>
        </div>

        {/* ===== TABLE ===== */}
        <div className="cmr-table-wrap">
          <table className="cmr-table">
            <thead>
              <tr>
                <th className="cmr-col-roll">রোল</th>
                <th className="cmr-col-name">নাম</th>
                {daysInMonth.map((day) => (
                  <th key={day.toISOString()} className="cmr-col-day">
                    {format(day, 'd')}
                  </th>
                ))}
                <th className="cmr-col-summary">উপ</th>
                <th className="cmr-col-summary">অনু</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td className="cmr-col-roll">{student.student_id_number || '-'}</td>
                  <td className="cmr-col-name" title={student.name_bn || student.name}>
                    {student.name_bn || student.name}
                  </td>
                  {daysInMonth.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const status = student.attendance[dateStr];
                    return (
                      <td key={day.toISOString()} className={`cmr-col-day ${getStatusClass(status)}`}>
                        {getStatusSymbol(status)}
                      </td>
                    );
                  })}
                  <td className="cmr-col-summary cmr-summary-p">{student.totalPresent}</td>
                  <td className="cmr-col-summary cmr-summary-a">{student.totalAbsent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ===== FOOTER ===== */}
        <hr className="cmr-footer-divider" />
        <div className="cmr-footer">
          <div className="cmr-footer-left">
            <div>Generated by <strong>Amar Hajira Smart</strong></div>
            <div>{format(now, 'dd/MM/yyyy')} — {format(now, 'hh:mm a')}</div>
          </div>
          <div className="cmr-footer-right">
            <div className="cmr-signature-line">শ্রেণী শিক্ষকের স্বাক্ষর</div>
          </div>
        </div>
      </div>
    </>
  );
}
