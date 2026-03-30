'use client'

import { useState } from 'react'

interface EditProfileFormProps {
  initialBio?: string | null
  initialAvatarUrl?: string | null
  initialUsername?: string
  hasPassword?: boolean
  onSuccess?: () => void
}

export default function EditProfileForm({
  initialBio = '',
  initialAvatarUrl = '',
  initialUsername = '',
  hasPassword = false,
  onSuccess,
}: EditProfileFormProps) {
  const [bio, setBio] = useState(initialBio || '')
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || '')
  const [username, setUsername] = useState(initialUsername || '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const trimmedBio = bio.trim()

    if (trimmedBio.length > 500) {
      setError('Bio must be 500 characters or less')
      setLoading(false)
      return
    }

    try {
      const payload: any = {
        bio: trimmedBio,
        avatarUrl: avatarUrl.trim(),
      }

      const currentTrimmedUsername = username.trim()
      if (currentTrimmedUsername !== initialUsername.trim()) {
        payload.username = currentTrimmedUsername
      }

      if (newPassword) {
        if (newPassword.length < 6) {
          setError('New password must be at least 6 characters')
          setLoading(false)
          return
        }
        if (hasPassword && !currentPassword) {
          setError('Current password is required to change password')
          setLoading(false)
          return
        }
        payload.newPassword = newPassword
        if (hasPassword) payload.currentPassword = currentPassword
      }

      const response = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to update profile')
        setLoading(false)
        return
      }

      setSuccess('Profile updated successfully!')
      setLoading(false)
      onSuccess?.()
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-2 rounded text-sm">
          {success}
        </div>
      )}

      {/* Username Field */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
          Username
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="your_username"
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          disabled={loading}
        />
      </div>

      {hasPassword ? (
        <div className="space-y-4 border-t border-slate-700 pt-4 mt-4">
          <h3 className="text-lg font-medium text-white">Change Password</h3>
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-300 mb-2">
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="changeNewPassword" className="block text-sm font-medium text-slate-300 mb-2">
              New Password
            </label>
            <input
              id="changeNewPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-4 border-t border-slate-700 pt-4 mt-4">
          <h3 className="text-lg font-medium text-white">Set Password</h3>
          <p className="text-sm text-slate-400 mb-2">You signed in with Google. Set a password to also allow email login.</p>
          <div>
            <label htmlFor="setNewPassword" className="block text-sm font-medium text-slate-300 mb-2">
              New Password
            </label>
            <input
              id="setNewPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            />
          </div>
        </div>
      )}

      {/* Bio Field */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-slate-300 mb-2">
          Bio
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          maxLength={500}
          rows={4}
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none disabled:opacity-50"
          disabled={loading}
        />
        <p className="text-xs text-slate-400 mt-1">
          {bio.length} / 500 characters
        </p>
      </div>

      {/* Avatar URL Field */}
      <div>
        <label htmlFor="avatar" className="block text-sm font-medium text-slate-300 mb-2">
          Avatar URL
        </label>
        <input
          id="avatar"
          type="url"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://example.com/avatar.jpg"
          className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
          disabled={loading}
        />
        <p className="text-xs text-slate-400 mt-1">
          Paste the URL of your profile image
        </p>
      </div>

      {/* Preview */}
      {avatarUrl && (
        <div className="border border-slate-700 rounded p-4">
          <p className="text-xs text-slate-400 mb-2">Preview</p>
          <img
            src={avatarUrl}
            alt="Avatar preview"
            className="w-16 h-16 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none'
            }}
          />
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold rounded transition-colors"
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  )
}
