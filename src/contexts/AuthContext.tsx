
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, getCurrentUser, getReminderSettings } from '@/lib/supabase';
import { User } from '@/types';
import { DEFAULT_REMINDER_SETTINGS } from '@/lib/default-data';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await getCurrentUser();
        
        if (currentUser) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentUser.id)
            .single();
            
          if (userError) throw userError;
          
          // Get reminder settings
          let reminderSettings;
          try {
            reminderSettings = await getReminderSettings(currentUser.id);
          } catch (error) {
            // Use default settings if none exist
            reminderSettings = DEFAULT_REMINDER_SETTINGS;
          }
          
          setUser({
            id: userData.id,
            email: userData.email,
            name: userData.name || currentUser.name || 'User',
            reminderSettings
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        fetchUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
