import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import './Profile.css';

const Profile = () => {
  const { userProfile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || '');
  const [uploading, setUploading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      setError('');
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post('/api/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      await api.put('/api/users/me', {
        photoURL: response.data.photoURL
      });

      await refreshProfile();
      setMessage('Profile picture updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setError('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      setUpdating(true);
      await api.put('/api/users/me', {
        displayName: displayName.trim()
      });

      await refreshProfile();
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-container">
          <h1>Profile Settings</h1>

          {message && <div className="alert alert-success">{message}</div>}
          {error && <div className="alert alert-error">{error}</div>}

          <div className="profile-card card">
            <div className="profile-avatar-section">
              <div className="profile-avatar-large">
                {userProfile?.photoURL ? (
                  <img src={userProfile.photoURL} alt={userProfile.displayName} />
                ) : (
                  <div className="avatar-placeholder-large">
                    {userProfile?.displayName?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div>
                <input
                  type="file"
                  id="avatar-input"
                  accept="image/jpeg,image/png,image/jpg"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="avatar-input" className="btn btn-outline">
                  {uploading ? 'Uploading...' : 'Change Picture'}
                </label>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={userProfile?.email || ''}
                  disabled
                />
                <small style={{ color: 'var(--gray)', display: 'block', marginTop: '0.5rem' }}>
                  Email cannot be changed (managed by Google)
                </small>
              </div>

              <div className="form-group">
                <label className="form-label">Role</label>
                <input
                  type="text"
                  className="form-input"
                  value={userProfile?.role || 'user'}
                  disabled
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={updating || !displayName.trim()}
              >
                {updating ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
