import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useWebsiteSettings, useSubmitContact } from '@/hooks/queries/useWebsiteCMS';

export default function Contact() {
  const { data: settings } = useWebsiteSettings();
  const submitContact = useSubmitContact();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitContact.mutate(formData, {
      onSuccess: () => setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
    });
  };

  return (
    <div>
      <section className="bg-gradient-to-r from-[#4B0082] to-[#6B2D8B] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold font-bengali mb-4">যোগাযোগ</h1>
          <p className="text-lg opacity-80">Contact Us</p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-[#4B0082] font-bengali mb-6">যোগাযোগের তথ্য</h2>
              <div className="space-y-4">
                {settings?.contact_address && (
                  <Card className="border-0 shadow-md"><CardContent className="p-4 flex items-start gap-4">
                    <MapPin className="w-6 h-6 text-[#4B0082]" />
                    <div><p className="font-medium font-bengali">ঠিকানা</p><p className="text-gray-600 font-bengali">{settings.contact_address_bn || settings.contact_address}</p></div>
                  </CardContent></Card>
                )}
                {settings?.contact_phone && (
                  <Card className="border-0 shadow-md"><CardContent className="p-4 flex items-start gap-4">
                    <Phone className="w-6 h-6 text-[#4B0082]" />
                    <div><p className="font-medium font-bengali">ফোন</p><a href={`tel:${settings.contact_phone}`} className="text-gray-600 hover:text-[#4B0082]">{settings.contact_phone}</a></div>
                  </CardContent></Card>
                )}
                {settings?.contact_email && (
                  <Card className="border-0 shadow-md"><CardContent className="p-4 flex items-start gap-4">
                    <Mail className="w-6 h-6 text-[#4B0082]" />
                    <div><p className="font-medium font-bengali">ইমেইল</p><a href={`mailto:${settings.contact_email}`} className="text-gray-600 hover:text-[#4B0082]">{settings.contact_email}</a></div>
                  </CardContent></Card>
                )}
                {settings?.office_hours && (
                  <Card className="border-0 shadow-md"><CardContent className="p-4 flex items-start gap-4">
                    <Clock className="w-6 h-6 text-[#4B0082]" />
                    <div><p className="font-medium font-bengali">অফিস সময়</p><p className="text-gray-600 font-bengali whitespace-pre-line">{settings.office_hours_bn || settings.office_hours}</p></div>
                  </CardContent></Card>
                )}
              </div>
              {settings?.google_map_embed && (
                <div className="mt-6 rounded-xl overflow-hidden shadow-lg" dangerouslySetInnerHTML={{ __html: settings.google_map_embed }} />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#4B0082] font-bengali mb-6">বার্তা পাঠান</h2>
              <Card className="border-0 shadow-lg"><CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div><Label>নাম *</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>ইমেইল</Label><Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
                    <div><Label>ফোন</Label><Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
                  </div>
                  <div><Label>বিষয়</Label><Input value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} /></div>
                  <div><Label>বার্তা *</Label><Textarea rows={5} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} required /></div>
                  <Button type="submit" className="w-full bg-[#4B0082]" disabled={submitContact.isPending}>
                    <Send className="w-4 h-4 mr-2" />{submitContact.isPending ? 'পাঠানো হচ্ছে...' : 'বার্তা পাঠান'}
                  </Button>
                </form>
              </CardContent></Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
