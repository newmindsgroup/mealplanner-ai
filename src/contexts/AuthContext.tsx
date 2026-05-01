// Authentication Context
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, LoginCredentials, RegisterData, AuthState } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = authService.getToken();
      const storedUser = authService.getStoredUser();

      if (token && storedUser) {
        // Verify token is still valid by fetching current user
        const currentUser = await authService.getCurrentUser();
        
        if (currentUser) {
          setState({
            user: currentUser,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          // Token is invalid, clear auth
          await authService.logout();
          setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } else {
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const response = await authService.login(credentials);

    if (response.success && response.user && response.token) {
      setState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } else {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: response.error || 'Login failed',
      }));
      return false;
    }
  }, []);

  // Register function
  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    const response = await authService.register(data);

    if (response.success && response.user && response.token) {
      setState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } else {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: response.error || 'Registration failed',
      }));
      return false;
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    await authService.logout();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  // Refresh authentication
  const refreshAuth = useCallback(async () => {
    const response = await authService.refreshToken();
    if (response.success && response.user && response.token) {
      setState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } else {
      await logout();
    }
  }, [logout]);

  // Update user
  const updateUser = useCallback((user: User) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshAuth,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

