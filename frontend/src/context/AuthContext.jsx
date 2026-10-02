import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [agentDetails, setAgentDetails] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('mwu_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user profile if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authAPI.getMe();
        if (res.success) {
          setUser(res.user);
          if (res.agentDetails) setAgentDetails(res.agentDetails);
        }
      } catch (err) {
        console.warn('Session expired or invalid token:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = async (email, password, role) => {
    const res = await authAPI.login({ email, password, role });
    if (res.success && res.token) {
      localStorage.setItem('mwu_token', res.token);
      setToken(res.token);
      setUser(res.user);
      if (res.agentDetails) setAgentDetails(res.agentDetails);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('mwu_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('mwu_token');
    setToken(null);
    setUser(null);
    setAgentDetails(null);
  };

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await authAPI.getMe();
      if (res.success) {
        setUser(res.user);
        if (res.agentDetails) setAgentDetails(res.agentDetails);
      }
    } catch (e) {}
  };

  const quickLoginAs = async (roleName) => {
    const creds = {
      customer: { email: 'customer@martwithus.com', password: 'Customer@123' },
      delivery: { email: 'delivery@martwithus.com', password: 'Delivery@123' },
      admin: { email: 'admin@martwithus.com', password: 'Admin@123' }
    };
    const c = creds[roleName];
    if (c) {
      return await login(c.email, c.password, roleName);
    }
  };

  const value = {
    user,
    agentDetails,
    token,
    loading,
    isAuthenticated: Boolean(user),
    isCustomer: user?.role === 'customer',
    isDelivery: user?.role === 'delivery',
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    refreshProfile,
    quickLoginAs
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
