import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { authCache } from '@/lib/authCache';

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
      
      // Cache the result (24 hour TTL)
      if (data) {
        await authCache.set('profile', data, 24 * 60 * 60 * 1000).catch(() => {});
      }
      
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
      
      const role = data?.role as AppRole | null;
      
      // Cache the result (24 hour TTL)
      if (role) {
        await authCache.set('role', role, 24 * 60 * 60 * 1000).catch(() => {});
      }
      
      return role;
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
      
      // Cache the result (1 hour TTL)
      await authCache.set('usernames', data, 60 * 60 * 1000).catch(() => {});
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
          // INSTANT: Restore from cache while fetching new data
          const cachedProfile = await authCache.get('profile').catch(() => null);
          const cachedRole = await authCache.get('role').catch(() => null);
          const cachedUsernames = await authCache.get('usernames').catch(() => null);
          
          if (mounted) {
            if (cachedProfile) setProfile(cachedProfile);
            if (cachedRole) setUserRole(cachedRole);
            if (cachedUsernames) setProfileUsernames(cachedUsernames);
            
            // Show UI immediately with cached data
            setLoading(false);
          }
          
          // BACKGROUND: Fetch fresh data to update cache
          try {
            const [profileData, roleData] = await Promise.all([
              fetchProfile(session.user.id),
              fetchUserRole(session.user.id)
            ]);
            
            if (mounted) {
              setProfile(profileData);
              setUserRole(roleData);
            }
          } catch (error) {
            if (import.meta.env.DEV) {
              console.error('Error fetching user data:', error);
            }
          }
          
          // DEFERRED: Fetch usernames after UI renders
          if (deferredFetchTimeout) clearTimeout(deferredFetchTimeout);
          deferredFetchTimeout = setTimeout(() => {
            if (mounted) {
              fetchProfileUsernames().catch(err => {
                if (import.meta.env.DEV) console.error('Usernames fetch failed:', err);
              });
            }
          }, 150);
          
          // Set user immediately
          if (mounted) {
            setSession(session);
            setUser(session.user);
          }
        } else {
          // User is not authenticated
          if (mounted) {
            setSession(null);
            setUser(null);
            setProfile(null);
            setUserRole(null);
            setProfileUsernames([]);
            setLoading(false);
            
            // Clear cache on logout
            authCache.clear().catch(() => {});
          }
        }
      }
    );

    // Safety timeout: 4 seconds max (cache should load instantly)
    loadingTimeout = setTimeout(() => {
      if (mounted && loading) {
        if (import.meta.env.DEV) {
          console.warn('Auth state initialization timeout');
        }
        setLoading(false);
      }
    }, 4000);

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
    setProfileUsernames([]);
    
    // Clear cache on logout
    await authCache.clear().catch(() => {});
    
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
