
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useVisitTracker = () => {
  useEffect(() => {
    const sessionId = sessionStorage.getItem('visit_session') || crypto.randomUUID();
    sessionStorage.setItem('visit_session', sessionId);

    const tracked = sessionStorage.getItem('visit_tracked');
    if (tracked) return;

    const trackVisit = async () => {
      await supabase.from('site_visits').insert({
        page: window.location.pathname,
        session_id: sessionId,
        user_agent: navigator.userAgent,
      });
      sessionStorage.setItem('visit_tracked', 'true');
    };

    trackVisit();
  }, []);
};
