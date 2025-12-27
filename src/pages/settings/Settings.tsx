import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings as SettingsIcon, Save, Building2, Shield, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Settings() {
  const { isSuperAdmin } = useAuth();
  const [settings, setSettings] = useState({
    school_name: '',
    school_name_bn: '',
    timezone: 'Asia/Dhaka',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('operator');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setSettings({
            school_name: data.school_name || '',
            school_name_bn: data.school_name_bn || '',
            timezone: data.timezone || 'Asia/Dhaka',
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*, user_roles(role)')
        .order('created_at', { ascending: false });
      setUsers(data || []);
    };

    fetchSettings();
    if (isSuperAdmin) {
      fetchUsers();
    }
  }, [isSuperAdmin]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('system_settings')
        .update(settings)
        .not('id', 'is', null);

      if (error) throw error;
      toast.success('Settings saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddUserRole = async () => {
    // This would typically invite a user or assign a role
    toast.success('User role functionality - requires user to sign up first');
    setIsAddUserOpen(false);
  };

  return (
    <MainLayout title="Settings" titleBn="সেটিংস">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">System Settings</h2>
            <p className="text-sm text-muted-foreground font-bengali">সিস্টেম সেটিংস</p>
          </div>
        </div>

        <Button variant="hero" className="gap-2" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* School Information */}
        <div className="card-elevated p-6">
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">School Information</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>School Name (English)</Label>
              <Input
                value={settings.school_name}
                onChange={(e) => setSettings({ ...settings, school_name: e.target.value })}
                placeholder="Enter school name"
              />
            </div>

            <div className="space-y-2">
              <Label>স্কুলের নাম (বাংলা)</Label>
              <Input
                value={settings.school_name_bn}
                onChange={(e) => setSettings({ ...settings, school_name_bn: e.target.value })}
                placeholder="স্কুলের নাম লিখুন"
                className="font-bengali"
              />
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={settings.timezone} onValueChange={(v) => setSettings({ ...settings, timezone: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Asia/Dhaka">Asia/Dhaka (Bangladesh)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* User Management - Super Admin Only */}
        {isSuperAdmin && (
          <div className="card-elevated p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-warning" />
                <h3 className="text-lg font-semibold">User Management</h3>
              </div>

              <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add User Role</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>User Email</Label>
                      <Input
                        placeholder="user@example.com"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select value={newUserRole} onValueChange={setNewUserRole}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="operator">Operator</SelectItem>
                          <SelectItem value="teacher">Teacher</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddUserRole} className="w-full">
                      Add User Role
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-3">
              {users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full capitalize">
                    {user.user_roles?.[0]?.role || 'No role'}
                  </span>
                </div>
              ))}

              {users.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No users found</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* About Section */}
      <div className="card-elevated p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">About</h3>
        <div className="text-center py-6">
          <h4 className="text-2xl font-bold font-bengali text-primary mb-2">আমার হাজিরা</h4>
          <p className="text-lg mb-4">Amar Hajira - Smart School Attendance System</p>
          <p className="text-muted-foreground">Version 1.0.0</p>
          <p className="text-muted-foreground mt-4">
            Developed by <strong>Jubair Zaman</strong>
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
