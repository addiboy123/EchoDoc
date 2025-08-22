import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      const userName = localStorage.getItem('userName');
      setUser({ name: userName });
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/v1/auth/login', { email, password });
      const { user, token } = response.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('userName', user.name);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/api/v1/auth/register', { name, email, password });
      const { user, token } = response.data;
      setToken(token);
      setUser(user);
      localStorage.setItem('userName', user.name);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };
  
  const logout = () => {
    setToken(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;