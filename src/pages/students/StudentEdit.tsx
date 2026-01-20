import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PhotoCapture } from '@/components/forms/PhotoCapture';
import { RfidEnroll } from '@/components/forms/RfidEnroll';
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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  GraduationCap, 
  Save, 
  ArrowLeft, 
  Loader2, 
  Plus, 
  Wallet, 
  Receipt, 
  CreditCard, 
  AlertCircle,
  User,
  CheckCircle2,
  XCircle,
  Settings2
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useStudentFeeRecords, useCreateFeeRecord, useCollectFee, StudentFeeRecord } from '@/hooks/queries/useFeeCollection';
import { useStudentCustomFee, useUpsertStudentCustomFee } from '@/hooks/queries/useStudentCustomFee';

interface Shift {
  id: string;
  name: string;
  name_bn: string | null;
}

interface Class {
  id: string;
  name: string;
  name_bn: string | null;
  shift_id: string | null;
}

interface Section {
  id: string;
  name: string;
  name_bn: string | null;
  class_id: string;
}

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const bengaliMonths = [
  { value: '01', label: 'জানুয়ারি' },
  { value: '02', label: 'ফেব্রুয়ারি' },
  { value: '03', label: 'মার্চ' },
  { value: '04', label: 'এপ্রিল' },
  { value: '05', label: 'মে' },
  { value: '06', label: 'জুন' },
  { value: '07', label: 'জুলাই' },
  { value: '08', label: 'আগস্ট' },
  { value: '09', label: 'সেপ্টেম্বর' },
  { value: '10', label: 'অক্টোবর' },
  { value: '11', label: 'নভেম্বর' },
  { value: '12', label: 'ডিসেম্বর' },
];

const feeTypeLabels: Record<string, string> = {
  admission: 'ভর্তি ফি',
  session: 'সেশন চার্জ',
  monthly: 'মাসিক ফি',
  exam: 'পরীক্ষা ফি',
};

const statusBadgeVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  paid: 'default',
  partial: 'secondary',
  unpaid: 'destructive',
};

