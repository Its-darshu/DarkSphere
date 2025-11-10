import { useState } from 'react';import { useState } from 'react';

import { useAuth } from '../../contexts/AuthContext';import { useAuth } from '../../contexts/AuthContext';

import './PasscodeModal.css';import './PasscodeModal.css';



const PasscodeModal = ({ isOpen, onClose, onSuccess }) => {const PasscodeModal = ({ isOpen, onClose, onSuccess }) => {

  const { registerWithPasscode, currentUser } = useAuth();  const { registerWithPasscode, verifyPasscode, currentUser } = useAuth();

  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');  const [passcode, setPasscode] = useState('');

  const [loading, setLoading] = useState(false);  const [displayName, setDisplayName] = useState('');

  const [error, setError] = useState('');  const [step, setStep] = useState(1); // 1: passcode, 2: display name

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;  const [error, setError] = useState('');



  const handleRegister = async (e) => {  if (!isOpen) return null;

    e.preventDefault();

    setError('');  const handleVerifyPasscode = async (e) => {

    setLoading(true);    e.preventDefault();

    setError('');

    try {    setLoading(true);

      // Auto-use passcode "admin123" - change REGISTRATION_PASSCODE in Vercel env vars to change this

      await registerWithPasscode('admin123', displayName);    try {

      if (onSuccess) onSuccess();      const valid = await verifyPasscode(passcode);

      onClose();      if (valid) {

    } catch (err) {        setStep(2);

      setError(err.response?.data?.message || 'Registration failed. Please try again.');        setDisplayName(currentUser?.displayName || '');

    } finally {      } else {

      setLoading(false);        setError('Invalid passcode. Please try again.');

    }      }

  };    } catch (err) {

      setError('Failed to verify passcode. Please try again.');

  return (    } finally {

    <div className="modal-overlay" onClick={onClose}>      setLoading(false);

      <div className="modal" onClick={(e) => e.stopPropagation()}>    }

        <div className="modal-header">  };

          <h2 className="modal-title">Complete Registration</h2>

          <button className="modal-close" onClick={onClose}>×</button>  const handleRegister = async (e) => {

        </div>    e.preventDefault();

    setError('');

        <div className="modal-body">    setLoading(true);

          <form onSubmit={handleRegister}>

            <div className="form-group">    try {

              <label className="form-label">Display Name</label>      await registerWithPasscode(passcode, displayName);

              <input      if (onSuccess) onSuccess();

                type="text"      onClose();

                className="form-input"    } catch (err) {

                placeholder="Enter your display name"      setError(err.response?.data?.message || 'Registration failed. Please try again.');

                value={displayName}    } finally {

                onChange={(e) => setDisplayName(e.target.value)}      setLoading(false);

                required    }

                autoFocus  };

              />

              <small style={{ color: 'var(--gray)', marginTop: '0.5rem', display: 'block' }}>  return (

                This is how others will see you on the platform    <div className="modal-overlay" onClick={onClose}>

              </small>      <div className="modal" onClick={(e) => e.stopPropagation()}>

            </div>        <div className="modal-header">

          <h2 className="modal-title">

            {error && <div className="alert alert-error">{error}</div>}            {step === 1 ? 'Enter Passcode' : 'Complete Registration'}

          </h2>

            <button          <button className="modal-close" onClick={onClose}>×</button>

              type="submit"        </div>

              className="btn btn-primary w-full"

              disabled={loading || !displayName}        <div className="modal-body">

            >          {step === 1 ? (

              {loading ? 'Creating Account...' : 'Complete Registration'}            <form onSubmit={handleVerifyPasscode}>

            </button>              <div className="form-group">

          </form>                <label className="form-label">Access Passcode</label>

        </div>                <input

      </div>                  type="password"

    </div>                  className="form-input"

  );                  placeholder="Enter the secret passcode"

};                  value={passcode}

                  onChange={(e) => setPasscode(e.target.value)}

export default PasscodeModal;                  required

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
