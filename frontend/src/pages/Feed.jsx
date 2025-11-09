import { useState, useEffect } from 'react';
import PostFeed from '../components/posts/PostFeed';
import PostComposer from '../components/posts/PostComposer';
import FloatingButton from '../components/common/FloatingButton';
import './Feed.css';

const Feed = () => {
  const [showComposer, setShowComposer] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handlePostCreated = () => {
    setShowComposer(false);
    setRefreshTrigger(prev => prev + 1); // Trigger feed refresh
  };

  return (
    <div className="feed-page">
      <div className="container">
        <div className="feed-header">
          <h1>Community Feed</h1>
          <p>Share your thoughts, memes, and moments with the community!</p>
        </div>

        <PostFeed key={refreshTrigger} />

        <FloatingButton onClick={() => setShowComposer(true)} />

        {showComposer && (
          <PostComposer
            onClose={() => setShowComposer(false)}
            onSuccess={handlePostCreated}
          />
        )}
      </div>
    </div>
  );
};

export default Feed;
