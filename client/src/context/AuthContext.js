'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  login: () => {},
  loginWithGoogle: () => {},
  logout: () => {},
  loading: true
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check auth status on initial load from Express backend and localStorage
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setUser(data.user);
            setIsAuthenticated(true);
            localStorage.setItem('yt_user', JSON.stringify(data.user));
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend authentication check failed:', err.message);
      }

      // Check cached user session in localStorage as fallback
      const savedUser = localStorage.getItem('yt_user');
      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          setIsAuthenticated(true);
        } catch (e) {
          localStorage.removeItem('yt_user');
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  // Initiate real Google OAuth redirect
  const loginWithGoogle = React.useCallback(() => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  }, []);

  // Set logged in user state
  const login = React.useCallback((userData) => {
    const userToSave = userData || {
      name: 'Google User',
      email: 'user@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
    setUser(userToSave);
    setIsAuthenticated(true);
    localStorage.setItem('yt_user', JSON.stringify(userToSave));
  }, []);

  // Trigger Logout
  const logout = React.useCallback(async () => {
    try {
      await fetch('http://localhost:5000/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.warn('Backend logout call error:', e);
    }
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('yt_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, loginWithGoogle, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

