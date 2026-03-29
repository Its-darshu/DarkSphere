'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SigninPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!username || !password) {
      setError('Username and password are required')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Sign in failed')
        setLoading(false)
        return
      }

      // Fetch user profile to check role and redirect accordingly
      const profileResponse = await fetch('/api/users/profile')
      if (profileResponse.ok) {
        const userProfile = await profileResponse.json()

        // Redirect based on role
        if (userProfile.role === 'SUPER_ADMIN' || userProfile.role === 'ADMIN') {
          setLoading(false)
          router.push('/admin')
        } else {
          setLoading(false)
          router.push('/feed')
        }
      } else {
        // If profile fetch fails, default to feed
        setLoading(false)
        router.push('/feed')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🌑 DarkSphere</h1>
          <p className="text-slate-400">Welcome back</p>
        </div>

        {/* Signin Form */}
        <form
          onSubmit={handleSignin}
          className="bg-slate-800 border border-slate-700 rounded-lg p-6 space-y-4"
        >
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded text-sm">
              {error}
            </div>
          )}

          {/* Username Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* Signin Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-2 rounded transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Signup Link */}
        <div className="text-center mt-4">
          <p className="text-slate-400">
            Don't have an account?{' '}
            <Link href="/signup" className="text-blue-400 hover:text-blue-300">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
