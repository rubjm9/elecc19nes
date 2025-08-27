import { useState, useCallback } from 'react';
import { FirestoreService } from '../firebase/firestoreService';
import type { User } from '../types';
import { ERROR_MESSAGES } from '../constants';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = useCallback(async (username: string, password: string) => {
    setLoading(true);
    setError('');
    
    try {
      const admin = await FirestoreService.getAdminByCredentials(username, password);
      if (admin) {
        const userData: User = {
          username: admin.username,
          name: admin.name,
          pass: admin.pass,
          role: admin.role
        };
        setUser(userData);
        return userData;
      } else {
        setError(ERROR_MESSAGES.INVALID_CREDENTIALS);
        return null;
      }
    } catch (err) {
      setError(ERROR_MESSAGES.INVALID_CREDENTIALS);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setError('');
  }, []);

  const clearError = useCallback(() => {
    setError('');
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    clearError,
    isAuthenticated: !!user
  };
};
