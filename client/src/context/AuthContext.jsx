import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('aura_auth_token'));
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  const fetchCurrentUser = useCallback(async () => {
    const storedToken = localStorage.getItem('aura_auth_token');
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.getMe();
      if (data.success) {
        setUser(data.user);
      } else {
        logout();
      }
    } catch (err) {
      console.warn('Failed to restore session:', err.message);
      logout();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    try {
      const data = await api.login({ email, password });
      if (data.success) {
        localStorage.setItem('aura_auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        showSuccess(`Welcome back, ${data.user.name}`);
        return data.user;
      }
    } catch (error) {
      showError(error.message || 'Login failed. Please check your credentials.');
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await api.register(userData);
      if (data.success) {
        localStorage.setItem('aura_auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        showSuccess(`Welcome to AURA Luxe, ${data.user.name}!`);
        return data.user;
      }
    } catch (error) {
      showError(error.message || 'Registration failed.');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('aura_auth_token');
    setToken(null);
    setUser(null);
    showSuccess('You have been logged out.');
  };

  const updateProfile = async (profileData) => {
    try {
      const data = await api.updateProfile(profileData);
      if (data.success) {
        setUser((prev) => ({ ...prev, ...data.user }));
        showSuccess('Profile updated successfully.');
      }
    } catch (error) {
      showError(error.message || 'Could not update profile.');
      throw error;
    }
  };

  const changePassword = async (passwordData) => {
    try {
      const data = await api.changePassword(passwordData);
      if (data.success) {
        showSuccess('Password updated securely.');
      }
    } catch (error) {
      showError(error.message || 'Could not update password.');
      throw error;
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refreshUser: fetchCurrentUser,
    updateProfile,
    changePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
