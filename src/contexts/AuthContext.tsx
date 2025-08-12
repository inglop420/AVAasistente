import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Organization } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth data
    const storedToken = localStorage.getItem('ava_token');
    const storedUser = localStorage.getItem('ava_user');
    
    if (storedToken && storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      // Set organization from user data
      setOrganization({
        id: userData.organizationId,
        name: 'Organización', // This could be fetched from backend
        createdAt: new Date()
      });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await authAPI.login(email, password);
      const { token, user: userData } = response.data;
      
      // Store token and user data
      localStorage.setItem('ava_token', token);
      localStorage.setItem('ava_user', JSON.stringify(userData));
      
      setUser(userData);
      setOrganization({
        id: userData.organizationId,
        name: 'Organización',
        createdAt: new Date()
      });
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setOrganization(null);
    localStorage.removeItem('ava_token');
    localStorage.removeItem('ava_user');
  };

  return (
    <AuthContext.Provider value={{ user, organization, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};