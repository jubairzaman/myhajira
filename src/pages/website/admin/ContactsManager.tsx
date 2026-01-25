import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWebsiteContacts, useMarkWebsiteContactRead, useDeleteWebsiteContact } from '@/hooks/queries/useWebsiteCMS';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Mail, MailOpen, Trash2, Eye, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function ContactsManager() {
  const { data: contacts, isLoading } = useWebsiteContacts();
  const markRead = useMarkWebsiteContactRead();
  const deleteContact = useDeleteWebsiteContact();
  const { toast } = useToast();

  const [selectedContact, setSelectedContact] = useState<any>(null);

  const unreadContacts = contacts?.filter((c) => !c.is_read) || [];
  const readContacts = contacts?.filter((c) => c.is_read) || [];

  const handleView = async (contact: any) => {
    setSelectedContact(contact);
    if (!contact.is_read) {
      try {
        await markRead.mutateAsync(contact.id);
      } catch (error) {
        // Silent fail for marking as read
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await deleteContact.mutateAsync(id);
      toast({ title: 'Message deleted successfully' });
      if (selectedContact?.id === id) {
        setSelectedContact(null);
      }
    } catch (error) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Contact Messages" titleBn="যোগাযোগ বার্তা">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </MainLayout>
    );
  }

  const ContactTable = ({ data }: { data: any[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>From</TableHead>
          <TableHead>Subject</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((contact) => (
          <TableRow key={contact.id} className={!contact.is_read ? 'bg-muted/30' : ''}>
            <TableCell>
              <div className="flex items-center gap-2">
                {!contact.is_read ? (
                  <Mail className="w-4 h-4 text-primary" />
                ) : (
                  <MailOpen className="w-4 h-4 text-muted-foreground" />
                )}
                <div>
                  <p className={`${!contact.is_read ? 'font-semibold' : ''}`}>{contact.name}</p>
                  <p className="text-sm text-muted-foreground">{contact.email || contact.phone}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <p className={`${!contact.is_read ? 'font-medium' : ''}`}>
                {contact.subject || 'No Subject'}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-1">{contact.message}</p>
            </TableCell>
            <TableCell>{format(new Date(contact.created_at), 'dd MMM yyyy, HH:mm')}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button size="icon" variant="ghost" onClick={() => handleView(contact)}>
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => handleDelete(contact.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
        {data.length === 0 && (
          <TableRow>
            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
              No messages found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <MainLayout title="Contact Messages" titleBn="যোগাযোগ বার্তা">
      <div className="space-y-6">
        <Tabs defaultValue="unread">
          <TabsList>
            <TabsTrigger value="unread" className="gap-2">
              <Mail className="w-4 h-4" /> Unread
              {unreadContacts.length > 0 && (
                <Badge variant="destructive" className="ml-1">{unreadContacts.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="read" className="gap-2">
              <MailOpen className="w-4 h-4" /> Read ({readContacts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="unread">
            <Card>
              <CardHeader>
                <CardTitle>Unread Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactTable data={unreadContacts} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="read">
            <Card>
              <CardHeader>
                <CardTitle>Read Messages</CardTitle>
              </CardHeader>
              <CardContent>
                <ContactTable data={readContacts} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={!!selectedContact} onOpenChange={(open) => !open && setSelectedContact(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Message Details</DialogTitle>
            </DialogHeader>
            {selectedContact && (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">From:</span>
                    <span>{selectedContact.name}</span>
                  </div>
                  {selectedContact.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${selectedContact.email}`} className="text-primary hover:underline">
                        {selectedContact.email}
                      </a>
                    </div>
                  )}
                  {selectedContact.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${selectedContact.phone}`} className="text-primary hover:underline">
                        {selectedContact.phone}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(selectedContact.created_at), 'dd MMM yyyy, HH:mm')}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="font-medium mb-2">{selectedContact.subject || 'No Subject'}</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedContact.message}</p>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  {selectedContact.email && (
                    <Button asChild>
                      <a href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject || 'Your message'}`}>
                        <Mail className="w-4 h-4 mr-2" /> Reply
                      </a>
                    </Button>
                  )}
                  <Button variant="destructive" onClick={() => handleDelete(selectedContact.id)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
