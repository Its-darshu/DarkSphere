'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface PostCardProps {
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
  onPostDeleted: (postId: string) => void
  onLikeToggle: (postId: string, isLiked: boolean) => void
  onRetweetToggle?: (postId: string, isRetweeted: boolean) => void
}

export default function PostCard({
  id,
  content,
  imageUrl,
  author,
  likeCount,
  commentCount,
  retweetCount,
  isLiked,
  isRetweeted,
  isOwnPost,
  createdAt,
  onPostDeleted,
  onLikeToggle,
  onRetweetToggle,
}: PostCardProps) {
  const [loading, setLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async () => {
    if (!isOwnPost) return

    setLoading(true)
    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onPostDeleted(id)
      } else {
        alert('Failed to delete post')
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
      alert('Failed to delete post')
    } finally {
      setLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleLike = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: id, type: 'post' }),
      })

      if (response.ok) {
        onLikeToggle(id, !isLiked)
      } else {
        alert('Failed to like post')
      }
    } catch (error) {
      console.error('Failed to like post:', error)
      alert('Failed to like post')
    } finally {
      setLoading(false)
    }
  }

  const handleRetweet = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/retweets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: id }),
      })

      if (response.ok) {
        const data = await response.json()
        onRetweetToggle?.(id, data.retweeted)
      } else {
        alert('Failed to retweet')
      }
    } catch (error) {
      console.error('Failed to retweet:', error)
      alert('Failed to retweet')
    } finally {
      setLoading(false)
    }
  }

  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true })

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-4 hover:bg-slate-700/50 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
            {author.avatarUrl ? (
              <img
                src={author.avatarUrl}
                alt={author.username}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-lg font-bold text-slate-300">
                {author.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          {/* Author Info */}
          <div className="flex-1">
            <Link
              href={`/profile/${author.username}`}
              className="font-semibold text-white hover:text-blue-400 transition-colors"
            >
              @{author.username}
            </Link>
            <p className="text-sm text-slate-400">{timeAgo}</p>
          </div>
        </div>

        {/* Delete Button */}
        {isOwnPost && (
          <div className="relative">
            <button
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              className="text-slate-400 hover:text-red-400 transition-colors"
              disabled={loading}
            >
              ⋯
            </button>

            {showDeleteConfirm && (
              <div className="absolute right-0 top-8 bg-slate-900 border border-slate-700 rounded-lg p-2 z-10">
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="block w-full text-left px-4 py-2 text-red-400 hover:bg-slate-800 rounded transition-colors text-sm"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <p className="text-white mb-4 break-words">{content}</p>

      {/* Image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Post image"
          className="w-full rounded-lg mb-4 max-h-96 object-cover"
        />
      )}

      {/* Actions */}
      <div className="flex gap-4 text-slate-400 border-t border-slate-700 pt-4">
        {/* Like Button */}
        <button
          onClick={handleLike}
          disabled={loading}
          className={`flex items-center gap-2 hover:text-blue-400 transition-colors ${
            isLiked ? 'text-blue-400' : ''
          }`}
        >
          {isLiked ? '❤️' : '🤍'}
          <span className="text-sm">{likeCount || ''}</span>
        </button>

        {/* Comment Button */}
        <Link
          href={`/posts/${id}`}
          className="flex items-center gap-2 hover:text-blue-400 transition-colors"
        >
          💬
          <span className="text-sm">{commentCount || ''}</span>
        </Link>

        {/* Retweet Button */}
        <button
          onClick={handleRetweet}
          disabled={loading}
          className={`flex items-center gap-2 hover:text-green-400 transition-colors ${
            isRetweeted ? 'text-green-400' : ''
          }`}
        >
          🔄
          <span className="text-sm">{retweetCount || ''}</span>
        </button>

        {/* Share Button */}
        <button
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                `${window.location.origin}/posts/${id}`
              )
              alert('Link copied!')
            } catch {
              alert('Failed to copy link')
            }
          }}
          className="flex items-center gap-2 hover:text-blue-400 transition-colors ml-auto"
        >
          📤
        </button>
      </div>
    </div>
  )
}
