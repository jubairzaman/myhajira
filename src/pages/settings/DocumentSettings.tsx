import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileText, Plus, Edit, Trash2, GripVertical, AlertCircle } from 'lucide-react';
import {
  useAllRequiredDocuments,
  useAddRequiredDocument,
  useUpdateRequiredDocument,
  useDeleteRequiredDocument,
  RequiredDocument,
} from '@/hooks/queries/useDocuments';

export default function DocumentSettings() {
  const { data: documents, isLoading } = useAllRequiredDocuments();
  const addDocument = useAddRequiredDocument();
  const updateDocument = useUpdateRequiredDocument();
  const deleteDocument = useDeleteRequiredDocument();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<RequiredDocument | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_bn: '',
    is_mandatory: true,
    display_order: 0,
  });

  const handleSubmit = async () => {
    if (!formData.name) {
      return;
    }

    if (editingDocument) {
      await updateDocument.mutateAsync({
        id: editingDocument.id,
        name: formData.name,
        nameBn: formData.name_bn,
        isMandatory: formData.is_mandatory,
        displayOrder: formData.display_order,
      });
    } else {
      await addDocument.mutateAsync({
        name: formData.name,
        nameBn: formData.name_bn,
        isMandatory: formData.is_mandatory,
        displayOrder: formData.display_order,
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteDocument.mutateAsync(deleteId);
    setDeleteId(null);
  };

  const handleToggleActive = async (doc: RequiredDocument) => {
    await updateDocument.mutateAsync({
      id: doc.id,
      isActive: !doc.is_active,
    });
  };

  const openEditDialog = (doc: RequiredDocument) => {
    setEditingDocument(doc);
    setFormData({
      name: doc.name,
      name_bn: doc.name_bn || '',
      is_mandatory: doc.is_mandatory,
      display_order: doc.display_order,
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingDocument(null);
    setFormData({
      name: '',
      name_bn: '',
      is_mandatory: true,
      display_order: 0,
    });
  };

  const sortedDocuments = documents?.slice().sort((a, b) => a.display_order - b.display_order) || [];

  return (
    <MainLayout title="Admission Documents" titleBn="ভর্তি ডকুমেন্ট">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Required Documents</h2>
            <p className="text-sm text-muted-foreground font-bengali">ভর্তির প্রয়োজনীয় কাগজপত্র</p>
          </div>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button variant="hero" className="gap-2">
              <Plus className="w-4 h-4" />
              Add Document
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-bengali">
                {editingDocument ? 'ডকুমেন্ট সম্পাদনা' : 'নতুন ডকুমেন্ট যুক্ত করুন'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Document Name</Label>
                  <Input
                    placeholder="e.g., Birth Certificate"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bengali">ডকুমেন্ট নাম</Label>
                  <Input
                    placeholder="যেমন: জন্ম সনদ"
                    value={formData.name_bn}
                    onChange={(e) => setFormData({ ...formData, name_bn: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Display Order</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <Label className="font-bengali">বাধ্যতামূলক</Label>
                    <p className="text-xs text-muted-foreground">Mandatory</p>
                  </div>
                  <Switch
                    checked={formData.is_mandatory}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_mandatory: checked })
                    }
                  />
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                className="w-full"
                disabled={!formData.name || addDocument.isPending || updateDocument.isPending}
              >
                {editingDocument ? 'আপডেট করুন' : 'যুক্ত করুন'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Documents Table */}
      <div className="card-elevated overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-12">#</th>
              <th>Document Name</th>
              <th>ডকুমেন্ট নাম</th>
              <th>Type</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedDocuments.map((doc, index) => (
              <tr key={doc.id} className={!doc.is_active ? 'opacity-50' : ''}>
                <td className="text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-muted-foreground/50" />
                    {index + 1}
                  </div>
                </td>
                <td className="font-medium">{doc.name}</td>
                <td className="font-bengali">{doc.name_bn || '-'}</td>
                <td>
                  {doc.is_mandatory ? (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Mandatory
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Optional</Badge>
                  )}
                </td>
                <td>
                  <Switch
                    checked={doc.is_active}
                    onCheckedChange={() => handleToggleActive(doc)}
                    disabled={updateDocument.isPending}
                  />
                </td>
                <td className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(doc)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => setDeleteId(doc.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedDocuments.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-foreground">No documents configured</p>
            <p className="text-sm text-muted-foreground font-bengali">
              কোন ডকুমেন্ট কনফিগার করা হয়নি
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bengali">ডকুমেন্ট মুছে ফেলুন?</AlertDialogTitle>
            <AlertDialogDescription className="font-bengali">
              এই ডকুমেন্ট মুছে ফেললে শিক্ষার্থীদের সংশ্লিষ্ট রেকর্ডও প্রভাবিত হতে পারে। আপনি কি নিশ্চিত?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              মুছে ফেলুন
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
