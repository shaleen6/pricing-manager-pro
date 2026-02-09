// src/contexts/LayoutContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LayoutContextType {
  collapsed: boolean;
  toggleCollapse: () => void;
  drawerWidth: number;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(true);
  
  const toggleCollapse = () => {
    setCollapsed(prev => !prev);
  };

  const drawerWidth = collapsed ? 72 : 280;

  return (
    <LayoutContext.Provider value={{ collapsed, toggleCollapse, drawerWidth }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within LayoutProvider');
  }
  return context;
};
