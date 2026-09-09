import React, { createContext, useContext, useState } from 'react';

type User = {
  id: string;
  _id?: string;
  name: string;
  role: 'admin' | 'user';
  companyId?: string; // For employees
};

type AuthContextType = {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ams_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (newUser: User) => {
    // Ensure id exists (handle both _id and id from different backends)
    const processedUser = { ...newUser, id: newUser.id || newUser._id || '' };
    setUser(processedUser);
    localStorage.setItem('ams_user', JSON.stringify(processedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ams_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
