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
import { Calendar, Search, Download, Users, CheckCircle, XCircle, Clock, LogIn, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { format } from 'date-fns';

interface AttendanceRecord {
  id: string;
  teacher_id: string;
  attendance_date: string;
  punch_in_time: string | null;
  punch_out_time: string | null;
  status: string;
  late_minutes: number;
  teachers: {
    name: string;
    name_bn: string | null;
    designation: string;
    photo_url: string | null;
  };
}

interface Shift {
  id: string;
  name: string;
  name_bn: string | null;
}

export default function TeacherAttendance() {
  const { activeYear } = useAcademicYear();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [stats, setStats] = useState({ total: 0, present: 0, late: 0, absent: 0 });

  useEffect(() => {
    if (activeYear) {
      fetchShifts();
    }
  }, [activeYear]);

  useEffect(() => {
    if (activeYear && selectedDate) {
      fetchAttendance();
    }
  }, [activeYear, selectedDate, selectedShift]);

  const fetchShifts = async () => {
    if (!activeYear) return;
    const { data } = await supabase
      .from('shifts')
      .select('id, name, name_bn')
      .eq('academic_year_id', activeYear.id);
    setShifts(data || []);
  };

  const fetchAttendance = async () => {
    if (!activeYear) return;
    setLoading(true);

    try {
      let query = supabase
        .from('teacher_attendance')
        .select(`
          id,
          teacher_id,
          attendance_date,
          punch_in_time,
          punch_out_time,
          status,
          late_minutes,
          teachers (
            name,
            name_bn,
            designation,
            photo_url,
            shift_id
          )
        `)
        .eq('attendance_date', selectedDate)
        .eq('academic_year_id', activeYear.id)
        .order('punch_in_time', { ascending: true });

      const { data, error } = await query;

      if (error) throw error;

      let filteredData = data || [];

      if (selectedShift !== 'all') {
        filteredData = filteredData.filter((r: any) => r.teachers?.shift_id === selectedShift);
      }

      setRecords(filteredData as AttendanceRecord[]);

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
      record.teachers?.name.toLowerCase().includes(query) ||
      record.teachers?.name_bn?.toLowerCase().includes(query)
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

  const formatDesignation = (designation: string) => {
    return designation
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <MainLayout title="Teacher Attendance" titleBn="শিক্ষক উপস্থিতি">
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

          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
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
              <th>Teacher Name</th>
              <th>Designation</th>
              <th>Punch In</th>
              <th>Punch Out</th>
              <th>Late (min)</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((record) => (
              <tr key={record.id}>
                <td>
                  <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                    {record.teachers?.photo_url ? (
                      <img
                        src={record.teachers.photo_url}
                        alt={record.teachers.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        {record.teachers?.name?.charAt(0) || '?'}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div>
                    <p className="font-medium">{record.teachers?.name}</p>
                    <p className="text-sm text-muted-foreground font-bengali">
                      {record.teachers?.name_bn}
                    </p>
                  </div>
                </td>
                <td>{record.teachers?.designation ? formatDesignation(record.teachers.designation) : '-'}</td>
                <td>
                  {record.punch_in_time ? (
                    <span className="inline-flex items-center gap-1 text-success">
                      <LogIn className="w-3 h-3" />
                      {format(new Date(record.punch_in_time), 'hh:mm a')}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  {record.punch_out_time ? (
                    <span className="inline-flex items-center gap-1 text-info">
                      <LogOut className="w-3 h-3" />
                      {format(new Date(record.punch_out_time), 'hh:mm a')}
                    </span>
                  ) : (
                    '-'
                  )}
                </td>
                <td>
                  {record.late_minutes > 0 ? (
                    <span className="text-warning">{record.late_minutes}</span>
                  ) : (
                    '-'
                  )}
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
