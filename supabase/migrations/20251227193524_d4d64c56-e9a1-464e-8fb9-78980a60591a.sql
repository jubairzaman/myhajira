-- Create the super admin user
-- First, we need to use a trigger to automatically assign super_admin role when this specific email signs up

CREATE OR REPLACE FUNCTION public.handle_super_admin_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- If the new user's email is super@admin.com, assign super_admin role
    IF NEW.email = 'super@admin.com' THEN
        INSERT INTO public.user_roles (user_id, role)
        VALUES (NEW.id, 'super_admin')
        ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
    END IF;
    RETURN NEW;
END;
$$;

-- Create trigger to run after user creation
DROP TRIGGER IF EXISTS on_super_admin_created ON auth.users;
CREATE TRIGGER on_super_admin_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_super_admin_signup();