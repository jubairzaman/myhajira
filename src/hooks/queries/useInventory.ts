import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAcademicYear } from '@/hooks/useAcademicYear';
import { toast } from 'sonner';

// Types
export interface InventoryProduct {
  id: string;
  name: string;
  name_bn: string | null;
  sku: string | null;
  unit_price: number;
  stock_quantity: number;
  min_stock_alert: number | null;
  category: string;
  is_active: boolean;
  academic_year_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryTransaction {
  id: string;
  product_id: string;
  transaction_type: 'stock_in' | 'sale' | 'adjustment';
  quantity: number;
  unit_price: number;
  total_amount: number;
  student_id: string | null;
  fee_record_id: string | null;
  notes: string | null;
  sold_by: string | null;
  academic_year_id: string | null;
  created_at: string;
  product?: InventoryProduct;
}

// Product categories
export const productCategories = [
  { value: 'diary', label: 'ডায়েরি', labelEn: 'Diary' },
  { value: 'id_card', label: 'আইডি কার্ড', labelEn: 'ID Card' },
  { value: 'fee_book', label: 'বেতন বই', labelEn: 'Fee Book' },
  { value: 'uniform', label: 'ইউনিফর্ম', labelEn: 'Uniform' },
  { value: 'book', label: 'বই', labelEn: 'Book' },
  { value: 'stationery', label: 'স্টেশনারি', labelEn: 'Stationery' },
  { value: 'other', label: 'অন্যান্য', labelEn: 'Other' },
];

// Get category label
export const getCategoryLabel = (category: string) => {
  const cat = productCategories.find(c => c.value === category);
  return cat?.label || category;
};

// Fetch all products
export function useInventoryProducts() {
  const { activeYear } = useAcademicYear();

  return useQuery({
    queryKey: ['inventory-products', activeYear?.id],
    queryFn: async () => {
      if (!activeYear?.id) return [];

      const { data, error } = await (supabase as any)
        .from('inventory_products')
        .select('*')
        .eq('academic_year_id', activeYear.id)
        .order('name');

      if (error) throw error;
      return data as InventoryProduct[];
    },
    enabled: !!activeYear?.id,
  });
}

// Fetch active products with stock
export function useActiveProducts() {
  const { activeYear } = useAcademicYear();

  return useQuery({
    queryKey: ['active-products', activeYear?.id],
    queryFn: async () => {
      if (!activeYear?.id) return [];

      const { data, error } = await (supabase as any)
        .from('inventory_products')
        .select('*')
        .eq('academic_year_id', activeYear.id)
        .eq('is_active', true)
        .gt('stock_quantity', 0)
        .order('name');

      if (error) throw error;
      return data as InventoryProduct[];
    },
    enabled: !!activeYear?.id,
  });
}

// Create product
export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { activeYear } = useAcademicYear();

  return useMutation({
    mutationFn: async (product: {
      name: string;
      name_bn?: string;
      sku?: string;
      unit_price: number;
      stock_quantity?: number;
      min_stock_alert?: number;
      category: string;
    }) => {
      if (!activeYear?.id) throw new Error('No active academic year');

      const { data, error } = await (supabase as any)
        .from('inventory_products')
        .insert({
          ...product,
          academic_year_id: activeYear.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-products'] });
      queryClient.invalidateQueries({ queryKey: ['active-products'] });
      toast.success('পণ্য সফলভাবে যুক্ত হয়েছে');
    },
    onError: (error) => {
      toast.error('পণ্য যুক্ত করতে সমস্যা হয়েছে');
      console.error('Create product error:', error);
    },
  });
}



// Update product
export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...product }: Partial<InventoryProduct> & { id: string }) => {
      const { data, error } = await (supabase as any)
        .from('inventory_products')
        .update(product)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-products'] });
      queryClient.invalidateQueries({ queryKey: ['active-products'] });
      toast.success('পণ্য আপডেট হয়েছে');
    },
    onError: (error) => {
      toast.error('পণ্য আপডেট করতে সমস্যা হয়েছে');
      console.error('Update product error:', error);
    },
  });
}

