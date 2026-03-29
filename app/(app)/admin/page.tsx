'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface AdminUser {
  id: string
  username: string
  role?: string | null
}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/users/profile')
      if (!response.ok) {
        // Not logged in or error
        router.push('/signin')
        return
      }

      const data = await response.json()

      // Check if user is admin
      if (data.role !== 'SUPER_ADMIN' && data.role !== 'ADMIN') {
        // Not an admin, redirect to feed
        router.push('/feed')
        return
      }

      setUser(data)
      setLoading(false)
    } catch (err) {
      router.push('/signin')
    }
  }

  if (loading) {
    return (
      <div className="py-8 px-4">
        <div className="text-center text-slate-400">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-bold text-white">⚙️ Admin Dashboard</h1>
          </div>
          <p className="text-slate-400">Welcome back, {user.username}</p>
          {user.role === 'SUPER_ADMIN' && (
            <p className="text-amber-400 text-sm mt-2">Super Admin Access</p>
          )}
        </div>

        {/* Admin Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Management */}
          <Link
            href="/admin/users"
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <div className="text-3xl mb-3">👥</div>
            <h2 className="text-xl font-bold text-white mb-2">User Management</h2>
            <p className="text-slate-400 text-sm">Ban/unban users, assign roles</p>
          </Link>

          {/* Post Moderation */}
          <Link
            href="/admin/posts"
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <div className="text-3xl mb-3">📝</div>
            <h2 className="text-xl font-bold text-white mb-2">Post Moderation</h2>
            <p className="text-slate-400 text-sm">Review and delete posts</p>
          </Link>

          {/* Reports */}
          <Link
            href="/admin/reports"
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <div className="text-3xl mb-3">🚩</div>
            <h2 className="text-xl font-bold text-white mb-2">Reports</h2>
            <p className="text-slate-400 text-sm">View and resolve user reports</p>
          </Link>

          {/* Audit Logs */}
          <Link
            href="/admin/logs"
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <div className="text-3xl mb-3">📊</div>
            <h2 className="text-xl font-bold text-white mb-2">Audit Logs</h2>
            <p className="text-slate-400 text-sm">View admin action history</p>
          </Link>

          {/* Admin Roles */}
          <Link
            href="/admin/roles"
            className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:bg-slate-700/50 transition-colors cursor-pointer"
          >
            <div className="text-3xl mb-3">👑</div>
            <h2 className="text-xl font-bold text-white mb-2">Admin Roles</h2>
            <p className="text-slate-400 text-sm">Manage admin role assignments</p>
          </Link>
        </div>

        {/* Back to Feed */}
        <div className="mt-8">
          <Link href="/feed" className="text-blue-400 hover:text-blue-300">
            ← Back to Feed
          </Link>
        </div>
      </div>
    </div>
  )
}

