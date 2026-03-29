'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface UserProfile {
  id: string
  username: string
  bio?: string | null
  avatarUrl?: string | null
  createdAt: string
  _count: {
    followers: number
    following: number
    posts: number
  }
}

interface Post {
  id: string
  content: string
  imageUrl?: string | null
  createdAt: string
  _count: {
    likes: number
    comments: number
    retweets: number
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/users/profile')
      if (!response.ok) {
        setError('Failed to load profile')
        setLoading(false)
        return
      }

      const data = await response.json()
      setProfile(data)
      setLoading(false)

      // Non-blocking fetch for posts
      fetchPosts(data.username)
    } catch (err) {
      setError('An error occurred')
      setLoading(false)
    }
  }

  const fetchPosts = async (profileUsername: string) => {
    try {
      const postsResponse = await fetch(
        `/api/users/${encodeURIComponent(profileUsername)}/posts`
      )
      if (postsResponse.ok) {
        const postsData = await postsResponse.json()
        setPosts(postsData.posts || [])
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err)
    }
  }

  if (loading) {
    return (
      <div className="py-8 px-4">
        <div className="text-center">
          <p className="text-slate-400">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="py-8 px-4">
        <div className="text-center">
          <p className="text-red-400">Failed to load profile</p>
        </div>
      </div>
    )
  }

  const joinedDate = new Date(profile.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Profile Header */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              {profile.avatarUrl && (
                <img
                  src={profile.avatarUrl}
                  alt={profile.username}
                  className="w-16 h-16 rounded-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-white">
                  @{profile.username}
                </h1>
                {profile.bio && (
                  <p className="text-slate-300 mt-2">{profile.bio}</p>
                )}
              </div>
            </div>

            <Link
              href="/profile/edit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded transition-colors"
            >
              Edit Profile
            </Link>
          </div>

          <p className="text-sm text-slate-400 mb-4">
            Joined {joinedDate}
          </p>

          {/* Stats */}
          <div className="flex gap-6">
            <div>
              <p className="text-2xl font-bold text-white">
                {profile._count.posts}
              </p>
              <p className="text-sm text-slate-400">Posts</p>
            </div>
            <Link
              href={`/profile/${encodeURIComponent(profile.username)}/followers`}
              className="hover:opacity-70"
            >
              <p className="text-2xl font-bold text-white">
                {profile._count.followers}
              </p>
              <p className="text-sm text-slate-400">Followers</p>
            </Link>
            <Link
              href={`/profile/${encodeURIComponent(profile.username)}/following`}
              className="hover:opacity-70"
            >
              <p className="text-2xl font-bold text-white">
                {profile._count.following}
              </p>
              <p className="text-sm text-slate-400">Following</p>
            </Link>
          </div>
        </div>

        {/* Posts Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Your Posts</h2>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {posts.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
              <p className="text-slate-400">No posts yet. Create your first post!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block bg-slate-800 border border-slate-700 rounded-lg p-4 hover:bg-slate-700/50 transition-colors"
                >
                  <p className="text-white mb-2">{post.content}</p>
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post image"
                      className="w-full rounded mb-2 max-h-96 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                      }}
                    />
                  )}
                  <div className="flex gap-4 text-sm text-slate-400">
                    <span>{post._count.likes} likes</span>
                    <span>{post._count.comments} comments</span>
                    <span>{post._count.retweets} retweets</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
