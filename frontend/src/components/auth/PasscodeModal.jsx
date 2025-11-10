import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './PasscodeModal.css';

const PasscodeModal = ({ isOpen, onClose, onSuccess }) => {
  const { registerWithPasscode, currentUser } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerWithPasscode('admin123', displayName);
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
          <h2 className="modal-title">Complete Registration</h2>
          <button className="modal-close" onClick={onClose}></button>
        </div>

        <div className="modal-body">
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
              <small style={{ color: 'var(--gray)', marginTop: '0.5rem', display: 'block' }}>
                This is how others will see you on the platform
              </small>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading || !displayName}
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasscodeModal;
