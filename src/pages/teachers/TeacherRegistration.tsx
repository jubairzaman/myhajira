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
import { Users, Save, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const shifts = [
  { id: '1', name: 'Morning Shift', nameBn: 'প্রভাতী শিফট' },
  { id: '2', name: 'Day Shift', nameBn: 'দিবা শিফট' },
];

const designations = [
  { id: '1', name: 'Head Teacher', nameBn: 'প্রধান শিক্ষক' },
  { id: '2', name: 'Assistant Head Teacher', nameBn: 'সহকারী প্রধান শিক্ষক' },
  { id: '3', name: 'Senior Teacher', nameBn: 'সিনিয়র শিক্ষক' },
  { id: '4', name: 'Assistant Teacher', nameBn: 'সহকারী শিক্ষক' },
  { id: '5', name: 'Junior Teacher', nameBn: 'জুনিয়র শিক্ষক' },
];

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function TeacherRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    shiftId: '',
    mobile: '',
    bloodGroup: '',
    photoUrl: '',
    rfidCardId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.designation || !formData.shiftId || 
        !formData.mobile || !formData.rfidCardId) {
      toast.error('Please fill all required fields');
      return;
    }

    // In production, this would save to database
    console.log('Teacher data:', formData);
    toast.success('Teacher registered successfully!');
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
                  <div className="space-y-2 md:col-span-2">
                    <Label className="form-label-required">Teacher Name / শিক্ষকের নাম</Label>
                    <Input
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
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
                            {shift.name} ({shift.nameBn})
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
                <Button type="submit" variant="hero" className="gap-2">
                  <Save className="w-4 h-4" />
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
