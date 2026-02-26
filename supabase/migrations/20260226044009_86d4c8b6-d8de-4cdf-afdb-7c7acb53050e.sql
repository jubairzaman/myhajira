
-- Create role_permissions table for action-based permissions per module
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  module text NOT NULL,
  can_read boolean NOT NULL DEFAULT false,
  can_create boolean NOT NULL DEFAULT false,
  can_update boolean NOT NULL DEFAULT false,
  can_delete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, module)
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can manage permissions"
  ON public.role_permissions FOR ALL
  USING (has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Authenticated users can view permissions"
  ON public.role_permissions FOR SELECT
  USING (true);

-- Add profile completion fields
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS is_profile_complete boolean NOT NULL DEFAULT false;

-- Mark existing super admin profile as complete
UPDATE public.profiles SET is_profile_complete = true WHERE user_id IN (
  SELECT user_id FROM public.user_roles WHERE role = 'super_admin'
);

-- Insert default permissions for all roles and modules
INSERT INTO public.role_permissions (role, module, can_read, can_create, can_update, can_delete)
SELECT r.role, m.module, 
  CASE WHEN r.role IN ('super_admin', 'admin') THEN true ELSE false END,
  CASE WHEN r.role IN ('super_admin', 'admin') THEN true ELSE false END,
  CASE WHEN r.role IN ('super_admin', 'admin') THEN true ELSE false END,
  CASE WHEN r.role IN ('super_admin', 'admin') THEN true ELSE false END
FROM 
  (VALUES ('super_admin'::app_role), ('admin'::app_role), ('operator'::app_role), ('teacher'::app_role), ('accountant'::app_role), ('it_admin'::app_role)) AS r(role),
  (VALUES ('students'), ('teachers'), ('attendance'), ('fees'), ('inventory'), ('devices'), ('reports'), ('settings'), ('website_cms'), ('sms'), ('calendar'), ('monitors')) AS m(module)
ON CONFLICT (role, module) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_role_permissions_updated_at
  BEFORE UPDATE ON public.role_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
