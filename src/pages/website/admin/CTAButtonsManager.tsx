import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useWebsiteCTAButtons, useUpdateWebsiteCTAButton, WebsiteCTAButton } from '@/hooks/queries/useWebsiteCMSNew';
import { Loader2, Save, MousePointer2, Edit, ExternalLink } from 'lucide-react';

const buttonLabels: Record<string, { name: string; name_bn: string; description: string }> = {
  hero_primary: { name: 'Hero Primary Button', name_bn: 'হিরো প্রাথমিক বাটন', description: 'হিরো সেকশনের প্রথম বাটন (যেমন: ভর্তি তথ্য)' },
  hero_secondary: { name: 'Hero Secondary Button', name_bn: 'হিরো গৌণ বাটন', description: 'হিরো সেকশনের দ্বিতীয় বাটন (যেমন: যোগাযোগ)' },
  cta_primary: { name: 'CTA Primary Button', name_bn: 'CTA প্রাথমিক বাটন', description: 'পেজের নিচের CTA সেকশনের প্রথম বাটন' },
  cta_secondary: { name: 'CTA Secondary Button', name_bn: 'CTA গৌণ বাটন', description: 'পেজের নিচের CTA সেকশনের দ্বিতীয় বাটন' },
};

export default function CTAButtonsManager() {
  const { data: buttons, isLoading } = useWebsiteCTAButtons();
  const updateButton = useUpdateWebsiteCTAButton();
  const [editingButton, setEditingButton] = useState<WebsiteCTAButton | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSave = async () => {
    if (!editingButton) return;
    await updateButton.mutateAsync(editingButton);
    setDialogOpen(false);
  };

  if (isLoading) {
    return (
      <MainLayout title="CTA Buttons" titleBn="বাটন লিংক সেটিংস">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="CTA Buttons" titleBn="বাটন লিংক সেটিংস">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointer2 className="w-5 h-5" />
              বাটন লিংক ম্যানেজমেন্ট
            </CardTitle>
            <CardDescription>
              ওয়েবসাইটের বিভিন্ন বাটনে ক্লিক করলে কোথায় যাবে তা সেট করুন
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {buttons?.map((button) => {
                const info = buttonLabels[button.button_key] || { name: button.button_key, name_bn: button.button_key, description: '' };
                return (
                  <div
                    key={button.id}
                    className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{info.name_bn}</h4>
                        {!button.is_enabled && (
                          <span className="text-xs px-2 py-0.5 bg-muted rounded">নিষ্ক্রিয়</span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{info.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm">
                        <span className="font-bengali">"{button.label_bn || button.label}"</span>
                        <ExternalLink className="w-3 h-3" />
                        <code className="px-2 py-0.5 bg-muted rounded text-xs">{button.link_url}</code>
                      </div>
                    </div>
                    <Dialog open={dialogOpen && editingButton?.id === button.id} onOpenChange={(open) => {
                      setDialogOpen(open);
                      if (open) setEditingButton(button);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          এডিট
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{info.name_bn} এডিট করুন</DialogTitle>
                        </DialogHeader>
                        {editingButton && (
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label>বাটন টেক্সট (English)</Label>
                              <Input
                                value={editingButton.label}
                                onChange={(e) => setEditingButton({ ...editingButton, label: e.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>বাটন টেক্সট (বাংলা)</Label>
                              <Input
                                value={editingButton.label_bn || ''}
                                onChange={(e) => setEditingButton({ ...editingButton, label_bn: e.target.value })}
                                className="font-bengali"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>লিংক URL</Label>
                              <Input
                                value={editingButton.link_url}
                                onChange={(e) => setEditingButton({ ...editingButton, link_url: e.target.value })}
                                placeholder="/website/admissions"
                              />
                              <p className="text-xs text-muted-foreground">
                                উদাহরণ: /website/admissions, /website/contact, /website/notices
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <Label>বাটন সক্রিয়</Label>
                              <Switch
                                checked={editingButton.is_enabled}
                                onCheckedChange={(checked) => setEditingButton({ ...editingButton, is_enabled: checked })}
                              />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                বাতিল
                              </Button>
                              <Button onClick={handleSave} disabled={updateButton.isPending}>
                                {updateButton.isPending ? (
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4 mr-2" />
                                )}
                                সংরক্ষণ
                              </Button>
                            </div>
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ব্যবহারের নির্দেশিকা</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• <strong>Hero বাটন:</strong> হোম পেজের উপরের স্লাইডার সেকশনে থাকে</p>
            <p>• <strong>CTA বাটন:</strong> হোম পেজের নিচের "কল টু অ্যাকশন" সেকশনে থাকে</p>
            <p>• লিংক URL-এ আপনার ওয়েবসাইটের যেকোনো পেজের পাথ দিতে পারেন</p>
            <p>• বাহ্যিক লিংকের জন্য সম্পূর্ণ URL দিন (https://...)</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
