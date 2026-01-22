import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  ArrowDownToLine,
  AlertTriangle,
  Search,
} from 'lucide-react';
import {
  useInventoryProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useAddStock,
  useAdjustStock,
  productCategories,
  getCategoryLabel,
  type InventoryProduct,
} from '@/hooks/queries/useInventory';

export default function InventoryManagement() {
  const { data: products, isLoading } = useInventoryProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const addStock = useAddStock();
  const adjustStock = useAdjustStock();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Product dialog
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<InventoryProduct | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    name_bn: '',
    sku: '',
    unit_price: 0,
    stock_quantity: 0,
    min_stock_alert: 10,
    category: 'other',
  });

  // Stock In dialog
  const [stockInDialogOpen, setStockInDialogOpen] = useState(false);
  const [stockInProduct, setStockInProduct] = useState<InventoryProduct | null>(null);
  const [stockInForm, setStockInForm] = useState({
    quantity: 0,
    unit_price: 0,
    notes: '',
  });

  // Stock Adjustment dialog
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState<InventoryProduct | null>(null);
  const [adjustForm, setAdjustForm] = useState({
    quantity: 0,
    notes: '',
  });

  // Filter products
  const filteredProducts = products?.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.name_bn?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  // Low stock count
  const lowStockCount = products?.filter(p => 
    p.stock_quantity <= (p.min_stock_alert || 10)
  ).length || 0;

  // Open product dialog
  const openProductDialog = (product?: InventoryProduct) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        name_bn: product.name_bn || '',
        sku: product.sku || '',
        unit_price: product.unit_price,
        stock_quantity: product.stock_quantity,
        min_stock_alert: product.min_stock_alert || 10,
        category: product.category,
      });
    } else {
      setEditingProduct(null);
      setProductForm({
        name: '',
        name_bn: '',
        sku: '',
        unit_price: 0,
        stock_quantity: 0,
        min_stock_alert: 10,
        category: 'other',
      });
    }
    setProductDialogOpen(true);
  };

  // Save product
  const handleSaveProduct = () => {
    if (!productForm.name || productForm.unit_price < 0) return;

    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, ...productForm },
        { onSuccess: () => setProductDialogOpen(false) }
      );
    } else {
      createProduct.mutate(productForm, {
        onSuccess: () => setProductDialogOpen(false),
      });
    }
  };

  // Delete product
  const handleDeleteProduct = (id: string) => {
    if (confirm('এই পণ্যটি মুছে ফেলতে চান?')) {
      deleteProduct.mutate(id);
    }
  };

  // Open Stock In dialog
  const openStockInDialog = (product: InventoryProduct) => {
    setStockInProduct(product);
    setStockInForm({
      quantity: 0,
      unit_price: product.unit_price,
      notes: '',
    });
    setStockInDialogOpen(true);
  };

  // Add stock
  const handleAddStock = () => {
    if (!stockInProduct || stockInForm.quantity <= 0) return;

    addStock.mutate(
      {
        productId: stockInProduct.id,
        quantity: stockInForm.quantity,
        unitPrice: stockInForm.unit_price,
        notes: stockInForm.notes || undefined,
      },
      { onSuccess: () => setStockInDialogOpen(false) }
    );
  };

  // Open adjustment dialog
  const openAdjustDialog = (product: InventoryProduct) => {
    setAdjustProduct(product);
    setAdjustForm({ quantity: 0, notes: '' });
    setAdjustDialogOpen(true);
  };

  // Adjust stock
  const handleAdjustStock = () => {
    if (!adjustProduct || adjustForm.quantity === 0) return;

    adjustStock.mutate(
      {
        productId: adjustProduct.id,
        quantity: adjustForm.quantity,
        notes: adjustForm.notes || undefined,
      },
      { onSuccess: () => setAdjustDialogOpen(false) }
    );
  };

  return (
    <MainLayout title="ইনভেন্টরি ম্যানেজমেন্ট">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Package className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">ইনভেন্টরি ম্যানেজমেন্ট</h1>
            <p className="text-muted-foreground">Inventory Management</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-sm text-muted-foreground">মোট পণ্য</div>
              <div className="text-2xl font-bold text-primary">
                {products?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-sm text-muted-foreground">সক্রিয় পণ্য</div>
              <div className="text-2xl font-bold text-green-600">
                {products?.filter(p => p.is_active).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <div className="text-sm text-muted-foreground">মোট স্টক</div>
              <div className="text-2xl font-bold">
                {products?.reduce((sum, p) => sum + p.stock_quantity, 0) || 0}
              </div>
            </CardContent>
          </Card>
          <Card className={lowStockCount > 0 ? 'border-orange-300 dark:border-orange-700' : ''}>
            <CardContent className="py-4 text-center">
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                {lowStockCount > 0 && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                কম স্টক
              </div>
              <div className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-orange-500' : ''}`}>
                {lowStockCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="পণ্য খুঁজুন..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="ক্যাটাগরি" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">সব ক্যাটাগরি</SelectItem>
                  {productCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => openProductDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                নতুন পণ্য
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Products Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">পণ্যের তালিকা</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>পণ্যের নাম</TableHead>
                      <TableHead>ক্যাটাগরি</TableHead>
                      <TableHead className="text-right">মূল্য</TableHead>
                      <TableHead className="text-right">স্টক</TableHead>
                      <TableHead>স্ট্যাটাস</TableHead>
                      <TableHead className="w-32">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product) => {
                      const isLowStock = product.stock_quantity <= (product.min_stock_alert || 10);
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="font-medium">{product.name}</div>
                            {product.name_bn && (
                              <div className="text-sm text-muted-foreground">{product.name_bn}</div>
                            )}
                            {product.sku && (
                              <div className="text-xs text-muted-foreground font-mono">
                                SKU: {product.sku}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{getCategoryLabel(product.category)}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            ৳ {product.unit_price.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={isLowStock ? 'text-orange-500 font-bold' : ''}>
                              {product.stock_quantity}
                            </span>
                            {isLowStock && (
                              <AlertTriangle className="w-4 h-4 inline ml-1 text-orange-500" />
                            )}
                          </TableCell>
                          <TableCell>
                            {product.is_active ? (
                              <Badge className="bg-green-100 text-green-700">সক্রিয়</Badge>
                            ) : (
                              <Badge variant="secondary">নিষ্ক্রিয়</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openStockInDialog(product)}
                                title="স্টক যোগ করুন"
                              >
                                <ArrowDownToLine className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openProductDialog(product)}
                                title="সম্পাদনা"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteProduct(product.id)}
                                title="মুছুন"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>কোন পণ্য পাওয়া যায়নি</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={() => openProductDialog()}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  নতুন পণ্য যুক্ত করুন
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product Add/Edit Dialog */}
        <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'পণ্য সম্পাদনা' : 'নতুন পণ্য যুক্ত করুন'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>পণ্যের নাম (English)*</Label>
                  <Input
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Product Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>পণ্যের নাম (বাংলা)</Label>
                  <Input
                    value={productForm.name_bn}
                    onChange={(e) => setProductForm({ ...productForm, name_bn: e.target.value })}
                    placeholder="পণ্যের নাম"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>SKU / কোড</Label>
                  <Input
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                    placeholder="SKU-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>ক্যাটাগরি*</Label>
                  <Select 
                    value={productForm.category} 
                    onValueChange={(v) => setProductForm({ ...productForm, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>একক মূল্য (৳)*</Label>
                  <Input
                    type="number"
                    min={0}
                    value={productForm.unit_price}
                    onChange={(e) => setProductForm({ ...productForm, unit_price: Number(e.target.value) })}
                  />
                </div>
                {!editingProduct && (
                  <div className="space-y-2">
                    <Label>প্রাথমিক স্টক</Label>
                    <Input
                      type="number"
                      min={0}
                      value={productForm.stock_quantity}
                      onChange={(e) => setProductForm({ ...productForm, stock_quantity: Number(e.target.value) })}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>কম স্টক সতর্কতা (যখন এর নিচে যাবে)</Label>
                <Input
                  type="number"
                  min={0}
                  value={productForm.min_stock_alert}
                  onChange={(e) => setProductForm({ ...productForm, min_stock_alert: Number(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setProductDialogOpen(false)}>
                বাতিল
              </Button>
              <Button 
                onClick={handleSaveProduct} 
                disabled={createProduct.isPending || updateProduct.isPending}
              >
                {editingProduct ? 'আপডেট করুন' : 'যুক্ত করুন'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stock In Dialog */}
        <Dialog open={stockInDialogOpen} onOpenChange={setStockInDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>স্টক যোগ করুন</DialogTitle>
            </DialogHeader>
            {stockInProduct && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="font-medium">{stockInProduct.name}</div>
                  {stockInProduct.name_bn && (
                    <div className="text-sm text-muted-foreground">{stockInProduct.name_bn}</div>
                  )}
                  <div className="text-sm mt-2">
                    বর্তমান স্টক: <span className="font-bold">{stockInProduct.stock_quantity}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>পরিমাণ*</Label>
                    <Input
                      type="number"
                      min={1}
                      value={stockInForm.quantity}
                      onChange={(e) => setStockInForm({ ...stockInForm, quantity: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ক্রয় মূল্য (৳)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={stockInForm.unit_price}
                      onChange={(e) => setStockInForm({ ...stockInForm, unit_price: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>মন্তব্য</Label>
                  <Textarea
                    value={stockInForm.notes}
                    onChange={(e) => setStockInForm({ ...stockInForm, notes: e.target.value })}
                    placeholder="ঐচ্ছিক মন্তব্য..."
                  />
                </div>

                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">যোগ হওয়ার পর স্টক</div>
                  <div className="text-xl font-bold text-green-600">
                    {stockInProduct.stock_quantity + stockInForm.quantity}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setStockInDialogOpen(false)}>
                বাতিল
              </Button>
              <Button onClick={handleAddStock} disabled={addStock.isPending}>
                <ArrowDownToLine className="w-4 h-4 mr-2" />
                স্টক যোগ করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Stock Adjustment Dialog */}
        <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>স্টক এডজাস্টমেন্ট</DialogTitle>
            </DialogHeader>
            {adjustProduct && (
              <div className="space-y-4 py-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="font-medium">{adjustProduct.name}</div>
                  <div className="text-sm mt-2">
                    বর্তমান স্টক: <span className="font-bold">{adjustProduct.stock_quantity}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>এডজাস্টমেন্ট পরিমাণ (+ বা -)</Label>
                  <Input
                    type="number"
                    value={adjustForm.quantity}
                    onChange={(e) => setAdjustForm({ ...adjustForm, quantity: Number(e.target.value) })}
                    placeholder="+10 বা -5"
                  />
                  <p className="text-xs text-muted-foreground">
                    ধনাত্মক = স্টক বাড়ানো, ঋণাত্মক = স্টক কমানো
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>কারণ*</Label>
                  <Textarea
                    value={adjustForm.notes}
                    onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                    placeholder="এডজাস্টমেন্টের কারণ লিখুন..."
                  />
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">এডজাস্টমেন্টের পর স্টক</div>
                  <div className="text-xl font-bold">
                    {adjustProduct.stock_quantity + adjustForm.quantity}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setAdjustDialogOpen(false)}>
                বাতিল
              </Button>
              <Button onClick={handleAdjustStock} disabled={adjustStock.isPending}>
                এডজাস্ট করুন
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
