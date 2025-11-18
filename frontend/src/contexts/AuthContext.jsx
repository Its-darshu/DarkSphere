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
      console.log('🔐 Auth state changed:', firebaseUser ? 'User signed in' : 'User signed out');
      
      if (firebaseUser) {
        try {
          // Get Firebase ID token
          const token = await firebaseUser.getIdToken();
          localStorage.setItem('firebaseToken', token);

          // Verify with backend and get user profile
          let response;
          try {
            response = await api.post('/api/auth/verify-token', {
              idToken: token
            });
            console.log('✅ User verified with backend:', response.data.user);
            setCurrentUser(firebaseUser);
            setUserProfile(response.data.user);
            setError(null);
            setLoading(false);
          } catch (err) {
            // If user not found (404), automatically register them
            if (err.response?.status === 404) {
              console.log('⚠️ User not registered - auto-registering...');
              try {
                // Auto-register user without passcode
                response = await api.post('/api/auth/register', {
                  idToken: token,
                  displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
                });
                console.log('✅ User auto-registered:', response.data.user);
                setCurrentUser(firebaseUser);
                setUserProfile(response.data.user);
                setError(null);
                setLoading(false);
              } catch (regErr) {
                console.error('❌ Auto-registration error:', regErr);
                setError(regErr.response?.data?.message || 'Registration failed');
                setLoading(false);
              }
            } else {
              throw err;
            }
          }
        } catch (err) {
          console.error('❌ Auth error:', err.response?.data?.message);
          setError(err.response?.data?.message || 'Authentication failed');
          await firebaseSignOut(auth);
          localStorage.removeItem('firebaseToken');
          setCurrentUser(null);
          setUserProfile(null);
          setLoading(false);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        localStorage.removeItem('firebaseToken');
        setLoading(false);
      }
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
