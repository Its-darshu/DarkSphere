'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Edit, 
  Save, 
  X, 
  ExternalLink,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  Globe,
  Heart,
  MessageCircle,
  User
} from 'lucide-react'

interface User {
  id: string
  username: string
  email: string
  fullName: string
  type: 'admin' | 'user'
  createdAt: Date
  bio?: string
  location?: string
  website?: string
  socialMedia?: {
    github?: string
    linkedin?: string
    twitter?: string
    instagram?: string
  }
}

interface Post {
  id: string
  title: string
  content: string
  user?: {
    username: string
    fullName: string
  }
  authorId: string
  createdAt: string
  likesCount: number
  commentsCount: number
}

export default function ProfilePage() {
  const router = useRouter()
  const params = useParams()
  const username = params?.username as string
  
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [profileUser, setProfileUser] = useState<User | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set())
  const [likingPost, setLikingPost] = useState<string | null>(null)
  
  const [editForm, setEditForm] = useState({
    fullName: '',
    bio: '',
    location: '',
    website: '',
    github: '',
    linkedin: '',
    twitter: '',
    instagram: ''
  })

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    if (!userData) {
      router.push('/')
      return
    }
    
    setCurrentUser(JSON.parse(userData))
    loadProfileUser()
  }, [username, router])
  
  useEffect(() => {
    if (profileUser) {
      loadUserPosts()
    }
  }, [profileUser])

  const loadProfileUser = async () => {
    try {
      console.log('Loading profile for username:', username)
      // Try to find user by username using the users API
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (response.ok && data.users) {
        const user = data.users.find((u: any) => u.username === username)
        
        if (user) {
          const formattedUser: User = {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.full_name,
            type: user.user_type,
            createdAt: new Date(user.created_at),
            bio: user.bio,
            location: user.location,
            website: user.website,
            socialMedia: {
              github: user.social_github,
              linkedin: user.social_linkedin,
              twitter: user.social_twitter,
              instagram: user.social_instagram
            }
          }
          
          setProfileUser(formattedUser)
          setEditForm({
            fullName: formattedUser.fullName || '',
            bio: formattedUser.bio || '',
            location: formattedUser.location || '',
            website: formattedUser.website || '',
            github: formattedUser.socialMedia?.github || '',
            linkedin: formattedUser.socialMedia?.linkedin || '',
            twitter: formattedUser.socialMedia?.twitter || '',
            instagram: formattedUser.socialMedia?.instagram || ''
          })
          console.log('Profile user loaded:', formattedUser.username)
        } else {
          console.log('User not found:', username)
        }
      }
    } catch (error) {
      console.error('Error loading profile user:', error)
    }
    
    setLoading(false)
  }

  const loadUserPosts = async () => {
    if (!profileUser) return
    
    try {
      console.log('Loading posts for user:', profileUser.username)
      const response = await fetch('/api/posts')
      const data = await response.json()
      
      if (response.ok && data.posts) {
        // Filter posts by the profile user's ID
        const userPosts = data.posts.filter((post: any) => post.author_id === profileUser.id)
        
        const formattedPosts: Post[] = userPosts.map((post: any) => ({
          id: post.id,
          title: post.title || '',
          content: post.content,
          user: {
            username: profileUser.username,
            fullName: profileUser.fullName
          },
          authorId: post.author_id,
          createdAt: post.created_at,
          likesCount: parseInt(post.likes_count) || 0,
          commentsCount: parseInt(post.comments_count) || 0
        }))
        
        setPosts(formattedPosts)
        console.log('User posts loaded:', formattedPosts.length)
      }
    } catch (error) {
      console.error('Error loading user posts:', error)
    }
  }

  const handleLikePost = async (postId: string) => {
    if (!currentUser || likingPost === postId) return
    
    setLikingPost(postId)
    
    try {
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          userId: currentUser.id,
        }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Update the posts state
        setPosts(prevPosts => 
          prevPosts.map(post => 
            post.id === postId 
              ? { ...post, likesCount: data.likesCount }
              : post
          )
        )
        
        // Update liked posts set
        setLikedPosts(prev => {
          const newSet = new Set(prev)
          if (data.liked) {
            newSet.add(postId)
          } else {
            newSet.delete(postId)
          }
          return newSet
        })
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setLikingPost(null)
    }
  }

  const saveProfile = () => {
    if (!profileUser || !currentUser) return
    
    // Only allow users to edit their own profile
    if (currentUser.id !== profileUser.id) return
    
    const updatedUser: User = {
      ...profileUser,
      fullName: editForm.fullName,
      bio: editForm.bio,
      location: editForm.location,
      website: editForm.website,
      socialMedia: {
        github: editForm.github,
        linkedin: editForm.linkedin,
        twitter: editForm.twitter,
        instagram: editForm.instagram
      }
    }
    
    setProfileUser(updatedUser)
    setCurrentUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setIsEditing(false)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'github':
        return <Github className="w-4 h-4 flex-shrink-0" />
      case 'linkedin':
        return <Linkedin className="w-4 h-4 flex-shrink-0" />
      case 'twitter':
        return <Twitter className="w-4 h-4 flex-shrink-0" />
      case 'instagram':
        return <Instagram className="w-4 h-4 flex-shrink-0" />
      default:
        return <ExternalLink className="w-4 h-4 flex-shrink-0" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading profile...</div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-xl lg:text-2xl font-bold text-white mb-4">User Not Found</h1>
          <p className="text-gray-400 mb-6">The user @{username} doesn't exist.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-white text-black hover:bg-gray-200 px-6 py-2 transition-colors w-full sm:w-auto"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === profileUser.id

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b border-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-white">{profileUser.fullName}</h1>
                <p className="text-sm text-gray-400">@{profileUser.username}</p>
              </div>
            </div>
            
            {isOwnProfile && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-white text-black hover:bg-gray-200 px-4 lg:px-6 py-2 transition-colors text-sm lg:text-base"
              >
                <Edit className="w-4 h-4 inline mr-2" />
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Edit</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-black border border-white p-4 lg:p-6 space-y-4 lg:space-y-6">
              {/* Avatar and Basic Info */}
              <div className="text-center">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white flex items-center justify-center mx-auto mb-4">
                  <span className="text-black font-black text-lg lg:text-2xl">
                    {profileUser.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
                
                <h2 className="text-lg lg:text-xl font-bold text-white mb-1">{profileUser.fullName}</h2>
                <p className="text-gray-400 mb-2">@{profileUser.username}</p>
                
                {profileUser.type === 'admin' && (
                  <span className="inline-block mt-2 text-xs bg-gray-800 text-white px-2 py-1">
                    Admin
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              {isOwnProfile ? (
                <div className="space-y-3">
                  {isEditing ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={saveProfile}
                        className="flex-1 bg-white text-black hover:bg-gray-200 py-2 px-3 lg:px-4 flex items-center justify-center space-x-2 transition-colors text-sm"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 lg:px-4 flex items-center justify-center space-x-2 transition-colors text-sm"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 lg:px-4 flex items-center space-x-2 justify-center transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>
              ) : null}

              {/* Bio Section */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Bio</h3>
                {isEditing ? (
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="w-full px-3 py-2 bg-black border border-gray-400 text-white placeholder-gray-400 resize-none focus:outline-none focus:border-white text-sm"
                  />
                ) : (
                  <p className="text-gray-400 text-sm">
                    {profileUser.bio || 'No bio available.'}
                  </p>
                )}
              </div>

              {/* Details */}
              <div className="space-y-3">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                        className="w-full px-2 py-1 bg-black border border-gray-400 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">Location</label>
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                        placeholder="Where are you based?"
                        className="w-full px-2 py-1 bg-black border border-gray-400 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">Website</label>
                      <input
                        type="url"
                        value={editForm.website}
                        onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                        placeholder="https://yourwebsite.com"
                        className="w-full px-2 py-1 bg-black border border-gray-400 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white"
                      />
                    </div>

                    {/* Social Media Links */}
                    <div>
                      <label className="block text-xs font-medium text-white mb-1">GitHub</label>
                      <input
                        type="text"
                        value={editForm.github}
                        onChange={(e) => setEditForm({...editForm, github: e.target.value})}
                        placeholder="github.com/username"
                        className="w-full px-2 py-1 bg-black border border-gray-400 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white mb-1">LinkedIn</label>
                      <input
                        type="text"
                        value={editForm.linkedin}
                        onChange={(e) => setEditForm({...editForm, linkedin: e.target.value})}
                        placeholder="linkedin.com/in/username"
                        className="w-full px-2 py-1 bg-black border border-gray-400 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-white mb-1">Twitter</label>
                      <input
                        type="text"
                        value={editForm.twitter}
                        onChange={(e) => setEditForm({...editForm, twitter: e.target.value})}
                        placeholder="twitter.com/username"
                        className="w-full px-2 py-1 bg-black border border-gray-400 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-white"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {profileUser.location && (
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{profileUser.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span>Joined {new Date(profileUser.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Social Links */}
                    {(profileUser.website || profileUser.socialMedia) && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-white">Links</h4>
                        <div className="bg-black border border-gray-800 p-3 space-y-2">
                          {profileUser.website && (
                            <a
                              href={profileUser.website.startsWith('http') ? profileUser.website : `https://${profileUser.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors break-all"
                            >
                              <Globe className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{profileUser.website}</span>
                            </a>
                          )}
                          
                          {Object.entries(profileUser.socialMedia || {}).map(([platform, url]) => (
                            url && (
                              <a
                                key={platform}
                                href={url.startsWith('http') ? url : `https://${url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition-colors"
                              >
                                {getSocialIcon(platform)}
                                <span className="capitalize">{platform}</span>
                              </a>
                            )
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Posts Section */}
          <div className="lg:col-span-3 space-y-4 order-1 lg:order-2">
            <div className="bg-black border border-white p-4 lg:p-6">
              <h2 className="text-lg lg:text-xl font-bold text-white mb-4">Posts by {profileUser.username}</h2>
              
              {posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-gray-900 border border-gray-700 p-3 lg:p-4 hover:border-gray-600 transition-colors"
                    >
                      <div className="flex items-start space-x-2 lg:space-x-3 mb-3">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white text-black flex items-center justify-center font-bold text-sm lg:text-base">
                          {post.user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-sm">
                            <span className="font-semibold text-white truncate">
                              @{post.user?.username}
                            </span>
                            <span className="text-gray-400 text-xs">
                              {formatTime(post.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        {post.title && (
                          <h3 className="font-semibold text-white mb-2 text-sm lg:text-base">
                            {post.title}
                          </h3>
                        )}
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {post.content}
                        </p>
                      </div>

                      {/* Post Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-700">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleLikePost(post.id)}
                            disabled={likingPost === post.id}
                            className={`flex items-center space-x-1 text-sm transition-colors ${
                              likedPosts.has(post.id)
                                ? 'text-red-500 hover:text-red-400'
                                : 'text-gray-400 hover:text-white'
                            } ${likingPost === post.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <Heart
                              className={`w-4 h-4 ${likedPosts.has(post.id) ? 'fill-current' : ''}`}
                            />
                            <span>{post.likesCount || 0}</span>
                          </button>
                          
                          <div className="flex items-center space-x-1 text-sm text-gray-400">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.commentsCount || 0}</span>
                          </div>
                        </div>
                        
                        <Link
                          href={`/posts/${post.id}`}
                          className="text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          View Post
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 lg:py-12">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-800 mx-auto mb-4 flex items-center justify-center">
                    <User className="w-8 h-8 lg:w-10 lg:h-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg lg:text-xl font-semibold text-white mb-2">No Posts Yet</h3>
                  <p className="text-gray-400 text-sm lg:text-base">
                    {isOwnProfile 
                      ? "You haven't posted anything yet. Share your first post!"
                      : `${profileUser.username} hasn't posted anything yet.`
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}