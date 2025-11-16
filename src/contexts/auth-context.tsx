'use client';

import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  display_name: string | null;
  avatar_url: string | null;
  is_admin: boolean;
  email_verified: boolean;
  preferred_language: 'mm' | 'en';
  daily_calorie_target: number;
  daily_protein_target_g: number | null;
  daily_fat_target_g: number | null;
  daily_carbs_target_g: number | null;
  points: number;
  level: number;
  streak_days: number;
}

interface AuthContextType {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, profile: Partial<UserProfile>) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Use useMemo to create supabase client only once
  const supabase = useMemo(() => createClient(), []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, display_name, avatar_url, is_admin, email_verified, preferred_language, daily_calorie_target, daily_protein_target_g, daily_fat_target_g, daily_carbs_target_g, points, level, streak_days')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) {
        setProfile(data as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signUp = async (email: string, password: string, profileData: Partial<UserProfile>) => {
    try {
      // Sign up with Supabase Auth
      // Profile data is passed via user_metadata and will be automatically
      // inserted into the users table by the handle_new_user() database trigger
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: profileData.full_name,
            display_name: profileData.display_name,
            preferred_language: profileData.preferred_language || 'mm',
            daily_calorie_target: profileData.daily_calorie_target || 2000,
          },
        },
      });

      if (authError) return { error: authError };
      if (!authData.user) return { error: new Error('No user returned from sign up') };

      // Profile is now created automatically by database trigger
      // No need to manually insert into users table

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    try {
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Always clear local state
      setUser(null);
      setProfile(null);
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
      }}
    >
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
