import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { FileText, Download, Users, GraduationCap, Clock, BarChart3, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAcademicYear } from '@/hooks/useAcademicYear';

interface AttendanceStats {
  total: number;
  present: number;
  late: number;
  absent: number;
}

interface AttendanceRecord {
  id: string;
  name: string;
  class_name: string | null;
  section_name: string | null;
  punch_time: string;
  status: string;
}

export default function Reports() {
  const { activeYear } = useAcademicYear();
  const [reportType, setReportType] = useState('student-daily');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [selectedClass, setSelectedClass] = useState('all');
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<AttendanceStats>({ total: 0, present: 0, late: 0, absent: 0 });
  const [reportData, setReportData] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (activeYear) {
      fetchStats();
    }
  }, [activeYear, dateRange]);

  const fetchClasses = async () => {
    const { data } = await supabase.from('classes').select('id, name').eq('is_active', true).order('grade_order');
    setClasses(data || []);
  };

  const fetchStats = async () => {
    if (!activeYear) return;

    try {
      // Fetch total students
      const { count: totalStudents } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('academic_year_id', activeYear.id)
        .eq('is_active', true);

      // Fetch today's attendance
      const { data: attendance } = await supabase
        .from('student_attendance')
        .select('status')
        .eq('academic_year_id', activeYear.id)
        .eq('attendance_date', dateRange.start);

      const present = attendance?.filter(a => a.status === 'present').length || 0;
      const late = attendance?.filter(a => a.status === 'late').length || 0;
      const attendedCount = present + late;
      const absent = (totalStudents || 0) - attendedCount;

      setStats({
        total: totalStudents || 0,
        present,
        late,
        absent: absent > 0 ? absent : 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const generateReport = async () => {
    if (!activeYear) {
      toast.error('No active academic year');
      return;
    }

    setLoading(true);
    try {
      let query = supabase
        .from('student_attendance')
        .select(`
          id, punch_time, status, attendance_date,
          student:students(
            id, name, name_bn,
            class:classes(id, name),
            section:sections(name)
          )
        `)
        .eq('academic_year_id', activeYear.id)
        .gte('attendance_date', dateRange.start)
        .lte('attendance_date', dateRange.end)
        .order('punch_time', { ascending: false });

      // Apply status filter based on report type
      if (reportType === 'student-absent') {
        query = query.eq('status', 'absent');
      } else if (reportType === 'student-late') {
        query = query.eq('status', 'late');
      }

      const { data, error } = await query.limit(500);

      if (error) throw error;

      // Filter by class if selected
      let filteredData = data || [];
      if (selectedClass !== 'all') {
        filteredData = filteredData.filter((record: any) => 
          record.student?.class?.id === selectedClass
        );
      }

      const records: AttendanceRecord[] = filteredData.map((record: any) => ({
        id: record.id,
        name: record.student?.name || 'Unknown',
        class_name: record.student?.class?.name,
        section_name: record.student?.section?.name,
        punch_time: record.punch_time,
        status: record.status,
      }));

      setReportData(records);
      toast.success(`Found ${records.length} records`);
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (reportData.length === 0) {
      toast.error('No data to download. Generate a report first.');
      return;
    }

    const headers = ['Name', 'Class', 'Section', 'Time', 'Status', 'Date'];
    const rows = reportData.map(record => [
      record.name,
      record.class_name || '',
      record.section_name || '',
      new Date(record.punch_time).toLocaleTimeString(),
      record.status,
      new Date(record.punch_time).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${dateRange.start}-to-${dateRange.end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  };

  const attendanceRate = stats.total > 0 
    ? (((stats.present + stats.late) / stats.total) * 100).toFixed(1) 
    : '0';

  return (
    <MainLayout title="Reports" titleBn="রিপোর্ট">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Reports & Analytics</h2>
          <p className="text-sm text-muted-foreground font-bengali">রিপোর্ট ও বিশ্লেষণ</p>
        </div>
      </div>

      <Tabs defaultValue="students" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 gap-2">
          <TabsTrigger value="students" className="gap-2">
            <GraduationCap className="w-4 h-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="teachers" className="gap-2">
            <Users className="w-4 h-4" />
            Teachers
          </TabsTrigger>
          <TabsTrigger value="class" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Class Reports
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Clock className="w-4 h-4" />
            System
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students">
          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold mb-4">Student Attendance Reports</h3>
            <p className="text-sm text-muted-foreground mb-6 font-bengali">শিক্ষার্থী উপস্থিতি রিপোর্ট</p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student-daily">Daily Attendance</SelectItem>
                    <SelectItem value="student-monthly">Monthly Summary</SelectItem>
                    <SelectItem value="student-absent">Absent Report</SelectItem>
                    <SelectItem value="student-late">Late Arrivals</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Class Filter</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue />
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
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="hero" className="gap-2" onClick={generateReport} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                Generate Report
              </Button>
              <Button variant="outline" className="gap-2" onClick={downloadCSV}>
                <Download className="w-4 h-4" />
                Download CSV
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="card-elevated p-4 text-center">
              <p className="text-3xl font-bold text-success">{attendanceRate}%</p>
              <p className="text-sm text-muted-foreground font-bengali">মোট উপস্থিতি হার</p>
            </div>
            <div className="card-elevated p-4 text-center">
              <p className="text-3xl font-bold text-warning">{stats.late}</p>
              <p className="text-sm text-muted-foreground font-bengali">বিলম্বে আসা</p>
            </div>
            <div className="card-elevated p-4 text-center">
              <p className="text-3xl font-bold text-destructive">{stats.absent}</p>
              <p className="text-sm text-muted-foreground font-bengali">অনুপস্থিত</p>
            </div>
            <div className="card-elevated p-4 text-center">
              <p className="text-3xl font-bold text-primary">{stats.present + stats.late}</p>
              <p className="text-sm text-muted-foreground font-bengali">উপস্থিত</p>
            </div>
          </div>

          {/* Report Data Table */}
          {reportData.length > 0 && (
            <div className="card-elevated mt-6 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportData.slice(0, 50).map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.name}</TableCell>
                      <TableCell>{record.class_name || '-'}</TableCell>
                      <TableCell>{record.section_name || '-'}</TableCell>
                      <TableCell>{new Date(record.punch_time).toLocaleTimeString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          record.status === 'present' ? 'bg-success/20 text-success' :
                          record.status === 'late' ? 'bg-warning/20 text-warning' :
                          'bg-destructive/20 text-destructive'
                        }`}>
                          {record.status}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {reportData.length > 50 && (
                <p className="p-4 text-sm text-muted-foreground text-center">
                  Showing 50 of {reportData.length} records. Download CSV for full data.
                </p>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="teachers">
          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold mb-4">Teacher Attendance Reports</h3>
            <p className="text-sm text-muted-foreground mb-6 font-bengali">শিক্ষক উপস্থিতি রিপোর্ট</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select defaultValue="teacher-daily">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="teacher-daily">Daily Report</SelectItem>
                    <SelectItem value="teacher-monthly">Monthly Summary</SelectItem>
                    <SelectItem value="teacher-late">Late Minutes Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" defaultValue={dateRange.start} />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" defaultValue={dateRange.end} />
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="hero" className="gap-2" onClick={() => toast.info('Teacher reports coming soon')}>
                <FileText className="w-4 h-4" />
                Generate Report
              </Button>
              <Button variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Download CSV
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="class">
          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold mb-4">Class-wise Reports</h3>
            <p className="text-sm text-muted-foreground mb-6 font-bengali">শ্রেণী ভিত্তিক রিপোর্ট</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select defaultValue="class-comparison">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="class-comparison">Class Comparison</SelectItem>
                    <SelectItem value="shift-performance">Shift Performance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Month</Label>
                <Input type="month" />
              </div>

              <div className="space-y-2">
                <Label>Class</Label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue />
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
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="hero" className="gap-2" onClick={() => toast.info('Class reports coming soon')}>
                <FileText className="w-4 h-4" />
                Generate Report
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="system">
          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold mb-4">System Reports</h3>
            <p className="text-sm text-muted-foreground mb-6 font-bengali">সিস্টেম রিপোর্ট</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label>Report Type</Label>
                <Select defaultValue="device-performance">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="device-performance">Device Performance</SelectItem>
                    <SelectItem value="sms-delivery">SMS Delivery Report</SelectItem>
                    <SelectItem value="audit-log">Audit Logs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <Input type="date" defaultValue={dateRange.start} />
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="hero" className="gap-2" onClick={() => toast.info('System reports coming soon')}>
                <FileText className="w-4 h-4" />
                Generate Report
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
