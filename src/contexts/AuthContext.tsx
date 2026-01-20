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

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to fetch profile', error);
      }
      return null;
    }
    return data as Profile | null;
  };

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Failed to fetch user role:', error);
        }
        return null;
      }

      return data?.role as AppRole | null;
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error fetching user role:', err);
      }
      return null;
    }
  };

  const fetchProfileUsernames = async () => {
    const { data, error } = await supabase
      .rpc('get_all_usernames');

    if (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to fetch usernames', error);
      }
      return;
    }
    setProfileUsernames(data as ProfileUsername[]);
  };

  const loadUserData = async (userId: string) => {
    try {
      const [profileData, roleData] = await Promise.all([
        fetchProfile(userId),
        fetchUserRole(userId)
      ]);
      
      setProfile(profileData);
      setUserRole(roleData);
      await fetchProfileUsernames();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading user data:', error);
      }
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check for existing session
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (existingSession?.user) {
          // Session exists, hydrate state
          setSession(existingSession);
          setUser(existingSession.user);
          await loadUserData(existingSession.user.id);
        } else {
          // No session
          setSession(null);
          setUser(null);
          setProfile(null);
          setUserRole(null);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error initializing auth:', error);
        }
        // On error, assume no session
        setSession(null);
        setUser(null);
        setProfile(null);
        setUserRole(null);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Initialize auth immediately
    initializeAuth();

    // Set up listener for auth state changes (login/logout in other tabs)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          await loadUserData(session.user.id);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
          setUserRole(null);
        }
      }
    );

    return () => {
      mounted = false;
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
