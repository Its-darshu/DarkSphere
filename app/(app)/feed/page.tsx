'use client'

import { useState, useEffect } from 'react'
import CreatePostForm from '@/components/CreatePostForm'
import PostCard from '@/components/PostCard'

interface PostData {
  id: string
  content: string
  imageUrl?: string | null
  author: {
    id: string
    username: string
    avatarUrl?: string | null
  }
  likeCount: number
  commentCount: number
  retweetCount: number
  isLiked: boolean
  isRetweeted: boolean
  isOwnPost: boolean
  createdAt: string
}

export default function FeedPage() {
  const [posts, setPosts] = useState<PostData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/posts')
      if (!response.ok) {
        setError('Failed to load posts')
        setLoading(false)
        return
      }

      const data = await response.json()
      setPosts(data)
    } catch (err) {
      setError('An error occurred while loading posts')
    }
    setLoading(false)
  }

  const handlePostCreated = () => {
    fetchPosts()
  }

  const handlePostDeleted = (postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((p) => p.id !== postId))
  }

  const handleLikeToggle = (postId: string, isLiked: boolean) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked,
              likeCount: isLiked ? post.likeCount + 1 : post.likeCount - 1,
            }
          : post
      )
    )
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Home</h1>
          <p className="text-slate-400">What's happening?!</p>
        </div>

        {/* Create Post Form */}
        <CreatePostForm onPostCreated={handlePostCreated} />

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-slate-400">Loading posts...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && !error && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-slate-400 mb-2">No posts yet</p>
            <p className="text-slate-500 text-sm">
              Follow users or create a post to get started!
            </p>
          </div>
        )}

        {/* Posts Feed */}
        {!loading && posts.length > 0 && (
          <div>
            {posts.map((post) => (
              <PostCard
                key={post.id}
                {...post}
                onPostDeleted={handlePostDeleted}
                onLikeToggle={handleLikeToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
