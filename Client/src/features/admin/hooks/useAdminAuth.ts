import { useState, useEffect, useCallback } from 'react';
import { AdminService } from '../services/adminService';

const ADMIN_TOKEN_KEY = 'aws_reinvent_admin_jwt';

export function useAdminAuth() {
  const [token, setToken] = useState<string | null>(() => {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(token));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const verifySavedSession = async () => {
      const savedToken = sessionStorage.getItem(ADMIN_TOKEN_KEY);
      if (!savedToken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const isValid = await AdminService.verifySession(savedToken);
      if (isValid) {
        setToken(savedToken);
        setIsAuthenticated(true);
      } else {
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
        setToken(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    };

    verifySavedSession();
  }, []);

  const login = useCallback(async (key: string) => {
    setError('');
    setIsLoading(true);
    try {
      const response = await AdminService.login(key);
      if (response.token) {
        sessionStorage.setItem(ADMIN_TOKEN_KEY, response.token);
        setToken(response.token);
        setIsAuthenticated(true);
        return { success: true };
      }
      throw new Error('No authentication token returned by server');
    } catch (err: any) {
      const msg = err.message || 'Invalid admin credentials';
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    setToken(null);
    setIsAuthenticated(false);
  }, []);

  return {
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
  };
}

