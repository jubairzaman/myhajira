import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useWebsitePrograms, 
  useCreateWebsiteProgram, 
  useUpdateWebsiteProgram, 
  useDeleteWebsiteProgram,
  useWebsiteMethodologies,
  useCreateWebsiteMethodology,
  useUpdateWebsiteMethodology,
  useDeleteWebsiteMethodology,
  WebsiteProgram,
  WebsiteMethodology
} from '@/hooks/queries/useWebsiteCMSNew';
import { Loader2, Plus, Pencil, Trash2, GraduationCap, Lightbulb } from 'lucide-react';

export default function AcademicsManager() {
  const { data: programs, isLoading: loadingPrograms } = useWebsitePrograms();
  const { data: methodologies, isLoading: loadingMethodologies } = useWebsiteMethodologies();
  
  const createProgram = useCreateWebsiteProgram();
  const updateProgram = useUpdateWebsiteProgram();
  const deleteProgram = useDeleteWebsiteProgram();
  
  const createMethodology = useCreateWebsiteMethodology();
  const updateMethodology = useUpdateWebsiteMethodology();
  const deleteMethodology = useDeleteWebsiteMethodology();
  
  const [editingProgram, setEditingProgram] = useState<WebsiteProgram | null>(null);
  const [editingMethodology, setEditingMethodology] = useState<WebsiteMethodology | null>(null);
  const [programDialogOpen, setProgramDialogOpen] = useState(false);
  const [methodologyDialogOpen, setMethodologyDialogOpen] = useState(false);

  const [programForm, setProgramForm] = useState({
    level: '',
    level_bn: '',
    grades: '',
    grades_bn: '',
    description: '',
    description_bn: '',
    color_from: '#4B0082',
    color_to: '#6B2D8B',
    icon: 'GraduationCap',
    display_order: 0,
    is_enabled: true,
  });

  const [methodologyForm, setMethodologyForm] = useState({
    title: '',
    title_bn: '',
    description: '',
    description_bn: '',
    icon: 'Lightbulb',
    display_order: 0,
    is_enabled: true,
  });

  const handleSaveProgram = async () => {
    if (editingProgram) {
      await updateProgram.mutateAsync({ id: editingProgram.id, ...programForm });
    } else {
      await createProgram.mutateAsync(programForm);
    }
    setProgramDialogOpen(false);
    setEditingProgram(null);
    setProgramForm({
      level: '', level_bn: '', grades: '', grades_bn: '', description: '', description_bn: '',
      color_from: '#4B0082', color_to: '#6B2D8B', icon: 'GraduationCap', display_order: 0, is_enabled: true,
    });
  };

  const handleEditProgram = (program: WebsiteProgram) => {
    setEditingProgram(program);
    setProgramForm({
      level: program.level,
      level_bn: program.level_bn || '',
      grades: program.grades || '',
      grades_bn: program.grades_bn || '',
      description: program.description || '',
      description_bn: program.description_bn || '',
      color_from: program.color_from || '#4B0082',
      color_to: program.color_to || '#6B2D8B',
      icon: program.icon || 'GraduationCap',
      display_order: program.display_order,
      is_enabled: program.is_enabled,
    });
    setProgramDialogOpen(true);
  };

  const handleSaveMethodology = async () => {
    if (editingMethodology) {
      await updateMethodology.mutateAsync({ id: editingMethodology.id, ...methodologyForm });
    } else {
      await createMethodology.mutateAsync(methodologyForm);
    }
    setMethodologyDialogOpen(false);
    setEditingMethodology(null);
    setMethodologyForm({
      title: '', title_bn: '', description: '', description_bn: '',
      icon: 'Lightbulb', display_order: 0, is_enabled: true,
    });
  };

  const handleEditMethodology = (methodology: WebsiteMethodology) => {
    setEditingMethodology(methodology);
    setMethodologyForm({
      title: methodology.title,
      title_bn: methodology.title_bn || '',
      description: methodology.description || '',
      description_bn: methodology.description_bn || '',
      icon: methodology.icon || 'Lightbulb',
      display_order: methodology.display_order,
      is_enabled: methodology.is_enabled,
    });
    setMethodologyDialogOpen(true);
  };

  if (loadingPrograms || loadingMethodologies) {
    return (
      <MainLayout title="Academics Manager" titleBn="শিক্ষা কার্যক্রম ম্যানেজার">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Academics Manager" titleBn="শিক্ষা কার্যক্রম ম্যানেজার">
      <Tabs defaultValue="programs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="programs" className="gap-2">
            <GraduationCap className="w-4 h-4" /> শিক্ষা স্তর
          </TabsTrigger>
          <TabsTrigger value="methodology" className="gap-2">
            <Lightbulb className="w-4 h-4" /> শিক্ষাদান পদ্ধতি
          </TabsTrigger>
        </TabsList>

        <TabsContent value="programs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>শিক্ষা স্তর / প্রোগ্রাম</CardTitle>
                <CardDescription>প্রাথমিক, মাধ্যমিক, উচ্চ মাধ্যমিক ইত্যাদি</CardDescription>
              </div>
              <Dialog open={programDialogOpen} onOpenChange={setProgramDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingProgram(null); setProgramForm({ level: '', level_bn: '', grades: '', grades_bn: '', description: '', description_bn: '', color_from: '#4B0082', color_to: '#6B2D8B', icon: 'GraduationCap', display_order: programs?.length || 0, is_enabled: true }); }}>
                    <Plus className="w-4 h-4 mr-2" /> নতুন প্রোগ্রাম
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingProgram ? 'প্রোগ্রাম সম্পাদনা' : 'নতুন প্রোগ্রাম যোগ করুন'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Level (English)</Label>
                        <Input value={programForm.level} onChange={(e) => setProgramForm({ ...programForm, level: e.target.value })} placeholder="e.g., Primary" />
                      </div>
                      <div className="space-y-2">
                        <Label>স্তর (বাংলা)</Label>
                        <Input value={programForm.level_bn} onChange={(e) => setProgramForm({ ...programForm, level_bn: e.target.value })} placeholder="যেমন: প্রাথমিক" className="font-bengali" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Grades (English)</Label>
                        <Input value={programForm.grades} onChange={(e) => setProgramForm({ ...programForm, grades: e.target.value })} placeholder="e.g., Class 1-5" />
                      </div>
                      <div className="space-y-2">
                        <Label>শ্রেণী (বাংলা)</Label>
                        <Input value={programForm.grades_bn} onChange={(e) => setProgramForm({ ...programForm, grades_bn: e.target.value })} placeholder="যেমন: প্রথম - পঞ্চম শ্রেণী" className="font-bengali" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Description (English)</Label>
                        <Textarea value={programForm.description} onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>বিবরণ (বাংলা)</Label>
                        <Textarea value={programForm.description_bn} onChange={(e) => setProgramForm({ ...programForm, description_bn: e.target.value })} className="font-bengali" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>কালার (শুরু)</Label>
                        <div className="flex gap-2">
                          <Input type="color" value={programForm.color_from} onChange={(e) => setProgramForm({ ...programForm, color_from: e.target.value })} className="w-16 h-10 p-1" />
                          <Input value={programForm.color_from} onChange={(e) => setProgramForm({ ...programForm, color_from: e.target.value })} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>কালার (শেষ)</Label>
                        <div className="flex gap-2">
                          <Input type="color" value={programForm.color_to} onChange={(e) => setProgramForm({ ...programForm, color_to: e.target.value })} className="w-16 h-10 p-1" />
                          <Input value={programForm.color_to} onChange={(e) => setProgramForm({ ...programForm, color_to: e.target.value })} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label>সক্রিয়</Label>
                      <Switch checked={programForm.is_enabled} onCheckedChange={(checked) => setProgramForm({ ...programForm, is_enabled: checked })} />
                    </div>
                    <Button onClick={handleSaveProgram} disabled={createProgram.isPending || updateProgram.isPending} className="w-full">
                      {(createProgram.isPending || updateProgram.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      সংরক্ষণ করুন
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {programs?.map((program) => (
                  <div key={program.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: `linear-gradient(135deg, ${program.color_from}, ${program.color_to})` }}>
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium font-bengali">{program.level_bn || program.level}</h4>
                        <p className="text-sm text-muted-foreground font-bengali">{program.grades_bn || program.grades}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={program.is_enabled} onCheckedChange={(checked) => updateProgram.mutate({ id: program.id, is_enabled: checked })} />
                      <Button variant="ghost" size="icon" onClick={() => handleEditProgram(program)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteProgram.mutate(program.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methodology">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>শিক্ষাদান পদ্ধতি</CardTitle>
                <CardDescription>শিক্ষাদানের বিভিন্ন পদ্ধতি ও বৈশিষ্ট্য</CardDescription>
              </div>
              <Dialog open={methodologyDialogOpen} onOpenChange={setMethodologyDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingMethodology(null); setMethodologyForm({ title: '', title_bn: '', description: '', description_bn: '', icon: 'Lightbulb', display_order: methodologies?.length || 0, is_enabled: true }); }}>
                    <Plus className="w-4 h-4 mr-2" /> নতুন পদ্ধতি
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-xl">
                  <DialogHeader>
                    <DialogTitle>{editingMethodology ? 'পদ্ধতি সম্পাদনা' : 'নতুন পদ্ধতি যোগ করুন'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title (English)</Label>
                        <Input value={methodologyForm.title} onChange={(e) => setMethodologyForm({ ...methodologyForm, title: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>শিরোনাম (বাংলা)</Label>
                        <Input value={methodologyForm.title_bn} onChange={(e) => setMethodologyForm({ ...methodologyForm, title_bn: e.target.value })} className="font-bengali" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Description (English)</Label>
                        <Textarea value={methodologyForm.description} onChange={(e) => setMethodologyForm({ ...methodologyForm, description: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>বিবরণ (বাংলা)</Label>
                        <Textarea value={methodologyForm.description_bn} onChange={(e) => setMethodologyForm({ ...methodologyForm, description_bn: e.target.value })} className="font-bengali" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Label>সক্রিয়</Label>
                      <Switch checked={methodologyForm.is_enabled} onCheckedChange={(checked) => setMethodologyForm({ ...methodologyForm, is_enabled: checked })} />
                    </div>
                    <Button onClick={handleSaveMethodology} disabled={createMethodology.isPending || updateMethodology.isPending} className="w-full">
                      {(createMethodology.isPending || updateMethodology.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      সংরক্ষণ করুন
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {methodologies?.map((methodology) => (
                  <div key={methodology.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Lightbulb className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium font-bengali">{methodology.title_bn || methodology.title}</h4>
                        <p className="text-sm text-muted-foreground font-bengali line-clamp-1">{methodology.description_bn || methodology.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={methodology.is_enabled} onCheckedChange={(checked) => updateMethodology.mutate({ id: methodology.id, is_enabled: checked })} />
                      <Button variant="ghost" size="icon" onClick={() => handleEditMethodology(methodology)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteMethodology.mutate(methodology.id)}>
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
