'use client'

import { useState } from 'react'

interface JokeCardProps {
  id: string
  content: string
  author?: {
    id: string
    name: string | null
  } | null
  score: number
  voteCount: number
  onVote: (jokeId: string, value: number) => Promise<void>
}

export default function JokeCard({
  id,
  content,
  author,
  score,
  voteCount,
  onVote,
}: JokeCardProps) {
  const [isVoting, setIsVoting] = useState(false)
  const [currentVote, setCurrentVote] = useState<number | null>(null)

  const handleVote = async (value: number) => {
    if (isVoting) return

    setIsVoting(true)
    try {
      // Toggle if clicking same vote
      const newValue = currentVote === value ? 0 : value
      await onVote(id, newValue)
      setCurrentVote(newValue === 0 ? null : value)
    } catch (error) {
      console.error('Vote failed:', error)
    } finally {
      setIsVoting(false)
    }
  }

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-4 animate-fade-in hover:border-slate-600 transition-colors">
      {/* Joke Content */}
      <p className="text-lg text-white mb-3 leading-relaxed">{content}</p>

      {/* Author */}
      {author?.name && (
        <p className="text-sm text-slate-400 mb-3">
          — {author.name}
        </p>
      )}

      {/* Vote Section */}
      <div className="flex items-center gap-4">
        {/* Upvote Button */}
        <button
          onClick={() => handleVote(1)}
          disabled={isVoting}
          className={`flex items-center gap-2 px-3 py-2 rounded transition-all ${
            currentVote === 1
              ? 'bg-green-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          } disabled:opacity-50`}
        >
          <span>👍</span>
          <span className="text-sm font-semibold">
            {score > 0 ? score : 0}
          </span>
        </button>

        {/* Downvote Button */}
        <button
          onClick={() => handleVote(-1)}
          disabled={isVoting}
          className={`flex items-center gap-2 px-3 py-2 rounded transition-all ${
            currentVote === -1
              ? 'bg-red-600 text-white'
              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
          } disabled:opacity-50`}
        >
          <span>👎</span>
          <span className="text-sm">
            {voteCount > 0 ? voteCount : ''}
          </span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => {
            navigator.share?.({
              text: content,
              title: 'Check out this joke!',
            })
          }}
          className="ml-auto px-3 py-2 rounded bg-slate-700 text-slate-300 hover:bg-slate-600 transition-all"
        >
          <span>📤</span>
        </button>
      </div>
    </div>
  )
}
