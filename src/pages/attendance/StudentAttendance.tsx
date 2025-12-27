import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Search, Download, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { format } from 'date-fns';

interface AttendanceRecord {
  id: string;
  student_id: string;
  attendance_date: string;
  punch_time: string;
  status: string;
  students: {
    name: string;
    name_bn: string | null;
    student_id_number: string | null;
    photo_url: string | null;
    classes: { name: string } | null;
    sections: { name: string } | null;
  };
}

interface Shift {
  id: string;
  name: string;
  name_bn: string | null;
}

interface Class {
  id: string;
  name: string;
}

export default function StudentAttendance() {
  const { activeYear } = useAcademicYear();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [stats, setStats] = useState({ total: 0, present: 0, late: 0, absent: 0 });

  useEffect(() => {
    if (activeYear) {
      fetchShiftsAndClasses();
    }
  }, [activeYear]);

  useEffect(() => {
    if (activeYear && selectedDate) {
      fetchAttendance();
    }
  }, [activeYear, selectedDate, selectedShift, selectedClass]);

  const fetchShiftsAndClasses = async () => {
    if (!activeYear) return;

    const [shiftsRes, classesRes] = await Promise.all([
      supabase.from('shifts').select('id, name, name_bn').eq('academic_year_id', activeYear.id),
      supabase.from('classes').select('id, name').eq('is_active', true).order('grade_order'),
    ]);

    setShifts(shiftsRes.data || []);
    setClasses(classesRes.data || []);
  };

  const fetchAttendance = async () => {
    if (!activeYear) return;
    setLoading(true);

    try {
      // Build query
      let query = supabase
        .from('student_attendance')
        .select(`
          id,
          student_id,
          attendance_date,
          punch_time,
          status,
          students (
            name,
            name_bn,
            student_id_number,
            photo_url,
            shift_id,
            class_id,
            classes (name),
            sections (name)
          )
        `)
        .eq('attendance_date', selectedDate)
        .eq('academic_year_id', activeYear.id)
        .order('punch_time', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];

      // Apply filters
      if (selectedShift !== 'all') {
        filteredData = filteredData.filter((r: any) => r.students?.shift_id === selectedShift);
      }
      if (selectedClass !== 'all') {
        filteredData = filteredData.filter((r: any) => r.students?.class_id === selectedClass);
      }

      setRecords(filteredData as AttendanceRecord[]);

      // Calculate stats
      const present = filteredData.filter((r: any) => r.status === 'present').length;
      const late = filteredData.filter((r: any) => r.status === 'late').length;
      const absent = filteredData.filter((r: any) => r.status === 'absent').length;

      setStats({
        total: filteredData.length,
        present,
        late,
        absent,
      });
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter((record) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      record.students?.name.toLowerCase().includes(query) ||
      record.students?.name_bn?.toLowerCase().includes(query) ||
      record.students?.student_id_number?.toLowerCase().includes(query)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
            <CheckCircle className="w-3 h-3" />
            Present
          </span>
        );
      case 'late':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
            <Clock className="w-3 h-3" />
            Late
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-destructive/10 text-destructive">
            <XCircle className="w-3 h-3" />
            Absent
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout title="Student Attendance" titleBn="শিক্ষার্থী উপস্থিতি">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Records</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{stats.present}</p>
              <p className="text-xs text-muted-foreground">Present</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{stats.late}</p>
              <p className="text-xs text-muted-foreground">Late</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold text-destructive">{stats.absent}</p>
              <p className="text-xs text-muted-foreground">Absent</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-elevated p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-40"
            />
          </div>

          <Select value={selectedShift} onValueChange={setSelectedShift}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Shifts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Shifts</SelectItem>
              {shifts.map((shift) => (
                <SelectItem key={shift.id} value={shift.id}>
                  {shift.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="card-elevated overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Photo</th>
              <th>Student Name</th>
              <th>ID</th>
              <th>Class</th>
              <th>Section</th>
              <th>Punch Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record.id}>
                <td>
                  <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                    {record.students?.photo_url ? (
                      <img
                        src={record.students.photo_url}
                        alt={record.students.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        {record.students?.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div>
                    <p className="font-medium">{record.students?.name}</p>
                    <p className="text-sm text-muted-foreground font-bengali">
                      {record.students?.name_bn}
                    </p>
                  </div>
                </td>
                <td>{record.students?.student_id_number || '-'}</td>
                <td>{record.students?.classes?.name || '-'}</td>
                <td>{record.students?.sections?.name || '-'}</td>
                <td>
                  {record.punch_time
                    ? format(new Date(record.punch_time), 'hh:mm a')
                    : '-'}
                </td>
                <td>{getStatusBadge(record.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRecords.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No attendance records</p>
            <p className="text-sm text-muted-foreground font-bengali">
              এই তারিখে কোন উপস্থিতি রেকর্ড নেই
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
