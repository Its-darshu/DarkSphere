import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './PasscodeModal.css';

const PasscodeModal = ({ isOpen, onClose, onSuccess }) => {
  const { registerWithPasscode, verifyPasscode, currentUser } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [step, setStep] = useState(1); // 1: passcode, 2: display name
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleVerifyPasscode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const valid = await verifyPasscode(passcode);
      if (valid) {
        setStep(2);
        setDisplayName(currentUser?.displayName || '');
      } else {
        setError('Invalid passcode. Please try again.');
      }
    } catch (err) {
      setError('Failed to verify passcode. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerWithPasscode(passcode, displayName);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {step === 1 ? 'Enter Passcode' : 'Complete Registration'}
          </h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {step === 1 ? (
            <form onSubmit={handleVerifyPasscode}>
              <div className="form-group">
                <label className="form-label">Access Passcode</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter the secret passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  required
                  autoFocus
                />
                <small style={{ color: 'var(--gray)', marginTop: '0.5rem', display: 'block' }}>
                  You need a valid passcode to access this platform
                </small>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading || !passcode}
              >
                {loading ? 'Verifying...' : 'Verify Passcode'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setStep(1)}
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={loading || !displayName}
                >
                  {loading ? 'Registering...' : 'Complete Registration'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasscodeModal;
