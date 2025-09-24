'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
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
  Globe
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
  content: string
  author: string
  authorId: string
  timestamp: Date
  likes: number
  comments: number
  likedBy: string[]
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
    loadUserPosts()
  }, [username, router])

  const loadProfileUser = () => {
    // Load all users to find the profile user
    const adminUsersList = localStorage.getItem('adminUsersList')
    if (!adminUsersList) {
      setLoading(false)
      return
    }
    
    const users: User[] = JSON.parse(adminUsersList)
    const user = users.find(u => u.username === username)
    
    if (user) {
      setProfileUser(user)
      setEditForm({
        fullName: user.fullName || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        github: user.socialMedia?.github || '',
        linkedin: user.socialMedia?.linkedin || '',
        twitter: user.socialMedia?.twitter || '',
        instagram: user.socialMedia?.instagram || ''
      })
    }
    
    setLoading(false)
  }

  const loadUserPosts = () => {
    const savedPosts = localStorage.getItem('posts')
    if (savedPosts) {
      const allPosts: Post[] = JSON.parse(savedPosts)
      // Filter posts by the profile user
      const userPosts = allPosts.filter(post => {
        // Try to match by authorId or by username derived from author name
        const usernameFromAuthor = post.author.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
        return usernameFromAuthor === username || post.authorId === profileUser?.id
      })
      setPosts(userPosts)
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
    
    // Update in admin users list
    const adminUsersList = localStorage.getItem('adminUsersList')
    if (adminUsersList) {
      const users: User[] = JSON.parse(adminUsersList)
      const userIndex = users.findIndex(u => u.id === profileUser.id)
      if (userIndex !== -1) {
        users[userIndex] = updatedUser
        localStorage.setItem('adminUsersList', JSON.stringify(users))
      }
    }
    
    // Update current user session if editing own profile
    if (currentUser.id === profileUser.id) {
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setCurrentUser(updatedUser)
    }
    
    setProfileUser(updatedUser)
    setIsEditing(false)
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'now'
    if (minutes < 60) return `${minutes}m`
    if (hours < 24) return `${hours}h`
    return `${days}d`
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'github': return <Github className="w-4 h-4" />
      case 'linkedin': return <Linkedin className="w-4 h-4" />
      case 'twitter': return <Twitter className="w-4 h-4" />
      case 'instagram': return <Instagram className="w-4 h-4" />
      default: return <ExternalLink className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-minimal-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-minimal-white mx-auto mb-4"></div>
          <p className="text-minimal-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-minimal-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-minimal-white mb-4">User Not Found</h1>
          <p className="text-minimal-gray-400 mb-6">The user @{username} doesn't exist.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-minimal-white text-minimal-black hover:bg-minimal-gray-200 px-6 py-2 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const isOwnProfile = currentUser?.id === profileUser.id

  return (
    <div className="min-h-screen bg-minimal-black">
      {/* Header */}
      <header className="bg-minimal-gray-900 border-b border-minimal-gray-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-minimal-gray-400 hover:text-minimal-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-minimal-white">{profileUser.fullName}</h1>
                <p className="text-sm text-minimal-gray-400">@{profileUser.username}</p>
              </div>
            </div>
            
            {isOwnProfile && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-minimal-white text-minimal-black hover:bg-minimal-gray-200 px-6 py-2 transition-colors"
              >
                <Edit className="w-4 h-4 inline mr-2" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="bg-minimal-gray-900 border border-minimal-gray-800 p-6 space-y-6">
              {/* Avatar and Basic Info */}
              <div className="text-center">
                <div className="w-20 h-20 bg-minimal-white flex items-center justify-center mx-auto mb-4">
                  <span className="text-minimal-black font-black text-2xl">
                    {profileUser.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
                
                <h2 className="text-xl font-bold text-minimal-white mb-1">{profileUser.fullName}</h2>
                <p className="text-minimal-gray-400 mb-2">@{profileUser.username}</p>
                
                {profileUser.type === 'admin' && (
                  <span className="inline-block mt-2 text-xs bg-minimal-gray-800 text-minimal-white px-2 py-1">
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
                        className="flex-1 bg-minimal-white text-minimal-black hover:bg-minimal-gray-200 py-2 px-4 flex items-center justify-center space-x-2 transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 bg-minimal-gray-800 hover:bg-minimal-gray-700 text-minimal-white py-2 px-4 flex items-center justify-center space-x-2 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-minimal-gray-800 hover:bg-minimal-gray-700 text-minimal-white py-2 px-4 flex items-center space-x-2 justify-center transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  )}
                </div>
              ) : null}

              {/* Bio Section */}
              <div>
                <h3 className="text-sm font-semibold text-minimal-white mb-2">Bio</h3>
                {isEditing ? (
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="w-full px-3 py-2 bg-minimal-black border border-minimal-gray-800 text-minimal-white placeholder-minimal-gray-400 resize-none focus:outline-none focus:border-minimal-white"
                  />
                ) : (
                  <p className="text-minimal-gray-400 text-sm">
                    {profileUser.bio || 'No bio available.'}
                  </p>
                )}
              </div>

              {/* Details */}
              <div className="space-y-3">
                {isEditing ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-minimal-white mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                        className="w-full px-2 py-1 bg-minimal-black border border-minimal-gray-800 text-sm text-minimal-white placeholder-minimal-gray-400 focus:outline-none focus:border-minimal-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-minimal-white mb-1">Location</label>
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                        placeholder="Where are you based?"
                        className="w-full px-2 py-1 bg-minimal-black border border-minimal-gray-800 text-sm text-minimal-white placeholder-minimal-gray-400 focus:outline-none focus:border-minimal-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-minimal-white mb-1">Website</label>
                      <input
                        type="url"
                        value={editForm.website}
                        onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                        placeholder="https://yourwebsite.com"
                        className="w-full px-2 py-1 bg-minimal-black border border-minimal-gray-800 text-sm text-minimal-white placeholder-minimal-gray-400 focus:outline-none focus:border-minimal-white"
                      />
                    </div>

                    {/* Social Media Links */}
                    <div>
                      <label className="block text-xs font-medium text-minimal-white mb-1">GitHub</label>
                      <input
                        type="text"
                        value={editForm.github}
                        onChange={(e) => setEditForm({...editForm, github: e.target.value})}
                        placeholder="github.com/username"
                        className="w-full px-2 py-1 bg-minimal-black border border-minimal-gray-800 text-sm text-minimal-white placeholder-minimal-gray-400 focus:outline-none focus:border-minimal-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-minimal-white mb-1">LinkedIn</label>
                      <input
                        type="text"
                        value={editForm.linkedin}
                        onChange={(e) => setEditForm({...editForm, linkedin: e.target.value})}
                        placeholder="linkedin.com/in/username"
                        className="w-full px-2 py-1 bg-minimal-black border border-minimal-gray-800 text-sm text-minimal-white placeholder-minimal-gray-400 focus:outline-none focus:border-minimal-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-minimal-white mb-1">Twitter</label>
                      <input
                        type="text"
                        value={editForm.twitter}
                        onChange={(e) => setEditForm({...editForm, twitter: e.target.value})}
                        placeholder="twitter.com/username"
                        className="w-full px-2 py-1 bg-minimal-black border border-minimal-gray-800 text-sm text-minimal-white placeholder-minimal-gray-400 focus:outline-none focus:border-minimal-white"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {profileUser.location && (
                      <div className="flex items-center space-x-2 text-sm text-minimal-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>{profileUser.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2 text-sm text-minimal-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(profileUser.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Social Links */}
                    {(profileUser.website || profileUser.socialMedia) && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-minimal-white">Links</h4>
                        <div className="bg-minimal-black p-3">
                          {profileUser.website && (
                            <a
                              href={profileUser.website.startsWith('http') ? profileUser.website : `https://${profileUser.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-2 text-sm text-minimal-gray-400 hover:text-minimal-white transition-colors mb-2"
                            >
                              <Globe className="w-4 h-4" />
                              <span>{profileUser.website}</span>
                            </a>
                          )}
                          
                          {Object.entries(profileUser.socialMedia || {}).map(([platform, url]) => (
                            url && (
                              <a
                                key={platform}
                                href={url.startsWith('http') ? url : `https://${url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 text-sm text-minimal-gray-400 hover:text-minimal-white transition-colors mb-1"
                              >
                                {getSocialIcon(platform)}
                                <span>{platform}</span>
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

          {/* Posts */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-minimal-gray-900 border border-minimal-gray-800 p-4">
              <h3 className="text-lg font-semibold text-minimal-white mb-4">
                Posts ({posts.length})
              </h3>
              
              {posts.length === 0 ? (
                <div className="bg-minimal-gray-900 border border-minimal-gray-800 p-8 text-center">
                  <p className="text-minimal-gray-400">No posts yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <div key={post.id} className="bg-minimal-gray-900 border border-minimal-gray-800 p-4">
                      <div className="flex items-start space-x-3 mb-3">
                        <div className="w-10 h-10 bg-minimal-white flex items-center justify-center">
                          <span className="text-minimal-black font-black text-sm">
                            {profileUser.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-minimal-white">{post.author}</span>
                            <span className="text-xs text-minimal-gray-500">{formatTime(post.timestamp)}</span>
                          </div>
                          <p className="text-minimal-white leading-relaxed whitespace-pre-wrap">
                            {post.content}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-minimal-gray-400">
                        <span>{post.likes} likes</span>
                        <span>{post.comments} comments</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}