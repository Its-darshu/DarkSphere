import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import './PostCard.css';

const PostCard = ({ post, onDelete }) => {
  const { userProfile, isAdmin } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [flagging, setFlagging] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);

  const isOwner = userProfile?.uid === post.user?.uid;
  const canDelete = isOwner || isAdmin;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.delete(`/api/posts/${post.id}`);
      if (onDelete) onDelete(post.id);
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
    }
  };

  const handleFlag = async () => {
    if (!flagReason.trim()) {
      alert('Please provide a reason for flagging');
      return;
    }

    try {
      setFlagging(true);
      await api.post(`/api/posts/${post.id}/flag`, { reason: flagReason });
      alert('Post has been flagged for review');
      setShowFlagModal(false);
      setFlagReason('');
    } catch (err) {
      console.error('Error flagging post:', err);
      alert(err.response?.data?.message || 'Failed to flag post');
    } finally {
      setFlagging(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <>
      <div className="post-card card">
        <div className="post-header">
          <div className="post-author">
            {post.user?.photoURL ? (
              <img src={post.user.photoURL} alt={post.user.displayName} className="author-avatar" />
            ) : (
              <div className="author-avatar-placeholder">
                {post.user?.displayName?.charAt(0) || '?'}
              </div>
            )}
            <div className="author-info">
              <p className="author-name">{post.user?.displayName || 'Unknown'}</p>
              <p className="post-date">{formatDate(post.createdAt)}</p>
            </div>
          </div>

          <div className="post-menu-container">
            <button className="post-menu-button" onClick={() => setShowMenu(!showMenu)}>
              ⋮
            </button>
            {showMenu && (
              <div className="post-menu">
                {!isOwner && (
                  <button className="post-menu-item" onClick={() => {
                    setShowMenu(false);
                    setShowFlagModal(true);
                  }}>
                    Flag as inappropriate
                  </button>
                )}
                {canDelete && (
                  <button className="post-menu-item danger" onClick={handleDelete}>
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="post-content">
          {post.imageUrl && (
            <div className="post-image-container">
              <img src={post.imageUrl} alt="Post" className="post-image" />
            </div>
          )}
          {post.text && <p className="post-text">{post.text}</p>}
          {post.description && <p className="post-description" style={{ color: 'var(--gray)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{post.description}</p>}
        </div>

        <div className="post-footer">
          {post.featured && <span className="post-badge">⭐ Featured</span>}
        </div>
      </div>

      {showFlagModal && (
        <div className="modal-overlay" onClick={() => setShowFlagModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Report Post</h3>
              <button className="modal-close" onClick={() => setShowFlagModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Reason for reporting</label>
                <textarea
                  className="form-textarea"
                  placeholder="Please describe why this post is inappropriate..."
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value)}
                  rows="4"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowFlagModal(false)}>
                Cancel
              </button>
              <button 
                className="btn btn-danger" 
                onClick={handleFlag}
                disabled={flagging || !flagReason.trim()}
              >
                {flagging ? 'Reporting...' : 'Report'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PostCard;
