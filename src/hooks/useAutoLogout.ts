import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Auto-logout hook: triggers logout once when the configured time is crossed.
 * Users can log back in after being logged out.
 */
export function useAutoLogout() {
  const { user, signOut } = useAuth();
  const hasLoggedOutThisSession = useRef(false);
  const loginTimestamp = useRef<number>(0);

  useEffect(() => {
    if (!user) {
      // Reset on logout so next login gets a fresh session
      hasLoggedOutThisSession.current = false;
      return;
    }

    // Record when this session started
    if (loginTimestamp.current === 0) {
      loginTimestamp.current = Date.now();
    }

    const checkAutoLogout = async () => {
      if (hasLoggedOutThisSession.current) return;

      // Don't auto-logout within 2 minutes of login
      if (Date.now() - loginTimestamp.current < 2 * 60 * 1000) return;

      try {
        const { data } = await supabase
          .from('system_settings')
          .select('auto_logout_time')
          .limit(1)
          .maybeSingle();

        if (!data?.auto_logout_time) return;

        const [hours, minutes] = (data.auto_logout_time as string).split(':').map(Number);
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const logoutMinutes = hours * 60 + minutes;

        // Only logout if user was logged in BEFORE the cutoff time
        // (i.e., they crossed the threshold while logged in)
        const loginTime = new Date(loginTimestamp.current);
        const loginMinutes = loginTime.getHours() * 60 + loginTime.getMinutes();

        if (currentMinutes >= logoutMinutes && loginMinutes < logoutMinutes) {
          hasLoggedOutThisSession.current = true;
          await signOut();
          window.location.href = '/login';
        }
      } catch {
        // silently ignore
      }
    };

    const interval = setInterval(checkAutoLogout, 60 * 1000);
    return () => clearInterval(interval);
  }, [user, signOut]);
}
