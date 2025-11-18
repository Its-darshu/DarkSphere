import { useState, useEffect } from 'react';
import api from '../../utils/api';
import PostCard from './PostCard';
import './PostFeed.css';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (startAfter = null) => {
    try {
      setLoading(true);
      setError('');
      const params = { limit: 20 };
      
      if (startAfter) {
        params.startAfter = startAfter;
      }

      const response = await api.get('/api/posts', { params });
      
      if (!startAfter) {
        // First page
        setPosts(response.data.posts);
      } else {
        // Append to existing posts
        setPosts(prev => [...prev, ...response.data.posts]);
      }
      
      setHasMore(response.data.hasMore);
      setLastDoc(response.data.lastDoc);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && lastDoc) {
      fetchPosts(lastDoc);
    }
  };

  const handleDelete = (deletedId) => {
    setPosts(prev => prev.filter(post => post.id !== deletedId));
  };

  return (
    <div className="post-feed">
      <div className="posts-grid">
        {posts.map(post => (
          <PostCard key={post.id} post={post} onDelete={handleDelete} />
        ))}
      </div>

      {loading && posts.length === 0 && (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="empty-state">
          <p>No posts yet. Be the first to share something!</p>
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {hasMore && posts.length > 0 && (
        <div className="load-more-container">
          <button
            className="btn btn-outline"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default PostFeed;
