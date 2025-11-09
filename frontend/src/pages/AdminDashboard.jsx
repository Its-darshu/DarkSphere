import { useState, useEffect } from 'react';
import api from '../utils/api';
import PasscodeManager from '../components/admin/PasscodeManager';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'flags') {
      fetchFlags();
    }
    // Passcodes tab doesn't need to fetch here - component handles it
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/users');
      setUsers(response.data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFlags = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/flags', {
        params: { status: 'open' }
      });
      setFlags(response.data.flags);
    } catch (err) {
      console.error('Error fetching flags:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableUser = async (uid, disabled) => {
    if (!window.confirm(`Are you sure you want to ${disabled ? 'disable' : 'enable'} this user?`)) return;

    try {
      await api.post(`/api/admin/users/${uid}/disable`, { disabled });
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      alert('Failed to update user');
    }
  };

  const handleDeleteUser = async (uid) => {
    if (!window.confirm('Are you sure you want to DELETE this user? This cannot be undone!')) return;

    try {
      await api.delete(`/api/admin/users/${uid}`);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Failed to delete user');
    }
  };

  const handleResolveFlag = async (flagId, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this flagged joke?`)) return;

    try {
      await api.post(`/api/admin/flags/${flagId}/resolve`, { action });
      fetchFlags();
    } catch (err) {
      console.error('Error resolving flag:', err);
      alert('Failed to resolve flag');
    }
  };

  return (
    <div className="admin-page">
      <div className="container">
        <h1>Admin Dashboard</h1>

        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button
            className={`admin-tab ${activeTab === 'passcodes' ? 'active' : ''}`}
            onClick={() => setActiveTab('passcodes')}
          >
            Passcodes
          </button>
          <button
            className={`admin-tab ${activeTab === 'flags' ? 'active' : ''}`}
            onClick={() => setActiveTab('flags')}
          >
            Flagged Content ({flags.length})
          </button>
        </div>

        {(loading && activeTab !== 'passcodes') ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            {activeTab === 'passcodes' && (
              <PasscodeManager />
            )}

            {activeTab === 'users' && (
              <div className="admin-section">
                <h2>User Management</h2>
                <div className="users-table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Passcode Used</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.uid}>
                          <td>
                            <div className="user-cell">
                              {user.photoURL ? (
                                <img src={user.photoURL} alt={user.displayName} className="user-table-avatar" />
                              ) : (
                                <div className="user-table-avatar-placeholder">
                                  {user.displayName.charAt(0)}
                                </div>
                              )}
                              <span>{user.displayName}</span>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td><span className={`role-badge ${user.role}`}>{user.role}</span></td>
                          <td>
                            {user.passcodeUsed ? (
                              <code style={{ fontSize: '0.875rem', color: 'var(--primary)' }}>
                                {user.passcodeUsed.passcode}
                              </code>
                            ) : (
                              <span style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>Legacy</span>
                            )}
                          </td>
                          <td>
                            <span className={`status-badge ${user.disabled ? 'disabled' : 'active'}`}>
                              {user.disabled ? 'Disabled' : 'Active'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                className="btn-small btn-outline"
                                onClick={() => handleDisableUser(user.uid, !user.disabled)}
                              >
                                {user.disabled ? 'Enable' : 'Disable'}
                              </button>
                              <button
                                className="btn-small btn-danger"
                                onClick={() => handleDeleteUser(user.uid)}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'flags' && (
              <div className="admin-section">
                <h2>Flagged Content</h2>
                {flags.length === 0 ? (
                  <p className="empty-message">No flagged content to review</p>
                ) : (
                  <div className="flags-grid">
                    {flags.map(flag => (
                      <div key={flag.id} className="flag-card card">
                        <div className="flag-header">
                          <span className="flag-status">Reported by: {flag.reporter?.displayName || 'Unknown'}</span>
                        </div>
                        <div className="flag-content">
                          {flag.joke?.imageUrl && (
                            <img src={flag.joke.imageUrl} alt="Flagged joke" className="flag-image" />
                          )}
                          <p className="flag-joke-text">{flag.joke?.text || 'Joke deleted'}</p>
                          <p className="flag-reason"><strong>Reason:</strong> {flag.reason}</p>
                        </div>
                        <div className="flag-actions">
                          <button
                            className="btn btn-outline"
                            onClick={() => handleResolveFlag(flag.id, 'dismiss')}
                          >
                            Dismiss
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleResolveFlag(flag.id, 'delete')}
                          >
                            Delete Joke
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
