import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Shield, UserPlus, Save, Loader2, Users, Key, Eye, Trash2, Activity,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

const ROLES = [
  { value: 'super_admin', label: 'সুপার এডমিন', labelEn: 'Super Admin', color: 'bg-red-100 text-red-800' },
  { value: 'admin', label: 'এডমিন', labelEn: 'Admin', color: 'bg-blue-100 text-blue-800' },
  { value: 'operator', label: 'অপারেটর', labelEn: 'Operator', color: 'bg-green-100 text-green-800' },
  { value: 'teacher', label: 'শিক্ষক', labelEn: 'Teacher', color: 'bg-purple-100 text-purple-800' },
  { value: 'accountant', label: 'হিসাবরক্ষক', labelEn: 'Accountant', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'it_admin', label: 'আইটি এডমিন', labelEn: 'IT Admin', color: 'bg-cyan-100 text-cyan-800' },
];

const MODULES = [
  { key: 'students', label: 'শিক্ষার্থী', labelEn: 'Students' },
  { key: 'teachers', label: 'শিক্ষক', labelEn: 'Teachers' },
  { key: 'attendance', label: 'উপস্থিতি', labelEn: 'Attendance' },
  { key: 'fees', label: 'ফি', labelEn: 'Fees' },
  { key: 'inventory', label: 'ইনভেন্টরি', labelEn: 'Inventory' },
  { key: 'devices', label: 'ডিভাইস', labelEn: 'Devices' },
  { key: 'reports', label: 'রিপোর্ট', labelEn: 'Reports' },
  { key: 'settings', label: 'সেটিংস', labelEn: 'Settings' },
  { key: 'website_cms', label: 'ওয়েবসাইট', labelEn: 'Website CMS' },
  { key: 'sms', label: 'এসএমএস', labelEn: 'SMS' },
  { key: 'calendar', label: 'ক্যালেন্ডার', labelEn: 'Calendar' },
  { key: 'monitors', label: 'মনিটর', labelEn: 'Monitors' },
];

interface UserData {
  id: string;
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  is_profile_complete: boolean;
  created_at: string;
  user_roles: { role: string }[];
}

interface Permission {
  id: string;
  role: string;
  module: string;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
}

