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
import { Users, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';

interface Shift {
  id: string;
  name: string;
  name_bn: string | null;
}

const designations = [
  { id: 'head_teacher', name: 'Head Teacher', nameBn: 'প্রধান শিক্ষক' },
  { id: 'assistant_head', name: 'Assistant Head Teacher', nameBn: 'সহকারী প্রধান শিক্ষক' },
  { id: 'senior_teacher', name: 'Senior Teacher', nameBn: 'সিনিয়র শিক্ষক' },
  { id: 'assistant_teacher', name: 'Assistant Teacher', nameBn: 'সহকারী শিক্ষক' },
  { id: 'junior_teacher', name: 'Junior Teacher', nameBn: 'জুনিয়র শিক্ষক' },
];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function TeacherRegistration() {
  const navigate = useNavigate();
  const { activeYear } = useAcademicYear();
  const [loading, setLoading] = useState(false);
  const [shifts, setShifts] = useState<Shift[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    nameBn: '',
    designation: '',
    shiftId: '',
    mobile: '',
    bloodGroup: '',
    photoUrl: '',
    rfidCardId: '',
  });

  // Fetch shifts
  useEffect(() => {
    const fetchShifts = async () => {
      if (!activeYear) return;

      try {
        const { data } = await supabase
          .from('shifts')
          .select('id, name, name_bn')
          .eq('academic_year_id', activeYear.id)
          .eq('is_active', true)
          .order('start_time');
        setShifts(data || []);
      } catch (error) {
        console.error('Error fetching shifts:', error);
      }
    };

    fetchShifts();
  }, [activeYear]);

  const uploadPhoto = async (base64Photo: string): Promise<string | null> => {
    if (!base64Photo || !base64Photo.startsWith('data:image')) {
      return null;
    }

    try {
      const response = await fetch(base64Photo);
      const blob = await response.blob();
      const fileName = `teachers/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

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
    
    if (!formData.name || !formData.designation || !formData.shiftId || !formData.mobile) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!/^01\d{9}$/.test(formData.mobile)) {
      toast.error('Please enter a valid mobile number (e.g., 01XXXXXXXXX)');
      return;
    }

    if (!activeYear) {
      toast.error('No active academic year');
      return;
    }

    setLoading(true);

    try {
      let photoUrl: string | null = null;
      if (formData.photoUrl) {
        photoUrl = await uploadPhoto(formData.photoUrl);
      }

      const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .insert({
          name: formData.name,
          name_bn: formData.nameBn || null,
          designation: formData.designation,
          shift_id: formData.shiftId,
          mobile: formData.mobile,
          blood_group: formData.bloodGroup || null,
          photo_url: photoUrl,
          academic_year_id: activeYear.id,
        })
        .select()
        .single();

      if (teacherError) throw teacherError;

      if (formData.rfidCardId && teacher) {
        const { error: rfidError } = await supabase
          .from('rfid_cards_teachers')
          .insert({
            teacher_id: teacher.id,
            card_number: formData.rfidCardId,
          });

        if (rfidError) {
          console.error('RFID enrollment error:', rfidError);
          toast.warning('Teacher saved, but RFID card enrollment failed');
        }
      }

      toast.success('Teacher registered successfully!');
      navigate('/teachers');
    } catch (error: any) {
      console.error('Error saving teacher:', error);
      toast.error(error.message || 'Failed to save teacher');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <MainLayout title="Teacher Registration" titleBn="শিক্ষক নিবন্ধন">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/teachers">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
              <Users className="w-6 h-6 text-info" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">New Teacher Registration</h2>
              <p className="text-sm text-muted-foreground font-bengali">নতুন শিক্ষক নিবন্ধন</p>
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
                <p className="text-sm text-muted-foreground mb-4 font-bengali">শিক্ষকের ছবি</p>
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
                    <Label className="form-label-required">Teacher Name (English)</Label>
                    <Input
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bengali">শিক্ষকের নাম (বাংলা)</Label>
                    <Input
                      placeholder="বাংলায় নাম লিখুন"
                      className="font-bengali"
                      value={formData.nameBn}
                      onChange={(e) => updateField('nameBn', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="form-label-required">Designation / পদবী</Label>
                    <Select value={formData.designation} onValueChange={(v) => updateField('designation', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Designation" />
                      </SelectTrigger>
                      <SelectContent>
                        {designations.map((designation) => (
                          <SelectItem key={designation.id} value={designation.id}>
                            {designation.name} ({designation.nameBn})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="form-label-required">Assigned Shift / শিফট</Label>
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
                </div>
              </div>

              {/* Contact & Other Info */}
              <div className="form-section">
                <h3 className="text-lg font-semibold mb-4">Contact & Other Info</h3>
                <p className="text-sm text-muted-foreground mb-4 font-bengali">যোগাযোগ ও অন্যান্য তথ্য</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="form-label-required">Mobile Number / মোবাইল নম্বর</Label>
                    <Input
                      placeholder="01XXXXXXXXX"
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => updateField('mobile', e.target.value)}
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
                <Link to="/teachers">
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
                  <span>Save Teacher</span>
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
