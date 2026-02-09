// src/contexts/AuthContext.tsx - DEBUGGED & FIXED
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'pricing_manager' | 'viewer';
}

interface Permissions {
  viewDashboard: boolean;
  searchRecords: boolean;
  uploadCSV: boolean;
  manageUsers: boolean;
  viewAnalytics: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  permissions: Permissions;
  loading: boolean;
  logout: () => Promise<void>;
  hasPermission: (permission: keyof Permissions) => boolean;
  isRole: (role: UserProfile['role']) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const getPermissionsByRole = (role: UserProfile['role']): Permissions => {  
  switch (role) {
    case 'admin':
      return { viewDashboard: true, searchRecords: true, uploadCSV: true, manageUsers: true, viewAnalytics: true };
    case 'pricing_manager':
      return { viewDashboard: true, searchRecords: true, uploadCSV: true, manageUsers: false, viewAnalytics: true };
    case 'viewer':
      return { viewDashboard: true, searchRecords: true, uploadCSV: false, manageUsers: false, viewAnalytics: false };
    default:
      return { viewDashboard: false, searchRecords: false, uploadCSV: false, manageUsers: false, viewAnalytics: false };
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<Permissions>({
    viewDashboard: false,
    searchRecords: false,
    uploadCSV: false,
    manageUsers: false,
    viewAnalytics: false
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          let userProfile: UserProfile;
          
          if (userDoc.exists()) {
            const data = userDoc.data();            
            userProfile = { 
              uid: firebaseUser.uid, 
              email: data.email || firebaseUser.email!,
              role: (data.role as UserProfile['role']) || 'viewer'
            };
          } else {
            console.warn('No user doc found, using fallback');
            userProfile = { 
              uid: firebaseUser.uid, 
              email: firebaseUser.email!, 
              role: 'viewer' as const 
            };
          }
          
          setUser(userProfile);
          
          const newPermissions = getPermissionsByRole(userProfile.role);
          setPermissions(newPermissions);
          
        } catch (error) {
          console.error('Profile fetch error:', error);
          const fallbackUser: UserProfile = { 
            uid: firebaseUser.uid, 
            email: firebaseUser.email!, 
            role: 'viewer' as const 
          };
          setUser(fallbackUser);
          setPermissions(getPermissionsByRole(fallbackUser.role));
        }
      } else {
        setUser(null);
        setPermissions({
          viewDashboard: false,
          searchRecords: false,
          uploadCSV: false,
          manageUsers: false,
          viewAnalytics: false
        });
      }
      
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const hasPermission = (permission: keyof Permissions): boolean => {
    const result = !!permissions[permission];
    return result;
  };

  const isRole = (role: UserProfile['role']): boolean => {
    return user?.role === role;
  };

  const value = { 
    user, 
    permissions, 
    loading, 
    logout, 
    hasPermission,
    isRole 
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
