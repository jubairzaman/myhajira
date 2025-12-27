import { useState } from 'react';
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
import { GraduationCap, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const shifts = [
  { id: '1', name: 'Morning Shift', nameBn: 'প্রভাতী শিফট' },
  { id: '2', name: 'Day Shift', nameBn: 'দিবা শিফট' },
];

const panels = [
  { id: '1', name: 'Primary Panel', nameBn: 'প্রাথমিক প্যানেল' },
  { id: '2', name: 'Boys Panel', nameBn: 'বালক প্যানেল' },
  { id: '3', name: 'Girls Panel', nameBn: 'বালিকা প্যানেল' },
];

const classes = [
  { id: '1', name: 'Class 1', nameBn: 'প্রথম শ্রেণী' },
  { id: '2', name: 'Class 2', nameBn: 'দ্বিতীয় শ্রেণী' },
  { id: '3', name: 'Class 3', nameBn: 'তৃতীয় শ্রেণী' },
  { id: '4', name: 'Class 4', nameBn: 'চতুর্থ শ্রেণী' },
  { id: '5', name: 'Class 5', nameBn: 'পঞ্চম শ্রেণী' },
  { id: '6', name: 'Class 6', nameBn: 'ষষ্ঠ শ্রেণী' },
  { id: '7', name: 'Class 7', nameBn: 'সপ্তম শ্রেণী' },
  { id: '8', name: 'Class 8', nameBn: 'অষ্টম শ্রেণী' },
  { id: '9', name: 'Class 9', nameBn: 'নবম শ্রেণী' },
  { id: '10', name: 'Class 10', nameBn: 'দশম শ্রেণী' },
];

const sections = [
  { id: '1', name: 'Section A', nameBn: 'শাখা ক' },
  { id: '2', name: 'Section B', nameBn: 'শাখা খ' },
  { id: '3', name: 'Section C', nameBn: 'শাখা গ' },
];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function StudentRegistration() {
  const [formData, setFormData] = useState({
    nameEnglish: '',
    nameBangla: '',
    shiftId: '',
    panelId: '',
    classId: '',
    sectionId: '',
    guardianMobile: '',
    bloodGroup: '',
    photoUrl: '',
    rfidCardId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.nameEnglish || !formData.nameBangla || !formData.shiftId || 
        !formData.panelId || !formData.classId || !formData.sectionId || 
        !formData.guardianMobile || !formData.rfidCardId) {
      toast.error('Please fill all required fields');
      return;
    }

    // In production, this would save to database
    console.log('Student data:', formData);
    toast.success('Student registered successfully!');
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
                    <Label className="form-label-required font-bengali">শিক্ষার্থীর নাম (বাংলা)</Label>
                    <Input
                      placeholder="বাংলায় নাম লিখুন"
                      className="font-bengali"
                      value={formData.nameBangla}
                      onChange={(e) => updateField('nameBangla', e.target.value)}
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
                            {shift.name} ({shift.nameBn})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="form-label-required">Panel / প্যানেল</Label>
                    <Select value={formData.panelId} onValueChange={(v) => updateField('panelId', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Panel" />
                      </SelectTrigger>
                      <SelectContent>
                        {panels.map((panel) => (
                          <SelectItem key={panel.id} value={panel.id}>
                            {panel.name} ({panel.nameBn})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="form-label-required">Class / শ্রেণী</Label>
                    <Select value={formData.classId} onValueChange={(v) => updateField('classId', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name} ({cls.nameBn})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="form-label-required">Section / শাখা</Label>
                    <Select value={formData.sectionId} onValueChange={(v) => updateField('sectionId', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Section" />
                      </SelectTrigger>
                      <SelectContent>
                        {sections.map((section) => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.name} ({section.nameBn})
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
                <Button type="submit" variant="hero" className="gap-2">
                  <Save className="w-4 h-4" />
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
