import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function CompleteProfile() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.user_metadata?.full_name || '',
    phone: '',
    address: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.phone || !form.address) {
      toast.error('সকল তথ্য পূরণ করুন');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: form.full_name,
          phone: form.phone,
          address: form.address,
          is_profile_complete: true,
        })
        .eq('user_id', user!.id);

      if (error) throw error;
      toast.success('প্রোফাইল সম্পূর্ণ হয়েছে!');
      // Force reload to update auth state
      window.location.href = '/dashboard';
    } catch (e: any) {
      toast.error(e.message || 'প্রোফাইল আপডেট ব্যর্থ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bengali">প্রোফাইল সম্পূর্ণ করুন</CardTitle>
          <CardDescription className="font-bengali">
            কাজ শুরু করার আগে আপনার তথ্য পূরণ করুন
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="font-bengali">পুরো নাম *</Label>
              <Input
                value={form.full_name}
                onChange={e => setForm({ ...form, full_name: e.target.value })}
                placeholder="আপনার পুরো নাম"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bengali">ফোন নম্বর *</Label>
              <Input
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="01XXXXXXXXX"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="font-bengali">ঠিকানা *</Label>
              <Input
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                placeholder="আপনার ঠিকানা লিখুন"
                required
              />
            </div>
            <Button type="submit" className="w-full gap-2" disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              প্রোফাইল সংরক্ষণ করুন
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
