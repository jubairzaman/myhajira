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
import { GraduationCap, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { useAutoGenerateAdmissionFees } from '@/hooks/queries/useBulkFeeGeneration';

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

export default function StudentRegistration() {
  const navigate = useNavigate();
  const { activeYear } = useAcademicYear();
  const [loading, setLoading] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [filteredSections, setFilteredSections] = useState<Section[]>([]);
  
  // Auto fee generation hook
  const autoGenerateFees = useAutoGenerateAdmissionFees();

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
    admissionDate: new Date().toISOString().split('T')[0],
  });

  // Fetch shifts, classes, sections
  useEffect(() => {
    const fetchData = async () => {
      if (!activeYear) return;

      try {
        // Fetch shifts
        const { data: shiftsData } = await supabase
          .from('shifts')
          .select('id, name, name_bn')
          .eq('academic_year_id', activeYear.id)
          .eq('is_active', true)
          .order('start_time');
        setShifts(shiftsData || []);

        // Fetch classes
        const { data: classesData } = await supabase
          .from('classes')
          .select('id, name, name_bn, shift_id')
          .eq('is_active', true)
          .order('grade_order');
        setClasses(classesData || []);

        // Fetch sections
        const { data: sectionsData } = await supabase
          .from('sections')
          .select('id, name, name_bn, class_id')
          .eq('is_active', true)
          .order('name');
        setSections(sectionsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [activeYear]);

  // Filter classes when shift changes
  useEffect(() => {
    if (formData.shiftId) {
      const filtered = classes.filter(c => c.shift_id === formData.shiftId || !c.shift_id);
      setFilteredClasses(filtered);
      // Reset class and section if current selection is not valid
      if (formData.classId && !filtered.find(c => c.id === formData.classId)) {
        updateField('classId', '');
        updateField('sectionId', '');
      }
    } else {
      setFilteredClasses(classes);
    }
  }, [formData.shiftId, classes]);

  // Filter sections when class changes
  useEffect(() => {
    if (formData.classId) {
      const filtered = sections.filter(s => s.class_id === formData.classId);
      setFilteredSections(filtered);
      // Reset section if current selection is not valid
      if (formData.sectionId && !filtered.find(s => s.id === formData.sectionId)) {
        updateField('sectionId', '');
      }
    } else {
      setFilteredSections([]);
    }
  }, [formData.classId, sections]);

  const uploadPhoto = async (base64Photo: string): Promise<string | null> => {
    if (!base64Photo || !base64Photo.startsWith('data:image')) {
      return null;
    }

    try {
      // Convert base64 to blob
      const response = await fetch(base64Photo);
      const blob = await response.blob();
      
      // Generate unique filename
      const fileName = `students/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
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
    
    // Validate required fields
    if (!formData.nameEnglish || !formData.shiftId || 
        !formData.classId || !formData.sectionId || 
        !formData.guardianMobile) {
      toast.error('Please fill all required fields');
      return;
    }

    // Validate mobile number format
    if (!/^01\d{9}$/.test(formData.guardianMobile)) {
      toast.error('Please enter a valid mobile number (e.g., 01XXXXXXXXX)');
      return;
    }

    if (!activeYear) {
      toast.error('No active academic year');
      return;
    }

    setLoading(true);

    try {
      // Upload photo if provided
      let photoUrl: string | null = null;
      if (formData.photoUrl) {
        photoUrl = await uploadPhoto(formData.photoUrl);
      }

      // Insert student
      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert({
          name: formData.nameEnglish,
          name_bn: formData.nameBangla || null,
          student_id_number: formData.studentIdNumber || null,
          shift_id: formData.shiftId,
          class_id: formData.classId,
          section_id: formData.sectionId,
          guardian_mobile: formData.guardianMobile,
          blood_group: formData.bloodGroup || null,
          photo_url: photoUrl,
          academic_year_id: activeYear.id,
          admission_date: formData.admissionDate || null,
        })
        .select()
        .single();

      if (studentError) throw studentError;

      // If RFID card is enrolled, create the RFID record
      if (formData.rfidCardId && student) {
        const { error: rfidError } = await supabase
          .from('rfid_cards_students')
          .insert({
            student_id: student.id,
            card_number: formData.rfidCardId,
          });

        if (rfidError) {
          console.error('RFID enrollment error:', rfidError);
          toast.warning('Student saved, but RFID card enrollment failed');
        }
      }
      
      // Auto-generate admission and session fees
      if (student) {
        autoGenerateFees.mutate({
          studentId: student.id,
          classId: student.class_id,
        });
      }

      toast.success('Student registered successfully!');
      navigate('/students');
    } catch (error: any) {
      console.error('Error saving student:', error);
      toast.error(error.message || 'Failed to save student');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MainLayout title="Student Registration" titleBn="শিক্ষার্থী নিবন্ধন">
      <div className="max-w-4xl mx-auto">
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
              <h2 className="text-xl font-semibold">New Student Registration</h2>
              <p className="text-sm text-muted-foreground font-bengali">নতুন শিক্ষার্থী নিবন্ধন</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Photo & RFID */}
            <div className="space-y-6">
              {/* Photo Section */}
              <div className="form-section">
                <h3 className="text-lg font-semibold mb-4">Photo</h3>
                <p className="text-sm text-muted-foreground mb-4 font-bengali">শিক্ষার্থীর ছবি</p>
                <PhotoCapture
                  value={formData.photoUrl}
                  onChange={(value) => updateField('photoUrl', value)}
                />
              </div>

              {/* RFID Section */}
              <div className="form-section">
                <h3 className="text-lg font-semibold mb-4">RFID Card</h3>
                <p className="text-sm text-muted-foreground mb-4 font-bengali">আইডি কার্ড নিবন্ধন</p>
                <RfidEnroll
                  value={formData.rfidCardId}
                  onChange={(value) => updateField('rfidCardId', value)}
                />
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
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

                  <div className="space-y-2">
                    <Label className="font-bengali">ভর্তির তারিখ</Label>
                    <Input
                      type="date"
                      value={formData.admissionDate}
                      onChange={(e) => updateField('admissionDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Academic Info */}
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

              {/* Contact & Other Info */}
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

              {/* Submit Button */}
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
                  <span>Save Student</span>
                  <span className="font-bengali">/ সংরক্ষণ করুন</span>
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}
