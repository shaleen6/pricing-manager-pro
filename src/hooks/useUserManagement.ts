// src/hooks/useUserManagement.ts
import { useState, useCallback } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile,
  User,
  sendEmailVerification,
  AuthErrorCodes 
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export interface UserFormData {
  email: string;
  password: string;
  displayName: string;
  role?: 'admin' | 'pricing_manager' | 'viewer';
}

interface UserRegistrationResult {
  success: boolean;
  user?: User;
  error?: string;
}

export const useUserManagement = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ CREATE NEW USER
  const createUser = useCallback(async (userData: UserFormData): Promise<UserRegistrationResult> => {
    setLoading(true);
    setError('');

    try {
      // 1. Create user with email/password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      
      const user = userCredential.user;

      // 2. Update display name
      await updateProfile(user, {
        displayName: userData.displayName
      });

      // 3. Save user profile to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role || 'viewer',
        emailVerified: false,
        createdAt: new Date().toISOString()
      });

      // 4. Send verification email
      await sendEmailVerification(user);

      return { success: true, user };
    } catch (error: any) {
      let errorMessage = 'Registration failed';
      
      switch (error.code) {
        case AuthErrorCodes.EMAIL_EXISTS:
          errorMessage = 'Email already exists';
          break;
        case AuthErrorCodes.WEAK_PASSWORD:
          errorMessage = 'Password too weak (min 6 chars)';
          break;
        case AuthErrorCodes.INVALID_EMAIL:
          errorMessage = 'Invalid email format';
          break;
        default:
          errorMessage = error.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createUser,
    loading,
    error
  };
};
