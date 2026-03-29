'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import FollowButton from '@/components/FollowButton'

interface User {
  id: string
  username: string
  bio?: string
  avatarUrl?: string
  isFollowing?: boolean
}

export default function FollowingPage() {
  const params = useParams()
  const username = typeof params.username === 'string' ? params.username : undefined

  if (!username) {
    notFound()
  }

  const [following, setFollowing] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new controller
    abortControllerRef.current = new AbortController()
    fetchFollowing(abortControllerRef.current.signal)

    return () => {
      // Cleanup: abort the request on unmount or username change
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [username])

  const fetchFollowing = async (signal: AbortSignal) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(
        `/api/users/${encodeURIComponent(username)}/following?limit=50`,
        { signal }
      )

      if (!response.ok) {
        setError('Failed to load following')
        setLoading(false)
        return
      }

      const data = await response.json()
      setFollowing(data.following || [])
    } catch (err: any) {
      // Ignore abort errors
      if (err.name !== 'AbortError') {
        setError('An error occurred')
      }
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="py-8 px-4">
        <p className="text-slate-400">Loading following...</p>
      </div>
    )
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href={`/profile/${encodeURIComponent(username)}`} className="text-blue-400 hover:text-blue-300 mb-6 inline-block">
          ← Back to profile
        </Link>

        <h1 className="text-3xl font-bold text-white mb-6">
          Following @{username}
        </h1>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {following.length === 0 && !error ? (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-slate-400">Not following anyone yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {following.map((user) => (
              <div
                key={user.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-4 flex items-center justify-between"
              >
                <Link
                  href={`/profile/${encodeURIComponent(user.username)}`}
                  className="flex items-center gap-3 flex-1 hover:opacity-70"
                >
                  {user.avatarUrl && (
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="w-12 h-12 rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-white">@{user.username}</p>
                    {user.bio && (
                      <p className="text-sm text-slate-400">{user.bio}</p>
                    )}
                  </div>
                </Link>

                <FollowButton
                  username={user.username}
                  isFollowing={user.isFollowing || false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
