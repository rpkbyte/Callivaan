/**
 * Authentication Context and State Management for Callivaan Web App
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, ApiUser, ApiTenant, AuthResponse } from '../services/api';

interface AuthContextType {
  user: ApiUser | null;
  tenant: ApiTenant | null;
  role: string | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (params: {
    email: string;
    password: string;
    fullName: string;
    businessName: string;
    category?: string;
    phoneNumber?: string;
  }) => Promise<AuthResponse>;
  logout: () => void;
  loginAsDemo: () => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [tenant, setTenant] = useState<ApiTenant | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('callivaan_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('callivaan_token');
      if (storedToken) {
        try {
          const res = await api.auth.getMe();
          setUser(res.user);
          setTenant(res.tenant);
          setRole(res.role);
          setToken(storedToken);
        } catch {
          // Token expired or invalid
          localStorage.removeItem('callivaan_token');
          localStorage.removeItem('callivaan_tenant_id');
          setUser(null);
          setTenant(null);
          setRole(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const handleAuthSuccess = (res: AuthResponse) => {
    localStorage.setItem('callivaan_token', res.accessToken);
    localStorage.setItem('callivaan_tenant_id', res.tenant.id);
    setUser(res.user);
    setTenant(res.tenant);
    setRole(res.role);
    setToken(res.accessToken);
    return res;
  };

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const res = await api.auth.login({ email, password });
    return handleAuthSuccess(res);
  };

  const signup = async (params: {
    email: string;
    password: string;
    fullName: string;
    businessName: string;
    category?: string;
    phoneNumber?: string;
  }): Promise<AuthResponse> => {
    const res = await api.auth.signup(params);
    return handleAuthSuccess(res);
  };

  const logout = () => {
    localStorage.removeItem('callivaan_token');
    localStorage.removeItem('callivaan_tenant_id');
    setUser(null);
    setTenant(null);
    setRole(null);
    setToken(null);
  };

  const loginAsDemo = async (): Promise<AuthResponse> => {
    // Demo credentials seeded in PostgreSQL & MemoryStore
    return login('owner@callivaan.demo', 'password123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        tenant,
        role,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        signup,
        logout,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
