import { useState, useEffect } from 'react';
import api from '../../utils/api';
import PostCard from './PostCard';
import './PostFeed.css';

const PostFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      setError('');
      const params = { page: pageNum, limit: 20 };

      const response = await api.get('/api/posts', { params });
      
      if (pageNum === 1) {
        setPosts(response.data.posts);
      } else {
        setPosts(prev => [...prev, ...response.data.posts]);
      }
      
      setHasMore(response.data.hasMore);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching posts:', err);
      // Silently fail - don't show error to user
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(page + 1);
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

      {loading && page === 1 && (
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="empty-state">
          <p>No posts yet. Be the first to share something!</p>
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
