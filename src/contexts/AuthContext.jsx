import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AuthContext = createContext(null);

console.log('AuthContext initialized. Supabase configured:', isSupabaseConfigured);
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    console.log('AuthProvider useEffect: Checking for existing session...');
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    console.log('AuthProvider useEffect: Setting up auth state change listener...');
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    console.log('AuthProvider useEffect: Auth state change listener set up.');
    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId) => {
    console.log('Loading user profile for userId:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUser(data);

      console.log('User profile loaded:', data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, userData) => {
    console.log('Registering user with email:', email, 'and userData:', userData);
    if (!isSupabaseConfigured) {
      return { 
        success: false, 
        error: 'Supabase not configured. Please add your API keys to .env file and restart the server.' 
      };
    }
    console.log('Supabase is configured. Proceeding with registration...');

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name
          }
        }
      });

      console.log('Supabase signUp response:', authData, 'Error:', signUpError);

      if (signUpError) throw signUpError;


      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            name: userData.name,
            role: userData.role,
            location: userData.location,
            phone: userData.phone
          })
          .eq('id', authData.user.id);

        console.log('Profile update response:', profileError);
        if (profileError) throw profileError;
        await loadUserProfile(authData.user.id);

        console.log('User registered and profile updated successfully:', authData.user);
      }

      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    if (!isSupabaseConfigured) {
      return { 
        success: false, 
        error: 'Supabase not configured. Please add your API keys to .env file and restart the server.' 
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      await loadUserProfile(data.user.id);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    if (!isSupabaseConfigured) return;

    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const updateUser = async (updates) => {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Supabase not configured' };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      setUser({ ...user, ...updates });
      return { success: true };
    } catch (error) {
      console.error('Update error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isVolunteer: user?.role === 'volunteer' || user?.role === 'admin',
    isMember: !!user
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ fontSize: '48px' }}>🌿</div>
        <div style={{ fontSize: '18px', fontWeight: '700', color: '#0a3d2e' }}>Loading EcoKubatana...</div>
      </div>
    );
  }

  // Show configuration needed screen
  if (!isSupabaseConfigured) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '24px',
        padding: '40px',
        maxWidth: '700px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '64px' }}>⚙️</div>
        <h1 style={{ fontSize: '32px', fontWeight: '900', color: '#0a3d2e', margin: 0 }}>
          Supabase Configuration Needed
        </h1>
        <div style={{ 
          background: 'linear-gradient(135deg, #fff8f0 0%, #fde8e8 100%)', 
          border: '2px solid #f97316',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'left',
          width: '100%'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: '#ea580c' }}>Quick Setup:</h3>
          <ol style={{ margin: 0, paddingLeft: '20px', color: '#6b7280', lineHeight: '1.8' }}>
            <li><strong>Create .env file</strong> in project root</li>
            <li><strong>Go to</strong> <a href="https://app.supabase.com" target="_blank" style={{ color: '#10b981' }}>Supabase Dashboard</a></li>
            <li><strong>Settings</strong> → <strong>API</strong></li>
            <li><strong>Copy</strong> Project URL and anon public key</li>
            <li><strong>Add to .env:</strong>
              <pre style={{ 
                background: '#1f2937', 
                color: '#10b981', 
                padding: '12px', 
                borderRadius: '6px', 
                fontSize: '12px',
                marginTop: '8px',
                overflow: 'auto'
              }}>
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`}
              </pre>
            </li>
            <li><strong>Restart</strong> dev server (Ctrl+C, then npm run dev)</li>
          </ol>
        </div>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Check the browser console for more details
        </p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
