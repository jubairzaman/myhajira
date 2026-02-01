import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  useWebsiteHomeSections, 
  useUpdateWebsiteHomeSection, 
  useWebsiteAvailableSections,
  useCreateWebsiteHomeSection,
  useDeleteWebsiteHomeSection
} from '@/hooks/queries/useWebsiteCMSNew';
import { Loader2, GripVertical, Home, Eye, EyeOff, Plus, Trash2, LayoutGrid } from 'lucide-react';

export default function HomePageManager() {
  const { data: sections, isLoading } = useWebsiteHomeSections();
  const { data: availableSections } = useWebsiteAvailableSections();
  const updateSection = useUpdateWebsiteHomeSection();
  const createSection = useCreateWebsiteHomeSection();
  const deleteSection = useDeleteWebsiteHomeSection();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleToggle = async (id: string, is_enabled: boolean) => {
    await updateSection.mutateAsync({ id, is_enabled });
  };

  const handleAddSection = async (section: { section_key: string; section_name: string; section_name_bn: string | null }) => {
    const maxOrder = sections?.reduce((max, s) => Math.max(max, s.display_order), 0) || 0;
    await createSection.mutateAsync({
      section_key: section.section_key,
      section_name: section.section_name,
      section_name_bn: section.section_name_bn || undefined,
      display_order: maxOrder + 1,
      is_enabled: true,
    });
    setDialogOpen(false);
  };

  const handleRemoveSection = async (id: string) => {
    if (confirm('এই সেকশনটি হোম পেজ থেকে সরাতে চান?')) {
      await deleteSection.mutateAsync(id);
    }
  };

  // Get sections that are not already in home page
  const addableSections = availableSections?.filter(
    (avail) => !sections?.some((s) => s.section_key === avail.section_key)
  ) || [];

  if (isLoading) {
    return (
      <MainLayout title="Homepage Manager" titleBn="হোম পেজ ম্যানেজার">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Homepage Manager" titleBn="হোম পেজ ম্যানেজার">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  হোম পেজ সেকশন
                </CardTitle>
                <CardDescription>
                  হোম পেজে কোন সেকশনগুলো দেখাবে তা নিয়ন্ত্রণ করুন
                </CardDescription>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button disabled={addableSections.length === 0}>
                    <Plus className="w-4 h-4 mr-2" />
                    সেকশন যোগ করুন
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <LayoutGrid className="w-5 h-5" />
                      নতুন সেকশন যোগ করুন
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3 pt-4 max-h-[400px] overflow-y-auto">
                    {addableSections.map((section) => (
                      <div
                        key={section.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => handleAddSection(section)}
                      >
                        <div>
                          <h4 className="font-medium">{section.section_name}</h4>
                          {section.section_name_bn && (
                            <p className="text-sm text-muted-foreground font-bengali">
                              {section.section_name_bn}
                            </p>
                          )}
                          {section.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {section.description}
                            </p>
                          )}
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded mt-1 inline-block">
                            {section.source_page} পেজ থেকে
                          </span>
                        </div>
                        <Plus className="w-5 h-5 text-primary" />
                      </div>
                    ))}
                    {addableSections.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        সব সেকশন ইতিমধ্যে যোগ করা হয়েছে
                      </p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sections?.map((section) => (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                    <div>
                      <h4 className="font-medium">{section.section_name}</h4>
                      {section.section_name_bn && (
                        <p className="text-sm text-muted-foreground font-bengali">
                          {section.section_name_bn}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {section.is_enabled ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                    )}
                    <Switch
                      checked={section.is_enabled}
                      onCheckedChange={(checked) => handleToggle(section.id, checked)}
                      disabled={updateSection.isPending}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleRemoveSection(section.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {(!sections || sections.length === 0) && (
                <p className="text-center text-muted-foreground py-8">
                  কোনো সেকশন নেই। উপরের বাটন থেকে যোগ করুন।
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>দ্রষ্টব্য</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• সুইচ অন করলে সেকশনটি হোম পেজে দেখা যাবে</p>
            <p>• "সেকশন যোগ করুন" বাটনে ক্লিক করে ওয়েবসাইটের যেকোনো সেকশন হোম পেজে যোগ করতে পারবেন</p>
            <p>• প্রতিটি সেকশনের বিস্তারিত কন্টেন্ট আলাদা ম্যানেজার থেকে এডিট করতে পারবেন</p>
            <p>• ট্র্যাশ আইকনে ক্লিক করে সেকশন হোম পেজ থেকে সরাতে পারবেন</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
