import { useState } from 'react';
import api from '../../utils/api';
import './PostComposer.css';

const PostComposer = ({ onClose, onSuccess }) => {
  const [text, setText] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'puns', label: 'Puns' },
    { value: 'one-liners', label: 'One-liners' },
    { value: 'memes', label: 'Memes' },
    { value: 'dad-jokes', label: 'Dad Jokes' },
    { value: 'knock-knock', label: 'Knock-knock' },
    { value: 'riddles', label: 'Riddles' },
    { value: 'wordplay', label: 'Wordplay' },
    { value: 'other', label: 'Other' }
  ];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError('');
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // At least text or image is required
    if (!text.trim() && !image) {
      setError('Please add either text or an image');
      return;
    }

    try {
      setSubmitting(true);
      let imageUrl = null;
      let thumbnailUrl = null;

      // Upload image if present
      if (image) {
        setUploading(true);
        const formData = new FormData();
        formData.append('image', image);

        const uploadResponse = await api.post('/api/upload/image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        imageUrl = uploadResponse.data.imageUrl;
        thumbnailUrl = uploadResponse.data.thumbnailUrl;
        setUploading(false);
      }

      // Create post
      await api.post('/api/posts', {
        text: text.trim() || description.trim() || 'Check out this image!',
        description: description.trim(),
        imageUrl,
        thumbnailUrl
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.message || 'Failed to create post. Please try again.');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal composer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Create Post</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label className="form-label">Your Content (Text or Image required)</label>
              <textarea
                className="form-textarea"
                placeholder="Share your thoughts, memes, or funny moments..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows="6"
                maxLength="5000"
              />
              <small style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>
                {text.length}/5000 characters
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Image (Optional)</label>
              {!imagePreview ? (
                <div className="image-upload">
                  <input
                    type="file"
                    id="image-input"
                    accept="image/jpeg,image/png,image/jpg"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="image-input" className="image-upload-label">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Click to upload image</span>
                    <small>JPG, PNG (Max 5MB)</small>
                  </label>
                </div>
              ) : (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Preview" className="image-preview" />
                  <button
                    type="button"
                    className="image-remove-button"
                    onClick={handleRemoveImage}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {image && (
              <div className="form-group">
                <label className="form-label">Image Description (Optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Add a description or caption for your image..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  maxLength="500"
                />
                <small style={{ color: 'var(--gray)', fontSize: '0.875rem' }}>
                  {description.length}/500 characters
                </small>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={submitting || uploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || uploading || (!text.trim() && !image)}
            >
              {uploading ? 'Uploading image...' : submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostComposer;
