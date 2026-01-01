import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { useShiftsQuery } from '@/hooks/queries/useShiftsQuery';
import { useClassesQuery } from '@/hooks/queries/useClassesQuery';
import { TableSkeleton } from '@/components/skeletons/TableSkeleton';
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
    shift_id: string;
    class_id: string;
    classes: { name: string } | null;
    sections: { name: string } | null;
  };
}

export default function StudentAttendance() {
  const { activeYear } = useAcademicYear();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedShift, setSelectedShift] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Use cached queries for shifts and classes
  const { data: shifts = [] } = useShiftsQuery(activeYear?.id);
  const { data: classes = [] } = useClassesQuery();

  // Fetch attendance with React Query
  const { data: records = [], isLoading, isFetching } = useQuery({
    queryKey: ['student-attendance', activeYear?.id, selectedDate],
    queryFn: async () => {
      if (!activeYear) return [];

      const { data, error } = await supabase
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

      if (error) throw error;
      return data as AttendanceRecord[];
    },
    enabled: !!activeYear?.id && !!selectedDate,
    staleTime: 30 * 1000, // 30 seconds - attendance changes frequently
    placeholderData: (previousData) => previousData,
  });

  // Filter and calculate stats using useMemo for performance
  const { filteredRecords, stats } = useMemo(() => {
    let filtered = records;

    // Apply shift filter
    if (selectedShift !== 'all') {
      filtered = filtered.filter((r) => r.students?.shift_id === selectedShift);
    }

    // Apply class filter
    if (selectedClass !== 'all') {
      filtered = filtered.filter((r) => r.students?.class_id === selectedClass);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((record) =>
        record.students?.name.toLowerCase().includes(query) ||
        record.students?.name_bn?.toLowerCase().includes(query) ||
        record.students?.student_id_number?.toLowerCase().includes(query)
      );
    }

    // Calculate stats
    const present = filtered.filter((r) => r.status === 'present').length;
    const late = filtered.filter((r) => r.status === 'late').length;
    const absent = filtered.filter((r) => r.status === 'absent').length;

    return {
      filteredRecords: filtered,
      stats: { total: filtered.length, present, late, absent },
    };
  }, [records, selectedShift, selectedClass, searchQuery]);

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
      <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 ${isFetching ? 'opacity-70' : ''}`}>
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
      {isLoading ? (
        <TableSkeleton rows={10} columns={7} />
      ) : (
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

          {filteredRecords.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No attendance records</p>
              <p className="text-sm text-muted-foreground font-bengali">
                এই তারিখে কোন উপস্থিতি রেকর্ড নেই
              </p>
            </div>
          )}
        </div>
      )}
    </MainLayout>
  );
}
