// src/contexts/AuthContext.tsx - DEBUGGED & FIXED
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'pricing_manager' | 'viewer';  // ✅ Matches your doc
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

// ✅ FIXED RBAC - Added pricing_manager
const getPermissionsByRole = (role: UserProfile['role']): Permissions => {
  console.log('🔍 getPermissionsByRole called with:', role);  // ✅ DEBUG
  
  switch (role) {
    case 'admin':
      return { viewDashboard: true, searchRecords: true, uploadCSV: true, manageUsers: true, viewAnalytics: true };
    case 'pricing_manager':  // ✅ YOUR ROLE
      console.log('✅ pricing_manager permissions granted');
      return { viewDashboard: true, searchRecords: true, uploadCSV: true, manageUsers: false, viewAnalytics: true };
    case 'viewer':
      return { viewDashboard: true, searchRecords: true, uploadCSV: false, manageUsers: false, viewAnalytics: false };
    default:
      console.warn('⚠️ Unknown role:', role);  // ✅ DEBUG
      return { viewDashboard: false, searchRecords: false, uploadCSV: false, manageUsers: false, viewAnalytics: false };
  }
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<Permissions>({  // ✅ FIXED: Proper type
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
      console.log('🔍 Auth changed:', firebaseUser?.email || 'No user');
      
      if (firebaseUser) {
        try {
          console.log('🔍 Fetching profile for UID:', firebaseUser.uid);
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          let userProfile: UserProfile;
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            console.log('🔍 Raw Firestore data:', data);  // ✅ DEBUG
            
            userProfile = { 
              uid: firebaseUser.uid, 
              email: data.email || firebaseUser.email!,
              role: (data.role as UserProfile['role']) || 'viewer'
            };
            
            console.log('✅ Parsed userProfile:', userProfile);  // ✅ DEBUG
          } else {
            console.warn('⚠️ No user doc found, using fallback');
            userProfile = { 
              uid: firebaseUser.uid, 
              email: firebaseUser.email!, 
              role: 'viewer' as const 
            };
          }
          
          console.log('🔍 Calling setUser...');
          setUser(userProfile);
          
          const newPermissions = getPermissionsByRole(userProfile.role);
          console.log('✅ Permissions calculated:', newPermissions);  // ✅ CRITICAL DEBUG
          setPermissions(newPermissions);
          
        } catch (error) {
          console.error('❌ Profile fetch error:', error);
          const fallbackUser: UserProfile = { 
            uid: firebaseUser.uid, 
            email: firebaseUser.email!, 
            role: 'viewer' as const 
          };
          setUser(fallbackUser);
          setPermissions(getPermissionsByRole(fallbackUser.role));
        }
      } else {
        console.log('🔍 No Firebase user - logging out');
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
    console.log('🔍 Logout initiated');
    await signOut(auth);
    navigate("/");
  };

  const hasPermission = (permission: keyof Permissions): boolean => {
    const result = !!permissions[permission];
    console.log(`🔍 hasPermission(${permission}):`, result, 'Current permissions:', permissions);  // ✅ DEBUG
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

  console.log('🔍 AuthContext value:', value);  // ✅ FINAL DEBUG

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
