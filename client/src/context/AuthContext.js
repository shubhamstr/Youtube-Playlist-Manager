'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
  loading: true
});

export const AuthProvider = ({ children }) => {
  // Pre-configured signed-in user initial state for smooth demo preview
  const [user, setUser] = useState({
    name: 'Alex Johnson',
    email: 'alex.johnson@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    googleId: '109823749281'
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [loading, setLoading] = useState(false);

  // Trigger Google Login
  const login = (customUser) => {
    setLoading(true);
    setTimeout(() => {
      setUser(customUser || {
        name: 'Alex Johnson',
        email: 'alex.johnson@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        googleId: '109823749281'
      });
      setIsAuthenticated(true);
      setLoading(false);
    }, 400);
  };

  // Trigger Logout
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
