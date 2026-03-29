'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface UserData {
  id: string
  username: string
  role?: string | null
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/users/profile')
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
    setLoading(false)
  }

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST' })
      if (response.ok) {
        router.push('/signin')
      } else {
        console.error('Logout failed with status:', response.status)
        router.push('/signin') // Still redirect even if logout fails
      }
    } catch (error) {
      console.error('Logout failed:', error)
      router.push('/signin') // Still redirect on error
    }
  }

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN'

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation Bar */}
      <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/feed" className="text-2xl font-bold text-white hover:text-slate-300">
            🌑 DarkSphere
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/feed"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Feed
            </Link>
            <Link
              href="/profile"
              className="text-slate-300 hover:text-white transition-colors"
            >
              Profile
            </Link>

            {/* Admin Dashboard Link - Only show if admin */}
            {!loading && isAdmin && (
              <Link
                href="/admin"
                className="text-amber-400 hover:text-amber-300 transition-colors font-semibold"
              >
                ⚙️ Admin Dashboard
              </Link>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  )
}
