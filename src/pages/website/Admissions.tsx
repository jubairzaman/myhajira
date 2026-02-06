import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Send, Loader2 } from 'lucide-react';
import { useWebsiteAdmissionInfo } from '@/hooks/queries/useWebsiteCMSNew';
import { useAdmissionFormFields, useSubmitAdmissionForm } from '@/hooks/queries/useAdmissionForm';

export default function Admissions() {
  const { data: admissionInfo } = useWebsiteAdmissionInfo();
  const { data: formFields } = useAdmissionFormFields(true);
  const submitForm = useSubmitAdmissionForm();

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const requirements = admissionInfo?.filter(i => i.section_key === 'requirement' && i.is_enabled) || [];

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const applicantName = formData['applicant_name'] || formData[Object.keys(formData)[0]] || 'Unknown';
    const applicantPhone = formData['applicant_phone'] || formData['phone'] || '';
    
    await submitForm.mutateAsync({
      applicant_name: applicantName,
      applicant_phone: applicantPhone || undefined,
      form_data: formData,
    });
    setSubmitted(true);
    setFormData({});
  };

  return (
    <div>
      {/* Page Header */}
      <section className="bg-gradient-to-r from-[#4B0082] to-[#6B2D8B] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold font-bengali mb-4">ভর্তি তথ্য</h1>
          <p className="text-lg opacity-80">Admissions</p>
        </div>
      </section>

      {/* Requirements */}
      {requirements.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#4B0082] font-bengali mb-4">প্রয়োজনীয় তথ্য ও ডকুমেন্ট</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
              {requirements.map((req) => (
                <Card key={req.id} className="border-0 shadow-sm">
                  <CardContent className="p-4 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-bengali font-medium">{req.title_bn || req.title}</span>
                      {(req.content_bn || req.content) && (
                        <p className="text-sm text-gray-500 font-bengali mt-1">{req.content_bn || req.content}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Application Form */}
      {formFields && formFields.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#4B0082] font-bengali mb-4">ভর্তি আবেদন ফর্ম</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
              <p className="text-gray-600 mt-4 font-bengali">নিচের ফর্মটি পূরণ করুন। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করবো।</p>
            </div>

            <div className="max-w-2xl mx-auto">
              {submitted ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-8 text-center">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#4B0082] font-bengali mb-3">আবেদন সফলভাবে জমা হয়েছে!</h3>
                    <p className="text-gray-600 font-bengali mb-6">আমরা আপনার আবেদন পর্যালোচনা করবো এবং শীঘ্রই যোগাযোগ করবো।</p>
                    <Button onClick={() => setSubmitted(false)} className="bg-[#4B0082] hover:bg-[#6B2D8B]">
                      নতুন আবেদন করুন
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="font-bengali text-[#4B0082]">আবেদন ফর্ম</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {formFields.map((field) => (
                        <div key={field.id} className="space-y-2">
                          <Label className="font-bengali">
                            {field.field_label_bn || field.field_label}
                            {field.is_required && <span className="text-red-500 ml-1">*</span>}
                          </Label>
                          {field.field_type === 'textarea' ? (
                            <Textarea
                              placeholder={field.placeholder_bn || field.placeholder || ''}
                              value={formData[field.field_name] || ''}
                              onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                              required={field.is_required}
                              className="font-bengali"
                            />
                          ) : field.field_type === 'select' ? (
                            <Select
                              value={formData[field.field_name] || ''}
                              onValueChange={(value) => handleFieldChange(field.field_name, value)}
                              required={field.is_required}
                            >
                              <SelectTrigger className="font-bengali">
                                <SelectValue placeholder={field.placeholder_bn || field.placeholder || 'নির্বাচন করুন'} />
                              </SelectTrigger>
                              <SelectContent>
                                {(field.options as string[] || []).map((option: string, i: number) => (
                                  <SelectItem key={i} value={option} className="font-bengali">{option}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              type={field.field_type}
                              placeholder={field.placeholder_bn || field.placeholder || ''}
                              value={formData[field.field_name] || ''}
                              onChange={(e) => handleFieldChange(field.field_name, e.target.value)}
                              required={field.is_required}
                              className="font-bengali"
                            />
                          )}
                        </div>
                      ))}
                      <Button
                        type="submit"
                        disabled={submitForm.isPending}
                        className="w-full bg-[#4B0082] hover:bg-[#6B2D8B] mt-6"
                        size="lg"
                      >
                        {submitForm.isPending ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 mr-2" />
                        )}
                        আবেদন জমা দিন
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
