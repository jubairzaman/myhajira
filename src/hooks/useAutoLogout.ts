import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Auto-logout hook: checks every minute if current time >= configured auto_logout_time.
 * If so, signs the user out automatically.
 */
export function useAutoLogout() {
  const { user, signOut } = useAuth();
  const hasLoggedOutToday = useRef(false);
  const lastCheckedDate = useRef('');

  useEffect(() => {
    if (!user) return;

    const checkAutoLogout = async () => {
      const now = new Date();
      const todayStr = now.toISOString().slice(0, 10);

      // Reset flag on new day
      if (lastCheckedDate.current !== todayStr) {
        hasLoggedOutToday.current = false;
        lastCheckedDate.current = todayStr;
      }

      if (hasLoggedOutToday.current) return;

      try {
        const { data } = await supabase
          .from('system_settings')
          .select('auto_logout_time')
          .limit(1)
          .maybeSingle();

        if (!data?.auto_logout_time) return;

        // Parse HH:MM:SS
        const [hours, minutes] = (data.auto_logout_time as string).split(':').map(Number);
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const logoutMinutes = hours * 60 + minutes;

        if (currentMinutes >= logoutMinutes) {
          hasLoggedOutToday.current = true;
          await signOut();
          window.location.href = '/login';
        }
      } catch {
        // silently ignore
      }
    };

    // Check immediately, then every 60 seconds
    checkAutoLogout();
    const interval = setInterval(checkAutoLogout, 60 * 1000);
    return () => clearInterval(interval);
  }, [user, signOut]);
}
