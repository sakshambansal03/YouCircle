import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (authUser) => {
    try {
      // Get user metadata from auth
      const metadata = authUser.user_metadata || {};
      
      // Construct profile from auth user data
      const profile = {
        id: authUser.id,
        email: authUser.email,
        name: metadata.first_name && metadata.last_name 
          ? `${metadata.first_name} ${metadata.last_name}`
          : metadata.name || authUser.email?.split('@')[0] || 'User',
        username: metadata.username || authUser.email?.split('@')[0] || '',
        phone: metadata.phone || '',
        firstName: metadata.first_name || '',
        lastName: metadata.last_name || '',
      };

      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      if (!user) {
        throw new Error('No user logged in');
      }

      // Prepare metadata updates
      const metadataUpdates = {};
      
      // Split name into first and last if provided
      if (updates.name) {
        const nameParts = updates.name.trim().split(' ');
        metadataUpdates.first_name = nameParts[0] || '';
        metadataUpdates.last_name = nameParts.slice(1).join(' ') || '';
        metadataUpdates.name = updates.name;
      }

      if (updates.username !== undefined) {
        metadataUpdates.username = updates.username;
      }

      if (updates.phone !== undefined) {
        metadataUpdates.phone = updates.phone;
      }

      // Update user metadata in Supabase
      const { data, error } = await supabase.auth.updateUser({
        data: metadataUpdates
      });

      if (error) throw error;

      // Update password if provided
      if (updates.password && updates.password.trim() !== '') {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: updates.password
        });

        if (passwordError) {
          throw passwordError;
        }
      }

      // Reload profile after update
      if (data?.user) {
        await loadUserProfile(data.user);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
  };

  const value = {
    user,
    userProfile,
    loading,
    updateUserProfile,
    signOut,
    refreshProfile: () => user && loadUserProfile(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

