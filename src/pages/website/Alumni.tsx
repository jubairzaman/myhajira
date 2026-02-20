import { useState, useRef } from 'react';
import { Users, Send, Youtube, Play, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useWebsiteAlumni, useSubmitAlumniApplication, useWebsiteAlumniPodcasts, useAlumniFormFields } from '@/hooks/queries/useWebsiteCMS';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Extract YouTube video ID from various URL formats
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Alumni page with horizontal scrolling testimonials
export default function Alumni() {
  const { data: alumni } = useWebsiteAlumni(true);
  const { data: podcasts } = useWebsiteAlumniPodcasts(true);
  const { data: customFields } = useAlumniFormFields();
  const submitApplication = useSubmitAlumniApplication();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    passing_year: '',
    current_position: '',
    comment: '',
  });
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const featuredAlumni = alumni?.filter(a => a.is_featured) || [];
  const bubbleAlumni = alumni?.filter(a => a.show_in_bubble && a.comment) || [];
  const featuredPodcast = podcasts?.find(p => p.is_featured);
  const otherPodcasts = podcasts?.filter(p => !p.is_featured) || [];
  const enabledCustomFields = customFields?.filter(f => f.is_enabled) || [];

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({ title: 'ছবির সাইজ ২MB এর বেশি হতে পারবে না', variant: 'destructive' });
        return;
      }
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let photoUrl: string | undefined;

      // Upload photo if selected
      if (photoFile) {
        const fileName = `alumni/${Date.now()}_${photoFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const { data, error } = await supabase.storage
          .from('website-assets')
          .upload(fileName, photoFile);
        
        if (error) throw error;
        
        const { data: urlData } = supabase.storage
          .from('website-assets')
          .getPublicUrl(data.path);
        photoUrl = urlData.publicUrl;
      }

      await submitApplication.mutateAsync({
        name: formData.name,
        passing_year: parseInt(formData.passing_year),
        current_position: formData.current_position || undefined,
        comment: formData.comment || undefined,
        photo_url: photoUrl,
      });

      setFormData({ name: '', passing_year: '', current_position: '', comment: '' });
      removePhoto();
    } catch (error: any) {
      toast({ title: 'ত্রুটি', description: error.message, variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#4B0082] to-[#6B2D8B] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-80" />
          <h1 className="text-4xl font-bold font-bengali mb-4">প্রাক্তন ছাত্র</h1>
          <p className="text-lg opacity-80">Alumni Network</p>
        </div>
      </section>

      {/* Featured Alumni Cards */}
      {featuredAlumni.length > 0 && (
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-[#4B0082] font-bengali mb-4">বিশিষ্ট প্রাক্তন ছাত্র</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
              {featuredAlumni.map((person) => (
                <Card key={person.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    {person.photo_url ? (
                      <img 
                        src={person.photo_url} 
                        alt={person.name} 
                        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover ring-4 ring-[#4B0082]/20" 
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-[#4B0082]/20">
                        {person.name.charAt(0)}
                      </div>
                    )}
                    <h3 className="font-bold text-lg font-bengali">{person.name_bn || person.name}</h3>
                    <p className="text-sm text-gray-500">ব্যাচ: {person.passing_year}</p>
                    <p className="text-sm text-[#4B0082] font-medium mt-1">{person.current_position_bn || person.current_position}</p>
                    {person.comment && (
                      <p className="text-sm text-gray-600 mt-3 italic">"{person.comment_bn || person.comment}"</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Animated Bubble Flow Section - 2 Row Scroll (Desktop) / Grid (Mobile) */}
      {bubbleAlumni.length > 0 && (
        <section className="py-12 md:py-20 bg-gradient-to-br from-[#0D0221] via-[#1A0533] to-[#4B0082] relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-32 h-32 bg-[#00D4FF]/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-[#4B0082]/20 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          </div>

          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white font-bengali mb-3 md:mb-4">প্রাক্তনদের কথা</h2>
            <p className="text-white/60 mb-8 md:mb-12 text-sm md:text-base">তাদের স্মৃতি ও অনুভূতি</p>
          </div>

          {/* Mobile Scroll View */}
          <div className="md:hidden relative z-10">
            {/* Mobile Row 1 - Scroll Left */}
            <div className="relative overflow-hidden py-2">
              <div 
                className="flex gap-3 animate-scroll-left hover:[animation-play-state:paused]"
                style={{ width: 'fit-content' }}
              >
                {[...bubbleAlumni.filter((_, i) => i % 2 === 0), ...bubbleAlumni.filter((_, i) => i % 2 === 0)].map((person, index) => (
                  <div
                    key={`mobile-row1-${person.id}-${index}`}
                    className="flex-shrink-0 bg-white/10 backdrop-blur-md rounded-xl p-3 w-[140px] border border-white/20 shadow-xl"
                  >
                    {person.photo_url ? (
                      <img 
                        src={person.photo_url} 
                        alt={person.name}
                        className="w-14 h-14 rounded-lg mx-auto mb-2 object-cover ring-2 ring-white/30"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg mx-auto mb-2 bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center text-white text-lg font-bold ring-2 ring-white/30">
                        {person.name.charAt(0)}
                      </div>
                    )}
                    <p className="text-white text-[10px] font-bengali leading-relaxed text-center line-clamp-2 min-h-[28px]">
                      "{(person.comment_bn || person.comment || '').slice(0, 40)}..."
                    </p>
                    <div className="mt-1.5 pt-1.5 border-t border-white/10 text-center">
                      <p className="text-[#00D4FF] text-[10px] font-medium truncate">{person.name_bn || person.name}</p>
                      <p className="text-white/50 text-[8px]">ব্যাচ {person.passing_year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Row 2 - Scroll Right */}
            <div className="relative overflow-hidden py-2 mt-2">
              <div 
                className="flex gap-3 animate-scroll-right hover:[animation-play-state:paused]"
                style={{ width: 'fit-content' }}
              >
                {[...bubbleAlumni.filter((_, i) => i % 2 === 1), ...bubbleAlumni.filter((_, i) => i % 2 === 1)].map((person, index) => (
                  <div
                    key={`mobile-row2-${person.id}-${index}`}
                    className="flex-shrink-0 bg-white/10 backdrop-blur-md rounded-xl p-3 w-[140px] border border-white/20 shadow-xl"
                  >
                    {person.photo_url ? (
                      <img 
                        src={person.photo_url} 
                        alt={person.name}
                        className="w-14 h-14 rounded-lg mx-auto mb-2 object-cover ring-2 ring-white/30"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg mx-auto mb-2 bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center text-white text-lg font-bold ring-2 ring-white/30">
                        {person.name.charAt(0)}
                      </div>
                    )}
                    <p className="text-white text-[10px] font-bengali leading-relaxed text-center line-clamp-2 min-h-[28px]">
                      "{(person.comment_bn || person.comment || '').slice(0, 40)}..."
                    </p>
                    <div className="mt-1.5 pt-1.5 border-t border-white/10 text-center">
                      <p className="text-[#00D4FF] text-[10px] font-medium truncate">{person.name_bn || person.name}</p>
                      <p className="text-white/50 text-[8px]">ব্যাচ {person.passing_year}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop: Row 1 - Scroll Left */}
          <div className="hidden md:block relative overflow-hidden py-4">
            <div 
              className="flex gap-8 animate-scroll-left hover:[animation-play-state:paused]"
              style={{ width: 'fit-content' }}
            >
              {/* Duplicate even-indexed alumni for seamless loop */}
              {[...bubbleAlumni.filter((_, i) => i % 2 === 0), ...bubbleAlumni.filter((_, i) => i % 2 === 0)].map((person, index) => (
                <div
                  key={`row1-${person.id}-${index}`}
                  className="flex-shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-6 w-[300px] border border-white/20 shadow-2xl hover:bg-white/20 hover:scale-105 transition-all duration-300 group cursor-default"
                >
                  {person.photo_url ? (
                    <img 
                      src={person.photo_url} 
                      alt={person.name}
                      className="w-32 h-32 rounded-2xl mx-auto mb-4 object-cover ring-4 ring-white/30 group-hover:ring-[#00D4FF]/60 transition-all shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl mx-auto mb-4 bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center text-white text-4xl font-bold ring-4 ring-white/30">
                      {person.name.charAt(0)}
                    </div>
                  )}
                  <p className="text-white text-sm font-bengali leading-relaxed text-center min-h-[60px]">
                    "{(person.comment_bn || person.comment || '').slice(0, 80)}{(person.comment_bn || person.comment || '').length > 80 ? '...' : ''}"
                  </p>
                  <div className="mt-4 pt-3 border-t border-white/10 text-center">
                    <p className="text-[#00D4FF] text-base font-medium">{person.name_bn || person.name}</p>
                    <p className="text-white/50 text-sm">ব্যাচ {person.passing_year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: Row 2 - Scroll Right (opposite direction, slightly slower) */}
          <div className="hidden md:block relative overflow-hidden py-4 mt-4">
            <div 
              className="flex gap-8 animate-scroll-right hover:[animation-play-state:paused]"
              style={{ width: 'fit-content' }}
            >
              {/* Duplicate odd-indexed alumni for seamless loop */}
              {[...bubbleAlumni.filter((_, i) => i % 2 === 1), ...bubbleAlumni.filter((_, i) => i % 2 === 1)].map((person, index) => (
                <div
                  key={`row2-${person.id}-${index}`}
                  className="flex-shrink-0 bg-white/10 backdrop-blur-md rounded-2xl p-6 w-[300px] border border-white/20 shadow-2xl hover:bg-white/20 hover:scale-105 transition-all duration-300 group cursor-default"
                >
                  {person.photo_url ? (
                    <img 
                      src={person.photo_url} 
                      alt={person.name}
                      className="w-32 h-32 rounded-2xl mx-auto mb-4 object-cover ring-4 ring-white/30 group-hover:ring-[#00D4FF]/60 transition-all shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-2xl mx-auto mb-4 bg-gradient-to-br from-[#4B0082] to-[#6B2D8B] flex items-center justify-center text-white text-4xl font-bold ring-4 ring-white/30">
                      {person.name.charAt(0)}
                    </div>
                  )}
                  <p className="text-white text-sm font-bengali leading-relaxed text-center min-h-[60px]">
                    "{(person.comment_bn || person.comment || '').slice(0, 80)}{(person.comment_bn || person.comment || '').length > 80 ? '...' : ''}"
                  </p>
                  <div className="mt-4 pt-3 border-t border-white/10 text-center">
                    <p className="text-[#00D4FF] text-base font-medium">{person.name_bn || person.name}</p>
                    <p className="text-white/50 text-sm">ব্যাচ {person.passing_year}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* YouTube Podcast Section */}
      {podcasts && podcasts.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
                <Youtube className="w-4 h-4" />
                YouTube
              </div>
              <h2 className="text-3xl font-bold text-[#4B0082] font-bengali mb-4">প্রাক্তনদের সাথে আলাপচারিতা</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-red-500 mx-auto rounded-full" />
            </div>

            {/* Featured Video */}
            {featuredPodcast && (
              <div className="max-w-4xl mx-auto mb-12">
                <Card className="overflow-hidden border-0 shadow-xl">
                  <AspectRatio ratio={16 / 9}>
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(featuredPodcast.youtube_url)}`}
                      title={featuredPodcast.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </AspectRatio>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-xl font-bengali text-[#4B0082]">
                      {featuredPodcast.title_bn || featuredPodcast.title}
                    </h3>
                    {featuredPodcast.description && (
                      <p className="text-gray-600 mt-2">{featuredPodcast.description_bn || featuredPodcast.description}</p>
                    )}
                    {featuredPodcast.alumni && (
                      <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                        <Users className="w-4 h-4" />
                        সাথে {featuredPodcast.alumni.name_bn || featuredPodcast.alumni.name}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Other Videos Grid */}
            {otherPodcasts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {otherPodcasts.map((podcast) => {
                  const videoId = getYouTubeVideoId(podcast.youtube_url);
                  return (
                    <Card key={podcast.id} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all group cursor-pointer">
                      <a 
                        href={podcast.youtube_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <div className="relative">
                          <AspectRatio ratio={16 / 9}>
                            <img
                              src={podcast.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                              alt={podcast.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                              }}
                            />
                          </AspectRatio>
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                              <Play className="w-5 h-5 text-white ml-1" />
                            </div>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-medium text-sm font-bengali line-clamp-2">
                            {podcast.title_bn || podcast.title}
                          </h4>
                        </CardContent>
                      </a>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Application Form */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#4B0082] font-bengali mb-4">প্রাক্তন নেটওয়ার্কে যোগ দিন</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#4B0082] to-[#00D4FF] mx-auto rounded-full" />
            </div>
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Photo Upload */}
                  <div className="flex flex-col items-center mb-6">
                    <Label className="mb-2 font-bengali">ছবি (ঐচ্ছিক)</Label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    {photoPreview ? (
                      <div className="relative">
                        <img 
                          src={photoPreview} 
                          alt="Preview" 
                          className="w-24 h-24 rounded-full object-cover ring-4 ring-[#4B0082]/20"
                        />
                        <button
                          type="button"
                          onClick={removePhoto}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 hover:border-[#4B0082] hover:bg-[#4B0082]/5 transition-colors"
                      >
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                        <span className="text-xs text-gray-400">আপলোড</span>
                      </button>
                    )}
                    <p className="text-xs text-gray-500 mt-2">সর্বোচ্চ ২MB</p>
                  </div>

                  <div>
                    <Label className="font-bengali">নাম *</Label>
                    <Input 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      required 
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="font-bengali">পাসের বছর *</Label>
                    <Input 
                      type="number" 
                      value={formData.passing_year} 
                      onChange={(e) => setFormData({...formData, passing_year: e.target.value})} 
                      required 
                      min="1900"
                      max={new Date().getFullYear()}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="font-bengali">বর্তমান পদবি</Label>
                    <Input 
                      value={formData.current_position} 
                      onChange={(e) => setFormData({...formData, current_position: e.target.value})} 
                      placeholder="যেমন: সফটওয়্যার ইঞ্জিনিয়ার, গুগল"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="font-bengali">মন্তব্য / স্মৃতিচারণ</Label>
                    <Textarea 
                      value={formData.comment} 
                      onChange={(e) => setFormData({...formData, comment: e.target.value})} 
                      placeholder="আপনার স্কুল জীবনের কোন স্মৃতি শেয়ার করুন..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  {/* Dynamic Custom Fields */}
                  {enabledCustomFields.map((field) => (
                    <div key={field.id}>
                      <Label className="font-bengali">
                        {field.field_label_bn || field.field_label}
                        {field.is_required && ' *'}
                      </Label>
                      {field.field_type === 'textarea' ? (
                        <Textarea
                          value={customFieldValues[field.field_name] || ''}
                          onChange={(e) => setCustomFieldValues({
                            ...customFieldValues,
                            [field.field_name]: e.target.value
                          })}
                          placeholder={field.placeholder_bn || field.placeholder || ''}
                          required={field.is_required}
                          rows={3}
                          className="mt-1"
                        />
                      ) : (
                        <Input
                          type={field.field_type === 'number' ? 'number' : field.field_type === 'email' ? 'email' : field.field_type === 'phone' ? 'tel' : 'text'}
                          value={customFieldValues[field.field_name] || ''}
                          onChange={(e) => setCustomFieldValues({
                            ...customFieldValues,
                            [field.field_name]: e.target.value
                          })}
                          placeholder={field.placeholder_bn || field.placeholder || ''}
                          required={field.is_required}
                          className="mt-1"
                        />
                      )}
                    </div>
                  ))}

                  <Button 
                    type="submit" 
                    className="w-full bg-[#4B0082] hover:bg-[#3a0066]" 
                    disabled={submitApplication.isPending || isUploading}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {isUploading ? 'আপলোড হচ্ছে...' : submitApplication.isPending ? 'জমা হচ্ছে...' : 'জমা দিন'}
                  </Button>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    আপনার আবেদন অনুমোদনের পর প্রদর্শিত হবে
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
