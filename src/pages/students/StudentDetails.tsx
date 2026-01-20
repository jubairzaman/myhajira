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
  Edit
} from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useRequiredDocuments, useStudentDocuments, useUpsertStudentDocument } from '@/hooks/queries/useDocuments';
import { useStudentCustomFee } from '@/hooks/queries/useStudentCustomFee';

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

  const { data: requiredDocuments = [] } = useRequiredDocuments();
  const { data: studentDocuments = [], isLoading: docsLoading } = useStudentDocuments(id);
  const { data: customFee } = useStudentCustomFee(id);
  const upsertDocument = useUpsertStudentDocument();

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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info" className="gap-2">
              <User className="w-4 h-4" />
              <span className="font-bengali">তথ্য</span>
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

            {/* Financial Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5" />
                  <span className="font-bengali">আর্থিক তথ্য</span>
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
                    <div>
                      <p className="text-sm text-muted-foreground font-bengali">কার্যকর তারিখ</p>
                      <p className="font-medium">
                        {new Date(customFee.effective_from).toLocaleDateString('bn-BD')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground font-bengali">
                    কোন কাস্টম ফি নির্ধারিত নেই। শ্রেণী অনুযায়ী ফি প্রযোজ্য হবে।
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
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
