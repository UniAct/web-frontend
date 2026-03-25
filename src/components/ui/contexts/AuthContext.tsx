/**
 * AUTHENTICATION CONTEXT
 * 
 * Global authentication state management for multi-tenant application.
 * Handles:
 * - User authentication (staff and superadmin)
 * - Session persistence
 * - Token management
 * - Tenant switching (for superadmin)
 * - Role-based access control
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { AuthService, apiClient, type User } from '../../../api';
import { TenantDetectionService } from '../../../services/TenantDetectionService';

export interface AuthContextType {
  // User info
  user: User | null;
  token: string | null;

  // State
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  error: string | null;

  // Tenant info
  currentTenant?: string;

  // Methods
  loginStaff: (email: string, password: string) => Promise<void>;
  loginSuperAdmin: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  switchTenant: (subdomain: string) => void;
  goToSuperAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTenant, setCurrentTenant] = useState<string>();

  // Restore session on mount
  useEffect(() => {
    const restoreSession = () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);
          console.log('[AuthContext] Session restored:', parsedUser.email);
        }

        // Detect current tenant
        const tenantContext = TenantDetectionService.detectTenant();
        setCurrentTenant(tenantContext.subdomain);
      } catch (err) {
        console.error('[AuthContext] Failed to restore session:', err);
        // Clear corrupted data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const loginStaff = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[AuthContext] Attempting staff login:', email);
      const response = await AuthService.loginStaff(email, password);

      setToken(response.token);
      setUser(response.user);
      setError(null);

      console.log('[AuthContext] ✓ Staff login successful');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      console.error('[AuthContext] Staff login error:', errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginSuperAdmin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[AuthContext] Attempting superadmin login:', email);
      const response = await AuthService.loginSuperAdmin(email, password);

      setToken(response.token);
      setUser(response.user);
      setError(null);

      console.log('[AuthContext] ✓ SuperAdmin login successful');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      console.error('[AuthContext] SuperAdmin login error:', errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('[AuthContext] Logging out user');
    AuthService.logout();
    setUser(null);
    setToken(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const switchTenant = (subdomain: string) => {
    console.log(`[AuthContext] Switching to tenant: ${subdomain}`);
    TenantDetectionService.navigateToTenant(subdomain);
  };

  const goToSuperAdmin = () => {
    console.log('[AuthContext] Navigating to superadmin');
    TenantDetectionService.navigateToSuperAdmin();
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isSuperAdmin: apiClient.isSuperAdmin(),
    isLoading,
    error,
    currentTenant,
    loginStaff,
    loginSuperAdmin,
    logout,
    clearError,
    switchTenant,
    goToSuperAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
