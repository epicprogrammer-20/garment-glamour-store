
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<{ error: any; needsVerification?: boolean }>;
  verifyOtp: (phone: string, token: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to format phone number to E.164
const formatPhoneToE164 = (phone: string): string => {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it doesn't start with +, assume it needs a country code
  if (!cleaned.startsWith('+')) {
    // If it starts with 0, remove it (common in many countries)
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    // Default to US country code if no + provided
    cleaned = '+1' + cleaned;
  }
  
  return cleaned;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    try {
      const formattedPhone = formatPhoneToE164(phone);
      console.log('Formatted phone:', formattedPhone);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        phone: formattedPhone,
        options: {
          data: { 
            name,
            phone: formattedPhone
          },
          channel: 'sms'
        }
      });

      if (error) {
        console.error('Signup error:', error);
        return { error };
      }

      // If user is not confirmed, they need OTP verification
      if (data.user && !data.user.phone_confirmed_at) {
        return { error: null, needsVerification: true };
      }

      return { error: null };
    } catch (error) {
      console.error('Signup catch error:', error);
      return { error };
    }
  };

  const verifyOtp = async (phone: string, token: string) => {
    try {
      const formattedPhone = formatPhoneToE164(phone);
      console.log('Verifying OTP for phone:', formattedPhone);

      const { error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token,
        type: 'sms'
      });
      
      if (error) {
        console.error('OTP verification error:', error);
      }
      
      return { error };
    } catch (error) {
      console.error('OTP verification catch error:', error);
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, verifyOtp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
