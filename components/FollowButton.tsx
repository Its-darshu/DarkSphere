'use client'

import { useState } from 'react'

interface FollowButtonProps {
  username: string
  isFollowing: boolean
  onFollowChange?: (isFollowing: boolean) => void
}

export default function FollowButton({
  username,
  isFollowing: initialIsFollowing,
  onFollowChange,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleToggleFollow = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `/api/users/${encodeURIComponent(username)}/follow`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }
      )

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to toggle follow')
        setLoading(false)
        return
      }

      const data = await response.json()
      const newFollowingState = data.following

      setIsFollowing(newFollowingState)
      setLoading(false)
      onFollowChange?.(newFollowingState)
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="flex flex-col items-end gap-2">
        <button
          onClick={handleToggleFollow}
          disabled={loading}
          className={`px-4 py-2 rounded font-semibold transition-colors ${
            isFollowing
              ? 'bg-slate-700 hover:bg-slate-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          } disabled:opacity-50`}
        >
          {loading
            ? 'Loading...'
            : isFollowing
              ? 'Following'
              : 'Follow'}
        </button>
        <span className="text-xs text-red-400">{error}</span>
      </div>
    )
  }

  return (
    <button
      onClick={handleToggleFollow}
      disabled={loading}
      className={`px-4 py-2 rounded font-semibold transition-colors ${
        isFollowing
          ? 'bg-slate-700 hover:bg-slate-600 text-white'
          : 'bg-blue-600 hover:bg-blue-700 text-white'
      } disabled:opacity-50`}
    >
      {loading
        ? 'Loading...'
        : isFollowing
          ? 'Following'
          : 'Follow'}
    </button>
  )
}