export default function UserManagement() {
  const { isSuperAdmin } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedRole, setSelectedRole] = useState('operator');
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // New user form
  const [newUser, setNewUser] = useState({
    email: '', password: '', full_name: '', role: 'operator',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, permsRes] = await Promise.all([
        supabase.from('profiles').select('*, user_roles(role)').order('created_at', { ascending: false }),
        supabase.from('role_permissions').select('*').order('module'),
      ]);
      setUsers((usersRes.data as unknown as UserData[]) || []);
      setPermissions((permsRes.data as unknown as Permission[]) || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    setLogsLoading(true);
    try {
      const { data } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setActivityLogs(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.full_name) {
      toast.error('সব তথ্য পূরণ করুন');
      return;
    }
    if (newUser.password.length < 6) {
      toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'create_user', ...newUser },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success('ইউজার সফলভাবে তৈরি হয়েছে');
      setIsAddOpen(false);
      setNewUser({ email: '', password: '', full_name: '', role: 'operator' });
      fetchData();
    } catch (e: any) {
      toast.error(e.message || 'ইউজার তৈরি ব্যর্থ');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`"${name}" কে মুছে ফেলতে চান?`)) return;
    try {
      const { data, error } = await supabase.functions.invoke('manage-users', {
        body: { action: 'delete_user', user_id: userId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success('ইউজার মুছে ফেলা হয়েছে');
      fetchData();
    } catch (e: any) {
      toast.error(e.message || 'মুছতে ব্যর্থ');
    }
  };

  const handlePermissionChange = (role: string, module: string, field: string, value: boolean) => {
    setPermissions(prev => prev.map(p => 
      p.role === role && p.module === module ? { ...p, [field]: value } : p
    ));
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      const rolePerms = permissions.filter(p => p.role === selectedRole);
      for (const perm of rolePerms) {
        await supabase.from('role_permissions').update({
          can_read: perm.can_read,
          can_create: perm.can_create,
          can_update: perm.can_update,
          can_delete: perm.can_delete,
        }).eq('id', perm.id);
      }
      toast.success('পারমিশন সংরক্ষণ করা হয়েছে');
    } catch (e: any) {
      toast.error(e.message || 'সংরক্ষণ ব্যর্থ');
    } finally {
      setSaving(false);
    }
  };

  const getRoleInfo = (role: string) => ROLES.find(r => r.value === role);

  if (!isSuperAdmin) {
    return (
      <MainLayout title="User Management" titleBn="ইউজার ম্যানেজমেন্ট">
        <div className="text-center py-12 text-muted-foreground font-bengali">
          শুধুমাত্র সুপার এডমিনের জন্য
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="User Management" titleBn="ইউজার ম্যানেজমেন্ট">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-bengali">ইউজার ও রোল ম্যানেজমেন্ট</h2>
            <p className="text-sm text-muted-foreground">User & Role Management</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="gap-2">
            <Users className="w-4 h-4" />
            <span className="font-bengali">ইউজার তালিকা</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="gap-2">
            <Key className="w-4 h-4" />
            <span className="font-bengali">পারমিশন</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2" onClick={fetchActivityLogs}>
            <Activity className="w-4 h-4" />
            <span className="font-bengali">একটিভিটি লগ</span>
          </TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="font-bengali">সকল ইউজার</CardTitle>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero" className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    নতুন ইউজার
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-bengali">নতুন ইউজার তৈরি করুন</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label className="font-bengali">পুরো নাম</Label>
                      <Input
                        placeholder="নাম লিখুন"
                        value={newUser.full_name}
                        onChange={e => setNewUser({ ...newUser, full_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ইমেইল / ইউজার আইডি</Label>
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        value={newUser.email}
                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bengali">পাসওয়ার্ড</Label>
                      <Input
                        type="password"
                        placeholder="কমপক্ষে ৬ অক্ষর"
                        value={newUser.password}
                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bengali">রোল</Label>
                      <Select value={newUser.role} onValueChange={v => setNewUser({ ...newUser, role: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ROLES.map(r => (
                            <SelectItem key={r.value} value={r.value}>
                              {r.label} ({r.labelEn})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleCreateUser} className="w-full gap-2" disabled={creating}>
                      {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                      ইউজার তৈরি করুন
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bengali">নাম</TableHead>
                        <TableHead className="font-bengali">ইমেইল</TableHead>
                        <TableHead className="font-bengali">রোল</TableHead>
                        <TableHead className="font-bengali">প্রোফাইল</TableHead>
                        <TableHead className="font-bengali">তারিখ</TableHead>
                        <TableHead className="font-bengali text-right">অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map(user => {
                        const role = user.user_roles?.[0]?.role;
                        const roleInfo = getRoleInfo(role);
                        return (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.full_name}</TableCell>
                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                            <TableCell>
                              {roleInfo ? (
                                <Badge className={`${roleInfo.color} border-0`}>
                                  {roleInfo.label}
                                </Badge>
                              ) : (
                                <Badge variant="secondary">নেই</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.is_profile_complete ? 'default' : 'destructive'}>
                                {user.is_profile_complete ? 'সম্পূর্ণ' : 'অসম্পূর্ণ'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {format(new Date(user.created_at), 'dd/MM/yyyy')}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteUser(user.user_id, user.full_name)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                <CardTitle className="font-bengali">পারমিশন ম্যানেজমেন্ট</CardTitle>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map(r => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label} ({r.labelEn})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button variant="hero" className="gap-2" onClick={handleSavePermissions} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                সংরক্ষণ
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bengali">মডিউল</TableHead>
                      <TableHead className="text-center font-bengali">দেখা (Read)</TableHead>
                      <TableHead className="text-center font-bengali">তৈরি (Create)</TableHead>
                      <TableHead className="text-center font-bengali">সম্পাদনা (Update)</TableHead>
                      <TableHead className="text-center font-bengali">মুছুন (Delete)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MODULES.map(mod => {
                      const perm = permissions.find(p => p.role === selectedRole && p.module === mod.key);
                      if (!perm) return null;
                      return (
                        <TableRow key={mod.key}>
                          <TableCell>
                            <div>
                              <span className="font-medium font-bengali">{mod.label}</span>
                              <span className="text-xs text-muted-foreground ml-2">({mod.labelEn})</span>
                            </div>
                          </TableCell>
                          {['can_read', 'can_create', 'can_update', 'can_delete'].map(field => (
                            <TableCell key={field} className="text-center">
                              <Checkbox
                                checked={(perm as any)[field]}
                                onCheckedChange={(v) => handlePermissionChange(selectedRole, mod.key, field, !!v)}
                                disabled={selectedRole === 'super_admin'}
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              {selectedRole === 'super_admin' && (
                <p className="text-sm text-muted-foreground mt-4 font-bengali text-center">
                  ⚠️ সুপার এডমিনের সকল পারমিশন সবসময় সক্রিয় থাকে
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle className="font-bengali">একটিভিটি লগ</CardTitle>
            </CardHeader>
            <CardContent>
              {logsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : activityLogs.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground font-bengali">
                  কোন একটিভিটি লগ নেই
                </p>
              ) : (
                <div className="overflow-auto max-h-[600px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-bengali">টেবিল</TableHead>
                        <TableHead className="font-bengali">অ্যাকশন</TableHead>
                        <TableHead className="font-bengali">রেকর্ড</TableHead>
                        <TableHead className="font-bengali">সময়</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activityLogs.map(log => (
                        <TableRow key={log.id}>
                          <TableCell>{log.table_name}</TableCell>
                          <TableCell>
                            <Badge variant={
                              log.action === 'INSERT' ? 'default' :
                              log.action === 'UPDATE' ? 'secondary' : 'destructive'
                            }>
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-xs">
                            {log.record_id?.substring(0, 8)}...
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
