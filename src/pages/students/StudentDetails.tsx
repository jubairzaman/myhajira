import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  GraduationCap, 
  ArrowLeft, 
  Loader2, 
  User, 
  Phone, 
  CreditCard,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit,
  Receipt,
  BarChart3,
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useRequiredDocuments, useStudentDocuments, useUpsertStudentDocument } from '@/hooks/queries/useDocuments';
import { useStudentCustomFee } from '@/hooks/queries/useStudentCustomFee';
import { useStudentFeeRecords, type StudentFeeRecord } from '@/hooks/queries/useFeeCollection';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

interface StudentData {
  id: string;
  name: string;
  name_bn: string | null;
  student_id_number: string | null;
  guardian_mobile: string;
  blood_group: string | null;
  photo_url: string | null;
  admission_date: string | null;
  is_active: boolean;
  shift: { id: string; name: string; name_bn: string | null } | null;
  class: { id: string; name: string; name_bn: string | null } | null;
  section: { id: string; name: string; name_bn: string | null } | null;
  rfid_card: { card_number: string } | null;
}

export default function StudentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);

  const { activeYear } = useAcademicYear();
  const { data: requiredDocuments = [] } = useRequiredDocuments();
  const { data: studentDocuments = [], isLoading: docsLoading } = useStudentDocuments(id);
  const { data: customFee } = useStudentCustomFee(id);
  const { data: feeRecords = [] } = useStudentFeeRecords(id);
  const upsertDocument = useUpsertStudentDocument();

  // Attendance stats
  const [attendanceStats, setAttendanceStats] = useState<{
    present: number; late: number; absent: number; total: number;
  } | null>(null);

  // Fetch student data
  useEffect(() => {
    const fetchStudent = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('students')
          .select(`
            id, name, name_bn, student_id_number, guardian_mobile, blood_group, 
            photo_url, admission_date, is_active,
            shift:shifts(id, name, name_bn),
            class:classes(id, name, name_bn),
            section:sections(id, name, name_bn),
            rfid_card:rfid_cards_students(card_number)
          `)
          .eq('id', id)
          .single();

        if (error) throw error;

        // Transform data
        const transformed: StudentData = {
          ...data,
          shift: Array.isArray(data.shift) ? data.shift[0] : data.shift,
          class: Array.isArray(data.class) ? data.class[0] : data.class,
          section: Array.isArray(data.section) ? data.section[0] : data.section,
          rfid_card: Array.isArray(data.rfid_card) ? data.rfid_card[0] : data.rfid_card,
        };

        setStudent(transformed);
      } catch (error) {
        console.error('Error fetching student:', error);
        toast.error('শিক্ষার্থীর তথ্য লোড করা যায়নি');
        navigate('/students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id, navigate]);

  // Fetch attendance stats
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!id || !activeYear?.id) return;
      const { data } = await supabase
        .from('student_attendance')
        .select('status')
        .eq('student_id', id)
        .eq('academic_year_id', activeYear.id);
      if (data) {
        const present = data.filter(r => r.status === 'present').length;
        const late = data.filter(r => r.status === 'late').length;
        const absent = data.filter(r => r.status === 'absent').length;
        setAttendanceStats({ present, late, absent, total: data.length });
      }
    };
    fetchAttendance();
  }, [id, activeYear?.id]);

  // Get document submission status
  const getDocumentStatus = (docId: string) => {
    return studentDocuments.find(sd => sd.document_id === docId);
  };

  // Handle document toggle
  const handleDocumentToggle = async (docId: string, isSubmitted: boolean) => {
    if (!id) return;
    await upsertDocument.mutateAsync({
      studentId: id,
      documentId: docId,
      isSubmitted,
    });
  };

  // Count document stats
  const docStats = {
    total: requiredDocuments.length,
    mandatory: requiredDocuments.filter(d => d.is_mandatory).length,
    submitted: studentDocuments.filter(sd => sd.is_submitted).length,
    mandatorySubmitted: requiredDocuments.filter(d => 
      d.is_mandatory && studentDocuments.find(sd => sd.document_id === d.id && sd.is_submitted)
    ).length,
  };

  if (loading) {
    return (
      <MainLayout title="Student Details" titleBn="শিক্ষার্থীর বিস্তারিত">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  if (!student) {
    return (
      <MainLayout title="Student Details" titleBn="শিক্ষার্থীর বিস্তারিত">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p>শিক্ষার্থী পাওয়া যায়নি</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Student Details" titleBn="শিক্ষার্থীর বিস্তারিত">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link to="/students">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <img
                src={student.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`}
                alt={student.name}
                className="w-16 h-16 rounded-full bg-muted border-2 border-primary/20"
              />
              <div>
                <h2 className="text-xl font-semibold">{student.name}</h2>
                {student.name_bn && (
                  <p className="text-muted-foreground font-bengali">{student.name_bn}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={student.is_active ? 'default' : 'secondary'}>
                    {student.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                  </Badge>
                  {student.student_id_number && (
                    <Badge variant="outline">ID: {student.student_id_number}</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          <Link to={`/students/${id}/edit`}>
            <Button variant="outline" className="gap-2">
              <Edit className="w-4 h-4" />
              সম্পাদনা
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info" className="gap-2">
              <User className="w-4 h-4" />
              <span className="font-bengali">তথ্য</span>
            </TabsTrigger>
            <TabsTrigger value="fees" className="gap-2">
              <Receipt className="w-4 h-4" />
              <span className="font-bengali">ফি ও উপস্থিতি</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="font-bengali">ডকুমেন্ট</span>
            </TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-6">
            {/* Academic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="w-5 h-5" />
                  <span className="font-bengali">শিক্ষা সংক্রান্ত তথ্য</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground font-bengali">শিফট</p>
                  <p className="font-medium">{student.shift?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-bengali">শ্রেণী</p>
                  <p className="font-medium">{student.class?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-bengali">শাখা</p>
                  <p className="font-medium">{student.section?.name || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-bengali">ভর্তির তারিখ</p>
                  <p className="font-medium">
                    {student.admission_date 
                      ? new Date(student.admission_date).toLocaleDateString('bn-BD')
                      : '-'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Phone className="w-5 h-5" />
                  <span className="font-bengali">যোগাযোগ ও অন্যান্য</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground font-bengali">অভিভাবকের মোবাইল</p>
                  <p className="font-medium font-mono">{student.guardian_mobile}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-bengali">রক্তের গ্রুপ</p>
                  <p className="font-medium">{student.blood_group || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-bengali">RFID কার্ড</p>
                  {student.rfid_card?.card_number ? (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-success" />
                      <span className="font-mono text-sm text-success">
                        {student.rfid_card.card_number}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">নিবন্ধিত নয়</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fees & Attendance Tab */}
          <TabsContent value="fees" className="space-y-6">
            {/* Attendance Stats */}
            {attendanceStats && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BarChart3 className="w-5 h-5" />
                    <span className="font-bengali">উপস্থিতি তথ্য</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold">{attendanceStats.total}</p>
                      <p className="text-sm text-muted-foreground font-bengali">মোট দিন</p>
                    </div>
                    <div className="text-center p-3 bg-success/10 rounded-lg">
                      <p className="text-2xl font-bold text-success">{attendanceStats.present}</p>
                      <p className="text-sm text-muted-foreground font-bengali">উপস্থিত</p>
                    </div>
                    <div className="text-center p-3 bg-warning/10 rounded-lg">
                      <p className="text-2xl font-bold text-warning">{attendanceStats.late}</p>
                      <p className="text-sm text-muted-foreground font-bengali">বিলম্ব</p>
                    </div>
                    <div className="text-center p-3 bg-destructive/10 rounded-lg">
                      <p className="text-2xl font-bold text-destructive">{attendanceStats.absent}</p>
                      <p className="text-sm text-muted-foreground font-bengali">অনুপস্থিত</p>
                    </div>
                    {attendanceStats.total > 0 && (
                      <div className="text-center p-3 bg-primary/10 rounded-lg">
                        <p className="text-2xl font-bold text-primary">
                          {(((attendanceStats.present + attendanceStats.late) / attendanceStats.total) * 100).toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground font-bengali">উপস্থিতি হার</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fee Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Receipt className="w-5 h-5" />
                  <span className="font-bengali">ফি সারসংক্ষেপ</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const totalDue = feeRecords.reduce((s, r) => s + Number(r.amount_due) + Number(r.late_fine), 0);
                  const totalPaid = feeRecords.reduce((s, r) => s + Number(r.amount_paid), 0);
                  const totalRemaining = totalDue - totalPaid;
                  const paidCount = feeRecords.filter(r => r.status === 'paid').length;
                  const unpaidCount = feeRecords.filter(r => r.status === 'unpaid').length;
                  const partialCount = feeRecords.filter(r => r.status === 'partial').length;

                  return (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <p className="text-2xl font-bold">৳{totalDue}</p>
                        <p className="text-sm text-muted-foreground font-bengali">মোট বকেয়া</p>
                      </div>
                      <div className="text-center p-3 bg-success/10 rounded-lg">
                        <p className="text-2xl font-bold text-success">৳{totalPaid}</p>
                        <p className="text-sm text-muted-foreground font-bengali">মোট পরিশোধ</p>
                      </div>
                      <div className="text-center p-3 bg-destructive/10 rounded-lg">
                        <p className="text-2xl font-bold text-destructive">৳{totalRemaining}</p>
                        <p className="text-sm text-muted-foreground font-bengali">অবশিষ্ট</p>
                      </div>
                      <div className="text-center p-3 bg-success/10 rounded-lg">
                        <p className="text-2xl font-bold text-success">{paidCount}</p>
                        <p className="text-sm text-muted-foreground font-bengali">পরিশোধিত</p>
                      </div>
                      <div className="text-center p-3 bg-warning/10 rounded-lg">
                        <p className="text-2xl font-bold text-warning">{unpaidCount + partialCount}</p>
                        <p className="text-sm text-muted-foreground font-bengali">অপরিশোধিত</p>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Fee Records Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bengali">
                  <FileText className="w-5 h-5" />
                  ফি রেকর্ড তালিকা
                </CardTitle>
              </CardHeader>
              <CardContent>
                {feeRecords.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground font-bengali">
                    কোন ফি রেকর্ড নেই
                  </p>
                ) : (
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="text-left p-2 font-bengali">ধরন</th>
                          <th className="text-left p-2 font-bengali">বিবরণ</th>
                          <th className="text-right p-2 font-bengali">বকেয়া</th>
                          <th className="text-right p-2 font-bengali">জরিমানা</th>
                          <th className="text-right p-2 font-bengali">পরিশোধ</th>
                          <th className="text-center p-2 font-bengali">স্ট্যাটাস</th>
                          <th className="text-center p-2 font-bengali">তারিখ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeRecords.map(record => {
                          const feeTypeLabels: Record<string, string> = {
                            monthly: 'মাসিক',
                            admission: 'ভর্তি',
                            session: 'সেশন',
                            exam: 'পরীক্ষা',
                          };
                          let description = feeTypeLabels[record.fee_type] || record.fee_type;
                          if (record.fee_type === 'monthly' && record.fee_month) {
                            try {
                              description = format(new Date(record.fee_month), 'MMMM yyyy', { locale: bn });
                            } catch { /* keep default */ }
                          }
                          if (record.fee_type === 'exam' && record.exam) {
                            description = record.exam.name_bn || record.exam.name;
                          }

                          return (
                            <tr key={record.id} className="border-b">
                              <td className="p-2 font-bengali">{feeTypeLabels[record.fee_type] || record.fee_type}</td>
                              <td className="p-2">{description}</td>
                              <td className="p-2 text-right font-mono">৳{record.amount_due}</td>
                              <td className="p-2 text-right font-mono">৳{record.late_fine}</td>
                              <td className="p-2 text-right font-mono">৳{record.amount_paid}</td>
                              <td className="p-2 text-center">
                                <Badge variant={
                                  record.status === 'paid' ? 'default' :
                                  record.status === 'partial' ? 'secondary' : 'destructive'
                                } className="text-xs">
                                  {record.status === 'paid' ? 'পরিশোধিত' :
                                   record.status === 'partial' ? 'আংশিক' : 'অপরিশোধিত'}
                                </Badge>
                              </td>
                              <td className="p-2 text-center text-muted-foreground">
                                {record.payment_date
                                  ? format(new Date(record.payment_date), 'dd/MM/yyyy')
                                  : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Custom Fee Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5" />
                  <span className="font-bengali">কাস্টম ফি তথ্য</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {customFee?.custom_monthly_fee ? (
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground font-bengali">কাস্টম মাসিক ফি</p>
                      <p className="text-xl font-bold text-primary">৳{customFee.custom_monthly_fee}</p>
                    </div>
                    {customFee.custom_admission_fee && (
                      <div>
                        <p className="text-sm text-muted-foreground font-bengali">কাস্টম ভর্তি ফি</p>
                        <p className="text-xl font-bold text-primary">৳{customFee.custom_admission_fee}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground font-bengali">
                    কোন কাস্টম ফি নির্ধারিত নেই। শ্রেণী অনুযায়ী ফি প্রযোজ্য হবে।
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            {/* Document Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold">{docStats.total}</p>
                  <p className="text-sm text-muted-foreground font-bengali">মোট ডকুমেন্ট</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold text-destructive">{docStats.mandatory}</p>
                  <p className="text-sm text-muted-foreground font-bengali">বাধ্যতামূলক</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold text-success">{docStats.submitted}</p>
                  <p className="text-sm text-muted-foreground font-bengali">জমা দেওয়া</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-2xl font-bold text-warning">
                    {docStats.mandatory - docStats.mandatorySubmitted}
                  </p>
                  <p className="text-sm text-muted-foreground font-bengali">বাধ্যতামূলক বাকি</p>
                </CardContent>
              </Card>
            </div>

            {/* Document Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-bengali">
                  <FileText className="w-5 h-5" />
                  ডকুমেন্ট চেকলিস্ট
                </CardTitle>
              </CardHeader>
              <CardContent>
                {docsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : requiredDocuments.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground font-bengali">
                    কোন ডকুমেন্ট প্রয়োজনীয় হিসেবে নির্ধারিত নেই
                  </p>
                ) : (
                  <div className="space-y-3">
                    {requiredDocuments.map((doc) => {
                      const submission = getDocumentStatus(doc.id);
                      const isSubmitted = submission?.is_submitted || false;

                      return (
                        <div
                          key={doc.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            isSubmitted 
                              ? 'bg-success/5 border-success/20' 
                              : doc.is_mandatory 
                                ? 'bg-destructive/5 border-destructive/20'
                                : 'bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={isSubmitted}
                              onCheckedChange={(checked) => 
                                handleDocumentToggle(doc.id, checked as boolean)
                              }
                              disabled={upsertDocument.isPending}
                            />
                            <div>
                              <p className="font-medium">
                                {doc.name}
                                {doc.name_bn && (
                                  <span className="text-muted-foreground font-bengali ml-2">
                                    ({doc.name_bn})
                                  </span>
                                )}
                              </p>
                              {doc.is_mandatory && (
                                <Badge variant="destructive" className="text-xs mt-1">
                                  বাধ্যতামূলক
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {isSubmitted ? (
                              <>
                                <CheckCircle2 className="w-5 h-5 text-success" />
                                <span className="text-sm text-success font-bengali">জমা দেওয়া হয়েছে</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="w-5 h-5 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground font-bengali">বাকি আছে</span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
