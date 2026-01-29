import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useWebsiteHomeSections, useUpdateWebsiteHomeSection } from '@/hooks/queries/useWebsiteCMSNew';
import { Loader2, GripVertical, Home, Eye, EyeOff } from 'lucide-react';

export default function HomePageManager() {
  const { data: sections, isLoading } = useWebsiteHomeSections();
  const updateSection = useUpdateWebsiteHomeSection();

  const handleToggle = async (id: string, is_enabled: boolean) => {
    await updateSection.mutateAsync({ id, is_enabled });
  };

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
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              হোম পেজ সেকশন
            </CardTitle>
            <CardDescription>
              হোম পেজে কোন সেকশনগুলো দেখাবে তা নিয়ন্ত্রণ করুন
            </CardDescription>
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
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>দ্রষ্টব্য</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• সুইচ অন করলে সেকশনটি হোম পেজে দেখা যাবে</p>
            <p>• প্রতিটি সেকশনের বিস্তারিত কন্টেন্ট আলাদা ম্যানেজার থেকে এডিট করতে পারবেন</p>
            <p>• হিরো স্লাইড ম্যানেজ করতে "হিরো স্লাইড" মেনুতে যান</p>
            <p>• অভিভাবক মতামত ম্যানেজ করতে "অভিভাবক মতামত" মেনুতে যান</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
