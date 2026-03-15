import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('drip_token');
    if (token) {
      setUser({ token, username: localStorage.getItem('drip_username') });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      
      if (response.ok && data.token) {
        localStorage.setItem('drip_token', data.token);
        localStorage.setItem('drip_username', data.username);
        setUser({ token: data.token, username: data.username });
        return { success: true };
      }
      return { success: false, error: data.message || 'Invalid credentials' };
    } catch (err) {
      return { success: false, error: 'Cannot connect to backend server' };
    }
  };

  const register = async (username, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      
      if (response.ok && data.token) {
        localStorage.setItem('drip_token', data.token);
        localStorage.setItem('drip_username', data.username);
        setUser({ token: data.token, username: data.username });
        return { success: true };
      }
      return { success: false, error: data.message || 'Registration failed' };
    } catch (err) {
      return { success: false, error: 'Cannot connect to backend server' };
    }
  };

  const logout = () => {
    localStorage.removeItem('drip_token');
    localStorage.removeItem('drip_username');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
