'use client'

import { useState } from 'react'

interface CreatePostFormProps {
  onPostCreated: () => void
}

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const trimmedContent = content.trim()

    if (!trimmedContent) {
      setError('Post cannot be empty')
      return
    }

    if (trimmedContent.length > 500) {
      setError('Post must be 500 characters or less')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: trimmedContent }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to create post')
        setLoading(false)
        return
      }

      setContent('')
      setLoading(false)
      onPostCreated()
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6"
    >
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded text-sm mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          maxLength={500}
          rows={4}
          className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
          disabled={loading}
        />
        <div className="mt-2 text-sm text-slate-400">
          {content.length} / 500 characters
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setContent('')}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors disabled:opacity-50"
          disabled={loading}
        >
          Clear
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold rounded transition-colors"
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </div>
    </form>
  )
}
