'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  username: string
  role?: string | null
  createdAt: string
}

export default function AdminRolesPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchUsername, setSearchUsername] = useState('')
  const [updating, setUpdating] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [searching, setSearching] = useState(false)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/users/profile')
      if (!response.ok) {
        router.push('/signin')
        return
      }

      const data = await response.json()

      // Check if user is admin
      if (data.role !== 'SUPER_ADMIN' && data.role !== 'ADMIN') {
        router.push('/feed')
        return
      }

      setLoading(false)
    } catch (err) {
      router.push('/signin')
    }
  }

  const debouncedFetchUser = useCallback(
    (username: string) => {
      if (!username.trim()) {
        setUsers([])
        setMessage('')
        return
      }

      const currentRequestId = ++requestIdRef.current

      setSearching(true)
      fetch(`/api/users/${encodeURIComponent(username)}`)
        .then((response) => {
          // Only update state if this is still the latest request
          if (currentRequestId !== requestIdRef.current) return

          if (response.ok) {
            return response.json().then((user) => {
              if (currentRequestId === requestIdRef.current) {
                setUsers([user])
                setMessage('')
              }
            })
          } else {
            if (currentRequestId === requestIdRef.current) {
              setUsers([])
              setMessage('User not found')
            }
          }
        })
        .catch(() => {
          if (currentRequestId === requestIdRef.current) {
            setMessage('Failed to search user')
          }
        })
        .finally(() => {
          if (currentRequestId === requestIdRef.current) {
            setSearching(false)
          }
        })
    },
    []
  )

  const handleSearch = (username: string) => {
    setSearchUsername(username)
    setMessage('')

    // Clear existing timeout
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timeout for debounced search
    debounceTimerRef.current = setTimeout(() => {
      debouncedFetchUser(username)
    }, 300)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const handleRoleChange = async (userId: string, newRole: string | null) => {
    setUpdating(userId)
    setMessage('')

    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers(users.map(u => (u.id === userId ? updatedUser : u)))
        setMessage('Role updated successfully')
      } else {
        const error = await response.json()
        setMessage(error.error || 'Failed to update role')
      }
    } catch (error) {
      setMessage('Failed to update role')
    }

    setUpdating(null)
  }

  if (loading) {
    return (
      <div className="py-8 px-4">
        <div className="text-center text-slate-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Back to Admin Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">👑 Admin Roles</h1>
          <p className="text-slate-400">Manage admin role assignments</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mb-6 px-4 py-3 rounded ${
              message.includes('successfully')
                ? 'bg-green-500/20 border border-green-500/50 text-green-200'
                : 'bg-red-500/20 border border-red-500/50 text-red-200'
            }`}
          >
            {message}
          </div>
        )}

        {/* Search */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            Search User by Username
          </label>
          <input
            type="text"
            value={searchUsername}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Enter username..."
            disabled={searching}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {searching && <p className="text-xs text-slate-400 mt-2">Searching...</p>}
        </div>

        {/* Users List */}
        {users.length > 0 && (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-slate-800 border border-slate-700 rounded-lg p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{user.username}</h3>
                    <p className="text-slate-400 text-sm">
                      ID: {user.id}
                    </p>
                    <p className="text-slate-400 text-sm">
                      Joined: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm mb-2">Current Role:</p>
                    <p className="text-amber-400 font-semibold">
                      {user.role || 'Regular User'}
                    </p>
                  </div>
                </div>

                {/* Role Selection */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleRoleChange(user.id, null)}
                    disabled={updating === user.id}
                    className={`px-4 py-2 rounded transition-colors ${
                      user.role == null
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    } disabled:opacity-50`}
                  >
                    {updating === user.id ? 'Updating...' : 'Remove Role'}
                  </button>
                  <button
                    onClick={() => handleRoleChange(user.id, 'ADMIN')}
                    disabled={updating === user.id}
                    className={`px-4 py-2 rounded transition-colors ${
                      user.role === 'ADMIN'
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    } disabled:opacity-50`}
                  >
                    {updating === user.id ? 'Updating...' : 'Make Admin'}
                  </button>
                  <button
                    onClick={() => handleRoleChange(user.id, 'SUPER_ADMIN')}
                    disabled={updating === user.id}
                    className={`px-4 py-2 rounded transition-colors ${
                      user.role === 'SUPER_ADMIN'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    } disabled:opacity-50`}
                  >
                    {updating === user.id ? 'Updating...' : 'Make Super Admin'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {searchUsername && users.length === 0 && !searching && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
            <p className="text-slate-400">No users found</p>
          </div>
        )}
      </div>
    </div>
  )
}
