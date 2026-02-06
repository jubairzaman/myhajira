import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, Pencil, Trash2, FileText, FormInput, Inbox, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import {
  useWebsiteAdmissionInfo,
  useCreateWebsiteAdmissionInfo,
  useUpdateWebsiteAdmissionInfo,
  useDeleteWebsiteAdmissionInfo,
} from '@/hooks/queries/useWebsiteCMSNew';
import {
  useAdmissionFormFields,
  useCreateAdmissionFormField,
  useUpdateAdmissionFormField,
  useDeleteAdmissionFormField,
  useAdmissionFormSubmissions,
  useUpdateAdmissionSubmission,
  useDeleteAdmissionSubmission,
  type AdmissionFormField,
  type AdmissionFormSubmission,
} from '@/hooks/queries/useAdmissionForm';

export default function AdmissionsManager() {
  return (
    <MainLayout title="Admissions Manager" titleBn="ভর্তি ম্যানেজার">
      <Tabs defaultValue="requirements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requirements" className="gap-2"><FileText className="w-4 h-4" /> প্রয়োজনীয়তা</TabsTrigger>
          <TabsTrigger value="form-fields" className="gap-2"><FormInput className="w-4 h-4" /> ফর্ম ফিল্ড</TabsTrigger>
          <TabsTrigger value="submissions" className="gap-2"><Inbox className="w-4 h-4" /> আবেদনসমূহ</TabsTrigger>
        </TabsList>
        <TabsContent value="requirements"><RequirementsTab /></TabsContent>
        <TabsContent value="form-fields"><FormFieldsTab /></TabsContent>
        <TabsContent value="submissions"><SubmissionsTab /></TabsContent>
      </Tabs>
    </MainLayout>
  );
}

