import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: (credentialResponse: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user in localStorage
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signInWithGoogle = (credentialResponse: any) => {
    try {
      // Decode the JWT token from Google
      const credential = credentialResponse.credential;
      const payload = JSON.parse(atob(credential.split('.')[1]));
      
      const userData = localStorage.getItem('user_data');
      let role: 'user' | 'admin' | 'superadmin' = 'user';
      let publisher_id = '4fe8719c-5687-4a82-9219-96951d0b5c2a';
      
      if (userData) {
        const parsed = JSON.parse(userData);
        role = parsed.role || 'user';
        publisher_id = parsed.publisher_id || publisher_id;
      }

      const appUser: User = {
        id: payload.sub,
        email: payload.email || '',
        full_name: payload.name || payload.email?.split('@')[0] || '',
        username: payload.email?.split('@')[0] || '',
        role,
        publisher_id,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUser(appUser);
      localStorage.setItem('auth_user', JSON.stringify(appUser));
      localStorage.removeItem('user_data'); // Clean up temporary role data
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
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
