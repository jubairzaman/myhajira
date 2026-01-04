/**
 * Reports Page - Attendance Reports System
 * Developed by Jubair Zaman
 * 
 * Three Real-Time Reports:
 * 1. Monthly Student Attendance Report (A4 Portrait)
 * 2. Monthly Class Attendance Register (A3 Landscape)
 * 3. Monthly Teacher Attendance Report (A4 Portrait)
 */

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { FileText, Printer, Users, GraduationCap, UserCheck, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { StudentMonthlyReport } from './components/StudentMonthlyReport';
import { ClassMonthlyReport } from './components/ClassMonthlyReport';
import { TeacherMonthlyReport } from './components/TeacherMonthlyReport';

interface AcademicYear {
  id: string;
  name: string;
}

interface ClassData {
  id: string;
  name: string;
  name_bn: string | null;
}

interface SectionData {
  id: string;
  name: string;
  name_bn: string | null;
  class_id: string;
}

interface StudentData {
  id: string;
  name: string;
  name_bn: string | null;
  student_id_number: string | null;
  class_id: string;
  section_id: string;
}

interface TeacherData {
  id: string;
  name: string;
  name_bn: string | null;
  designation: string;
}

export default function Reports() {
  const { activeYear } = useAcademicYear();
  const reportRef = useRef<HTMLDivElement>(null);

  // Common State
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));

  // Student Report State
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [showStudentReport, setShowStudentReport] = useState(false);

  // Class Report State
  const [classReportClass, setClassReportClass] = useState<string>('');
  const [classReportSection, setClassReportSection] = useState<string>('');
  const [classReportSections, setClassReportSections] = useState<SectionData[]>([]);
  const [showClassReport, setShowClassReport] = useState(false);

  // Teacher Report State
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [showTeacherReport, setShowTeacherReport] = useState(false);

  // Fetch academic years on mount
  useEffect(() => {
    const fetchAcademicYears = async () => {
      const { data } = await supabase
        .from('academic_years')
        .select('id, name')
        .eq('is_archived', false)
        .order('start_date', { ascending: false });

      if (data) {
        setAcademicYears(data);
        if (activeYear) {
          setSelectedYear(activeYear.id);
        } else if (data.length > 0) {
          setSelectedYear(data[0].id);
        }
      }
    };
    fetchAcademicYears();
  }, [activeYear]);

  // Fetch classes when academic year changes
  useEffect(() => {
    if (!selectedYear) return;

    const fetchClasses = async () => {
      const { data } = await supabase
        .from('classes')
        .select('id, name, name_bn')
        .eq('is_active', true)
        .order('grade_order');

      if (data) {
        setClasses(data);
      }
    };
    fetchClasses();

    const fetchTeachers = async () => {
      const { data } = await supabase
        .from('teachers')
        .select('id, name, name_bn, designation')
        .eq('academic_year_id', selectedYear)
        .eq('is_active', true)
        .order('name');

      if (data) {
        setTeachers(data);
      }
    };
    fetchTeachers();
  }, [selectedYear]);

  // Fetch sections when class changes (for student report)
  useEffect(() => {
    if (!selectedClass) {
      setSections([]);
      setStudents([]);
      return;
    }

    const fetchSections = async () => {
      const { data } = await supabase
        .from('sections')
        .select('id, name, name_bn, class_id')
        .eq('class_id', selectedClass)
        .eq('is_active', true)
        .order('name');

      if (data) {
        setSections(data);
      }
    };
    fetchSections();
  }, [selectedClass]);

  // Fetch sections for class report
  useEffect(() => {
    if (!classReportClass) {
      setClassReportSections([]);
      return;
    }

    const fetchSections = async () => {
      const { data } = await supabase
        .from('sections')
        .select('id, name, name_bn, class_id')
        .eq('class_id', classReportClass)
        .eq('is_active', true)
        .order('name');

      if (data) {
        setClassReportSections(data);
      }
    };
    fetchSections();
  }, [classReportClass]);

  // Fetch students when section changes
  useEffect(() => {
    if (!selectedSection || !selectedYear) {
      setStudents([]);
      return;
    }

    const fetchStudents = async () => {
      const { data } = await supabase
        .from('students')
        .select('id, name, name_bn, student_id_number, class_id, section_id')
        .eq('section_id', selectedSection)
        .eq('academic_year_id', selectedYear)
        .eq('is_active', true)
        .order('student_id_number');

      if (data) {
        setStudents(data);
      }
    };
    fetchStudents();
  }, [selectedSection, selectedYear]);

  const handlePrint = () => {
    window.print();
  };

  const getMonthDate = () => {
    const [year, month] = selectedMonth.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, 1);
  };

  const getSelectedYearName = () => {
    return academicYears.find(y => y.id === selectedYear)?.name || '';
  };

  const getClassName = (classId: string) => {
    const cls = classes.find(c => c.id === classId);
    return cls?.name_bn || cls?.name || '';
  };

  const getSectionName = (sectionId: string, sectionsList: SectionData[]) => {
    const sec = sectionsList.find(s => s.id === sectionId);
    return sec?.name_bn || sec?.name || '';
  };

  const resetStudentReport = () => {
    setShowStudentReport(false);
    setSelectedStudent('');
  };

  const resetClassReport = () => {
    setShowClassReport(false);
  };

  const resetTeacherReport = () => {
    setShowTeacherReport(false);
    setSelectedTeacher('');
  };

  return (
    <MainLayout title="রিপোর্ট" titleBn="Reports">
      <div className="space-y-6">
        {/* Header - Hide on print */}
        <div className="no-print flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <FileText className="w-8 h-8" />
              রিপোর্ট ও বিশ্লেষণ
            </h1>
            <p className="text-muted-foreground mt-1">
              শিক্ষার্থী ও শিক্ষকদের উপস্থিতি রিপোর্ট তৈরি করুন
            </p>
          </div>
        </div>

        {/* Filters Card - Hide on print */}
        <Card className="no-print">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              রিপোর্ট ফিল্টার
            </CardTitle>
            <CardDescription>
              রিপোর্ট তৈরির জন্য প্রয়োজনীয় তথ্য নির্বাচন করুন
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Common Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label>শিক্ষাবর্ষ</Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="শিক্ষাবর্ষ নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {academicYears.map(year => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>মাস</Label>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            {/* Report Type Tabs */}
            <Tabs defaultValue="student" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="student" className="flex items-center gap-2" onClick={resetStudentReport}>
                  <GraduationCap className="w-4 h-4" />
                  শিক্ষার্থী মাসিক
                </TabsTrigger>
                <TabsTrigger value="class" className="flex items-center gap-2" onClick={resetClassReport}>
                  <Users className="w-4 h-4" />
                  শ্রেণী রেজিস্টার
                </TabsTrigger>
                <TabsTrigger value="teacher" className="flex items-center gap-2" onClick={resetTeacherReport}>
                  <UserCheck className="w-4 h-4" />
                  শিক্ষক মাসিক
                </TabsTrigger>
              </TabsList>

              {/* Student Monthly Report Tab */}
              <TabsContent value="student" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>শ্রেণী</Label>
                    <Select value={selectedClass} onValueChange={(v) => {
                      setSelectedClass(v);
                      setSelectedSection('');
                      setSelectedStudent('');
                      setShowStudentReport(false);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="শ্রেণী নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map(cls => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name_bn || cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>শাখা</Label>
                    <Select value={selectedSection} onValueChange={(v) => {
                      setSelectedSection(v);
                      setSelectedStudent('');
                      setShowStudentReport(false);
                    }} disabled={!selectedClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="শাখা নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map(sec => (
                          <SelectItem key={sec.id} value={sec.id}>
                            {sec.name_bn || sec.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>শিক্ষার্থী</Label>
                    <Select value={selectedStudent} onValueChange={(v) => {
                      setSelectedStudent(v);
                      setShowStudentReport(false);
                    }} disabled={!selectedSection}>
                      <SelectTrigger>
                        <SelectValue placeholder="শিক্ষার্থী নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {students.map(student => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.student_id_number ? `${student.student_id_number} - ` : ''}
                            {student.name_bn || student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowStudentReport(true)}
                    disabled={!selectedStudent || !selectedYear}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    রিপোর্ট তৈরি করুন
                  </Button>
                  {showStudentReport && (
                    <Button variant="outline" onClick={handlePrint}>
                      <Printer className="w-4 h-4 mr-2" />
                      প্রিন্ট / PDF
                    </Button>
                  )}
                </div>
              </TabsContent>

              {/* Class Monthly Register Tab */}
              <TabsContent value="class" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>শ্রেণী</Label>
                    <Select value={classReportClass} onValueChange={(v) => {
                      setClassReportClass(v);
                      setClassReportSection('');
                      setShowClassReport(false);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="শ্রেণী নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map(cls => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name_bn || cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>শাখা</Label>
                    <Select value={classReportSection} onValueChange={(v) => {
                      setClassReportSection(v);
                      setShowClassReport(false);
                    }} disabled={!classReportClass}>
                      <SelectTrigger>
                        <SelectValue placeholder="শাখা নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {classReportSections.map(sec => (
                          <SelectItem key={sec.id} value={sec.id}>
                            {sec.name_bn || sec.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowClassReport(true)}
                    disabled={!classReportClass || !classReportSection || !selectedYear}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    রিপোর্ট তৈরি করুন
                  </Button>
                  {showClassReport && (
                    <Button variant="outline" onClick={handlePrint}>
                      <Printer className="w-4 h-4 mr-2" />
                      প্রিন্ট / PDF (A3)
                    </Button>
                  )}
                </div>
              </TabsContent>

              {/* Teacher Monthly Report Tab */}
              <TabsContent value="teacher" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>শিক্ষক</Label>
                    <Select value={selectedTeacher} onValueChange={(v) => {
                      setSelectedTeacher(v);
                      setShowTeacherReport(false);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="শিক্ষক নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map(teacher => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.name_bn || teacher.name} - {teacher.designation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowTeacherReport(true)}
                    disabled={!selectedTeacher || !selectedYear}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    রিপোর্ট তৈরি করুন
                  </Button>
                  {showTeacherReport && (
                    <Button variant="outline" onClick={handlePrint}>
                      <Printer className="w-4 h-4 mr-2" />
                      প্রিন্ট / PDF
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Report Display Area */}
        <div ref={reportRef} className="print-area">
          {showStudentReport && selectedStudent && (
            <Card className="print:shadow-none print:border-none">
              <CardContent className="p-0">
                <StudentMonthlyReport
                  studentId={selectedStudent}
                  month={getMonthDate()}
                  academicYearId={selectedYear}
                  academicYearName={getSelectedYearName()}
                />
              </CardContent>
            </Card>
          )}

          {showClassReport && classReportClass && classReportSection && (
            <Card className="print:shadow-none print:border-none class-register-card">
              <CardContent className="p-0">
                <ClassMonthlyReport
                  classId={classReportClass}
                  sectionId={classReportSection}
                  month={getMonthDate()}
                  academicYearId={selectedYear}
                  academicYearName={getSelectedYearName()}
                  className={getClassName(classReportClass)}
                  sectionName={getSectionName(classReportSection, classReportSections)}
                />
              </CardContent>
            </Card>
          )}

          {showTeacherReport && selectedTeacher && (
            <Card className="print:shadow-none print:border-none">
              <CardContent className="p-0">
                <TeacherMonthlyReport
                  teacherId={selectedTeacher}
                  month={getMonthDate()}
                  academicYearId={selectedYear}
                  academicYearName={getSelectedYearName()}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
