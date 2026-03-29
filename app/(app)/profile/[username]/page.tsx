'use client'

import { useState, useEffect } from 'react'
import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import FollowButton from '@/components/FollowButton'

interface UserProfile {
  id: string
  username: string
  bio?: string
  avatarUrl?: string
  createdAt: string
  _count?: {
    followers: number
    following: number
    posts: number
  }
  isFollowing?: boolean
}

interface Post {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    username: string
  }
  _count?: {
    likes: number
    comments: number
    retweets: number
  }
}

export default function ProfilePage() {
  const params = useParams()
  const username = typeof params.username === 'string' ? params.username : undefined

  if (!username) {
    notFound()
  }

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isOwnProfile, setIsOwnProfile] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [username])

  const fetchProfile = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/users/${encodeURIComponent(username)}`)
      if (!response.ok) {
        setError('User not found')
        setLoading(false)
        return
      }

      const data = await response.json()
      setProfile(data)
      setIsFollowing(data.isFollowing || false)
      setIsOwnProfile(data.isOwnProfile || false)

      // Non-blocking fetch for posts
      fetchPosts(data.username)
    } catch (err) {
      setError('Failed to load profile')
    }
    setLoading(false)
  }

  const fetchPosts = async (profileUsername: string) => {
    try {
      const response = await fetch(
        `/api/users/${encodeURIComponent(profileUsername)}/posts`
      )
      if (response.ok) {
        const postsData = await response.json()
        setPosts(postsData.posts || [])
      }
    } catch (err) {
      console.error('Failed to fetch posts:', err)
    }
  }

  const handleFollowChange = (newState: boolean) => {
    setIsFollowing(newState)
    if (profile) {
      setProfile({
        ...profile,
        _count: {
          ...(profile._count || { followers: 0, following: 0, posts: 0 }),
          followers:
            (profile._count?.followers || 0) + (newState ? 1 : -1),
        },
      })
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

  if (error || !profile) {
    return (
      <div className="py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded mb-4">
            {error || 'Profile not found'}
          </div>
          <Link href="/feed" className="text-blue-400 hover:text-blue-300">
            ← Back to feed
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link href="/feed" className="text-blue-400 hover:text-blue-300 mb-6 inline-block">
          ← Back
        </Link>

        {/* Profile Header */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              {profile.avatarUrl && (
                <img
                  src={profile.avatarUrl}
                  alt={profile.username}
                  className="w-16 h-16 rounded-full"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-white">
                  @{profile.username}
                </h1>
                {profile.bio && (
                  <p className="text-slate-300 mt-2">{profile.bio}</p>
                )}
                <p className="text-xs text-slate-400 mt-2">
                  Joined {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {!isOwnProfile && (
              <FollowButton
                username={profile.username}
                isFollowing={isFollowing}
                onFollowChange={handleFollowChange}
              />
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-6 border-t border-slate-700 pt-4">
            <div>
              <p className="font-semibold text-white">
                {profile._count?.posts || 0}
              </p>
              <p className="text-sm text-slate-400">Posts</p>
            </div>
            <Link
              href={`/profile/${encodeURIComponent(profile.username)}/followers`}
              className="hover:opacity-70"
            >
              <p className="font-semibold text-white">
                {profile._count?.followers || 0}
              </p>
              <p className="text-sm text-slate-400">Followers</p>
            </Link>
            <Link
              href={`/profile/${encodeURIComponent(profile.username)}/following`}
              className="hover:opacity-70"
            >
              <p className="font-semibold text-white">
                {profile._count?.following || 0}
              </p>
              <p className="text-sm text-slate-400">Following</p>
            </Link>
          </div>
        </div>

        {/* Posts */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Posts</h2>

          {posts.length === 0 ? (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
              <p className="text-slate-400">No posts yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:bg-slate-700/50 transition-colors block"
                >
                  <p className="text-white break-words">{post.content}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-4 text-slate-400 text-sm mt-2">
                    <span>❤️ {post._count?.likes || 0}</span>
                    <span>💬 {post._count?.comments || 0}</span>
                    <span>🔄 {post._count?.retweets || 0}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