// Delete product
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('inventory_products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-products'] });
      queryClient.invalidateQueries({ queryKey: ['active-products'] });
      toast.success('পণ্য মুছে ফেলা হয়েছে');
    },
    onError: (error) => {
      toast.error('পণ্য মুছে ফেলতে সমস্যা হয়েছে');
      console.error('Delete product error:', error);
    },
  });
}

// Add stock (Stock In)
export function useAddStock() {
  const queryClient = useQueryClient();
  const { activeYear } = useAcademicYear();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
      unitPrice,
      notes,
    }: {
      productId: string;
      quantity: number;
      unitPrice: number;
      notes?: string;
    }) => {
      if (!activeYear?.id) throw new Error('No active academic year');

      const { data, error } = await (supabase as any)
        .from('inventory_transactions')
        .insert({
          product_id: productId,
          transaction_type: 'stock_in',
          quantity,
          unit_price: unitPrice,
          total_amount: quantity * unitPrice,
          notes,
          academic_year_id: activeYear.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-products'] });
      queryClient.invalidateQueries({ queryKey: ['active-products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      toast.success('স্টক যুক্ত হয়েছে');
    },
    onError: (error) => {
      toast.error('স্টক যুক্ত করতে সমস্যা হয়েছে');
      console.error('Add stock error:', error);
    },
  });
}

// Sell product
export function useSellProduct() {
  const queryClient = useQueryClient();
  const { activeYear } = useAcademicYear();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
      unitPrice,
      studentId,
      feeRecordId,
      notes,
    }: {
      productId: string;
      quantity: number;
      unitPrice: number;
      studentId?: string;
      feeRecordId?: string;
      notes?: string;
    }) => {
      if (!activeYear?.id) throw new Error('No active academic year');

      const { data, error } = await (supabase as any)
        .from('inventory_transactions')
        .insert({
          product_id: productId,
          transaction_type: 'sale',
          quantity,
          unit_price: unitPrice,
          total_amount: quantity * unitPrice,
          student_id: studentId || null,
          fee_record_id: feeRecordId || null,
          notes,
          academic_year_id: activeYear.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-products'] });
      queryClient.invalidateQueries({ queryKey: ['active-products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      toast.success('বিক্রয় সম্পন্ন হয়েছে');
    },
    onError: (error) => {
      toast.error('বিক্রয় করতে সমস্যা হয়েছে');
      console.error('Sell product error:', error);
    },
  });
}

// Adjust stock
export function useAdjustStock() {
  const queryClient = useQueryClient();
  const { activeYear } = useAcademicYear();

  return useMutation({
    mutationFn: async ({
      productId,
      quantity,
      notes,
    }: {
      productId: string;
      quantity: number; // Can be positive or negative
      notes?: string;
    }) => {
      if (!activeYear?.id) throw new Error('No active academic year');

      const { data, error } = await (supabase as any)
        .from('inventory_transactions')
        .insert({
          product_id: productId,
          transaction_type: 'adjustment',
          quantity,
          unit_price: 0,
          total_amount: 0,
          notes,
          academic_year_id: activeYear.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-products'] });
      queryClient.invalidateQueries({ queryKey: ['active-products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-transactions'] });
      toast.success('স্টক এডজাস্ট হয়েছে');
    },
    onError: (error) => {
      toast.error('স্টক এডজাস্ট করতে সমস্যা হয়েছে');
      console.error('Adjust stock error:', error);
    },
  });
}

// Fetch transactions
export function useInventoryTransactions(productId?: string) {
  const { activeYear } = useAcademicYear();

  return useQuery({
    queryKey: ['inventory-transactions', activeYear?.id, productId],
    queryFn: async () => {
      if (!activeYear?.id) return [];

      const { data, error } = await (supabase as any)
        .from('inventory_transactions')
        .select(`
          *,
          product:inventory_products(id, name, name_bn)
        `)
        .eq('academic_year_id', activeYear.id)
        .order('created_at', { ascending: false });

      if (productId) {
        // Filter in-memory for now since we need to use 'as any'
      }

      if (error) throw error;
      const filtered = productId 
        ? (data || []).filter((t: any) => t.product_id === productId)
        : data;
      return filtered as (InventoryTransaction & { product: InventoryProduct })[];
    },
    enabled: !!activeYear?.id,
  });
}
