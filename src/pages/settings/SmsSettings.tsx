import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Save, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SmsSettingsData {
  id: string;
  api_key: string | null;
  sender_id: string | null;
  balance: number | null;
  is_enabled: boolean;
  absent_sms_enabled: boolean;
  monthly_summary_enabled: boolean;
  sms_template: string | null;
}

export default function SmsSettings() {
  const [settings, setSettings] = useState<SmsSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('sms_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching SMS settings:', error);
      toast.error('Failed to load SMS settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

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
        })
        .eq('id', settings.id);

      if (error) throw error;
      toast.success('SMS settings saved successfully');
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

  if (loading) {
    return (
      <MainLayout title="SMS Settings" titleBn="এসএমএস সেটিংস">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="SMS Settings" titleBn="এসএমএস সেটিংস">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-info/10 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-info" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">SMS Settings (mimSMS)</h2>
            <p className="text-sm text-muted-foreground font-bengali">এসএমএস সেটিংস পরিচালনা</p>
          </div>
        </div>

        <Button variant="hero" className="gap-2" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Configuration */}
        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold mb-4">API Configuration</h3>
          <p className="text-sm text-muted-foreground mb-6 font-bengali">এপিআই কনফিগারেশন</p>

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

        {/* SMS Toggles */}
        <div className="card-elevated p-6">
          <h3 className="text-lg font-semibold mb-4">SMS Controls</h3>
          <p className="text-sm text-muted-foreground mb-6 font-bengali">এসএমএস নিয়ন্ত্রণ</p>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS System</p>
                <p className="text-sm text-muted-foreground font-bengali">এসএমএস সিস্টেম চালু/বন্ধ</p>
              </div>
              <Switch
                checked={settings?.is_enabled || false}
                onCheckedChange={(checked) => updateSetting('is_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Absent SMS</p>
                <p className="text-sm text-muted-foreground font-bengali">অনুপস্থিতি এসএমএস</p>
              </div>
              <Switch
                checked={settings?.absent_sms_enabled || false}
                onCheckedChange={(checked) => updateSetting('absent_sms_enabled', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Monthly Summary</p>
                <p className="text-sm text-muted-foreground font-bengali">মাসিক রিপোর্ট এসএমএস</p>
              </div>
              <Switch
                checked={settings?.monthly_summary_enabled || false}
                onCheckedChange={(checked) => updateSetting('monthly_summary_enabled', checked)}
              />
            </div>
          </div>
        </div>

        {/* SMS Template */}
        <div className="card-elevated p-6 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">SMS Template</h3>
          <p className="text-sm text-muted-foreground mb-6 font-bengali">এসএমএস টেমপ্লেট</p>

          <div className="space-y-4">
            <Textarea
              rows={4}
              placeholder="Enter SMS template..."
              value={settings?.sms_template || ''}
              onChange={(e) => updateSetting('sms_template', e.target.value)}
              className="font-bengali"
            />

            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-2">Available Variables:</p>
              <div className="flex flex-wrap gap-2">
                {['{{StudentName}}', '{{Class}}', '{{Date}}', '{{PresentDays}}', '{{SchoolName}}'].map((variable) => (
                  <code key={variable} className="px-2 py-1 bg-background rounded text-sm">
                    {variable}
                  </code>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
