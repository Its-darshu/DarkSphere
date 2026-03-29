'use client'

import { useState } from 'react'

interface CommentFormProps {
  postId: string
  parentCommentId?: string
  onCommentCreated: () => void
  isReply?: boolean
  onCancel?: () => void
}

export default function CommentForm({
  postId,
  parentCommentId,
  onCommentCreated,
  isReply = false,
  onCancel,
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmed = content.trim()
    if (!trimmed) {
      setError('Comment cannot be empty')
      return
    }

    if (trimmed.length > 500) {
      setError('Comment must be 500 characters or less')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: trimmed,
          parentCommentId: parentCommentId || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to post comment')
        setLoading(false)
        return
      }

      setContent('')
      setLoading(false)
      onCommentCreated()
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  if (isReply) {
    return (
      <form onSubmit={handleSubmit} className="bg-slate-800 rounded p-4 space-y-3">
        {error && (
          <div className="text-sm text-red-400 bg-red-500/10 p-2 rounded">
            {error}
          </div>
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write a reply..."
          className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          rows={3}
          disabled={loading}
        />

        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400">
            {content.length}/500
          </span>
          <div className="flex gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-1 rounded text-slate-300 hover:bg-slate-700 disabled:opacity-50"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded"
            >
              {loading ? 'Posting...' : 'Reply'}
            </button>
          </div>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-4 space-y-3">
      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 p-2 rounded">
          {error}
        </div>
      )}

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What do you think?"
        className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
        rows={3}
        disabled={loading}
      />

      <div className="flex justify-between items-center">
        <span className="text-xs text-slate-400">
          {content.length}/500
        </span>
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold rounded transition-colors"
        >
          {loading ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  )
}
