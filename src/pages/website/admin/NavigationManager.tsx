 import { useState } from 'react';
import { useWebsitePages, useUpdateWebsitePage, useCreateWebsitePage, useDeleteWebsitePage, WebsitePage } from '@/hooks/queries/useWebsiteCMS';
 import { MainLayout } from '@/components/layout/MainLayout';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Switch } from '@/components/ui/switch';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Textarea } from '@/components/ui/textarea';
 import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { Badge } from '@/components/ui/badge';
 import { Plus, Pencil, Trash2, GripVertical, ExternalLink } from 'lucide-react';
 import { toast } from 'sonner';
 
 export default function NavigationManager() {
   const { data: pages, isLoading } = useWebsitePages();
  const updatePages = useUpdateWebsitePage();
   const createPage = useCreateWebsitePage();
   const deletePage = useDeleteWebsitePage();
   
   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
   const [editingPage, setEditingPage] = useState<any>(null);
   const [formData, setFormData] = useState({
     title: '',
     title_bn: '',
     slug: '',
     is_enabled: true,
     parent_page_id: null as string | null,
     is_custom_page: false,
     custom_content: '',
     custom_content_bn: '',
     display_order: 0,
   });
 
   const parentPages = pages?.filter(p => !p.parent_page_id) || [];
   const sortedPages = [...(pages || [])].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
 
   const resetForm = () => {
     setFormData({
       title: '',
       title_bn: '',
       slug: '',
       is_enabled: true,
       parent_page_id: null,
       is_custom_page: false,
       custom_content: '',
       custom_content_bn: '',
       display_order: (pages?.length || 0) + 1,
     });
     setEditingPage(null);
   };
 
   const handleEdit = (page: any) => {
     setEditingPage(page);
     setFormData({
       title: page.title || '',
       title_bn: page.title_bn || '',
       slug: page.slug || '',
       is_enabled: page.is_enabled ?? true,
       parent_page_id: page.parent_page_id || null,
       is_custom_page: page.is_custom_page || false,
       custom_content: page.custom_content || '',
       custom_content_bn: page.custom_content_bn || '',
       display_order: page.display_order || 0,
     });
     setIsAddDialogOpen(true);
   };
 
   const handleSave = async () => {
     if (!formData.title || !formData.slug) {
       toast.error('Title and slug are required');
       return;
     }
 
     try {
       if (editingPage) {
         await updatePages.mutateAsync({
           id: editingPage.id,
           ...formData,
        } as any);
         toast.success('পেজ আপডেট হয়েছে');
       } else {
        await createPage.mutateAsync(formData as any);
         toast.success('নতুন পেজ তৈরি হয়েছে');
       }
       setIsAddDialogOpen(false);
       resetForm();
     } catch (error) {
       toast.error('Error saving page');
     }
   };
 
   const handleDelete = async (page: any) => {
     if (!confirm(`"${page.title_bn || page.title}" পেজটি মুছে ফেলতে চান?`)) return;
     
     try {
       await deletePage.mutateAsync(page.id);
       toast.success('পেজ মুছে ফেলা হয়েছে');
     } catch (error) {
       toast.error('Error deleting page');
     }
   };
 
   const handleToggleEnabled = async (page: any) => {
     try {
       await updatePages.mutateAsync({
         id: page.id,
         is_enabled: !page.is_enabled,
       });
       toast.success(page.is_enabled ? 'পেজ বন্ধ করা হয়েছে' : 'পেজ চালু করা হয়েছে');
     } catch (error) {
       toast.error('Error updating page');
     }
   };
 
   const getParentName = (parentId: string | null) => {
     if (!parentId) return null;
     const parent = pages?.find(p => p.id === parentId);
     return parent?.title_bn || parent?.title;
   };
 
   return (
     <MainLayout title="Navigation Manager" titleBn="ন্যাভিগেশন ম্যানেজার">
       <div className="space-y-6">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between">
             <div>
               <CardTitle className="font-bengali">পেজ ও ন্যাভিগেশন</CardTitle>
               <CardDescription className="font-bengali">
                 ওয়েবসাইটের পেজ এবং মেনু আইটেম পরিচালনা করুন
               </CardDescription>
             </div>
             <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
               setIsAddDialogOpen(open);
               if (!open) resetForm();
             }}>
               <DialogTrigger asChild>
                 <Button>
                   <Plus className="w-4 h-4 mr-2" />
                   নতুন পেজ
                 </Button>
               </DialogTrigger>
               <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                 <DialogHeader>
                   <DialogTitle className="font-bengali">
                     {editingPage ? 'পেজ সম্পাদনা' : 'নতুন পেজ তৈরি'}
                   </DialogTitle>
                   <DialogDescription className="font-bengali">
                     পেজের তথ্য পূরণ করুন
                   </DialogDescription>
                 </DialogHeader>
                 
                 <div className="space-y-4 py-4">
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label>Title (English)</Label>
                       <Input
                         value={formData.title}
                         onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                         placeholder="About Us"
                       />
                     </div>
                     <div className="space-y-2">
                       <Label>শিরোনাম (বাংলা)</Label>
                       <Input
                         value={formData.title_bn}
                         onChange={(e) => setFormData({ ...formData, title_bn: e.target.value })}
                         placeholder="আমাদের সম্পর্কে"
                         className="font-bengali"
                       />
                     </div>
                   </div>
 
                   <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                       <Label>Slug (URL)</Label>
                       <Input
                         value={formData.slug}
                         onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                         placeholder="about-us"
                       />
                       <p className="text-xs text-muted-foreground">URL: /{formData.slug}</p>
                     </div>
                     <div className="space-y-2">
                       <Label>প্যারেন্ট পেজ (সাব-মেনুর জন্য)</Label>
                       <Select
                         value={formData.parent_page_id || 'none'}
                         onValueChange={(value) => setFormData({ ...formData, parent_page_id: value === 'none' ? null : value })}
                       >
                         <SelectTrigger>
                           <SelectValue placeholder="কোনো প্যারেন্ট নেই" />
                         </SelectTrigger>
                         <SelectContent>
                           <SelectItem value="none">কোনো প্যারেন্ট নেই (Top Level)</SelectItem>
                           {parentPages.filter(p => p.id !== editingPage?.id).map((page) => (
                             <SelectItem key={page.id} value={page.id}>
                               {page.title_bn || page.title}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                   </div>
 
                   <div className="flex items-center gap-6">
                     <div className="flex items-center gap-2">
                       <Switch
                         checked={formData.is_enabled}
                         onCheckedChange={(checked) => setFormData({ ...formData, is_enabled: checked })}
                       />
                       <Label>সক্রিয়</Label>
                     </div>
                     <div className="flex items-center gap-2">
                       <Switch
                         checked={formData.is_custom_page}
                         onCheckedChange={(checked) => setFormData({ ...formData, is_custom_page: checked })}
                       />
                       <Label>কাস্টম পেজ</Label>
                     </div>
                   </div>
 
                   {formData.is_custom_page && (
                     <div className="space-y-4 border-t pt-4">
                       <div className="space-y-2">
                         <Label>Custom Content (English)</Label>
                         <Textarea
                           value={formData.custom_content}
                           onChange={(e) => setFormData({ ...formData, custom_content: e.target.value })}
                           placeholder="Enter HTML or markdown content..."
                           rows={6}
                         />
                       </div>
                       <div className="space-y-2">
                         <Label>কাস্টম কন্টেন্ট (বাংলা)</Label>
                         <Textarea
                           value={formData.custom_content_bn}
                           onChange={(e) => setFormData({ ...formData, custom_content_bn: e.target.value })}
                           placeholder="HTML বা মার্কডাউন কন্টেন্ট লিখুন..."
                           rows={6}
                           className="font-bengali"
                         />
                       </div>
                     </div>
                   )}
 
                   <div className="space-y-2">
                     <Label>Display Order</Label>
                     <Input
                       type="number"
                       value={formData.display_order}
                       onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                     />
                   </div>
                 </div>
 
                 <DialogFooter>
                   <Button variant="outline" onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>
                     বাতিল
                   </Button>
                   <Button onClick={handleSave} disabled={updatePages.isPending || createPage.isPending}>
                     {editingPage ? 'আপডেট করুন' : 'তৈরি করুন'}
                   </Button>
                 </DialogFooter>
               </DialogContent>
             </Dialog>
           </CardHeader>
           <CardContent>
             {isLoading ? (
               <div className="text-center py-8 text-muted-foreground">লোড হচ্ছে...</div>
             ) : (
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="w-12">#</TableHead>
                     <TableHead>পেজ</TableHead>
                     <TableHead>Slug</TableHead>
                     <TableHead>প্যারেন্ট</TableHead>
                     <TableHead>টাইপ</TableHead>
                     <TableHead>স্ট্যাটাস</TableHead>
                     <TableHead className="text-right">অ্যাকশন</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {sortedPages.map((page, index) => (
                     <TableRow key={page.id} className={page.parent_page_id ? 'bg-muted/30' : ''}>
                       <TableCell className="text-muted-foreground">
                         {page.parent_page_id ? '↳' : index + 1}
                       </TableCell>
                       <TableCell>
                         <div>
                           <div className="font-medium font-bengali">{page.title_bn || page.title}</div>
                           {page.title_bn && <div className="text-xs text-muted-foreground">{page.title}</div>}
                         </div>
                       </TableCell>
                       <TableCell>
                         <code className="text-xs bg-muted px-1 py-0.5 rounded">/{page.slug}</code>
                       </TableCell>
                       <TableCell>
                         {page.parent_page_id ? (
                           <Badge variant="secondary" className="font-bengali">
                             {getParentName(page.parent_page_id)}
                           </Badge>
                         ) : (
                           <span className="text-muted-foreground">-</span>
                         )}
                       </TableCell>
                       <TableCell>
                         <Badge variant={page.is_custom_page ? 'default' : 'outline'}>
                           {page.is_custom_page ? 'কাস্টম' : 'সিস্টেম'}
                         </Badge>
                       </TableCell>
                       <TableCell>
                         <Switch
                           checked={page.is_enabled}
                           onCheckedChange={() => handleToggleEnabled(page)}
                         />
                       </TableCell>
                       <TableCell className="text-right">
                         <div className="flex items-center justify-end gap-2">
                           <Button variant="ghost" size="icon" onClick={() => handleEdit(page)}>
                             <Pencil className="w-4 h-4" />
                           </Button>
                           <Button 
                             variant="ghost" 
                             size="icon" 
                             className="text-destructive hover:text-destructive"
                             onClick={() => handleDelete(page)}
                           >
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         </div>
                       </TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
             )}
           </CardContent>
         </Card>
       </div>
     </MainLayout>
   );
 }