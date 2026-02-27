import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useDailyFinanceSummary, useTodayExpenses, useAddExpense, useUpdateExpense, type Expense } from '@/hooks/queries/useExpenses';
import { toast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Wallet, TrendingDown, TrendingUp, Banknote } from 'lucide-react';
import { format } from 'date-fns';

const PAYMENT_METHODS = [
  { value: 'cash', label: 'নগদ (Cash)' },
  { value: 'bank', label: 'ব্যাংক (Bank)' },
  { value: 'bkash', label: 'বিকাশ (bKash)' },
  { value: 'nagad', label: 'নগদ মোবাইল (Nagad)' },
  { value: 'other', label: 'অন্যান্য (Other)' },
];

const CATEGORIES = [
  { value: 'salary', label: 'বেতন' },
  { value: 'utilities', label: 'ইউটিলিটি' },
  { value: 'maintenance', label: 'মেরামত' },
  { value: 'supplies', label: 'সরবরাহ' },
  { value: 'transport', label: 'পরিবহন' },
  { value: 'food', label: 'খাবার' },
  { value: 'other', label: 'অন্যান্য' },
];

function ExpenseForm({ expense, onClose }: { expense?: Expense; onClose: () => void }) {
  const addExpense = useAddExpense();
  const updateExpense = useUpdateExpense();
  const [title, setTitle] = useState(expense?.title || '');
  const [amount, setAmount] = useState(expense?.amount?.toString() || '');
  const [paymentMethod, setPaymentMethod] = useState(expense?.payment_method || 'cash');
  const [category, setCategory] = useState(expense?.category || 'other');
  const [notes, setNotes] = useState(expense?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    const data = { title, amount: parseFloat(amount), payment_method: paymentMethod, category, notes: notes || undefined };

    if (expense) {
      updateExpense.mutate({ id: expense.id, ...data }, {
        onSuccess: () => { toast({ title: 'খরচ আপডেট হয়েছে' }); onClose(); },
      });
    } else {
      addExpense.mutate(data, {
        onSuccess: () => { toast({ title: 'নতুন খরচ যোগ হয়েছে' }); onClose(); },
      });
    }
  };

  const isLoading = addExpense.isPending || updateExpense.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="font-bengali">শিরোনাম *</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="খরচের বিবরণ" required />
      </div>
      <div>
        <Label className="font-bengali">পরিমাণ (৳) *</Label>
        <Input type="number" min="0" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
      </div>
      <div>
        <Label className="font-bengali">পেমেন্ট মাধ্যম</Label>
        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{PAYMENT_METHODS.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label className="font-bengali">ক্যাটাগরি</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div>
        <Label className="font-bengali">নোট</Label>
        <Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="ঐচ্ছিক নোট" />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {expense ? 'আপডেট করুন' : 'খরচ যোগ করুন'}
      </Button>
    </form>
  );
}

export default function AccountsDashboard() {
  const { data: summary, isLoading: summaryLoading } = useDailyFinanceSummary();
  const { data: expenses, isLoading: expensesLoading } = useTodayExpenses();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingExpense(undefined);
  };

  if (summaryLoading) {
    return (
      <MainLayout title="Accounts Dashboard" titleBn="হিসাব ড্যাশবোর্ড">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Accounts Dashboard" titleBn="হিসাব ড্যাশবোর্ড">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Banknote className="w-7 h-7 text-primary" />
              <span className="font-bengali">আজকের হিসাব</span>
            </h1>
            <p className="text-muted-foreground">{format(new Date(), 'dd MMMM yyyy')}</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingExpense(undefined)}>
                <Plus className="w-4 h-4 mr-2" />
                <span className="font-bengali">খরচ যোগ</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-bengali">{editingExpense ? 'খরচ সম্পাদনা' : 'নতুন খরচ'}</DialogTitle>
              </DialogHeader>
              <ExpenseForm expense={editingExpense} onClose={handleCloseDialog} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-bengali">আজকের আদায়</p>
                  <p className="text-2xl font-bold">৳{summary?.total_collection?.toLocaleString() || 0}</p>
                  <p className="text-xs text-muted-foreground">{summary?.transaction_count || 0} transactions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-bengali">আজকের খরচ</p>
                  <p className="text-2xl font-bold">৳{summary?.total_expenses?.toLocaleString() || 0}</p>
                  <p className="text-xs text-muted-foreground">{summary?.expense_count || 0} entries</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-bengali">আজকের ব্যালেন্স</p>
                  <p className="text-2xl font-bold">৳{summary?.net_balance?.toLocaleString() || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Expenses Table */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bengali">আজকের খরচের তালিকা</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : !expenses?.length ? (
              <p className="text-center py-8 text-muted-foreground font-bengali">আজকে কোনো খরচ নেই</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bengali">বিবরণ</TableHead>
                    <TableHead className="font-bengali">ক্যাটাগরি</TableHead>
                    <TableHead className="font-bengali">মাধ্যম</TableHead>
                    <TableHead className="text-right font-bengali">পরিমাণ</TableHead>
                    <TableHead className="font-bengali">সময়</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map(exp => (
                    <TableRow key={exp.id}>
                      <TableCell className="font-medium">{exp.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {CATEGORIES.find(c => c.value === exp.category)?.label || exp.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{PAYMENT_METHODS.find(m => m.value === exp.payment_method)?.label || exp.payment_method}</TableCell>
                      <TableCell className="text-right font-semibold">৳{exp.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{format(new Date(exp.created_at), 'hh:mm a')}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(exp)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
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