// ============ REQUIREMENTS TAB ============
function RequirementsTab() {
  const { data: items, isLoading } = useWebsiteAdmissionInfo();
  const createItem = useCreateWebsiteAdmissionInfo();
  const updateItem = useUpdateWebsiteAdmissionInfo();
  const deleteItem = useDeleteWebsiteAdmissionInfo();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ title: '', title_bn: '', content: '', content_bn: '', section_key: 'requirement', display_order: 0, is_enabled: true });

  const handleSave = async () => {
    if (editing) {
      await updateItem.mutateAsync({ id: editing.id, ...form });
    } else {
      await createItem.mutateAsync(form as any);
    }
    setDialogOpen(false);
    setEditing(null);
    setForm({ title: '', title_bn: '', content: '', content_bn: '', section_key: 'requirement', display_order: items?.length || 0, is_enabled: true });
  };

  const handleEdit = (item: any) => {
    setEditing(item);
    setForm({ title: item.title, title_bn: item.title_bn || '', content: item.content || '', content_bn: item.content_bn || '', section_key: item.section_key, display_order: item.display_order, is_enabled: item.is_enabled });
    setDialogOpen(true);
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-bengali">ভর্তি প্রয়োজনীয়তা</CardTitle>
          <CardDescription>শিক্ষার্থীদের কি কি প্রয়োজন হবে তা যোগ করুন</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm({ title: '', title_bn: '', content: '', content_bn: '', section_key: 'requirement', display_order: items?.length || 0, is_enabled: true }); }}>
              <Plus className="w-4 h-4 mr-2" /> নতুন যোগ করুন
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle className="font-bengali">{editing ? 'সম্পাদনা' : 'নতুন প্রয়োজনীয়তা'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Title (En)</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="space-y-2"><Label>শিরোনাম (বাংলা)</Label><Input value={form.title_bn} onChange={(e) => setForm({ ...form, title_bn: e.target.value })} className="font-bengali" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Description (En)</Label><Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={2} /></div>
                <div className="space-y-2"><Label>বিবরণ (বাংলা)</Label><Textarea value={form.content_bn} onChange={(e) => setForm({ ...form, content_bn: e.target.value })} rows={2} className="font-bengali" /></div>
              </div>
              <div className="flex items-center gap-4">
                <Label>সক্রিয়</Label>
                <Switch checked={form.is_enabled} onCheckedChange={(v) => setForm({ ...form, is_enabled: v })} />
              </div>
              <Button onClick={handleSave} disabled={createItem.isPending || updateItem.isPending} className="w-full">
                {(createItem.isPending || updateItem.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} সংরক্ষণ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items?.filter(i => i.section_key === 'requirement').map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium font-bengali">{item.title_bn || item.title}</p>
                  {(item.content_bn || item.content) && <p className="text-sm text-muted-foreground font-bengali">{item.content_bn || item.content}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={item.is_enabled ?? true} onCheckedChange={(v) => updateItem.mutate({ id: item.id, is_enabled: v })} />
                <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteItem.mutate(item.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
          {(!items || items.filter(i => i.section_key === 'requirement').length === 0) && (
            <p className="text-center text-muted-foreground py-8 font-bengali">কোনো প্রয়োজনীয়তা যোগ করা হয়নি</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============ FORM FIELDS TAB ============
function FormFieldsTab() {
  const { data: fields, isLoading } = useAdmissionFormFields();
  const createField = useCreateAdmissionFormField();
  const updateField = useUpdateAdmissionFormField();
  const deleteField = useDeleteAdmissionFormField();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdmissionFormField | null>(null);
  const [form, setForm] = useState({
    field_label: '', field_label_bn: '', field_type: 'text', field_name: '',
    placeholder: '', placeholder_bn: '', options: '' as string,
    is_required: false, is_enabled: true, display_order: 0,
  });

  const handleSave = async () => {
    const payload: any = {
      ...form,
      options: form.field_type === 'select' && form.options
        ? form.options.split(',').map((o: string) => o.trim()).filter(Boolean)
        : null,
    };
    if (editing) {
      await updateField.mutateAsync({ id: editing.id, ...payload });
    } else {
      await createField.mutateAsync(payload);
    }
    setDialogOpen(false);
    setEditing(null);
    resetForm();
  };

  const resetForm = () => {
    setForm({ field_label: '', field_label_bn: '', field_type: 'text', field_name: '', placeholder: '', placeholder_bn: '', options: '', is_required: false, is_enabled: true, display_order: fields?.length || 0 });
  };

  const handleEdit = (field: AdmissionFormField) => {
    setEditing(field);
    setForm({
      field_label: field.field_label,
      field_label_bn: field.field_label_bn || '',
      field_type: field.field_type,
      field_name: field.field_name,
      placeholder: field.placeholder || '',
      placeholder_bn: field.placeholder_bn || '',
      options: Array.isArray(field.options) ? (field.options as string[]).join(', ') : '',
      is_required: field.is_required,
      is_enabled: field.is_enabled,
      display_order: field.display_order,
    });
    setDialogOpen(true);
  };

  const fieldTypeLabels: Record<string, string> = {
    text: 'টেক্সট', textarea: 'টেক্সট এরিয়া', select: 'সিলেক্ট', number: 'সংখ্যা', email: 'ইমেইল', phone: 'ফোন', date: 'তারিখ',
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-bengali">ফর্ম ফিল্ডসমূহ</CardTitle>
          <CardDescription>ভর্তি আবেদন ফর্মে কি কি তথ্য চাইবেন তা এখানে যোগ করুন</CardDescription>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); resetForm(); }}><Plus className="w-4 h-4 mr-2" /> নতুন ফিল্ড</Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle className="font-bengali">{editing ? 'ফিল্ড সম্পাদনা' : 'নতুন ফিল্ড'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Label (En)</Label><Input value={form.field_label} onChange={(e) => setForm({ ...form, field_label: e.target.value })} /></div>
                <div className="space-y-2"><Label>লেবেল (বাংলা)</Label><Input value={form.field_label_bn} onChange={(e) => setForm({ ...form, field_label_bn: e.target.value })} className="font-bengali" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Field Name (unique key)</Label>
                  <Input value={form.field_name} onChange={(e) => setForm({ ...form, field_name: e.target.value.replace(/\s/g, '_').toLowerCase() })} placeholder="e.g. applicant_name" disabled={!!editing} />
                </div>
                <div className="space-y-2">
                  <Label>ফিল্ড টাইপ</Label>
                  <Select value={form.field_type} onValueChange={(v) => setForm({ ...form, field_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(fieldTypeLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {form.field_type === 'select' && (
                <div className="space-y-2">
                  <Label>Options (comma separated)</Label>
                  <Input value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} placeholder="Option 1, Option 2, Option 3" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Placeholder (En)</Label><Input value={form.placeholder} onChange={(e) => setForm({ ...form, placeholder: e.target.value })} /></div>
                <div className="space-y-2"><Label>প্লেসহোল্ডার (বাংলা)</Label><Input value={form.placeholder_bn} onChange={(e) => setForm({ ...form, placeholder_bn: e.target.value })} className="font-bengali" /></div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2"><Label>আবশ্যক</Label><Switch checked={form.is_required} onCheckedChange={(v) => setForm({ ...form, is_required: v })} /></div>
                <div className="flex items-center gap-2"><Label>সক্রিয়</Label><Switch checked={form.is_enabled} onCheckedChange={(v) => setForm({ ...form, is_enabled: v })} /></div>
              </div>
              <Button onClick={handleSave} disabled={createField.isPending || updateField.isPending || !form.field_label || !form.field_name} className="w-full">
                {(createField.isPending || updateField.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} সংরক্ষণ
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {fields?.map((field) => (
            <div key={field.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center gap-3">
                <FormInput className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium font-bengali">{field.field_label_bn || field.field_label}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">{fieldTypeLabels[field.field_type] || field.field_type}</Badge>
                    {field.is_required && <Badge variant="destructive" className="text-xs">আবশ্যক</Badge>}
                    <Badge variant="outline" className="text-xs">{field.field_name}</Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={field.is_enabled} onCheckedChange={(v) => updateField.mutate({ id: field.id, is_enabled: v })} />
                <Button variant="ghost" size="icon" onClick={() => handleEdit(field)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteField.mutate(field.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          ))}
          {(!fields || fields.length === 0) && (
            <p className="text-center text-muted-foreground py-8 font-bengali">কোনো ফর্ম ফিল্ড যোগ করা হয়নি</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============ SUBMISSIONS TAB ============
function SubmissionsTab() {
  const { data: submissions, isLoading } = useAdmissionFormSubmissions();
  const { data: formFields } = useAdmissionFormFields();
  const updateSubmission = useUpdateAdmissionSubmission();
  const deleteSubmission = useDeleteAdmissionSubmission();
  const [selectedSubmission, setSelectedSubmission] = useState<AdmissionFormSubmission | null>(null);

  const statusLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
    pending: { label: 'অপেক্ষমাণ', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    reviewed: { label: 'পর্যালোচিত', color: 'bg-blue-100 text-blue-800', icon: Eye },
    accepted: { label: 'গৃহীত', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { label: 'বাতিল', color: 'bg-red-100 text-red-800', icon: XCircle },
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="font-bengali">জমাকৃত আবেদনসমূহ</CardTitle>
          <CardDescription>শিক্ষার্থীদের জমা দেওয়া ভর্তি আবেদন</CardDescription>
        </CardHeader>
        <CardContent>
          {submissions && submissions.length > 0 ? (
            <div className="space-y-3">
              {submissions.map((sub) => {
                const st = statusLabels[sub.status] || statusLabels.pending;
                const StatusIcon = st.icon;
                return (
                  <div key={sub.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-3 flex-1" onClick={() => setSelectedSubmission(sub)} role="button">
                      <div>
                        <p className="font-medium">{sub.applicant_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {sub.applicant_phone && <span className="text-sm text-muted-foreground">{sub.applicant_phone}</span>}
                          <Badge className={`${st.color} gap-1`}><StatusIcon className="w-3 h-3" />{st.label}</Badge>
                          <span className="text-xs text-muted-foreground">{new Date(sub.created_at).toLocaleDateString('bn-BD')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={sub.status} onValueChange={(v) => updateSubmission.mutate({ id: sub.id, status: v })}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([key, val]) => (
                            <SelectItem key={key} value={key} className="font-bengali">{val.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedSubmission(sub)}><Eye className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteSubmission.mutate(sub.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8 font-bengali">এখনও কোনো আবেদন জমা হয়নি</p>
          )}
        </CardContent>
      </Card>

      {/* Submission Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="font-bengali">আবেদনের বিস্তারিত</DialogTitle></DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div><Label className="text-muted-foreground text-xs">আবেদনকারী</Label><p className="font-medium">{selectedSubmission.applicant_name}</p></div>
                <div><Label className="text-muted-foreground text-xs">ফোন</Label><p>{selectedSubmission.applicant_phone || '-'}</p></div>
                <div><Label className="text-muted-foreground text-xs">তারিখ</Label><p>{new Date(selectedSubmission.created_at).toLocaleString('bn-BD')}</p></div>
                <div><Label className="text-muted-foreground text-xs">স্ট্যাটাস</Label><Badge className={statusLabels[selectedSubmission.status]?.color}>{statusLabels[selectedSubmission.status]?.label}</Badge></div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium font-bengali">ফর্ম ডেটা</h4>
                {Object.entries(selectedSubmission.form_data).map(([key, value]) => {
                  const field = formFields?.find(f => f.field_name === key);
                  return (
                    <div key={key} className="p-3 bg-muted/30 rounded-lg">
                      <Label className="text-muted-foreground text-xs font-bengali">{field?.field_label_bn || field?.field_label || key}</Label>
                      <p className="font-bengali">{String(value)}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
