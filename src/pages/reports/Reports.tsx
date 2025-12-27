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
import { FileText, Download, Calendar, Users, GraduationCap, Clock, BarChart3 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function Reports() {
  const [reportType, setReportType] = useState('student-daily');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [selectedClass, setSelectedClass] = useState('all');
  const [classes, setClasses] = useState<any[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      const { data } = await supabase.from('classes').select('id, name').order('grade_order');
      setClasses(data || []);
    };
    fetchClasses();
  }, []);

  const generateReport = () => {
    toast.success('Report generated! Download will start shortly.');
    // In production, this would generate and download the report
  };

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
                    <SelectItem value="student-yearly">Yearly Report</SelectItem>
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
              <Button variant="hero" className="gap-2" onClick={generateReport}>
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <Button variant="outline" className="gap-2" onClick={generateReport}>
                <Download className="w-4 h-4" />
                Download Excel
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="card-elevated p-4 text-center">
              <p className="text-3xl font-bold text-success">92.5%</p>
              <p className="text-sm text-muted-foreground font-bengali">মোট উপস্থিতি হার</p>
            </div>
            <div className="card-elevated p-4 text-center">
              <p className="text-3xl font-bold text-warning">45</p>
              <p className="text-sm text-muted-foreground font-bengali">আজ বিলম্বে আসা</p>
            </div>
            <div className="card-elevated p-4 text-center">
              <p className="text-3xl font-bold text-destructive">23</p>
              <p className="text-sm text-muted-foreground font-bengali">আজ অনুপস্থিত</p>
            </div>
            <div className="card-elevated p-4 text-center">
              <p className="text-3xl font-bold text-primary">1,142</p>
              <p className="text-sm text-muted-foreground font-bengali">আজ উপস্থিত</p>
            </div>
          </div>
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
                    <SelectItem value="teacher-perfect">Perfect Attendance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" />
              </div>

              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" />
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="hero" className="gap-2" onClick={generateReport}>
                <Download className="w-4 h-4" />
                Download PDF
              </Button>
              <Button variant="outline" className="gap-2" onClick={generateReport}>
                <Download className="w-4 h-4" />
                Download Excel
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
                    <SelectItem value="panel-analysis">Panel Analysis</SelectItem>
                    <SelectItem value="gender-analysis">Boys vs Girls</SelectItem>
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
              <Button variant="hero" className="gap-2" onClick={generateReport}>
                <Download className="w-4 h-4" />
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
                    <SelectItem value="manual-edits">Manual Edit History</SelectItem>
                    <SelectItem value="audit-log">Audit Logs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date Range</Label>
                <Input type="date" />
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="hero" className="gap-2" onClick={generateReport}>
                <Download className="w-4 h-4" />
                Generate Report
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
