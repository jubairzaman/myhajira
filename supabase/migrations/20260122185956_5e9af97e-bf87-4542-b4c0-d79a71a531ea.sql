
-- Create inventory_products table for managing school products
CREATE TABLE public.inventory_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_bn TEXT,
  sku TEXT,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  min_stock_alert INTEGER DEFAULT 10,
  category TEXT NOT NULL DEFAULT 'other',
  is_active BOOLEAN NOT NULL DEFAULT true,
  academic_year_id UUID REFERENCES public.academic_years(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create inventory_transactions table for tracking stock movements
CREATE TABLE public.inventory_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.inventory_products(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('stock_in', 'sale', 'adjustment')),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  fee_record_id UUID REFERENCES public.student_fee_records(id) ON DELETE SET NULL,
  notes TEXT,
  sold_by UUID,
  academic_year_id UUID REFERENCES public.academic_years(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.inventory_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for inventory_products
CREATE POLICY "Users with any role can view inventory products"
ON public.inventory_products FOR SELECT
USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins can insert inventory products"
ON public.inventory_products FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update inventory products"
ON public.inventory_products FOR UPDATE
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete inventory products"
ON public.inventory_products FOR DELETE
USING (public.is_admin(auth.uid()));

-- RLS Policies for inventory_transactions
CREATE POLICY "Users with any role can view inventory transactions"
ON public.inventory_transactions FOR SELECT
USING (public.has_any_role(auth.uid()));

CREATE POLICY "Admins can insert inventory transactions"
ON public.inventory_transactions FOR INSERT
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update inventory transactions"
ON public.inventory_transactions FOR UPDATE
USING (public.is_admin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_inventory_products_academic_year ON public.inventory_products(academic_year_id);
CREATE INDEX idx_inventory_products_category ON public.inventory_products(category);
CREATE INDEX idx_inventory_transactions_product ON public.inventory_transactions(product_id);
CREATE INDEX idx_inventory_transactions_student ON public.inventory_transactions(student_id);
CREATE INDEX idx_inventory_transactions_type ON public.inventory_transactions(transaction_type);

-- Create trigger for updated_at
CREATE TRIGGER update_inventory_products_updated_at
BEFORE UPDATE ON public.inventory_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-update stock on transaction insert
CREATE OR REPLACE FUNCTION public.update_stock_on_transaction()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.transaction_type = 'stock_in' THEN
    UPDATE public.inventory_products 
    SET stock_quantity = stock_quantity + NEW.quantity
    WHERE id = NEW.product_id;
  ELSIF NEW.transaction_type = 'sale' THEN
    UPDATE public.inventory_products 
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.product_id;
  ELSIF NEW.transaction_type = 'adjustment' THEN
    UPDATE public.inventory_products 
    SET stock_quantity = stock_quantity + NEW.quantity
    WHERE id = NEW.product_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto stock update
CREATE TRIGGER trigger_update_stock_on_transaction
AFTER INSERT ON public.inventory_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_stock_on_transaction();
