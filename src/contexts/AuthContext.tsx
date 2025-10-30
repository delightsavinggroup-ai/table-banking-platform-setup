
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  member_id: string | null;
  phone_number: string;
  full_name: string;
  is_active: boolean;
  password_changed: boolean;
  last_login: string | null;
}

interface UserRole {
  role_name: string;
  permissions: Record<string, any>;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  roles: UserRole[];
  session: Session | null;
  loading: boolean;
  signIn: (phoneNumber: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (roleName: string) => boolean;
  isChairman: boolean;
  isTreasurer: boolean;
  isSecretary: boolean;
  isMember: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;

      setProfile(profileData);

      // Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .rpc('get_user_roles', { user_uuid: userId });

      if (rolesError) throw rolesError;

      setRoles(rolesData || []);

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);

    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      toast.error('Failed to load user profile');
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
        setRoles([]);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (phoneNumber: string, password: string) => {
    try {
      setLoading(true);

      // Find user by phone number
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, phone_number, is_active')
        .eq('phone_number', phoneNumber)
        .single();

      if (userError || !userData) {
        throw new Error('Invalid phone number or password');
      }

      if (!userData.is_active) {
        throw new Error('Your account has been suspended. Please contact the chairman.');
      }

      // Sign in with Supabase Auth using phone as email
      const email = `${phoneNumber}@savingsgroup.local`;
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success('Login successful!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setProfile(null);
      setRoles([]);
      toast.success('Logged out successfully');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  const hasPermission = (permission: string): boolean => {
    const [resource, action] = permission.split('.');
    return roles.some(role => {
      const permissions = role.permissions;
      return permissions[resource]?.[action] === true;
    });
  };

  const hasRole = (roleName: string): boolean => {
    return roles.some(role => role.role_name === roleName);
  };

  const isChairman = hasRole('chairman');
  const isTreasurer = hasRole('treasurer');
  const isSecretary = hasRole('secretary');
  const isMember = hasRole('member');

  const value: AuthContextType = {
    user,
    profile,
    roles,
    session,
    loading,
    signIn,
    signOut,
    hasPermission,
    hasRole,
    isChairman,
    isTreasurer,
    isSecretary,
    isMember,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};