import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useWebsiteAboutContent, 
  useUpdateWebsiteAboutContent,
  useWebsiteFacilities,
  useCreateWebsiteFacility,
  useUpdateWebsiteFacility,
  useDeleteWebsiteFacility,
  WebsiteFacility
} from '@/hooks/queries/useWebsiteCMSNew';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Save, Building, Info, Plus, Pencil, Trash2 } from 'lucide-react';

export default function AboutManager() {
  const { data: aboutContent, isLoading: loadingContent } = useWebsiteAboutContent();
  const updateContent = useUpdateWebsiteAboutContent();
  
  const { data: facilities, isLoading: loadingFacilities } = useWebsiteFacilities();
  const createFacility = useCreateWebsiteFacility();
  const updateFacility = useUpdateWebsiteFacility();
  const deleteFacility = useDeleteWebsiteFacility();

  const [formData, setFormData] = useState<Record<string, { title: string; title_bn: string; content: string; content_bn: string; image_url: string }>>({});
  const [editingFacility, setEditingFacility] = useState<WebsiteFacility | null>(null);
  const [facilityDialogOpen, setFacilityDialogOpen] = useState(false);
  const [facilityForm, setFacilityForm] = useState({
    title: '',
    title_bn: '',
    description: '',
    description_bn: '',
    icon: 'Building',
    display_order: 0,
    is_enabled: true,
  });

  useEffect(() => {
    if (aboutContent) {
      const data: Record<string, any> = {};
      aboutContent.forEach((item) => {
        data[item.section_key] = {
          id: item.id,
          title: item.title || '',
          title_bn: item.title_bn || '',
          content: item.content || '',
          content_bn: item.content_bn || '',
          image_url: item.image_url || '',
        };
      });
      setFormData(data);
    }
  }, [aboutContent]);

  const handleSaveContent = async (sectionKey: string) => {
    const section = aboutContent?.find(c => c.section_key === sectionKey);
    if (section && formData[sectionKey]) {
      await updateContent.mutateAsync({
        id: section.id,
        ...formData[sectionKey],
      });
    }
  };

  const handleSaveFacility = async () => {
    if (editingFacility) {
      await updateFacility.mutateAsync({ id: editingFacility.id, ...facilityForm });
    } else {
      await createFacility.mutateAsync(facilityForm);
    }
    setFacilityDialogOpen(false);
    setEditingFacility(null);
    setFacilityForm({ title: '', title_bn: '', description: '', description_bn: '', icon: 'Building', display_order: facilities?.length || 0, is_enabled: true });
  };

  const handleEditFacility = (facility: WebsiteFacility) => {
    setEditingFacility(facility);
    setFacilityForm({
      title: facility.title,
      title_bn: facility.title_bn || '',
      description: facility.description || '',
      description_bn: facility.description_bn || '',
      icon: facility.icon || 'Building',
      display_order: facility.display_order,
      is_enabled: facility.is_enabled,
    });
    setFacilityDialogOpen(true);
  };

  if (loadingContent || loadingFacilities) {
    return (
      <MainLayout title="About Manager" titleBn="আমাদের সম্পর্কে ম্যানেজার">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  const sections = [
    { key: 'intro', label: 'পরিচিতি', labelEn: 'Introduction' },
    { key: 'vision', label: 'দৃষ্টিভঙ্গি', labelEn: 'Vision' },
    { key: 'mission', label: 'লক্ষ্য', labelEn: 'Mission' },
    { key: 'principal', label: 'অধ্যক্ষের বাণী', labelEn: 'Principal Message' },
  ];

  return (
    <MainLayout title="About Manager" titleBn="আমাদের সম্পর্কে ম্যানেজার">
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content" className="gap-2">
            <Info className="w-4 h-4" /> বিষয়বস্তু
          </TabsTrigger>
          <TabsTrigger value="facilities" className="gap-2">
            <Building className="w-4 h-4" /> সুবিধাসমূহ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <div className="space-y-6">
            {sections.map((section) => (
              <Card key={section.key}>
                <CardHeader>
                  <CardTitle>{section.label}</CardTitle>
                  <CardDescription>{section.labelEn}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title (English)</Label>
                      <Input
                        value={formData[section.key]?.title || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          [section.key]: { ...formData[section.key], title: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>শিরোনাম (বাংলা)</Label>
                      <Input
                        value={formData[section.key]?.title_bn || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          [section.key]: { ...formData[section.key], title_bn: e.target.value }
                        })}
                        className="font-bengali"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Content (English)</Label>
                      <Textarea
                        rows={4}
                        value={formData[section.key]?.content || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          [section.key]: { ...formData[section.key], content: e.target.value }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>বিষয়বস্তু (বাংলা)</Label>
                      <Textarea
                        rows={4}
                        value={formData[section.key]?.content_bn || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          [section.key]: { ...formData[section.key], content_bn: e.target.value }
                        })}
                        className="font-bengali"
                      />
                    </div>
                  </div>
                  {section.key === 'principal' && (
                    <div className="space-y-2">
                      <Label>ছবি URL</Label>
                      <Input
                        value={formData[section.key]?.image_url || ''}
                        onChange={(e) => setFormData({
                          ...formData,
                          [section.key]: { ...formData[section.key], image_url: e.target.value }
                        })}
                        placeholder="https://..."
                      />
                    </div>
                  )}
                  <Button onClick={() => handleSaveContent(section.key)} disabled={updateContent.isPending}>
                    {updateContent.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Save className="w-4 h-4 mr-2" /> সংরক্ষণ করুন
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="facilities">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>সুবিধাসমূহ</CardTitle>
                <CardDescription>স্কুলের সুবিধা ও অবকাঠামো</CardDescription>
              </div>
              <Dialog open={facilityDialogOpen} onOpenChange={setFacilityDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingFacility(null); setFacilityForm({ title: '', title_bn: '', description: '', description_bn: '', icon: 'Building', display_order: facilities?.length || 0, is_enabled: true }); }}>
                    <Plus className="w-4 h-4 mr-2" /> নতুন সুবিধা
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>{editingFacility ? 'সুবিধা সম্পাদনা' : 'নতুন সুবিধা যোগ করুন'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title (English)</Label>
                        <Input value={facilityForm.title} onChange={(e) => setFacilityForm({ ...facilityForm, title: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>শিরোনাম (বাংলা)</Label>
                        <Input value={facilityForm.title_bn} onChange={(e) => setFacilityForm({ ...facilityForm, title_bn: e.target.value })} className="font-bengali" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Description (English)</Label>
                        <Textarea value={facilityForm.description} onChange={(e) => setFacilityForm({ ...facilityForm, description: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>বিবরণ (বাংলা)</Label>
                        <Textarea value={facilityForm.description_bn} onChange={(e) => setFacilityForm({ ...facilityForm, description_bn: e.target.value })} className="font-bengali" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label>সক্রিয়</Label>
                      <Switch checked={facilityForm.is_enabled} onCheckedChange={(checked) => setFacilityForm({ ...facilityForm, is_enabled: checked })} />
                    </div>
                    <Button onClick={handleSaveFacility} disabled={createFacility.isPending || updateFacility.isPending} className="w-full">
                      {(createFacility.isPending || updateFacility.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      সংরক্ষণ করুন
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {facilities?.map((facility) => (
                  <div key={facility.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium font-bengali">{facility.title_bn || facility.title}</h4>
                        <p className="text-sm text-muted-foreground font-bengali line-clamp-1">{facility.description_bn || facility.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={facility.is_enabled} onCheckedChange={(checked) => updateFacility.mutate({ id: facility.id, is_enabled: checked })} />
                      <Button variant="ghost" size="icon" onClick={() => handleEditFacility(facility)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteFacility.mutate(facility.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </MainLayout>
  );
}
