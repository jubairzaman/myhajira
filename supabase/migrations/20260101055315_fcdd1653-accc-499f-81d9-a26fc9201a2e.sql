-- Fix audit_logs INSERT policy to only allow service role (backend processes)
-- Drop the existing overly permissive INSERT policy
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_logs;

-- Create a more restrictive INSERT policy
-- This policy uses auth.role() = 'service_role' to ensure only backend processes can insert
-- Regular authenticated users cannot insert directly - only via triggers or edge functions using service key
CREATE POLICY "Only service role can insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated, anon, service_role
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');