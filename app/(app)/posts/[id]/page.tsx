'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import CommentForm from '@/components/CommentForm'
import CommentThread from '@/components/CommentThread'

interface PostDetail {
  id: string
  content: string
  author: {
    id: string
    username: string
    avatarUrl?: string | null
  }
  createdAt: string
  updatedAt: string
  likeCount: number
  commentCount: number
  retweetCount: number
  isLiked: boolean
  isRetweeted: boolean
  isOwnPost: boolean
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [post, setPost] = useState<PostDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const commentFormRef = useRef<HTMLDivElement>(null)

  const fetchPost = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/posts/${postId}`)
      if (!response.ok) {
        setError('Post not found')
        setLoading(false)
        return
      }

      const data = await response.json()
      setPost(data)
      setIsLiked(data.isLiked)
      setLikeCount(data.likeCount)
    } catch (err) {
      setError('Failed to load post')
    }
    setLoading(false)
  }, [postId])

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/users/profile')
        if (response.ok) {
          const data = await response.json()
          setCurrentUserId(data.id)
        }
      } catch (err) {
        console.error('Failed to fetch current user:', err)
      }
    }

    fetchCurrentUser()
    fetchPost()
  }, [fetchPost])

  const handleLikeToggle = async () => {
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, likeType: 'post' }),
      })

      if (response.ok) {
        setIsLiked((prev) => !prev)
        setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1))
      }
    } catch (error) {
      console.error('Like toggle failed:', error)
    }
  }

  const handleRetweetToggle = async () => {
    try {
      const response = await fetch('/api/retweets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      })

      if (response.ok) {
        // Refresh post to get updated retweet count
        fetchPost()
      }
    } catch (error) {
      console.error('Retweet toggle failed:', error)
    }
  }

  const handleDeletePost = async () => {
    if (!confirm('Delete this post?')) return

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.push('/feed')
      }
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  if (loading) {
    return (
      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto text-center py-12">
          <p className="text-slate-400">Loading post...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded mb-4">
            {error || 'Post not found'}
          </div>
          <Link href="/feed" className="text-blue-400 hover:text-blue-300">
            ← Back to feed
          </Link>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link href="/feed" className="text-blue-400 hover:text-blue-300 mb-6 inline-block">
          ← Back to feed
        </Link>

        {/* Post Detail */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
          {/* Author */}
          <div className="flex items-center justify-between mb-4">
            <Link
              href={`/profile/${post.author.username}`}
              className="flex items-center gap-3 hover:opacity-80"
            >
              {post.author.avatarUrl && (
                <img
                  src={post.author.avatarUrl}
                  alt={post.author.username}
                  className="w-12 h-12 rounded-full"
                />
              )}
              <div>
                <p className="font-semibold text-white">@{post.author.username}</p>
                <p className="text-sm text-slate-400">{formatDate(post.createdAt)}</p>
              </div>
            </Link>

            {post.isOwnPost && (
              <button
                onClick={handleDeletePost}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Delete
              </button>
            )}
          </div>

          {/* Content */}
          <p className="text-white text-2xl mb-6 break-words">{post.content}</p>

          {/* Engagement Stats */}
          <div className="flex gap-8 text-slate-400 text-sm border-t border-b border-slate-700 py-4 mb-4">
            <div>
              <span className="font-semibold text-white">{post.commentCount}</span>
              <span> comment{post.commentCount !== 1 ? 's' : ''}</span>
            </div>
            <div>
              <span className="font-semibold text-white">{post.retweetCount}</span>
              <span> retweet{post.retweetCount !== 1 ? 's' : ''}</span>
            </div>
            <div>
              <span className="font-semibold text-white">{likeCount}</span>
              <span> like{likeCount !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-around text-slate-400">
            <button
              onClick={handleLikeToggle}
              className={`flex items-center gap-2 py-2 px-4 rounded hover:bg-red-500/10 ${
                isLiked ? 'text-red-500' : ''
              }`}
            >
              ❤️ Like
            </button>
            <button
              onClick={handleRetweetToggle}
              className="flex items-center gap-2 py-2 px-4 rounded hover:bg-green-500/10"
            >
              🔄 Retweet
            </button>
            <button
              onClick={() => commentFormRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 py-2 px-4 rounded hover:bg-blue-500/10"
            >
              💬 Comment
            </button>
          </div>
        </div>

        {/* Comment Section */}
        <div className="space-y-6" ref={commentFormRef}>
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Replies</h2>
            <CommentForm
              postId={postId}
              onCommentCreated={() => fetchPost()}
            />
          </div>

          <div>
            <CommentThread
              postId={postId}
              currentUserId={currentUserId || ''}
              onCommentAdded={() => fetchPost()}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
