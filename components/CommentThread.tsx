'use client'

import { useState, useEffect } from 'react'
import CommentCard from './CommentCard'

interface Comment {
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
  replyCount: number
  parentCommentId?: string | null
}

interface CommentThreadProps {
  postId: string
  currentUserId: string
  onCommentAdded?: () => void
}

export default function CommentThread({
  postId,
  currentUserId,
  onCommentAdded,
}: CommentThreadProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchComments()
  }, [postId])

  const fetchComments = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/posts/${postId}/comments?limit=50`)
      if (!response.ok) {
        setError('Failed to load comments')
        setLoading(false)
        return
      }

      const data = await response.json()
      if (data && Array.isArray(data.comments)) {
        setComments(data.comments)
      } else {
        setError('Invalid comments data')
      }
    } catch (err) {
      setError('An error occurred while loading comments')
    }
    setLoading(false)
  }

  const handleCommentDeleted = (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId))
  }

  const handleCommentAdded = () => {
    fetchComments()
    onCommentAdded?.()
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">Loading comments...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  if (comments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">No comments yet. Be the first to comment!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentCard
          key={comment.id}
          {...comment}
          isOwnComment={comment.author.id === currentUserId}
          postId={postId}
          onCommentDeleted={handleCommentDeleted}
          onReplyCreated={handleCommentAdded}
        />
      ))}
    </div>
  )
}
