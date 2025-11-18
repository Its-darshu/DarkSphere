import { useState, useEffect } from 'react';
import api from '../../utils/api';
import './PasscodeManager.css';

const PasscodeManager = () => {
  const [passcodes, setPasscodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [type, setType] = useState('user');
  const [customPasscode, setCustomPasscode] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPasscodes();
  }, []);

  const fetchPasscodes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/passcodes');
      setPasscodes(response.data.passcodes);
    } catch (err) {
      console.error('Error fetching passcodes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePasscode = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setCreating(true);
      await api.post('/api/admin/passcodes', {
        type,
        customPasscode: customPasscode.trim() || null
      });

      setShowCreateModal(false);
      setCustomPasscode('');
      setType('user');
      fetchPasscodes();
    } catch (err) {
      console.error('Error creating passcode:', err);
      setError(err.response?.data?.message || 'Failed to create passcode');
    } finally {
      setCreating(false);
    }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Are you sure you want to deactivate this passcode?')) return;

    try {
      await api.delete(`/api/admin/passcodes/${id}`);
      fetchPasscodes();
    } catch (err) {
      console.error('Error deactivating passcode:', err);
      alert('Failed to deactivate passcode');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Passcode copied to clipboard!');
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysRemaining = (expiresAt) => {
    const expires = expiresAt.toDate ? expiresAt.toDate() : new Date(expiresAt);
    const now = new Date();
    const diff = expires - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="passcode-manager">
      <div className="passcode-header">
        <h2>Passcode Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Passcode
        </button>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      ) : (
        <div className="passcode-list">
          {passcodes.length === 0 ? (
            <div className="empty-state">
              <p>No passcodes created yet. Create one to allow new registrations.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="passcode-table">
                <thead>
                  <tr>
                    <th>Passcode</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Expires In</th>
                    <th>Used By</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {passcodes.map(passcode => {
                    const daysRemaining = getDaysRemaining(passcode.expiresAt);
                    return (
                      <tr key={passcode.id}>
                        <td>
                          <div className="passcode-cell">
                            <code className="passcode-code">{passcode.passcode}</code>
                            <button
                              className="btn-icon"
                              onClick={() => copyToClipboard(passcode.passcode)}
                              title="Copy to clipboard"
                            >
                              📋
                            </button>
                          </div>
                        </td>
                        <td>
                          <span className={`badge badge-${passcode.type}`}>
                            {passcode.type === 'admin' ? '👑 Admin' : '👤 User'}
                          </span>
                        </td>
                        <td>
                          {passcode.isExpired ? (
                            <span className="status-badge expired">Expired</span>
                          ) : passcode.usedBy ? (
                            <span className="status-badge used">Used</span>
                          ) : passcode.isActive ? (
                            <span className="status-badge active">Active</span>
                          ) : (
                            <span className="status-badge inactive">Inactive</span>
                          )}
                        </td>
                        <td>
                          {passcode.isExpired ? (
                            <span style={{ color: 'var(--red)' }}>Expired</span>
                          ) : daysRemaining < 0 ? (
                            <span style={{ color: 'var(--red)' }}>Expired</span>
                          ) : daysRemaining === 0 ? (
                            <span style={{ color: 'var(--orange)' }}>Today</span>
                          ) : daysRemaining === 1 ? (
                            <span style={{ color: 'var(--orange)' }}>1 day</span>
                          ) : (
                            <span>{daysRemaining} days</span>
                          )}
                        </td>
                        <td>
                          {passcode.usedBy ? (
                            <span className="user-email">{passcode.usedBy}</span>
                          ) : (
                            <span style={{ color: 'var(--gray)' }}>Not used</span>
                          )}
                        </td>
                        <td>{formatDate(passcode.createdAt)}</td>
                        <td>
                          {passcode.isActive && !passcode.isExpired && (
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleDeactivate(passcode.id)}
                            >
                              Deactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New Passcode</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <form onSubmit={handleGeneratePasscode}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}

                <div className="form-group">
                  <label className="form-label">Passcode Type</label>
                  <select
                    className="form-select"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    required
                  >
                    <option value="user">👤 User (Regular Access)</option>
                    <option value="admin">👑 Admin (Full Access)</option>
                  </select>
                  <small style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>
                    Choose whether this passcode grants admin or user access
                  </small>
                </div>

                <div className="form-group">
                  <label className="form-label">Custom Passcode (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Leave empty to auto-generate"
                    value={customPasscode}
                    onChange={(e) => setCustomPasscode(e.target.value)}
                    maxLength="50"
                  />
                  <small style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>
                    Leave empty to generate a random 12-character passcode
                  </small>
                </div>

                <div className="info-box">
                  <strong>📅 Expiration:</strong> All passcodes expire after 5 days
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? 'Creating...' : 'Create Passcode'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasscodeManager;
