import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      syncUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const syncUser = async (sbUser: any) => {
    if (!sbUser) {
      setUser(null);
      return;
    }

    // Try to get user profile from our users table
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', sbUser.id)
      .single();

    if (error && error.code === 'PGRST116') {
      // User doesn't exist in our table, create it
      let role = 'FREE';
      if (sbUser.email === 'laispsiqueira@gmail.com') role = 'ADMIN';
      else if (sbUser.email === 'laispsiqueira.3@gmail.com') role = 'PAID';

      const newUser = {
        id: sbUser.id,
        email: sbUser.email,
        name: sbUser.user_metadata?.full_name || sbUser.email,
        role: role,
        created_at: new Date().toISOString()
      };

      await supabase.from('users').insert(newUser);
      setUser({
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        createdAt: newUser.created_at
      });
    } else if (profile) {
      setUser({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role,
        createdAt: profile.created_at
      });
    } else {
      // Fallback
      setUser({ id: sbUser.id, email: sbUser.email, role: 'FREE' });
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  return { user, loading, logout };
}
