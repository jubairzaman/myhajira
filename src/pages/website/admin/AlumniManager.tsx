import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  useWebsiteAlumni, 
  useApproveWebsiteAlumni, 
  useUpdateWebsiteAlumni, 
  useDeleteWebsiteAlumni,
  useWebsiteAlumniPodcasts,
  useCreateWebsiteAlumniPodcast,
  useUpdateWebsiteAlumniPodcast,
  useDeleteWebsiteAlumniPodcast,
} from '@/hooks/queries/useWebsiteCMS';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Pencil, Trash2, Check, Star, User, Youtube, Plus, ExternalLink } from 'lucide-react';

interface AlumniFormData {
  name: string;
  name_bn: string;
  passing_year: number;
  current_position: string;
  current_position_bn: string;
  comment: string;
  comment_bn: string;
  photo_url: string;
  is_featured: boolean;
  show_in_bubble: boolean;
}

interface PodcastFormData {
  title: string;
  title_bn: string;
  description: string;
  description_bn: string;
  youtube_url: string;
  thumbnail_url: string;
  is_featured: boolean;
  display_order: number;
}

const currentYear = new Date().getFullYear();

// Extract YouTube video ID
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function AlumniManager() {
  const { data: alumni, isLoading } = useWebsiteAlumni();
  const { data: podcasts, isLoading: podcastsLoading } = useWebsiteAlumniPodcasts();
  const approveAlumni = useApproveWebsiteAlumni();
  const updateAlumni = useUpdateWebsiteAlumni();
  const deleteAlumni = useDeleteWebsiteAlumni();
  const createPodcast = useCreateWebsiteAlumniPodcast();
  const updatePodcast = useUpdateWebsiteAlumniPodcast();
  const deletePodcast = useDeleteWebsiteAlumniPodcast();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AlumniFormData>({
    name: '',
    name_bn: '',
    passing_year: currentYear - 5,
    current_position: '',
    current_position_bn: '',
    comment: '',
    comment_bn: '',
    photo_url: '',
    is_featured: false,
    show_in_bubble: true,
  });

  const [isPodcastDialogOpen, setIsPodcastDialogOpen] = useState(false);
  const [editingPodcastId, setEditingPodcastId] = useState<string | null>(null);
  const [podcastForm, setPodcastForm] = useState<PodcastFormData>({
    title: '',
    title_bn: '',
    description: '',
    description_bn: '',
    youtube_url: '',
    thumbnail_url: '',
    is_featured: false,
    display_order: 0,
  });

  const pendingAlumni = alumni?.filter((a) => !a.is_approved) || [];
  const approvedAlumni = alumni?.filter((a) => a.is_approved) || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateAlumni.mutateAsync({ id: editingId, ...formData });
        toast({ title: 'Alumni updated successfully' });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({ title: 'Operation failed', variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_bn: '',
      passing_year: currentYear - 5,
      current_position: '',
      current_position_bn: '',
      comment: '',
      comment_bn: '',
      photo_url: '',
      is_featured: false,
      show_in_bubble: true,
    });
    setEditingId(null);
  };

  const handleEdit = (alum: any) => {
    setFormData({
      name: alum.name,
      name_bn: alum.name_bn || '',
      passing_year: alum.passing_year,
      current_position: alum.current_position || '',
      current_position_bn: alum.current_position_bn || '',
      comment: alum.comment || '',
      comment_bn: alum.comment_bn || '',
      photo_url: alum.photo_url || '',
      is_featured: alum.is_featured,
      show_in_bubble: alum.show_in_bubble,
    });
    setEditingId(alum.id);
    setIsDialogOpen(true);
  };

  const handleApprove = async (id: string) => {
    try {
      await approveAlumni.mutateAsync(id);
      toast({ title: 'Alumni approved successfully' });
    } catch (error) {
      toast({ title: 'Approval failed', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alumni?')) return;
    try {
      await deleteAlumni.mutateAsync(id);
      toast({ title: 'Alumni deleted successfully' });
    } catch (error) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  // Podcast handlers
  const resetPodcastForm = () => {
    setPodcastForm({
      title: '',
      title_bn: '',
      description: '',
      description_bn: '',
      youtube_url: '',
      thumbnail_url: '',
      is_featured: false,
      display_order: 0,
    });
    setEditingPodcastId(null);
  };

  const handlePodcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPodcastId) {
        await updatePodcast.mutateAsync({ id: editingPodcastId, ...podcastForm });
      } else {
        await createPodcast.mutateAsync(podcastForm);
      }
      setIsPodcastDialogOpen(false);
      resetPodcastForm();
    } catch (error) {
      toast({ title: 'Operation failed', variant: 'destructive' });
    }
  };

  const handleEditPodcast = (podcast: any) => {
    setPodcastForm({
      title: podcast.title,
      title_bn: podcast.title_bn || '',
      description: podcast.description || '',
      description_bn: podcast.description_bn || '',
      youtube_url: podcast.youtube_url,
      thumbnail_url: podcast.thumbnail_url || '',
      is_featured: podcast.is_featured,
      display_order: podcast.display_order,
    });
    setEditingPodcastId(podcast.id);
    setIsPodcastDialogOpen(true);
  };

  const handleDeletePodcast = async (id: string) => {
    if (!confirm('Are you sure you want to delete this podcast?')) return;
    try {
      await deletePodcast.mutateAsync(id);
    } catch (error) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Alumni Management" titleBn="প্রাক্তন ছাত্র ম্যানেজমেন্ট">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  const AlumniTable = ({ data, showApprove = false }: { data: any[]; showApprove?: boolean }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Alumni</TableHead>
          <TableHead>Passing Year</TableHead>
          <TableHead>Position</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((alum) => (
          <TableRow key={alum.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={alum.photo_url} />
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{alum.name}</p>
                  {alum.name_bn && (
                    <p className="text-sm text-muted-foreground font-bengali">{alum.name_bn}</p>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell>{alum.passing_year}</TableCell>
            <TableCell>
              <div>
                <p>{alum.current_position || '-'}</p>
                {alum.current_position_bn && (
                  <p className="text-sm text-muted-foreground font-bengali">{alum.current_position_bn}</p>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                {alum.is_featured && (
                  <Badge className="bg-yellow-500">
                    <Star className="w-3 h-3 mr-1" /> Featured
                  </Badge>
                )}
                {alum.show_in_bubble && (
                  <Badge variant="outline">Bubble</Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {showApprove && (
                  <Button size="icon" variant="ghost" onClick={() => handleApprove(alum.id)}>
                    <Check className="w-4 h-4 text-green-500" />
                  </Button>
                )}
                <Button size="icon" variant="ghost" onClick={() => handleEdit(alum)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(alum.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
              No alumni found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <MainLayout title="Alumni Management" titleBn="প্রাক্তন ছাত্র ম্যানেজমেন্ট">
      <div className="space-y-6">
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              Pending Approval
              {pendingAlumni.length > 0 && (
                <Badge variant="destructive" className="ml-1">{pendingAlumni.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedAlumni.length})</TabsTrigger>
            <TabsTrigger value="podcasts" className="gap-2">
              <Youtube className="w-4 h-4" />
              Podcasts ({podcasts?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <AlumniTable data={pendingAlumni} showApprove />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Approved Alumni</CardTitle>
              </CardHeader>
              <CardContent>
                <AlumniTable data={approvedAlumni} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="podcasts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Youtube className="w-5 h-5 text-red-500" />
                  YouTube Podcasts
                </CardTitle>
                <Button onClick={() => { resetPodcastForm(); setIsPodcastDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Podcast
                </Button>
              </CardHeader>
              <CardContent>
                {podcastsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Thumbnail</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {podcasts?.map((podcast) => {
                        const videoId = getYouTubeVideoId(podcast.youtube_url);
                        return (
                          <TableRow key={podcast.id}>
                            <TableCell>
                              <img
                                src={podcast.thumbnail_url || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                alt={podcast.title}
                                className="w-24 h-14 object-cover rounded"
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium">{podcast.title}</p>
                                {podcast.title_bn && (
                                  <p className="text-sm text-muted-foreground font-bengali">{podcast.title_bn}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {podcast.is_featured && (
                                  <Badge className="bg-red-500">Featured</Badge>
                                )}
                                {podcast.is_enabled ? (
                                  <Badge variant="outline" className="text-green-600 border-green-600">Active</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-gray-400">Hidden</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{podcast.display_order}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="icon" variant="ghost" asChild>
                                  <a href={podcast.youtube_url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => handleEditPodcast(podcast)}>
                                  <Pencil className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => handleDeletePodcast(podcast.id)}>
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {(!podcasts || podcasts.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                            No podcasts yet. Add your first YouTube video!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Alumni Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Alumni</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Name (English) *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Name (বাংলা)</Label>
                  <Input
                    value={formData.name_bn}
                    onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                    className="font-bengali"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Passing Year *</Label>
                  <Input
                    type="number"
                    value={formData.passing_year}
                    onChange={(e) => setFormData({ ...formData, passing_year: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Photo URL</Label>
                  <Input
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Current Position (English)</Label>
                  <Input
                    value={formData.current_position}
                    onChange={(e) => setFormData({ ...formData, current_position: e.target.value })}
                    placeholder="Software Engineer at Google"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Current Position (বাংলা)</Label>
                  <Input
                    value={formData.current_position_bn}
                    onChange={(e) => setFormData({ ...formData, current_position_bn: e.target.value })}
                    className="font-bengali"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Comment (English)</Label>
                  <Textarea
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Comment (বাংলা)</Label>
                  <Textarea
                    value={formData.comment_bn}
                    onChange={(e) => setFormData({ ...formData, comment_bn: e.target.value })}
                    rows={3}
                    className="font-bengali"
                  />
                </div>
              </div>

              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label>Featured</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.show_in_bubble}
                    onCheckedChange={(checked) => setFormData({ ...formData, show_in_bubble: checked })}
                  />
                  <Label>Show in Bubble</Label>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={updateAlumni.isPending}>
                  {updateAlumni.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Update
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Podcast Dialog */}
        <Dialog open={isPodcastDialogOpen} onOpenChange={(open) => {
          setIsPodcastDialogOpen(open);
          if (!open) resetPodcastForm();
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPodcastId ? 'Edit Podcast' : 'Add New Podcast'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePodcastSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>YouTube URL *</Label>
                <Input
                  value={podcastForm.youtube_url}
                  onChange={(e) => setPodcastForm({ ...podcastForm, youtube_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
                {podcastForm.youtube_url && getYouTubeVideoId(podcastForm.youtube_url) && (
                  <img
                    src={`https://img.youtube.com/vi/${getYouTubeVideoId(podcastForm.youtube_url)}/mqdefault.jpg`}
                    alt="Thumbnail preview"
                    className="w-40 h-auto rounded mt-2"
                  />
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title (English) *</Label>
                  <Input
                    value={podcastForm.title}
                    onChange={(e) => setPodcastForm({ ...podcastForm, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Title (বাংলা)</Label>
                  <Input
                    value={podcastForm.title_bn}
                    onChange={(e) => setPodcastForm({ ...podcastForm, title_bn: e.target.value })}
                    className="font-bengali"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Description (English)</Label>
                  <Textarea
                    value={podcastForm.description}
                    onChange={(e) => setPodcastForm({ ...podcastForm, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description (বাংলা)</Label>
                  <Textarea
                    value={podcastForm.description_bn}
                    onChange={(e) => setPodcastForm({ ...podcastForm, description_bn: e.target.value })}
                    rows={3}
                    className="font-bengali"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Custom Thumbnail URL (optional)</Label>
                  <Input
                    value={podcastForm.thumbnail_url}
                    onChange={(e) => setPodcastForm({ ...podcastForm, thumbnail_url: e.target.value })}
                    placeholder="Leave empty to use YouTube thumbnail"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    value={podcastForm.display_order}
                    onChange={(e) => setPodcastForm({ ...podcastForm, display_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={podcastForm.is_featured}
                  onCheckedChange={(checked) => setPodcastForm({ ...podcastForm, is_featured: checked })}
                />
                <Label>Featured (shows as main video)</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsPodcastDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPodcast.isPending || updatePodcast.isPending}>
                  {(createPodcast.isPending || updatePodcast.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingPodcastId ? 'Update' : 'Add Podcast'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
