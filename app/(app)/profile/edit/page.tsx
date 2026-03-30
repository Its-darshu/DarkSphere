'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import EditProfileForm from '@/components/EditProfileForm'

interface CurrentUser {
  id: string
  username: string
  bio?: string | null
  avatarUrl?: string | null
  hasPassword?: boolean
}

export default function EditProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/users/profile')
      if (!response.ok) {
        setLoading(false)
        return
      }

      const data = await response.json()
      setUser(data)
      setLoading(false)
    } catch (err) {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="py-8 px-4">
        <div className="text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="py-8 px-4">
        <div className="text-center">
          <p className="text-red-400">Failed to load profile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/profile" className="text-blue-400 hover:text-blue-300">
            ← Back to profile
          </Link>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h1 className="text-3xl font-bold text-white mb-6">Edit Profile</h1>

          <EditProfileForm
            initialBio={user.bio}
            initialAvatarUrl={user.avatarUrl}
            initialUsername={user.username}
            hasPassword={user.hasPassword}
            onSuccess={() => {
              router.push('/profile')
            }}
          />
        </div>
      </div>
    </div>
  )
}
