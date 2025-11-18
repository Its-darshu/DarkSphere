import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './PasscodeModal.css';

const PasscodeModal = ({ isOpen, onClose, onSuccess }) => {
  const { registerWithPasscode, currentUser } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePasscodeSubmit = async (e) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter a passcode');
      return;
    }
    setStep(2);
    setDisplayName(currentUser?.displayName || '');
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
      setError(err.response?.data?.message || 'Registration failed');
      setStep(1);
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
          <button className="modal-close" onClick={onClose}></button>
        </div>

        <div className="modal-body">
          {step === 1 ? (
            <form onSubmit={handlePasscodeSubmit}>
              <div className="form-group">
                <label className="form-label">Access Passcode</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  required
                  autoFocus
                />
                <small style={{ color: 'var(--gray)', marginTop: '0.5rem', display: 'block' }}>
                  Contact admin if you do not have a passcode
                </small>
              </div>

              {error && <div className="alert alert-error">{error}</div>}

              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={!passcode.trim()}
              >
                Next
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

              <div style={{ display: 'flex', gap: '0.5rem' }}>
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
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={loading || !displayName.trim()}
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
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
