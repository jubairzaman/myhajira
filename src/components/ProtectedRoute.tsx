import { ReactNode, useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

/**
 * SECURITY NOTE: Client-side authorization checks in this component are for UX convenience only.
 * The actual security enforcement is handled by Row-Level Security (RLS) policies in the database.
 */
interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const [profileComplete, setProfileComplete] = useState<boolean | null>(null);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      if (!user) {
        setCheckingProfile(false);
        return;
      }
      try {
        const { data } = await supabase
          .from('profiles')
          .select('is_profile_complete')
          .eq('user_id', user.id)
          .maybeSingle();
        setProfileComplete(data?.is_profile_complete ?? true);
      } catch {
        setProfileComplete(true); // Don't block on error
      } finally {
        setCheckingProfile(false);
      }
    };
    checkProfile();
  }, [user]);

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Force profile completion
  if (profileComplete === false) {
    return <Navigate to="/complete-profile" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
