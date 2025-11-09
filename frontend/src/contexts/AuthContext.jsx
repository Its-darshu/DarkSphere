import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from '../utils/api';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get Firebase ID token
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('firebaseToken', token);

          // Verify with backend and get user profile
          const response = await api.post('/api/auth/verify-token', {
            idToken: token
          });
          setCurrentUser(firebaseUser);
          setUserProfile(response.data.user);
          setError(null);
        } catch (err) {
          console.error('Error verifying user:', err);
          if (err.response?.status === 404) {
            // User not registered yet
            setCurrentUser(firebaseUser);
            setUserProfile(null);
          } else {
            setError(err.response?.data?.message || 'Authentication failed');
            await firebaseSignOut(auth);
            localStorage.removeItem('firebaseToken');
          }
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        localStorage.removeItem('firebaseToken');
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(err.message);
      throw err;
    }
  };

  const registerWithPasscode = async (passcode, displayName) => {
    try {
      setError(null);
      
      if (!currentUser) {
        throw new Error('No authenticated user');
      }

      // Get fresh token
      const token = await currentUser.getIdToken(true);
      localStorage.setItem('firebaseToken', token);

      // Register with backend
      const response = await api.post('/api/auth/register', {
        idToken: token,
        passcode,
        displayName
      });

      setUserProfile(response.data.user);
      return response.data;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  const verifyPasscode = async (passcode) => {
    try {
      const response = await api.post('/api/auth/verify-passcode', { passcode });
      return response.data.valid;
    } catch (err) {
      console.error('Passcode verification error:', err);
      return false;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      localStorage.removeItem('firebaseToken');
      setCurrentUser(null);
      setUserProfile(null);
      setError(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err.message);
    }
  };

  const refreshProfile = async () => {
    try {
      const response = await api.get('/api/users/me');
      setUserProfile(response.data.user);
    } catch (err) {
      console.error('Error refreshing profile:', err);
    }
  };

  const value = {
    currentUser,
    userProfile,
    loading,
    error,
    signInWithGoogle,
    registerWithPasscode,
    verifyPasscode,
    signOut,
    refreshProfile,
    isAuthenticated: !!currentUser,
    isRegistered: !!userProfile,
    isAdmin: userProfile?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
