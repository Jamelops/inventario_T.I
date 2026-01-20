import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface ProfileUsername {
  id: string;
  user_id: string;
  username: string;
}

type AppRole = 'admin' | 'manager' | 'viewer';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  profileUsernames: ProfileUsername[];
  userRole: AppRole | null;
  loading: boolean;
  isApproved: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  fetchProfileUsernames: () => Promise<void>;
  hasRole: (role: AppRole) => boolean;
  isAdmin: () => boolean;
  canEdit: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileUsernames, setProfileUsernames] = useState<ProfileUsername[]>([]);
  const [userRole, setUserRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data as Profile | null;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to fetch profile:', error);
      }
      return null;
    }
  };

  const fetchUserRole = async (userId: string): Promise<AppRole | null> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data?.role as AppRole | null;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to fetch user role:', error);
      }
      return null;
    }
  };

  const fetchProfileUsernames = async () => {
    try {
      const { data, error } = await supabase.rpc('get_all_usernames');
      if (error) throw error;
      setProfileUsernames(data as ProfileUsername[]);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to fetch usernames:', error);
      }
    }
  };

  useEffect(() => {
    let mounted = true;
    let loadingTimeout: NodeJS.Timeout | null = null;
    let deferredFetchTimeout: NodeJS.Timeout | null = null;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (session?.user) {
          // User is authenticated
          setSession(session);
          setUser(session.user);
          
          // CRITICAL: Fetch ONLY profile + role in parallel (minimal, fast)
          try {
            const [profileData, roleData] = await Promise.all([
              fetchProfile(session.user.id),
              fetchUserRole(session.user.id)
            ]);
            
            if (mounted) {
              setProfile(profileData);
              setUserRole(roleData);
              setLoading(false);
            }
          } catch (error) {
            if (mounted) {
              setLoading(false);
            }
          }
          
          // DEFERRED: Fetch usernames AFTER UI renders (not blocking)
          // Use setTimeout with 0 delay to queue after current task
          if (deferredFetchTimeout) clearTimeout(deferredFetchTimeout);
          deferredFetchTimeout = setTimeout(() => {
            if (mounted) {
              fetchProfileUsernames().catch(err => {
                if (import.meta.env.DEV) console.error('Usernames fetch failed:', err);
              });
            }
          }, 100); // Small delay to ensure UI renders first
        } else {
          // User is not authenticated
          if (mounted) {
            setSession(null);
            setUser(null);
            setProfile(null);
            setUserRole(null);
            setLoading(false);
          }
        }
      }
    );

    // Safety timeout: 5 seconds max
    loadingTimeout = setTimeout(() => {
      if (mounted && loading) {
        if (import.meta.env.DEV) {
          console.warn('Auth state initialization timeout');
        }
        setLoading(false);
      }
    }, 5000);

    return () => {
      mounted = false;
      if (loadingTimeout) clearTimeout(loadingTimeout);
      if (deferredFetchTimeout) clearTimeout(deferredFetchTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const hasRole = (role: AppRole): boolean => {
    return userRole === role;
  };

  const isAdmin = (): boolean => {
    return userRole === 'admin';
  };

  const canEdit = (): boolean => {
    return (userRole === 'admin' || userRole === 'manager') && profile?.status === 'approved';
  };

  const isApproved = profile?.status === 'approved';

  const signUp = async (email: string, password: string, username: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { username }
      }
    });

    if (error) {
      return { error };
    }

    toast({
      title: "Cadastro enviado!",
      description: "Aguarde a aprovação de um administrador para acessar o sistema.",
    });

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    toast({
      title: "Login realizado!",
      description: "Bem-vindo de volta.",
    });

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setUserRole(null);
    setSession(null);
    setUser(null);
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      profileUsernames,
      userRole,
      loading,
      isApproved,
      signUp,
      signIn,
      signOut,
      fetchProfileUsernames,
      hasRole,
      isAdmin,
      canEdit,
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
