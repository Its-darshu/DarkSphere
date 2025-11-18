import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignIn from '../components/auth/GoogleSignIn';
import PasscodeModal from '../components/auth/PasscodeModal';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isRegistered } = useAuth();
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);

  useEffect(() => {
    console.log('🎯 Login useEffect - Auth state:', { isAuthenticated, isRegistered, showPasscodeModal });
    
    // If user is authenticated but not registered, show passcode modal
    if (isAuthenticated && !isRegistered) {
      console.log('🔓 Showing passcode modal - user not registered');
      setShowPasscodeModal(true);
    }
    // If fully authenticated and registered, redirect to feed
    else if (isAuthenticated && isRegistered) {
      console.log('✅ User fully authenticated - redirecting to feed');
      navigate('/feed');
    }
  }, [isAuthenticated, isRegistered, navigate]);

  const handleSignInSuccess = () => {
    // After Google sign-in, the useEffect will handle showing passcode modal
  };

  const handleRegistrationSuccess = () => {
    setShowPasscodeModal(false);
    navigate('/feed');
  };

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
            <GoogleSignIn onSuccess={handleSignInSuccess} />
            
            <div className="login-info">
              <p>
                <strong>Note:</strong> You need a valid passcode to access this platform.
                Contact an admin if you don't have one.
              </p>
            </div>
          </div>

          <div className="login-footer">
            <p>By signing in, you agree to our Terms of Service and Privacy Policy.</p>
          </div>
        </div>
      </div>

      <PasscodeModal
        isOpen={showPasscodeModal}
        onClose={() => setShowPasscodeModal(false)}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  );
};

export default Login;
