import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFeatureFlags, useFinanceMode, useToggleFeature, useSetFinanceMode } from '@/hooks/queries/useFinanceFeatures';
import { toast } from '@/hooks/use-toast';
import { Settings, Zap, Shield, BarChart3, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURE_LABELS: Record<string, { label: string; labelBn: string; description: string }> = {
  online_payment: { label: 'Online Payment', labelBn: 'অনলাইন পেমেন্ট', description: 'bKash, Nagad, Card payment integration' },
  sms_module: { label: 'SMS Module', labelBn: 'এসএমএস মডিউল', description: 'SMS notifications for fees & attendance' },
  ledger_system: { label: 'Ledger System', labelBn: 'লেজার সিস্টেম', description: 'Full double-entry ledger tracking' },
  revenue_dashboard: { label: 'Revenue Dashboard', labelBn: 'রেভিনিউ ড্যাশবোর্ড', description: 'Revenue analytics & charts' },
  inventory_sales: { label: 'Inventory Sales', labelBn: 'ইনভেন্টরি বিক্রয়', description: 'POS inventory sales with fee collection' },
  fine_system: { label: 'Fine System', labelBn: 'জরিমানা সিস্টেম', description: 'Late fine auto-calculation' },
  audit_log: { label: 'Audit Log', labelBn: 'অডিট লগ', description: 'Track all financial transactions' },
  bank_payment: { label: 'Bank Payment', labelBn: 'ব্যাংক পেমেন্ট', description: 'Bank deposit/transfer tracking' },
  mobile_payment: { label: 'Mobile Payment', labelBn: 'মোবাইল পেমেন্ট', description: 'Mobile banking payment tracking' },
};

const MODES = [
  { key: 'SIMPLE_MODE', label: 'Simple', labelBn: 'সিম্পল', icon: Settings, description: 'Cash only, basic reports', color: 'bg-blue-500' },
  { key: 'STANDARD_MODE', label: 'Standard', labelBn: 'স্ট্যান্ডার্ড', icon: Zap, description: 'Payment tracking, daily summary', color: 'bg-amber-500' },
  { key: 'PRO_MODE', label: 'Pro', labelBn: 'প্রো', icon: BarChart3, description: 'Ledger, audit log, analytics', color: 'bg-emerald-500' },
];

export default function FinanceControlPanel() {
  const { data: flags, isLoading: flagsLoading } = useFeatureFlags();
  const { data: financeMode, isLoading: modeLoading } = useFinanceMode();
  const toggleFeature = useToggleFeature();
  const setFinanceMode = useSetFinanceMode();
  const [settingMode, setSettingMode] = useState(false);

  const handleToggle = (id: string, enabled: boolean) => {
    toggleFeature.mutate({ id, enabled }, {
      onSuccess: () => toast({ title: enabled ? 'ফিচার সক্রিয় করা হয়েছে' : 'ফিচার নিষ্ক্রিয় করা হয়েছে' }),
    });
  };

  const handleModeChange = async (mode: string) => {
    if (!financeMode) return;
    setSettingMode(true);
    setFinanceMode.mutate({ id: financeMode.id, mode }, {
      onSuccess: () => {
        toast({ title: `${mode.replace('_', ' ')} মোড সক্রিয় করা হয়েছে` });
        setSettingMode(false);
      },
      onError: () => setSettingMode(false),
    });
  };

  if (flagsLoading || modeLoading) {
    return (
      <MainLayout title="Finance Control Panel" titleBn="ফাইন্যান্স কন্ট্রোল">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Finance Control Panel" titleBn="ফাইন্যান্স কন্ট্রোল">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" />
            Finance Control Panel
          </h1>
          <p className="text-muted-foreground font-bengali">ফাইন্যান্স কন্ট্রোল প্যানেল — ফিচার টগল ও মোড সিলেক্ট করুন</p>
        </div>

        {/* Finance Mode Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bengali">ফাইন্যান্স মোড</CardTitle>
            <CardDescription>মোড পরিবর্তন করলে স্বয়ংক্রিয়ভাবে সংশ্লিষ্ট ফিচার সক্রিয়/নিষ্ক্রিয় হবে</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {MODES.map(m => {
                const Icon = m.icon;
                const isActive = financeMode?.mode === m.key;
                return (
                  <button
                    key={m.key}
                    onClick={() => handleModeChange(m.key)}
                    disabled={settingMode}
                    className={cn(
                      'p-4 rounded-xl border-2 text-left transition-all',
                      isActive ? 'border-primary bg-primary/5 shadow-md' : 'border-border hover:border-primary/40'
                    )}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-white', m.color)}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{m.label}</p>
                        <p className="text-xs font-bengali text-muted-foreground">{m.labelBn}</p>
                      </div>
                      {isActive && <Badge className="ml-auto">Active</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{m.description}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Feature Flags */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bengali">ফিচার টগল</CardTitle>
            <CardDescription>পৃথক ফিচার সক্রিয় বা নিষ্ক্রিয় করুন</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {flags?.map(flag => {
                const meta = FEATURE_LABELS[flag.feature_key];
                return (
                  <div key={flag.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors">
                    <div>
                      <p className="font-medium">{meta?.label || flag.feature_key}</p>
                      <p className="text-xs font-bengali text-muted-foreground">{meta?.labelBn}</p>
                      <p className="text-xs text-muted-foreground">{meta?.description}</p>
                    </div>
                    <Switch
                      checked={flag.enabled}
                      onCheckedChange={(checked) => handleToggle(flag.id, checked)}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
