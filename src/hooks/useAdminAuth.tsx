
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminAuth = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const adminLogin = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Simple password check for demo - in production use proper hashing
      if (username === 'admin' && password === 'admin123') {
        setIsAdminAuthenticated(true);
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      return { success: false, error: 'Authentication failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    window.location.href = '/';
  };

  return {
    isAdminAuthenticated,
    isLoading,
    adminLogin,
    adminLogout
  };
};
