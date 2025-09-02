// client/src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Add a small delay to ensure localStorage is properly set
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        console.log('🔐 Frontend: Checking auth with token:', token.substring(0, 20) + '...');
        const userData = await authService.getProfile();
        console.log('🔐 Frontend: Auth check successful, user:', userData.user);
        setUser(userData.user);
      } else {
        console.log('🔐 Frontend: No token found in localStorage');
      }
    } catch (error) {
      console.error('🔐 Frontend: Auth check error:', error);
      // Only remove token if it's a 401 (unauthorized) or 403 (forbidden)
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('🔐 Frontend: Removing invalid token');
        localStorage.removeItem('token');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (method, credentials) => {
    try {
      let response;
      
      if (method === 'google') {
        // Handle Google OAuth login
        response = await authService.googleLogin(credentials);
      } else {
        // Handle email/password login
        const { email, password } = credentials;
        response = await authService.login(email, password);
      }

      localStorage.setItem('token', response.token);
      setUser(response.user);

      // Welcome message based on user role
      const roleMessages = {
        admin: '👑 Welcome back, Admin!',
        moderator: '🛡️ Welcome back, Moderator!',
        member: '✍️ Welcome back! Ready to share your story?',
        user: '👋 Welcome back!'
      };

      toast.success(roleMessages[response.user.role] || 'Welcome back!');
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      localStorage.setItem('token', response.token);
      setUser(response.user);
      toast.success(
        '🎉 Welcome to Tausug Confession! Your account has been created successfully.'
      );
      return response;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMessage);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('👋 Logged out successfully');
  };

  const updateUser = (updatedUserData) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...updatedUserData,
    }));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    setUser,
    isAuthenticated: !!user,
    hasRole: (roles) => {
      if (!user) return false;
      return Array.isArray(roles)
        ? roles.includes(user.role)
        : user.role === roles;
    },
    canCreateContent: () => {
      if (!user) return false;
      return true; // All authenticated users can create content
    },
    canComment: () => {
      if (!user) return false;
      return ['user', 'member', 'moderator', 'admin'].includes(user.role);
    },
    canLike: () => {
      if (!user) return false;
      return ['user', 'member', 'moderator', 'admin'].includes(user.role);
    },
    canBookmark: () => {
      if (!user) return false;
      return ['user', 'member', 'moderator', 'admin'].includes(user.role);
    },
    isAdmin: () => user?.role === 'admin',
    isModerator: () => ['moderator', 'admin'].includes(user?.role),
    isMember: () => ['member', 'moderator', 'admin'].includes(user?.role),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
