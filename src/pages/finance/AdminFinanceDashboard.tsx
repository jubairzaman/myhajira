import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useDailyFinanceSummary } from '@/hooks/queries/useExpenses';
import { useRecentTransactions } from '@/hooks/queries/useAdminFinance';
import { Loader2, TrendingUp, TrendingDown, Wallet, Receipt, AlertTriangle, BarChart3 } from 'lucide-react';
import { format } from 'date-fns';

const FEE_TYPE_LABELS: Record<string, string> = {
  monthly: 'মাসিক', admission: 'ভর্তি', session: 'সেশন', exam: 'পরীক্ষা', product_sale: 'পণ্য বিক্রয়',
};

export default function AdminFinanceDashboard() {
  const { data: summary, isLoading: summaryLoading } = useDailyFinanceSummary();
  const { data: transactions, isLoading: txLoading } = useRecentTransactions(20);

  if (summaryLoading) {
    return (
      <MainLayout title="Finance Dashboard" titleBn="ফাইন্যান্স ড্যাশবোর্ড">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  const isDeficit = (summary?.net_balance || 0) < 0;
  const expenseExceedsIncome = (summary?.total_expenses || 0) > (summary?.total_collection || 0);

  return (
    <MainLayout title="Finance Dashboard" titleBn="ফাইন্যান্স ড্যাশবোর্ড">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-primary" />
            <span className="font-bengali">ফাইন্যান্স কমান্ড সেন্টার</span>
          </h1>
          <p className="text-muted-foreground">{format(new Date(), 'EEEE, dd MMMM yyyy')}</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bengali">আজকের আদায়</p>
                  <p className="text-xl font-bold">৳{summary?.total_collection?.toLocaleString() || 0}</p>
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
                  <p className="text-xs text-muted-foreground font-bengali">আজকের খরচ</p>
                  <p className="text-xl font-bold">৳{summary?.total_expenses?.toLocaleString() || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className={isDeficit ? 'border-destructive/50' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDeficit ? 'bg-red-100 dark:bg-red-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                  <Wallet className={`w-6 h-6 ${isDeficit ? 'text-red-600' : 'text-blue-600'}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bengali">নেট ব্যালেন্স</p>
                  <p className={`text-xl font-bold ${isDeficit ? 'text-destructive' : ''}`}>৳{summary?.net_balance?.toLocaleString() || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bengali">ট্রানজেকশন</p>
                  <p className="text-xl font-bold">{summary?.transaction_count || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-bengali">খরচ এন্ট্রি</p>
                  <p className="text-xl font-bold">{summary?.expense_count || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expense Alert */}
        {expenseExceedsIncome && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                <div>
                  <p className="font-semibold font-bengali">⚠️ সতর্কতা: খরচ আদায়ের চেয়ে বেশি!</p>
                  <p className="text-sm text-muted-foreground font-bengali">
                    আজকের খরচ ৳{summary?.total_expenses?.toLocaleString()} কিন্তু আদায় হয়েছে ৳{summary?.total_collection?.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="font-bengali">সাম্প্রতিক লেনদেন (সর্বশেষ ২০)</CardTitle>
          </CardHeader>
          <CardContent>
            {txLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : !transactions?.length ? (
              <p className="text-center py-8 text-muted-foreground font-bengali">কোনো লেনদেন পাওয়া যায়নি</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="font-bengali">রিসিপ্ট</TableHead>
                      <TableHead className="font-bengali">শিক্ষার্থী</TableHead>
                      <TableHead className="font-bengali">শ্রেণী</TableHead>
                      <TableHead className="font-bengali">ফি টাইপ</TableHead>
                      <TableHead className="text-right font-bengali">পরিমাণ</TableHead>
                      <TableHead className="font-bengali">তারিখ</TableHead>
                      <TableHead className="font-bengali">স্ট্যাটাস</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx: any) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-xs">{tx.receipt_number || '-'}</TableCell>
                        <TableCell className="font-medium">{tx.student?.name || '-'}</TableCell>
                        <TableCell>{tx.student?.class?.name || '-'} {tx.student?.section?.name || ''}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{FEE_TYPE_LABELS[tx.fee_type] || tx.fee_type}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">৳{Number(tx.amount_paid).toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {tx.payment_date ? format(new Date(tx.payment_date), 'dd/MM/yy hh:mm a') : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={tx.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'}>
                            {tx.status === 'paid' ? 'পরিশোধিত' : 'আংশিক'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