export default function StudentEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activeYear } = useAcademicYear();
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  const [exams, setExams] = useState<{ id: string; name: string; name_bn: string | null; exam_fee_amount: number }[]>([]);
  const [classFee, setClassFee] = useState<{ amount: number; admission_fee: number; session_charge: number } | null>(null);

  // Fee dialogs state
  const [showAddFeeDialog, setShowAddFeeDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedFeeRecord, setSelectedFeeRecord] = useState<StudentFeeRecord | null>(null);
  const [newFeeType, setNewFeeType] = useState<'monthly' | 'admission' | 'session' | 'exam'>('monthly');
  const [newFeeMonth, setNewFeeMonth] = useState('');
  const [newFeeYear, setNewFeeYear] = useState(new Date().getFullYear().toString());
  const [newFeeAmount, setNewFeeAmount] = useState('');
  const [newFeeExamId, setNewFeeExamId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [customFeeAmount, setCustomFeeAmount] = useState('');
  const [customFeeEffectiveFrom, setCustomFeeEffectiveFrom] = useState('');

  // Fee hooks
  const { data: feeRecords = [], isLoading: feeLoading } = useStudentFeeRecords(id);
  const createFeeRecord = useCreateFeeRecord();
  const collectFee = useCollectFee();
  const { data: studentCustomFee, isLoading: customFeeLoading } = useStudentCustomFee(id);
  const upsertCustomFee = useUpsertStudentCustomFee();

  const [formData, setFormData] = useState({
    nameEnglish: '',
    nameBangla: '',
    studentIdNumber: '',
    shiftId: '',
    classId: '',
    sectionId: '',
    guardianMobile: '',
    bloodGroup: '',
    photoUrl: '',
    rfidCardId: '',
  });

  // Fetch student data
  useEffect(() => {
    const fetchStudent = async () => {
      if (!id) return;
      
      try {
        const { data: student, error } = await supabase
          .from('students')
          .select('*, rfid_cards_students(card_number)')
          .eq('id', id)
          .single();

        if (error) throw error;

        if (student) {
          setFormData({
            nameEnglish: student.name || '',
            nameBangla: student.name_bn || '',
            studentIdNumber: student.student_id_number || '',
            shiftId: student.shift_id || '',
            classId: student.class_id || '',
            sectionId: student.section_id || '',
            guardianMobile: student.guardian_mobile || '',
            bloodGroup: student.blood_group || '',
            photoUrl: student.photo_url || '',
            rfidCardId: student.rfid_cards_students?.[0]?.card_number || '',
          });
        }
      } catch (error) {
        console.error('Error fetching student:', error);
        toast.error('Failed to load student data');
      } finally {
        setFetching(false);
      }
    };

    fetchStudent();
  }, [id]);

  // Fetch shifts, classes, sections, exams
  useEffect(() => {
    const fetchData = async () => {
      if (!activeYear) return;

      try {
        const { data: shiftsData } = await supabase
          .from('shifts')
          .select('id, name, name_bn')
          .eq('academic_year_id', activeYear.id)
          .eq('is_active', true)
          .order('start_time');
        setShifts(shiftsData || []);

        const { data: classesData } = await supabase
          .from('classes')
          .select('id, name, name_bn, shift_id')
          .eq('is_active', true)
          .order('grade_order');
        setClasses(classesData || []);

        const { data: sectionsData } = await supabase
          .from('sections')
          .select('id, name, name_bn, class_id')
          .eq('is_active', true)
          .order('name');
        setSections(sectionsData || []);

        const { data: examsData } = await supabase
          .from('exams')
          .select('id, name, name_bn, exam_fee_amount')
          .eq('academic_year_id', activeYear.id)
          .eq('is_active', true);
        setExams(examsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [activeYear]);

  // Fetch class fee when class changes
  useEffect(() => {
    const fetchClassFee = async () => {
      if (!formData.classId || !activeYear?.id) {
        setClassFee(null);
        return;
      }

      const { data } = await supabase
        .from('class_monthly_fees')
        .select('amount, admission_fee, session_charge')
        .eq('class_id', formData.classId)
        .eq('academic_year_id', activeYear.id)
        .maybeSingle();

      setClassFee(data);
    };

    fetchClassFee();
  }, [formData.classId, activeYear?.id]);

  // Filter classes when shift changes
  useEffect(() => {
    if (formData.shiftId) {
      const filtered = classes.filter(c => c.shift_id === formData.shiftId || !c.shift_id);
      setFilteredClasses(filtered);
    } else {
      setFilteredClasses(classes);
    }
  }, [formData.shiftId, classes]);

  // Filter sections when class changes
  useEffect(() => {
    if (formData.classId) {
      const filtered = sections.filter(s => s.class_id === formData.classId);
      setFilteredSections(filtered);
    } else {
      setFilteredSections([]);
    }
  }, [formData.classId, sections]);

  // Auto-fill amount when fee type changes
  useEffect(() => {
    if (newFeeType === 'monthly') {
      // Priority: custom fee > class fee
      if (studentCustomFee?.custom_monthly_fee) {
        setNewFeeAmount(studentCustomFee.custom_monthly_fee.toString());
      } else if (classFee) {
        setNewFeeAmount(classFee.amount.toString());
      }
    } else if (newFeeType === 'admission' && classFee) {
      setNewFeeAmount(classFee.admission_fee.toString());
    } else if (newFeeType === 'session' && classFee) {
      setNewFeeAmount(classFee.session_charge.toString());
    } else if (newFeeType === 'exam' && newFeeExamId) {
      const exam = exams.find(e => e.id === newFeeExamId);
      if (exam) {
        setNewFeeAmount(exam.exam_fee_amount.toString());
      }
    }
  }, [newFeeType, classFee, newFeeExamId, exams, studentCustomFee]);

  // Populate custom fee form when data loads
  useEffect(() => {
    if (studentCustomFee) {
      setCustomFeeAmount(studentCustomFee.custom_monthly_fee?.toString() || '');
      setCustomFeeEffectiveFrom(studentCustomFee.effective_from || '');
    } else {
      setCustomFeeAmount('');
      setCustomFeeEffectiveFrom(new Date().toISOString().split('T')[0]);
    }
  }, [studentCustomFee]);

  const uploadPhoto = async (base64Photo: string): Promise<string | null> => {
    if (!base64Photo || !base64Photo.startsWith('data:image')) {
      return null;
    }

    try {
      const response = await fetch(base64Photo);
      const blob = await response.blob();
      const fileName = `students/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

      const { data, error } = await supabase.storage
        .from('photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('photos')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading photo:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nameEnglish || !formData.shiftId || 
        !formData.classId || !formData.sectionId || 
        !formData.guardianMobile) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!/^01\d{9}$/.test(formData.guardianMobile)) {
      toast.error('Please enter a valid mobile number (e.g., 01XXXXXXXXX)');
      return;
    }

    setLoading(true);

    try {
      let photoUrl = formData.photoUrl;
      
      // Upload new photo if it's a base64 string
      if (formData.photoUrl && formData.photoUrl.startsWith('data:image')) {
        const newPhotoUrl = await uploadPhoto(formData.photoUrl);
        if (newPhotoUrl) {
          photoUrl = newPhotoUrl;
        }
      }

      const { error: studentError } = await supabase
        .from('students')
        .update({
          name: formData.nameEnglish,
          name_bn: formData.nameBangla || null,
          student_id_number: formData.studentIdNumber || null,
          shift_id: formData.shiftId,
          class_id: formData.classId,
          section_id: formData.sectionId,
          guardian_mobile: formData.guardianMobile,
          blood_group: formData.bloodGroup || null,
          photo_url: photoUrl || null,
        })
        .eq('id', id);

      if (studentError) throw studentError;

      toast.success('Student updated successfully!');
      navigate('/students');
    } catch (error: any) {
      console.error('Error updating student:', error);
      toast.error(error.message || 'Failed to update student');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate fee summary
  const feeSummary = feeRecords.reduce(
    (acc, record) => ({
      totalDue: acc.totalDue + Number(record.amount_due) + Number(record.late_fine),
      totalPaid: acc.totalPaid + Number(record.amount_paid),
    }),
    { totalDue: 0, totalPaid: 0 }
  );
  const totalRemaining = feeSummary.totalDue - feeSummary.totalPaid;

  // Get monthly fee status for visual cards
  const getMonthlyFeeStatus = () => {
    const monthlyRecords = feeRecords.filter(r => r.fee_type === 'monthly');
    return bengaliMonths.map(month => {
      const record = monthlyRecords.find(r => {
        if (!r.fee_month) return false;
        return r.fee_month.substring(5, 7) === month.value;
      });
      return {
        month: month.value,
        label: month.label,
        status: record?.status || null,
        record
      };
    });
  };

  const handleAddFee = async () => {
    if (!id) return;

    let amountDue = parseFloat(newFeeAmount);
    let feeMonth: string | undefined;
    let examId: string | undefined;

    if (newFeeType === 'monthly') {
      if (newFeeMonth && newFeeYear) {
        feeMonth = `${newFeeYear}-${newFeeMonth}-01`;
      }
    } else if (newFeeType === 'exam') {
      examId = newFeeExamId;
      if (!examId) {
        toast.error('অনুগ্রহ করে পরীক্ষা নির্বাচন করুন');
        return;
      }
    }

    if (!amountDue || amountDue <= 0) {
      toast.error('অনুগ্রহ করে পরিমাণ লিখুন');
      return;
    }

    await createFeeRecord.mutateAsync({
      studentId: id,
      feeType: newFeeType,
      amountDue,
      feeMonth,
      examId,
    });

    setShowAddFeeDialog(false);
    setNewFeeType('monthly');
    setNewFeeMonth('');
    setNewFeeAmount('');
    setNewFeeExamId('');
  };

  const handlePayment = async () => {
    if (!selectedFeeRecord) return;

    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      toast.error('অনুগ্রহ করে পরিমাণ লিখুন');
      return;
    }

    await collectFee.mutateAsync({
      recordId: selectedFeeRecord.id,
      amountPaid: amount,
    });

    setShowPaymentDialog(false);
    setSelectedFeeRecord(null);
    setPaymentAmount('');
  };

  const openPaymentDialog = (record: StudentFeeRecord) => {
    setSelectedFeeRecord(record);
    const remaining = Number(record.amount_due) + Number(record.late_fine) - Number(record.amount_paid);
    setPaymentAmount(remaining.toString());
    setShowPaymentDialog(true);
  };

  const handleSaveCustomFee = async () => {
    if (!id) return;
    
    const amount = customFeeAmount ? parseFloat(customFeeAmount) : null;
    
    await upsertCustomFee.mutateAsync({
      studentId: id,
      customMonthlyFee: amount,
      effectiveFrom: customFeeEffectiveFrom || undefined,
    });
  };

  const getMonthLabel = (feeMonth: string | null) => {
    if (!feeMonth) return '-';
    const month = feeMonth.substring(5, 7);
    const year = feeMonth.substring(0, 4);
    const monthName = bengaliMonths.find(m => m.value === month)?.label || month;
    return `${monthName} ${year}`;
  };

  if (fetching) {
    return (
      <MainLayout title="Edit Student" titleBn="শিক্ষার্থী সম্পাদনা">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const monthlyFeeStatus = getMonthlyFeeStatus();

  return (
    <MainLayout title="Edit Student" titleBn="শিক্ষার্থী সম্পাদনা">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/students">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{formData.nameEnglish || 'Edit Student'}</h2>
              <p className="text-sm text-muted-foreground font-bengali">{formData.nameBangla || 'শিক্ষার্থী সম্পাদনা'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Photo & RFID */}
          <div className="space-y-6">
            <div className="form-section">
              <h3 className="text-lg font-semibold mb-4">Photo</h3>
              <p className="text-sm text-muted-foreground mb-4 font-bengali">শিক্ষার্থীর ছবি</p>
              <PhotoCapture
                value={formData.photoUrl}
                onChange={(value) => updateField('photoUrl', value)}
              />
            </div>

            <div className="form-section">
              <h3 className="text-lg font-semibold mb-4">RFID Card</h3>
              <p className="text-sm text-muted-foreground mb-4 font-bengali">আইডি কার্ড</p>
              <RfidEnroll
                value={formData.rfidCardId}
                onChange={(value) => updateField('rfidCardId', value)}
              />
            </div>
          </div>

          {/* Right Column - Tabbed Content */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="info" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span className="font-bengali">শিক্ষার্থীর তথ্য</span>
                </TabsTrigger>
                <TabsTrigger value="fees" className="flex items-center gap-2">
                  <Wallet className="w-4 h-4" />
                  <span className="font-bengali">আর্থিক তথ্য</span>
                  {totalRemaining > 0 && (
                    <Badge variant="destructive" className="ml-1 text-xs">
                      ৳{totalRemaining}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Student Info Tab */}
              <TabsContent value="info" className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="form-section">
                    <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                    <p className="text-sm text-muted-foreground mb-4 font-bengali">মৌলিক তথ্য</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="form-label-required">Student Name (English)</Label>
                        <Input
                          placeholder="Enter name in English"
                          value={formData.nameEnglish}
                          onChange={(e) => updateField('nameEnglish', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bengali">শিক্ষার্থীর নাম (বাংলা)</Label>
                        <Input
                          placeholder="বাংলায় নাম লিখুন"
                          className="font-bengali"
                          value={formData.nameBangla}
                          onChange={(e) => updateField('nameBangla', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Student ID Number</Label>
                        <Input
                          placeholder="Optional ID number"
                          value={formData.studentIdNumber}
                          onChange={(e) => updateField('studentIdNumber', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="text-lg font-semibold mb-4">Academic Information</h3>
                    <p className="text-sm text-muted-foreground mb-4 font-bengali">শিক্ষা সংক্রান্ত তথ্য</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="form-label-required">Shift / শিফট</Label>
                        <Select value={formData.shiftId} onValueChange={(v) => updateField('shiftId', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Shift" />
                          </SelectTrigger>
                          <SelectContent>
                            {shifts.map((shift) => (
                              <SelectItem key={shift.id} value={shift.id}>
                                {shift.name} {shift.name_bn && `(${shift.name_bn})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="form-label-required">Class / শ্রেণী</Label>
                        <Select 
                          value={formData.classId} 
                          onValueChange={(v) => updateField('classId', v)}
                          disabled={!formData.shiftId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Class" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredClasses.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {cls.name} {cls.name_bn && `(${cls.name_bn})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="form-label-required">Section / শাখা</Label>
                        <Select 
                          value={formData.sectionId} 
                          onValueChange={(v) => updateField('sectionId', v)}
                          disabled={!formData.classId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Section" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredSections.map((section) => (
                              <SelectItem key={section.id} value={section.id}>
                                {section.name} {section.name_bn && `(${section.name_bn})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="text-lg font-semibold mb-4">Contact & Other Info</h3>
                    <p className="text-sm text-muted-foreground mb-4 font-bengali">যোগাযোগ ও অন্যান্য তথ্য</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="form-label-required">Guardian Mobile / অভিভাবকের মোবাইল</Label>
                        <Input
                          placeholder="01XXXXXXXXX"
                          type="tel"
                          value={formData.guardianMobile}
                          onChange={(e) => updateField('guardianMobile', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Blood Group / রক্তের গ্রুপ</Label>
                        <Select value={formData.bloodGroup} onValueChange={(v) => updateField('bloodGroup', v)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Blood Group" />
                          </SelectTrigger>
                          <SelectContent>
                            {bloodGroups.map((group) => (
                              <SelectItem key={group} value={group}>
                                {group}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-4">
                    <Link to="/students">
                      <Button type="button" variant="outline">
                        Cancel
                      </Button>
                    </Link>
                    <Button type="submit" variant="hero" className="gap-2" disabled={loading}>
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      <span>Update Student</span>
                      <span className="font-bengali">/ আপডেট করুন</span>
                    </Button>
                  </div>
                </form>
              </TabsContent>

              {/* Financial Info Tab */}
              <TabsContent value="fees" className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 border-red-200 dark:border-red-800">
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground font-bengali">মোট বকেয়া</p>
                      <p className="text-2xl font-bold text-destructive">৳{feeSummary.totalDue.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 border-green-200 dark:border-green-800">
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground font-bengali">পরিশোধিত</p>
                      <p className="text-2xl font-bold text-green-600">৳{feeSummary.totalPaid.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 border-orange-200 dark:border-orange-800">
                    <CardContent className="p-4 text-center">
                      <p className="text-xs text-muted-foreground font-bengali">অবশিষ্ট</p>
                      <p className={`text-2xl font-bold ${totalRemaining > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        ৳{totalRemaining.toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Custom Monthly Fee Section */}
                <div className="form-section">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings2 className="w-5 h-5 text-primary" />
                    <h3 className="text-lg font-semibold font-bengali">কাস্টম মাসিক ফি</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 font-bengali">
                    এই শিক্ষার্থীর জন্য ভিন্ন মাসিক ফি নির্ধারণ করুন। খালি রাখলে শ্রেণীর ডিফল্ট ফি প্রযোজ্য হবে।
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="font-bengali">কাস্টম মাসিক ফি (টাকা)</Label>
                      <Input
                        type="number"
                        placeholder="পরিমাণ লিখুন"
                        value={customFeeAmount}
                        onChange={(e) => setCustomFeeAmount(e.target.value)}
                      />
                      {classFee && (
                        <p className="text-xs text-muted-foreground font-bengali">
                          শ্রেণীর ডিফল্ট ফি: ৳{classFee.amount}
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="font-bengali">কার্যকর তারিখ</Label>
                      <Input
                        type="date"
                        value={customFeeEffectiveFrom}
                        onChange={(e) => setCustomFeeEffectiveFrom(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground font-bengali">
                        এই তারিখ থেকে নতুন ফি প্রযোজ্য হবে
                      </p>
                    </div>
                    
                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={handleSaveCustomFee}
                        disabled={upsertCustomFee.isPending || customFeeLoading}
                        className="w-full"
                      >
                        {upsertCustomFee.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        <span className="font-bengali">সংরক্ষণ করুন</span>
                      </Button>
                    </div>
                  </div>
                  
                  {studentCustomFee?.custom_monthly_fee && (
                    <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                      <p className="text-sm font-bengali">
                        <span className="font-medium">বর্তমান কাস্টম ফি:</span> ৳{studentCustomFee.custom_monthly_fee}
                        <span className="text-muted-foreground ml-2">
                          (কার্যকর: {new Date(studentCustomFee.effective_from).toLocaleDateString('bn-BD')})
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Monthly Fee Visual Cards */}
                <div className="form-section">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold font-bengali">মাসিক ফি স্ট্যাটাস</h3>
                  </div>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                    {monthlyFeeStatus.map(({ month, label, status, record }) => (
                      <button
                        key={month}
                        type="button"
                        onClick={() => record && record.status !== 'paid' && openPaymentDialog(record)}
                        disabled={!record || status === 'paid'}
                        className={`
                          p-3 rounded-lg border-2 text-center transition-all
                          ${status === 'paid' 
                            ? 'bg-green-100 border-green-300 dark:bg-green-900/30 dark:border-green-700' 
                            : status === 'partial'
                              ? 'bg-yellow-100 border-yellow-300 dark:bg-yellow-900/30 dark:border-yellow-700 cursor-pointer hover:border-yellow-500'
                              : status === 'unpaid'
                                ? 'bg-red-100 border-red-300 dark:bg-red-900/30 dark:border-red-700 cursor-pointer hover:border-red-500'
                                : 'bg-muted/50 border-muted-foreground/20'
                          }
                        `}
                      >
                        <div className="font-bengali text-sm font-medium">{label}</div>
                        <div className="mt-1">
                          {status === 'paid' && <CheckCircle2 className="w-5 h-5 mx-auto text-green-600" />}
                          {status === 'partial' && <AlertCircle className="w-5 h-5 mx-auto text-yellow-600" />}
                          {status === 'unpaid' && <XCircle className="w-5 h-5 mx-auto text-red-600" />}
                          {!status && <span className="text-xs text-muted-foreground">—</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* All Fee Records */}
                <div className="form-section">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold font-bengali">সকল ফি রেকর্ড</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddFeeDialog(true)}
                      className="gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="font-bengali">ফি যুক্ত করুন</span>
                    </Button>
                  </div>

                  {feeLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : feeRecords.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="font-bengali">কোনো ফি রেকর্ড নেই</p>
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="font-bengali">ফি এর ধরন</TableHead>
                            <TableHead className="font-bengali hidden sm:table-cell">মাস/বিবরণ</TableHead>
                            <TableHead className="font-bengali text-right">বকেয়া</TableHead>
                            <TableHead className="font-bengali text-right hidden sm:table-cell">পরিশোধিত</TableHead>
                            <TableHead className="font-bengali text-center">স্ট্যাটাস</TableHead>
                            <TableHead className="font-bengali text-center">অ্যাকশন</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {feeRecords.map((record) => {
                            const remaining = Number(record.amount_due) + Number(record.late_fine) - Number(record.amount_paid);
                            return (
                              <TableRow key={record.id}>
                                <TableCell className="font-bengali">
                                  {feeTypeLabels[record.fee_type] || record.fee_type}
                                </TableCell>
                                <TableCell className="font-bengali hidden sm:table-cell">
                                  {record.fee_type === 'monthly' 
                                    ? getMonthLabel(record.fee_month)
                                    : record.fee_type === 'exam' && record.exam
                                      ? record.exam.name_bn || record.exam.name
                                      : '-'}
                                </TableCell>
                                <TableCell className="text-right">
                                  ৳{Number(record.amount_due) + Number(record.late_fine)}
                                  {Number(record.late_fine) > 0 && (
                                    <span className="text-xs text-destructive ml-1 hidden sm:inline">(+{record.late_fine} জরিমানা)</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-right text-green-600 hidden sm:table-cell">
                                  ৳{record.amount_paid}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Badge variant={statusBadgeVariant[record.status] || 'default'} className="font-bengali">
                                    {record.status === 'paid' ? 'পরিশোধিত' : record.status === 'partial' ? 'আংশিক' : 'বকেয়া'}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-center">
                                  {record.status !== 'paid' && (
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openPaymentDialog(record)}
                                      className="gap-1 text-primary hover:text-primary"
                                    >
                                      <CreditCard className="w-4 h-4" />
                                      <span className="font-bengali hidden sm:inline">আদায়</span>
                                    </Button>
                                  )}
                                  {record.status === 'paid' && record.receipt_number && (
                                    <span className="text-xs text-muted-foreground">
                                      #{record.receipt_number}
                                    </span>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Add Fee Dialog */}
        <Dialog open={showAddFeeDialog} onOpenChange={setShowAddFeeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-bengali">নতুন ফি যুক্ত করুন</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="font-bengali">ফি এর ধরন</Label>
                <Select value={newFeeType} onValueChange={(v: any) => setNewFeeType(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly" className="font-bengali">মাসিক ফি</SelectItem>
                    <SelectItem value="admission" className="font-bengali">ভর্তি ফি</SelectItem>
                    <SelectItem value="session" className="font-bengali">সেশন চার্জ</SelectItem>
                    <SelectItem value="exam" className="font-bengali">পরীক্ষা ফি</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newFeeType === 'monthly' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bengali">মাস</Label>
                    <Select value={newFeeMonth} onValueChange={setNewFeeMonth}>
                      <SelectTrigger>
                        <SelectValue placeholder="মাস নির্বাচন" />
                      </SelectTrigger>
                      <SelectContent>
                        {bengaliMonths.map((month) => (
                          <SelectItem key={month.value} value={month.value} className="font-bengali">
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bengali">বছর</Label>
                    <Select value={newFeeYear} onValueChange={setNewFeeYear}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2024, 2025, 2026].map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {newFeeType === 'exam' && (
                <div className="space-y-2">
                  <Label className="font-bengali">পরীক্ষা</Label>
                  <Select value={newFeeExamId} onValueChange={setNewFeeExamId}>
                    <SelectTrigger>
                      <SelectValue placeholder="পরীক্ষা নির্বাচন" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id} className="font-bengali">
                          {exam.name_bn || exam.name} (৳{exam.exam_fee_amount})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label className="font-bengali">
                  পরিমাণ (টাকা)
                </Label>
                <Input
                  type="number"
                  placeholder="পরিমাণ লিখুন"
                  value={newFeeAmount}
                  onChange={(e) => setNewFeeAmount(e.target.value)}
                />
                {classFee && (
                  <p className="text-xs text-muted-foreground">
                    {newFeeType === 'monthly' && `ডিফল্ট মাসিক ফি: ৳${classFee.amount}`}
                    {newFeeType === 'admission' && `ডিফল্ট ভর্তি ফি: ৳${classFee.admission_fee}`}
                    {newFeeType === 'session' && `ডিফল্ট সেশন চার্জ: ৳${classFee.session_charge}`}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddFeeDialog(false)}>
                বাতিল
              </Button>
              <Button onClick={handleAddFee} disabled={createFeeRecord.isPending}>
                {createFeeRecord.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <span className="font-bengali">যুক্ত করুন</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-bengali">ফি আদায়</DialogTitle>
            </DialogHeader>
            {selectedFeeRecord && (
              <div className="space-y-4 py-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-bengali">ফি এর ধরন:</span>
                    <span className="font-bengali font-medium">
                      {feeTypeLabels[selectedFeeRecord.fee_type]}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bengali">মোট বকেয়া:</span>
                    <span className="font-medium text-destructive">
                      ৳{Number(selectedFeeRecord.amount_due) + Number(selectedFeeRecord.late_fine)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="font-bengali">পরিশোধিত:</span>
                    <span className="font-medium text-green-600">৳{selectedFeeRecord.amount_paid}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t pt-2">
                    <span className="font-bengali font-medium">অবশিষ্ট:</span>
                    <span className="font-bold text-orange-600">
                      ৳{Number(selectedFeeRecord.amount_due) + Number(selectedFeeRecord.late_fine) - Number(selectedFeeRecord.amount_paid)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-bengali">আদায়ের পরিমাণ (টাকা)</Label>
                  <Input
                    type="number"
                    placeholder="পরিমাণ লিখুন"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
                বাতিল
              </Button>
              <Button onClick={handlePayment} disabled={collectFee.isPending}>
                {collectFee.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Receipt className="w-4 h-4 mr-2" />
                <span className="font-bengali">আদায় করুন</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
