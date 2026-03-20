'use client'

import { useState } from 'react'

interface PostJokeFormProps {
  onSubmit: (content: string, authorName: string) => Promise<void>
}

export default function PostJokeForm({ onSubmit }: PostJokeFormProps) {
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      alert('Please write a joke!')
      return
    }

    setIsLoading(true)
    try {
      const trimmedContent = content.trim()
      const trimmedAuthor = authorName.trim()
      await onSubmit(trimmedContent, trimmedAuthor)
      setContent('')
      setAuthorName('')
    } catch (error) {
      console.error('Failed to post joke:', error)
      alert('Failed to post joke. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const charCount = content.length
  const maxChars = 500

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6 sticky top-0 z-10 animate-slide-down"
    >
      <h2 className="text-xl font-bold text-white mb-4">Share a Joke 😄</h2>

      {/* Joke Input */}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's a funny joke?"
        className="w-full bg-slate-700 text-white placeholder-slate-500 border border-slate-600 rounded px-4 py-3 mb-3 resize-none focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        rows={3}
        maxLength={maxChars}
      />

      {/* Character Count */}
      <p className={`text-sm mb-3 ${charCount > maxChars * 0.8 ? 'text-yellow-400' : 'text-slate-400'}`}>
        {charCount}/{maxChars}
      </p>

      {/* Author Input */}
      <input
        type="text"
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        placeholder="Your name (optional)"
        className="w-full bg-slate-700 text-white placeholder-slate-500 border border-slate-600 rounded px-4 py-2 mb-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        maxLength={50}
      />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !content.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded transition-all"
      >
        {isLoading ? 'Posting...' : 'Post Joke'}
      </button>
    </form>
  )
}
