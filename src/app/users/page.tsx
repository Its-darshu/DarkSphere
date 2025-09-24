'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Search, 
  Users, 
  User,
  Github,
  Linkedin,
  Twitter,
  Instagram,
  MapPin,
  Calendar,
  Crown
} from 'lucide-react'

interface UserProfile {
  id: string
  username: string
  email: string
  fullName: string
  type: 'admin' | 'user'
  createdAt: Date
  bio?: string
  location?: string
  website?: string
  socialLinks: {
    github?: string
    linkedin?: string
    twitter?: string
    instagram?: string
  }
  totalPosts: number
  totalLikes: number
}

export default function UsersDirectory() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'name' | 'posts' | 'likes' | 'joined'>('name')

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user')
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    
    if (!isLoggedIn || !userData) {
      router.push('/')
      return
    }

    setCurrentUser(JSON.parse(userData))
    loadUsers()
    
    // Set up polling to check for new users every 5 seconds
    const userRefreshInterval = setInterval(() => {
      loadUsers()
    }, 5000)
    
    // Listen for storage changes (when new users register)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'adminUsersList') {
        console.log('🔄 New user detected, refreshing user list')
        loadUsers()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      clearInterval(userRefreshInterval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [router])

  useEffect(() => {
    // Filter users based on search query
    const filtered = users.filter(user => 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.bio && user.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.location && user.location.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    // Sort users
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.fullName.localeCompare(b.fullName)
        case 'posts':
          return b.totalPosts - a.totalPosts
        case 'likes':
          return b.totalLikes - a.totalLikes
        case 'joined':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        default:
          return 0
      }
    })

    setFilteredUsers(sorted)
  }, [users, searchQuery, sortBy])

  const loadUsers = () => {
    const adminUsersList = localStorage.getItem('adminUsersList')
    const userProfiles = localStorage.getItem('userProfiles') || '{}'
    const posts = JSON.parse(localStorage.getItem('posts') || '[]')
    
    if (!adminUsersList) {
      setLoading(false)
      return
    }

    const usersList = JSON.parse(adminUsersList)
    const profiles = JSON.parse(userProfiles)

    const enhancedUsers: UserProfile[] = usersList.map((user: any) => {
      const userProfile = profiles[user.id] || {}
      const userPosts = posts.filter((post: any) => post.authorId === user.id)
      const totalLikes = userPosts.reduce((sum: number, post: any) => sum + post.likes, 0)

      return {
        ...user,
        bio: userProfile.bio || '',
        location: userProfile.location || '',
        website: userProfile.website || '',
        socialLinks: userProfile.socialLinks || {},
        totalPosts: userPosts.length,
        totalLikes: totalLikes
      }
    })

    setUsers(enhancedUsers)
    setLoading(false)
  }

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'github': return <Github className="w-4 h-4" />
      case 'linkedin': return <Linkedin className="w-4 h-4" />
      case 'twitter': return <Twitter className="w-4 h-4" />
      case 'instagram': return <Instagram className="w-4 h-4" />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-blue mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="sticky top-0 bg-dark-card border-b border-dark-border backdrop-blur-md z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 text-dark-text-secondary hover:text-dark-text transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <Users className="w-6 h-6 text-dark-blue" />
              <h1 className="text-xl font-bold text-dark-text">Community Members</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Search and Filter Bar */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-text-secondary w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name, username, bio, or location..."
                className="w-full pl-10 pr-4 py-3 bg-dark-bg border border-dark-border rounded-lg text-dark-text placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-dark-text-secondary">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 bg-dark-bg border border-dark-border rounded-lg text-dark-text focus:outline-none focus:ring-2 focus:ring-dark-blue"
              >
                <option value="name">Name</option>
                <option value="posts">Posts</option>
                <option value="likes">Likes</option>
                <option value="joined">Recently Joined</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 pt-4 border-t border-dark-border">
            <div className="flex items-center justify-between text-sm text-dark-text-secondary">
              <span>
                {filteredUsers.length} of {users.length} members
                {searchQuery && ` matching "${searchQuery}"`}
              </span>
              <div className="flex items-center space-x-4">
                <span>{users.filter(u => u.type === 'admin').length} Admins</span>
                <span>{users.filter(u => u.type === 'user').length} Users</span>
              </div>
            </div>
          </div>
        </div>

        {/* Users Grid */}
        {filteredUsers.length === 0 ? (
          <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center">
            <User className="w-16 h-16 text-dark-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-dark-text mb-2">No Users Found</h3>
            <p className="text-dark-text-secondary">
              {searchQuery 
                ? `No members match your search for "${searchQuery}"`
                : "No members have joined the community yet."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-dark-card border border-dark-border rounded-xl p-6 hover:border-dark-blue/50 transition-colors cursor-pointer group"
                onClick={() => router.push(`/profile/${user.username}`)}
              >
                {/* User Header */}
                <div className="text-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-dark-blue to-dark-green flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
                    <span className="text-xl font-black text-white">
                      {user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-dark-text mb-1 group-hover:text-dark-blue transition-colors">
                    {user.fullName}
                  </h3>
                  <p className="text-dark-text-secondary text-sm">@{user.username}</p>
                  
                  {user.type === 'admin' && (
                    <div className="flex items-center justify-center space-x-1 mt-2">
                      <Crown className="w-4 h-4 text-dark-red" />
                      <span className="text-xs bg-dark-red/20 text-dark-red px-2 py-1 rounded-full">
                        Admin
                      </span>
                    </div>
                  )}
                </div>

                {/* Bio */}
                {user.bio && (
                  <p className="text-dark-text-secondary text-sm text-center mb-4 line-clamp-2">
                    {user.bio}
                  </p>
                )}

                {/* Info */}
                <div className="space-y-2 mb-4">
                  {user.location && (
                    <div className="flex items-center space-x-2 text-dark-text-secondary text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 text-dark-text-secondary text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Social Links */}
                {Object.values(user.socialLinks).some(link => link) && (
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    {Object.entries(user.socialLinks).map(([platform, username]) => 
                      username && (
                        <div
                          key={platform}
                          className="text-dark-text-secondary hover:text-dark-blue transition-colors"
                        >
                          {getSocialIcon(platform)}
                        </div>
                      )
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="bg-dark-bg rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div>
                      <div className="text-lg font-bold text-dark-text">{user.totalPosts}</div>
                      <div className="text-xs text-dark-text-secondary">Posts</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-dark-text">{user.totalLikes}</div>
                      <div className="text-xs text-dark-text-secondary">Likes</div>
                    </div>
                  </div>
                </div>

                {/* View Profile Button */}
                <button className="w-full mt-4 py-2 text-dark-blue hover:bg-dark-blue hover:text-white border border-dark-blue rounded-lg transition-colors text-sm font-medium">
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}