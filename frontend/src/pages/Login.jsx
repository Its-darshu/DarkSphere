import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignIn from '../components/auth/GoogleSignIn';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isRegistered, isAdmin, loading } = useAuth();

  useEffect(() => {
    // Wait for loading to complete before checking auth state
    if (loading) {
      console.log('⏳ Login: Still loading auth state...');
      return;
    }
    
    console.log('🔍 Login: Auth state check -', { isAuthenticated, isRegistered, isAdmin, loading });
    
    // If user is authenticated and registered, redirect to appropriate dashboard
    if (isAuthenticated && isRegistered) {
      const redirectPath = isAdmin ? '/admin' : '/feed';
      console.log('✅ Login: User authenticated and registered - redirecting to', redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, isRegistered, isAdmin, loading, navigate]);

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card card">
          <div className="login-header">
            <h1 className="login-title">� DarkSphere</h1>
            <p className="login-subtitle">
              A secure social platform for sharing and connecting
            </p>
          </div>

          <div className="login-body">
            <GoogleSignIn />
          </div>

          <div className="login-footer">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
