import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any; data?: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  resendConfirmationEmail: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

 const signUp = async (email: string, password: string, fullName: string) => {
  const redirectUrl = `${window.location.origin}/`;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
        },
      }
    });

    console.log("SignUp response:", data);
    
    if (error) {
      console.error("Supabase signUp error:", error);
      
      // Handle specific email confirmation errors
      if (error.message?.includes('confirmation email') || error.code === 'unexpected_failure') {
        return { 
          error: {
            message: "Email confirmation service is temporarily unavailable. Please try again later or contact support.",
            code: error.code
          }
        };
      }
      
      return { error };
    }

    // Check if user was created but email confirmation failed
    if (data?.user && !data?.session) {
      // User created but needs email confirmation
      console.log("User created successfully, email confirmation sent");
      
      // Ensure a profile row exists with the full name immediately
      try {
        if (data.user.id) {
          const { error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              user_id: data.user.id,
              email,
              full_name: fullName,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });
          if (upsertError) {
            console.warn('Profile upsert after signUp failed (will rely on trigger):', upsertError);
          }
        }
      } catch (e) {
        console.warn('Profile upsert threw unexpectedly:', e);
      }
      
      return { error: null, data };
    }

    return { error: null, data };
  } catch (err) {
    console.error("Unexpected error during signup:", err);
    return { 
      error: {
        message: "An unexpected error occurred. Please try again.",
        code: 'unexpected_error'
      }
    };
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
  };

    const forgotPassword = async (email: string) => {
    const redirectUrl = `${window.location.origin}/auth?mode=reset`;
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl
    });
    return { error };
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({
      password: password
    });
    return { error };
  };

  const resendConfirmationEmail = async (email: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: redirectUrl,
      }
    });
    return { error };
  };


  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      forgotPassword,
      updatePassword,
      resendConfirmationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}