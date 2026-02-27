
-- 1. Finance Feature Flags table
CREATE TABLE public.finance_feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key text NOT NULL UNIQUE,
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.finance_feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage feature flags"
ON public.finance_feature_flags FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can view feature flags"
ON public.finance_feature_flags FOR SELECT
USING (has_any_role(auth.uid()));

-- Insert default feature flags
INSERT INTO public.finance_feature_flags (feature_key, enabled) VALUES
  ('online_payment', false),
  ('sms_module', true),
  ('ledger_system', false),
  ('revenue_dashboard', false),
  ('inventory_sales', true),
  ('fine_system', true),
  ('audit_log', false),
  ('bank_payment', false),
  ('mobile_payment', false);

-- 2. Finance mode setting
CREATE TABLE public.finance_mode (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mode text NOT NULL DEFAULT 'SIMPLE_MODE' CHECK (mode IN ('SIMPLE_MODE', 'STANDARD_MODE', 'PRO_MODE')),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.finance_mode ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage finance mode"
ON public.finance_mode FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can view finance mode"
ON public.finance_mode FOR SELECT
USING (has_any_role(auth.uid()));

INSERT INTO public.finance_mode (mode) VALUES ('SIMPLE_MODE');

-- 3. Expenses table
CREATE TABLE public.expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'cash',
  category text,
  notes text,
  expense_date date NOT NULL DEFAULT CURRENT_DATE,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Super admin full access
CREATE POLICY "Super admins can manage all expenses"
ON public.expenses FOR ALL
USING (has_role(auth.uid(), 'super_admin'::app_role));

-- Admins can view all expenses
CREATE POLICY "Admins can view all expenses"
ON public.expenses FOR SELECT
USING (is_admin(auth.uid()));

-- Accountants can insert expenses
CREATE POLICY "Accountants can insert expenses"
ON public.expenses FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'accountant'::app_role) 
  AND created_by = auth.uid()
);

-- Accountants can view today's expenses
CREATE POLICY "Accountants can view today expenses"
ON public.expenses FOR SELECT
USING (
  has_role(auth.uid(), 'accountant'::app_role)
  AND expense_date = CURRENT_DATE
);

-- Accountants can update same-day expenses they created
CREATE POLICY "Accountants can update same-day own expenses"
ON public.expenses FOR UPDATE
USING (
  has_role(auth.uid(), 'accountant'::app_role)
  AND created_by = auth.uid()
  AND expense_date = CURRENT_DATE
);

-- Trigger for updated_at
CREATE TRIGGER update_expenses_updated_at
BEFORE UPDATE ON public.expenses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_finance_feature_flags_updated_at
BEFORE UPDATE ON public.finance_feature_flags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Daily finance summary function (read-only, no modifications)
CREATE OR REPLACE FUNCTION public.get_daily_finance_summary(p_date date)
RETURNS json
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT json_build_object(
    'total_collection', COALESCE((
      SELECT SUM(amount_paid)
      FROM student_fee_records
      WHERE payment_date::date = p_date
        AND status IN ('paid', 'partial')
    ), 0),
    'total_expenses', COALESCE((
      SELECT SUM(amount)
      FROM expenses
      WHERE expense_date = p_date
    ), 0),
    'net_balance', COALESCE((
      SELECT SUM(amount_paid)
      FROM student_fee_records
      WHERE payment_date::date = p_date
        AND status IN ('paid', 'partial')
    ), 0) - COALESCE((
      SELECT SUM(amount)
      FROM expenses
      WHERE expense_date = p_date
    ), 0),
    'transaction_count', (
      SELECT COUNT(*)
      FROM student_fee_records
      WHERE payment_date::date = p_date
        AND status IN ('paid', 'partial')
    ),
    'expense_count', (
      SELECT COUNT(*)
      FROM expenses
      WHERE expense_date = p_date
    )
  );
$$;

-- 5. Add accountant permissions to role_permissions if not exists
INSERT INTO public.role_permissions (role, module, can_read, can_create, can_update, can_delete)
VALUES
  ('accountant', 'fees', true, true, true, false),
  ('accountant', 'expenses', true, true, true, false),
  ('accountant', 'inventory', true, false, false, false),
  ('accountant', 'students', true, false, false, false)
ON CONFLICT (role, module) DO NOTHING;
