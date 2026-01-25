import { useState } from 'react';
import { Users, Star, Youtube, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useWebsiteAlumni, useSubmitAlumniApplication } from '@/hooks/queries/useWebsiteCMS';

export default function Alumni() {
  const { data: alumni } = useWebsiteAlumni(true);
  const submitApplication = useSubmitAlumniApplication();
  
  const [formData, setFormData] = useState({
    name: '',
    passing_year: '',
    current_position: '',
    comment: '',
  });

  const featuredAlumni = alumni?.filter(a => a.is_featured) || [];
  const bubbleAlumni = alumni?.filter(a => a.show_in_bubble) || [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitApplication.mutate({
      name: formData.name,
      passing_year: parseInt(formData.passing_year),
      current_position: formData.current_position,
      comment: formData.comment,
    }, {
      onSuccess: () => {
        setFormData({ name: '', passing_year: '', current_position: '', comment: '' });
      }
    });
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-[#4B0082] to-[#6B2D8B] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-80" />
          <h1 className="text-4xl font-bold font-bengali mb-4">প্রাক্তন ছাত্র</h1>
          <p className="text-lg opacity-80">Alumni Network</p>
        </div>
      </section>

      {/* Featured Alumni */}
      {featuredAlumni.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#4B0082] font-bengali mb-4">বিশিষ্ট প্রাক্তন ছাত্র</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAlumni.map((person) => (
                <Card key={person.id} className="border-0 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="p-6 text-center">
                    {person.photo_url ? (
                      <img src={person.photo_url} alt={person.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                        {person.name.charAt(0)}
                      </div>
                    )}
                    <h3 className="font-bold text-lg font-bengali">{person.name_bn || person.name}</h3>
                    <p className="text-sm text-gray-500">ব্যাচ: {person.passing_year}</p>
                    <p className="text-sm text-[#4B0082] font-medium mt-1">{person.current_position_bn || person.current_position}</p>
                    {person.comment && <p className="text-sm text-gray-600 mt-3 italic">"{person.comment_bn || person.comment}"</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bubble Animation Section */}
      {bubbleAlumni.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-[#0D0221] to-[#4B0082] relative overflow-hidden min-h-[400px]">
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl font-bold text-white font-bengali mb-4">প্রাক্তনদের কথা</h2>
          </div>
          {bubbleAlumni.map((person, index) => (
            <div
              key={person.id}
              className="absolute animate-bounce"
              style={{
                left: `${10 + (index * 20) % 80}%`,
                top: `${20 + (index * 15) % 60}%`,
                animationDelay: `${index * 0.5}s`,
                animationDuration: `${3 + index % 2}s`,
              }}
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 max-w-[200px]">
                <p className="text-white text-sm font-bengali">"{person.comment_bn || person.comment}"</p>
                <p className="text-[#00D4FF] text-xs mt-2">- {person.name_bn || person.name}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Application Form */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#4B0082] font-bengali mb-4">প্রাক্তন নেটওয়ার্কে যোগ দিন</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
            </div>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div><Label>নাম *</Label><Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required /></div>
                  <div><Label>পাসের বছর *</Label><Input type="number" value={formData.passing_year} onChange={(e) => setFormData({...formData, passing_year: e.target.value})} required /></div>
                  <div><Label>বর্তমান পদবি</Label><Input value={formData.current_position} onChange={(e) => setFormData({...formData, current_position: e.target.value})} /></div>
                  <div><Label>মন্তব্য</Label><Textarea value={formData.comment} onChange={(e) => setFormData({...formData, comment: e.target.value})} /></div>
                  <Button type="submit" className="w-full bg-[#4B0082]" disabled={submitApplication.isPending}>
                    <Send className="w-4 h-4 mr-2" />{submitApplication.isPending ? 'জমা হচ্ছে...' : 'জমা দিন'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
