import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { MessageSquare, Save, RefreshCw, Send, Phone, MessageCircle, Users, Bell, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAcademicYear } from '@/hooks/useAcademicYear';

interface SmsSettingsData {
  id: string;
  api_key: string | null;
  sender_id: string | null;
  balance: number | null;
  is_enabled: boolean;
  absent_sms_enabled: boolean;
  monthly_summary_enabled: boolean;
  sms_template: string | null;
  // Punch SMS
  punch_sms_enabled: boolean;
  punch_sms_template: string | null;
  // Late SMS
  late_sms_enabled: boolean;
  late_sms_template: string | null;
  // WhatsApp
  whatsapp_enabled: boolean;
  whatsapp_phone_number_id: string | null;
  whatsapp_access_token: string | null;
  whatsapp_business_account_id: string | null;
  whatsapp_fallback_to_sms: boolean;
  preferred_channel: string;
}

interface ClassData {
  id: string;
  name: string;
  name_bn: string | null;
}

interface SectionData {
  id: string;
  name: string;
  name_bn: string | null;
  class_id: string;
}

export default function SmsSettings() {
  const { activeYear } = useAcademicYear();
  const [settings, setSettings] = useState<SmsSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Custom Notice state
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [customMessage, setCustomMessage] = useState('');
  const [recipientCount, setRecipientCount] = useState(0);
  const [sendingNotice, setSendingNotice] = useState(false);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('sms_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      
      // Set defaults for new fields if null
      if (data) {
        setSettings({
          ...data,
          punch_sms_enabled: data.punch_sms_enabled ?? false,
          punch_sms_template: data.punch_sms_template ?? 'প্রিয় অভিভাবক, আপনার সন্তান {{StudentName}} ({{Class}}) আজ {{Date}} সকাল {{Time}} এ স্কুলে এসেছে। - {{SchoolName}}',
          late_sms_enabled: data.late_sms_enabled ?? false,
          late_sms_template: data.late_sms_template ?? 'প্রিয় অভিভাবক, আপনার সন্তান {{StudentName}} ({{Class}}) আজ {{Date}} স্কুলে {{LateMinutes}} মিনিট দেরিতে এসেছে। - {{SchoolName}}',
          whatsapp_enabled: data.whatsapp_enabled ?? false,
          whatsapp_phone_number_id: data.whatsapp_phone_number_id ?? null,
          whatsapp_access_token: data.whatsapp_access_token ?? null,
          whatsapp_business_account_id: data.whatsapp_business_account_id ?? null,
          whatsapp_fallback_to_sms: data.whatsapp_fallback_to_sms ?? true,
          preferred_channel: data.preferred_channel ?? 'sms_only',
        });
      }
    } catch (error) {
      console.error('Error fetching SMS settings:', error);
      toast.error('Failed to load SMS settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchClassesAndSections = async () => {
    try {
      const [classRes, sectionRes] = await Promise.all([
        supabase.from('classes').select('id, name, name_bn').eq('is_active', true).order('grade_order'),
        supabase.from('sections').select('id, name, name_bn, class_id').eq('is_active', true),
      ]);
      
      if (classRes.data) setClasses(classRes.data);
      if (sectionRes.data) setSections(sectionRes.data);
    } catch (error) {
      console.error('Error fetching classes/sections:', error);
    }
  };

  const fetchRecipientCount = async () => {
    if (!activeYear) return;
    
    try {
      let query = supabase
        .from('students')
        .select('id', { count: 'exact', head: true })
        .eq('academic_year_id', activeYear.id)
        .eq('is_active', true)
        .not('guardian_mobile', 'is', null);
      
      if (selectedClass !== 'all') {
        query = query.eq('class_id', selectedClass);
      }
      if (selectedSection !== 'all') {
        query = query.eq('section_id', selectedSection);
      }
      
      const { count } = await query;
      setRecipientCount(count || 0);
    } catch (error) {
      console.error('Error fetching recipient count:', error);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchClassesAndSections();
  }, []);

  useEffect(() => {
    fetchRecipientCount();
  }, [selectedClass, selectedSection, activeYear]);

  const handleSave = async () => {
    if (!settings) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('sms_settings')
        .update({
          api_key: settings.api_key,
          sender_id: settings.sender_id,
          is_enabled: settings.is_enabled,
          absent_sms_enabled: settings.absent_sms_enabled,
          monthly_summary_enabled: settings.monthly_summary_enabled,
          sms_template: settings.sms_template,
          punch_sms_enabled: settings.punch_sms_enabled,
          punch_sms_template: settings.punch_sms_template,
          late_sms_enabled: settings.late_sms_enabled,
          late_sms_template: settings.late_sms_template,
          whatsapp_enabled: settings.whatsapp_enabled,
          whatsapp_phone_number_id: settings.whatsapp_phone_number_id,
          whatsapp_access_token: settings.whatsapp_access_token,
          whatsapp_business_account_id: settings.whatsapp_business_account_id,
          whatsapp_fallback_to_sms: settings.whatsapp_fallback_to_sms,
          preferred_channel: settings.preferred_channel,
        })
        .eq('id', settings.id);

      if (error) throw error;
      toast.success('সেটিংস সংরক্ষণ হয়েছে');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof SmsSettingsData, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const handleSendCustomNotice = async () => {
    if (!customMessage.trim()) {
      toast.error('মেসেজ লিখুন');
      return;
    }
    
    if (recipientCount === 0) {
      toast.error('কোনো প্রাপক পাওয়া যায়নি');
      return;
    }

    if (!activeYear) {
      toast.error('একাডেমিক বছর সিলেক্ট করুন');
      return;
    }
    
    setSendingNotice(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-sms', {
        body: {
          sms_type: 'custom_notice',
          message: customMessage,
          class_id: selectedClass !== 'all' ? selectedClass : null,
          section_id: selectedSection !== 'all' ? selectedSection : null,
          academic_year_id: activeYear.id,
        },
      });

      if (error) throw error;
      
      toast.success(`${data.sent || 0} জনকে মেসেজ পাঠানো হয়েছে`);
      setCustomMessage('');
    } catch (error: any) {
      toast.error(error.message || 'মেসেজ পাঠাতে সমস্যা হয়েছে');
    } finally {
      setSendingNotice(false);
    }
  };

  const filteredSections = selectedClass !== 'all' 
    ? sections.filter(s => s.class_id === selectedClass)
    : [];

  if (loading) {
    return (
      <MainLayout title="SMS Settings" titleBn="মেসেজিং সেটিংস">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Messaging Settings" titleBn="মেসেজিং সেটিংস">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-info" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Messaging Settings</h2>
            <p className="text-sm text-muted-foreground font-bengali">SMS ও WhatsApp সেটিংস</p>
          </div>
        </div>

        <Button variant="hero" className="gap-2" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
        </Button>
      </div>

      <Tabs defaultValue="api" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="api" className="gap-2">
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">API</span>
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </TabsTrigger>
          <TabsTrigger value="punch" className="gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">পাঞ্চ</span>
          </TabsTrigger>
          <TabsTrigger value="absent" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">অনুপস্থিত</span>
          </TabsTrigger>
          <TabsTrigger value="custom" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">নোটিস</span>
          </TabsTrigger>
        </TabsList>

        {/* API Settings Tab */}
        <TabsContent value="api">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* mimSMS API Configuration */}
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold mb-4">mimSMS API</h3>
              <p className="text-sm text-muted-foreground mb-6 font-bengali">এসএমএস এপিআই কনফিগারেশন</p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>API Key</Label>
                  <Input
                    type="password"
                    placeholder="Enter mimSMS API Key"
                    value={settings?.api_key || ''}
                    onChange={(e) => updateSetting('api_key', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sender ID</Label>
                  <Input
                    placeholder="Enter Sender ID"
                    value={settings?.sender_id || ''}
                    onChange={(e) => updateSetting('sender_id', e.target.value)}
                  />
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Current Balance</p>
                      <p className="text-sm text-muted-foreground font-bengali">বর্তমান ব্যালেন্স</p>
                    </div>
                    <p className="text-2xl font-bold text-primary">৳{settings?.balance || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Channel Preference */}
            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold mb-4">মেসেজিং চ্যানেল</h3>
              <p className="text-sm text-muted-foreground mb-6 font-bengali">কোন মাধ্যমে মেসেজ পাঠাবেন</p>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">মেসেজিং সিস্টেম</p>
                    <p className="text-sm text-muted-foreground font-bengali">মাস্টার সুইচ</p>
                  </div>
                  <Switch
                    checked={settings?.is_enabled || false}
                    onCheckedChange={(checked) => updateSetting('is_enabled', checked)}
                  />
                </div>

                <div className="border-t pt-4">
                  <Label className="mb-3 block">পছন্দের চ্যানেল</Label>
                  <RadioGroup
                    value={settings?.preferred_channel || 'sms_only'}
                    onValueChange={(value) => updateSetting('preferred_channel', value)}
                    className="space-y-3"
                  >
                    <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="whatsapp_first" id="whatsapp_first" className="mt-1" />
                      <div>
                        <Label htmlFor="whatsapp_first" className="font-medium cursor-pointer">
                          WhatsApp প্রথম
                        </Label>
                        <p className="text-sm text-muted-foreground font-bengali">
                          প্রথমে WhatsApp, ব্যর্থ হলে SMS
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="sms_only" id="sms_only" className="mt-1" />
                      <div>
                        <Label htmlFor="sms_only" className="font-medium cursor-pointer">
                          শুধু SMS
                        </Label>
                        <p className="text-sm text-muted-foreground font-bengali">
                          শুধুমাত্র mimSMS ব্যবহার করুন
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="whatsapp_only" id="whatsapp_only" className="mt-1" />
                      <div>
                        <Label htmlFor="whatsapp_only" className="font-medium cursor-pointer">
                          শুধু WhatsApp
                        </Label>
                        <p className="text-sm text-muted-foreground font-bengali">
                          শুধুমাত্র WhatsApp ব্যবহার করুন
                        </p>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* WhatsApp Settings Tab */}
        <TabsContent value="whatsapp">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">Meta WhatsApp Cloud API</h3>
                  <p className="text-sm text-muted-foreground font-bengali">হোয়াটসঅ্যাপ কনফিগারেশন</p>
                </div>
                <Switch
                  checked={settings?.whatsapp_enabled || false}
                  onCheckedChange={(checked) => updateSetting('whatsapp_enabled', checked)}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Phone Number ID</Label>
                  <Input
                    placeholder="Enter WhatsApp Phone Number ID"
                    value={settings?.whatsapp_phone_number_id || ''}
                    onChange={(e) => updateSetting('whatsapp_phone_number_id', e.target.value)}
                    disabled={!settings?.whatsapp_enabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Access Token</Label>
                  <Input
                    type="password"
                    placeholder="Enter Access Token"
                    value={settings?.whatsapp_access_token || ''}
                    onChange={(e) => updateSetting('whatsapp_access_token', e.target.value)}
                    disabled={!settings?.whatsapp_enabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Business Account ID</Label>
                  <Input
                    placeholder="Enter Business Account ID"
                    value={settings?.whatsapp_business_account_id || ''}
                    onChange={(e) => updateSetting('whatsapp_business_account_id', e.target.value)}
                    disabled={!settings?.whatsapp_enabled}
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="font-medium">SMS Fallback</p>
                    <p className="text-sm text-muted-foreground font-bengali">WhatsApp ব্যর্থ হলে SMS পাঠান</p>
                  </div>
                  <Switch
                    checked={settings?.whatsapp_fallback_to_sms || false}
                    onCheckedChange={(checked) => updateSetting('whatsapp_fallback_to_sms', checked)}
                    disabled={!settings?.whatsapp_enabled}
                  />
                </div>
              </div>
            </div>

            <div className="card-elevated p-6">
              <h3 className="text-lg font-semibold mb-4">সেটআপ গাইড</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
                  <p className="font-bengali">Facebook Business Account তৈরি করুন</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</span>
                  <p className="font-bengali">developers.facebook.com এ যান</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</span>
                  <p className="font-bengali">নতুন App তৈরি করুন (Business Type)</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">4</span>
                  <p className="font-bengali">WhatsApp প্রোডাক্ট যোগ করুন</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">5</span>
                  <p className="font-bengali">Phone Number ID ও Access Token কপি করুন</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-success/10 rounded-lg">
                <p className="text-sm font-medium text-success">ফ্রি টায়ার সুবিধা</p>
                <p className="text-sm text-muted-foreground font-bengali mt-1">
                  প্রতি মাসে ১,০০০ ফ্রি কনভার্সেশন
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Punch SMS Tab */}
        <TabsContent value="punch">
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">পাঞ্চ SMS</h3>
                <p className="text-sm text-muted-foreground font-bengali">শিক্ষার্থী পাঞ্চ করলে সাথে সাথে মেসেজ</p>
              </div>
              <Switch
                checked={settings?.punch_sms_enabled || false}
                onCheckedChange={(checked) => updateSetting('punch_sms_enabled', checked)}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>পাঞ্চ SMS টেমপ্লেট</Label>
                <Textarea
                  rows={4}
                  placeholder="Enter SMS template..."
                  value={settings?.punch_sms_template || ''}
                  onChange={(e) => updateSetting('punch_sms_template', e.target.value)}
                  className="font-bengali"
                  disabled={!settings?.punch_sms_enabled}
                />
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium mb-2">Available Variables:</p>
                <div className="flex flex-wrap gap-2">
                  {['{{StudentName}}', '{{Class}}', '{{Date}}', '{{Time}}', '{{SchoolName}}'].map((variable) => (
                    <code key={variable} className="px-2 py-1 bg-background rounded text-sm">
                      {variable}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Absent/Late SMS Tab */}
        <TabsContent value="absent">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Absent SMS */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">অনুপস্থিত SMS</h3>
                  <p className="text-sm text-muted-foreground font-bengali">পাঞ্চ না করলে অটো মেসেজ</p>
                </div>
                <Switch
                  checked={settings?.absent_sms_enabled || false}
                  onCheckedChange={(checked) => updateSetting('absent_sms_enabled', checked)}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>অনুপস্থিত SMS টেমপ্লেট</Label>
                  <Textarea
                    rows={4}
                    placeholder="Enter SMS template..."
                    value={settings?.sms_template || ''}
                    onChange={(e) => updateSetting('sms_template', e.target.value)}
                    className="font-bengali"
                    disabled={!settings?.absent_sms_enabled}
                  />
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Available Variables:</p>
                  <div className="flex flex-wrap gap-2">
                    {['{{StudentName}}', '{{Class}}', '{{Date}}', '{{SchoolName}}'].map((variable) => (
                      <code key={variable} className="px-2 py-1 bg-background rounded text-sm">
                        {variable}
                      </code>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Late SMS */}
            <div className="card-elevated p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">লেট SMS</h3>
                  <p className="text-sm text-muted-foreground font-bengali">দেরিতে আসলে মেসেজ</p>
                </div>
                <Switch
                  checked={settings?.late_sms_enabled || false}
                  onCheckedChange={(checked) => updateSetting('late_sms_enabled', checked)}
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>লেট SMS টেমপ্লেট</Label>
                  <Textarea
                    rows={4}
                    placeholder="Enter SMS template..."
                    value={settings?.late_sms_template || ''}
                    onChange={(e) => updateSetting('late_sms_template', e.target.value)}
                    className="font-bengali"
                    disabled={!settings?.late_sms_enabled}
                  />
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Available Variables:</p>
                  <div className="flex flex-wrap gap-2">
                    {['{{StudentName}}', '{{Class}}', '{{Date}}', '{{LateMinutes}}', '{{SchoolName}}'].map((variable) => (
                      <code key={variable} className="px-2 py-1 bg-background rounded text-sm">
                        {variable}
                      </code>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Summary */}
            <div className="card-elevated p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">মাসিক সামারি SMS</h3>
                  <p className="text-sm text-muted-foreground font-bengali">মাসের শেষে উপস্থিতির সামারি</p>
                </div>
                <Switch
                  checked={settings?.monthly_summary_enabled || false}
                  onCheckedChange={(checked) => updateSetting('monthly_summary_enabled', checked)}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Custom Notice Tab */}
        <TabsContent value="custom">
          <div className="card-elevated p-6">
            <h3 className="text-lg font-semibold mb-2">কাস্টম নোটিস পাঠান</h3>
            <p className="text-sm text-muted-foreground mb-6 font-bengali">
              ক্লাস, শাখা বা পুরো স্কুলে একসাথে নোটিস পাঠান
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>প্রাপক নির্বাচন</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={selectedClass} onValueChange={(v) => {
                      setSelectedClass(v);
                      setSelectedSection('all');
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="ক্লাস সিলেক্ট করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">সব ক্লাস</SelectItem>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name_bn || cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select 
                      value={selectedSection} 
                      onValueChange={setSelectedSection}
                      disabled={selectedClass === 'all'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="শাখা সিলেক্ট করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">সব শাখা</SelectItem>
                        {filteredSections.map((sec) => (
                          <SelectItem key={sec.id} value={sec.id}>
                            {sec.name_bn || sec.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>মেসেজ লিখুন</Label>
                  <Textarea
                    rows={6}
                    placeholder="আপনার নোটিস এখানে লিখুন..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="font-bengali"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-6 bg-muted rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground font-bengali">মোট প্রাপক</p>
                    <p className="text-4xl font-bold text-primary mt-2">{recipientCount}</p>
                    <p className="text-sm text-muted-foreground font-bengali mt-1">জন অভিভাবক</p>
                  </div>
                </div>

                <div className="p-4 bg-warning/10 rounded-lg">
                  <p className="text-sm font-medium text-warning">খরচের হিসাব</p>
                  <p className="text-sm text-muted-foreground font-bengali mt-1">
                    আনুমানিক SMS: {recipientCount} × ০.৫০ = ৳{(recipientCount * 0.5).toFixed(2)}
                  </p>
                </div>

                <Button 
                  className="w-full gap-2" 
                  onClick={handleSendCustomNotice}
                  disabled={sendingNotice || !customMessage.trim() || recipientCount === 0}
                >
                  <Send className="w-4 h-4" />
                  {sendingNotice ? 'পাঠানো হচ্ছে...' : 'নোটিস পাঠান'}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
