'use client'

import { useState } from 'react'
import Link from 'next/link'
import CommentForm from './CommentForm'

interface CommentCardProps {
  id: string
  content: string
  author: {
    id: string
    username: string
    avatarUrl?: string | null
  }
  createdAt: string
  likeCount: number
  replyCount: number
  isOwnComment: boolean
  postId: string
  isReply?: boolean
  onCommentDeleted: (id: string) => void
  onReplyCreated: () => void
}

export default function CommentCard({
  id,
  content,
  author,
  createdAt,
  likeCount,
  replyCount,
  isOwnComment,
  postId,
  isReply = false,
  onCommentDeleted,
  onReplyCreated,
}: CommentCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(content)
  const [isSaving, setIsSaving] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return date.toLocaleDateString()
  }

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onCommentDeleted(id)
      } else {
        alert('Failed to delete comment')
      }
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete comment')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleSaveEdit = async () => {
    const trimmed = editContent.trim()
    if (!trimmed || trimmed === content) {
      setIsEditing(false)
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/comments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmed }),
      })

      if (response.ok) {
        const updatedComment = await response.json()
        setEditContent(updatedComment.content || trimmed)
        setIsEditing(false)
        onReplyCreated() // Trigger refresh
      } else {
        alert('Failed to save edit')
      }
    } catch (error) {
      console.error('Save failed:', error)
      alert('Failed to save edit')
    } finally {
      setIsSaving(false)
    }
  }

  const containerClass = isReply ? 'ml-12 mt-2' : ''
  const bgClass = isReply ? 'bg-slate-800/50' : 'bg-slate-800'

  return (
    <div className={containerClass}>
      <div className={`${bgClass} rounded-lg p-4 border border-slate-700`}>
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {author.avatarUrl && (
              <img
                src={author.avatarUrl}
                alt={author.username}
                className="w-8 h-8 rounded-full"
              />
            )}
            <div>
              <Link
                href={`/profile/${author.username}`}
                className="font-semibold text-white hover:underline"
              >
                @{author.username}
              </Link>
              <p className="text-xs text-slate-400">{formatDate(createdAt)}</p>
            </div>
          </div>

          {isOwnComment && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-slate-400 hover:text-blue-400"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-xs text-slate-400 hover:text-red-400 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>

        {/* Comment Content */}
        {isEditing ? (
          <div className="space-y-2 mb-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white"
              rows={3}
              aria-label="Edit comment content"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setIsEditing(false)
                  setEditContent(content)
                }}
                className="px-3 py-1 text-sm text-slate-300 hover:bg-slate-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-slate-300 mb-3 break-words">{content}</p>
        )}

        {/* Comment Stats & Actions */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          {likeCount > 0 && <span>{likeCount} like{likeCount !== 1 ? 's' : ''}</span>}
          {replyCount > 0 && <span>{replyCount} repl{replyCount !== 1 ? 'ies' : 'y'}</span>}
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="hover:text-blue-400"
          >
            {showReplyForm ? 'Cancel Reply' : 'Reply'}
          </button>
        </div>
      </div>

      {/* Reply Form */}
      {showReplyForm && (
        <div className="mt-3 ml-12">
          <CommentForm
            postId={postId}
            parentCommentId={id}
            onCommentCreated={() => {
              setShowReplyForm(false)
              onReplyCreated()
            }}
            isReply
            onCancel={() => setShowReplyForm(false)}
          />
        </div>
      )}
    </div>
  )
}
