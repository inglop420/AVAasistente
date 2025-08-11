import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Organization } from '../types';
import { mockUsers, mockOrganizations } from '../data/mockData';

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
    const storedUser = localStorage.getItem('ava_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      const org = mockOrganizations.find(o => o.id === userData.organizationId);
      setOrganization(org || null);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (foundUser && password === 'demo123') {
      setUser(foundUser);
      const org = mockOrganizations.find(o => o.id === foundUser.organizationId);
      setOrganization(org || null);
      localStorage.setItem('ava_user', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    setOrganization(null);
    localStorage.removeItem('ava_user');
  };

  return (
    <AuthContext.Provider value={{ user, organization, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};