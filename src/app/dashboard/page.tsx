'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Heart, MessageCircle, Share, Send, LogOut, User, Search, Trash2, Settings, X, Info, AlertTriangle, CheckCircle, Users } from 'lucide-react'

interface Post {
  id: string
  content: string
  author: string
  authorId: string
  timestamp: Date
  likes: number
  comments: number
  likedBy: string[]
  replies: Comment[]
}

interface Comment {
  id: string
  postId: string
  content: string
  author: string
  authorId: string
  timestamp: Date
  likes: number
}

interface User {
  id: string
  username: string
  email: string
  fullName: string
  type: 'admin' | 'user'
}

interface Announcement {
  id: string
  title: string
  content: string
  type: 'info' | 'warning' | 'success'
  createdAt: Date
  createdBy: string
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([])
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false)
  
  // Comment state
  const [comments, setComments] = useState<Comment[]>([])
  const [showComments, setShowComments] = useState<{[key: string]: boolean}>({})
  const [newComment, setNewComment] = useState<{[key: string]: string}>({})

  // Load user data and posts on component mount
  useEffect(() => {
    console.log('🏠 Dashboard - Loading...')
    
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    const userData = localStorage.getItem('user')
    
    console.log('🔍 Dashboard Debug:')
    console.log('  - isLoggedIn:', isLoggedIn)
    console.log('  - userData exists:', !!userData)
    console.log('  - localStorage available:', typeof(Storage) !== "undefined")
    
    if (!isLoggedIn || !userData) {
      console.log('❌ Not logged in, redirecting to login')
      router.push('/')
      return
    }
    
    try {
      const parsedUserData = JSON.parse(userData)
      console.log('✅ Raw user data:', parsedUserData)
      
      // Map database fields to expected format
      const user = {
        id: parsedUserData.id,
        username: parsedUserData.username,
        email: parsedUserData.email,
        fullName: parsedUserData.full_name || parsedUserData.fullName || 'Unknown User',
        type: parsedUserData.user_type || parsedUserData.type || 'user'
      }
      
      console.log('✅ Mapped user data:', user)
      setUser(user)
    } catch (error) {
      console.error('❌ Error parsing user data:', error)
      router.push('/')
      return
    }
    
    // Load posts from localStorage or create sample posts
    const savedPosts = localStorage.getItem('posts')
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts))
    } else {
      // Create some sample posts
      const samplePosts: Post[] = [
        {
          id: '1',
          content: 'Welcome to DarkSphere! 🌟 This is the future of social media. Share your thoughts and connect with amazing people.',
          author: 'DarkSphere Team',
          authorId: 'system',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          likes: 5,
          comments: 2,
          likedBy: [],
          replies: []
        },
        {
          id: '2',
          content: 'Just built my first React component today! The feeling when your code finally works is unmatched 🚀',
          author: 'CodeMaster',
          authorId: 'user2',
          timestamp: new Date(Date.now() - 7200000), // 2 hours ago
          likes: 12,
          comments: 3,
          likedBy: [],
          replies: []
        },
        {
          id: '3',
          content: 'Coffee ☕ + Code 💻 = Perfect morning! What\'s your favorite programming language?',
          author: 'DevLife',
          authorId: 'user3',
          timestamp: new Date(Date.now() - 10800000), // 3 hours ago
          likes: 8,
          comments: 5,
          likedBy: [],
          replies: []
        }
      ]
      setPosts(samplePosts)
      localStorage.setItem('posts', JSON.stringify(samplePosts))
    }
    
    // Load announcements and dismissed announcements
    loadAnnouncements()
    
    // Load comments
    const savedComments = localStorage.getItem('comments')
    if (savedComments) {
      setComments(JSON.parse(savedComments))
    }
  }, [router])

  // Also listen for storage changes to sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'globalAnnouncements') {
        loadAnnouncements()
      } else if (e.key === 'dismissedAnnouncements') {
        const dismissed = e.newValue ? JSON.parse(e.newValue) : []
        setDismissedAnnouncements(dismissed)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const loadAnnouncements = () => {
    const savedAnnouncements = localStorage.getItem('globalAnnouncements')
    if (savedAnnouncements) {
      setAnnouncements(JSON.parse(savedAnnouncements))
    }
    
    // Load dismissed announcements immediately after loading announcements
    const dismissed = localStorage.getItem('dismissedAnnouncements')
    if (dismissed) {
      setDismissedAnnouncements(JSON.parse(dismissed))
    }
  }

  const dismissAnnouncement = (announcementId: string) => {
    // Get current dismissed announcements
    const currentDismissed = localStorage.getItem('dismissedAnnouncements')
    const dismissedList = currentDismissed ? JSON.parse(currentDismissed) : []
    
    // Add the new dismissed announcement if not already in the list
    if (!dismissedList.includes(announcementId)) {
      const updated = [...dismissedList, announcementId]
      setDismissedAnnouncements(updated)
      localStorage.setItem('dismissedAnnouncements', JSON.stringify(updated))
    }
  }

  const undismissAnnouncement = (announcementId: string) => {
    const currentDismissed = localStorage.getItem('dismissedAnnouncements')
    const dismissedList = currentDismissed ? JSON.parse(currentDismissed) : []
    
    // Remove the announcement from dismissed list
    const updated = dismissedList.filter((id: string) => id !== announcementId)
    setDismissedAnnouncements(updated)
    localStorage.setItem('dismissedAnnouncements', JSON.stringify(updated))
  }

  const getUsernameFromAuthor = (authorId: string, author: string) => {
    // Try to get username from registered users list
    const adminUsersList = localStorage.getItem('adminUsersList')
    if (adminUsersList) {
      const users = JSON.parse(adminUsersList)
      const user = users.find((u: any) => u.id === authorId)
      if (user) return user.username
    }
    
    // Fallback to creating username from author name
    return author.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
  }

  const handlePost = async () => {
    if (!newPost.trim() || !user) return
    
    setLoading(true)
    
    const post: Post = {
      id: Date.now().toString(),
      content: newPost,
      author: user.fullName || user.username,
      authorId: user.id,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      likedBy: [],
      replies: []
    }
    
    // Add to the beginning of the posts array (newest first)
    const updatedPosts = [post, ...posts]
    setPosts(updatedPosts)
    localStorage.setItem('posts', JSON.stringify(updatedPosts))
    
    setNewPost('')
    setLoading(false)
  }

  const handleLike = (postId: string) => {
    if (!user) return
    
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const hasLiked = post.likedBy.includes(user.id)
        return {
          ...post,
          likes: hasLiked ? post.likes - 1 : post.likes + 1,
          likedBy: hasLiked 
            ? post.likedBy.filter(id => id !== user.id)
            : [...post.likedBy, user.id]
        }
      }
      return post
    })
    
    // Sort by likes (higher likes first)
    updatedPosts.sort((a, b) => b.likes - a.likes)
    
    setPosts(updatedPosts)
    localStorage.setItem('posts', JSON.stringify(updatedPosts))
  }

  const handleDelete = (postId: string) => {
    if (!user) return
    
    const updatedPosts = posts.filter(post => {
      // Users can delete their own posts, admins can delete any post
      if (user.type === 'admin') return post.id !== postId
      return post.id !== postId && post.authorId === user.id
    })
    
    // Also delete related comments
    const updatedComments = comments.filter(comment => comment.postId !== postId)
    setComments(updatedComments)
    localStorage.setItem('comments', JSON.stringify(updatedComments))
    
    setPosts(updatedPosts)
    localStorage.setItem('posts', JSON.stringify(updatedPosts))
  }
  
  const handleComment = (postId: string) => {
    if (!user || !newComment[postId]?.trim()) return
    
    const comment: Comment = {
      id: Date.now().toString(),
      postId,
      content: newComment[postId].trim(),
      author: user.fullName || user.username,
      authorId: user.id,
      timestamp: new Date(),
      likes: 0
    }
    
    const updatedComments = [...comments, comment]
    setComments(updatedComments)
    localStorage.setItem('comments', JSON.stringify(updatedComments))
    
    // Update post comment count
    const updatedPosts = posts.map(post => 
      post.id === postId 
        ? { ...post, comments: post.comments + 1 }
        : post
    )
    setPosts(updatedPosts)
    localStorage.setItem('posts', JSON.stringify(updatedPosts))
    
    // Clear comment input
    setNewComment(prev => ({ ...prev, [postId]: '' }))
  }
  
  const toggleComments = (postId: string) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }))
  }
  
  const getPostComments = (postId: string): Comment[] => {
    return comments.filter(comment => comment.postId === postId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('user')
    router.push('/')
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

  const filteredPosts = posts.filter(post =>
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!user) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-blue mx-auto mb-4"></div>
          <p className="text-dark-text-secondary">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-minimal-black">
      {/* Header */}
      <header className="sticky top-0 bg-minimal-black border-b border-minimal-gray-800 z-50">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-minimal-white flex items-center justify-center">
                <span className="text-sm font-bold text-minimal-black">DS</span>
              </div>
              <h1 className="text-xl font-bold text-minimal-white tracking-tight">DarkSphere</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.push(`/profile/${user.username}`)}
                className="flex items-center space-x-3 text-minimal-gray-400 hover:text-minimal-white transition-colors p-2 hover:bg-minimal-gray-900"
                title="My Profile"
              >
                <div className="w-8 h-8 bg-minimal-white flex items-center justify-center">
                  <span className="text-sm font-bold text-minimal-black">
                    {user?.fullName ? 
                      user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
                      : user?.username ? user.username.substring(0, 2).toUpperCase() 
                      : 'U'}
                  </span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-minimal-white">{user?.fullName || user?.username || 'User'}</div>
                  {user.type === 'admin' && (
                    <div className="text-xs bg-minimal-gray-800 text-minimal-white px-2 py-0.5">
                      Admin
                    </div>
                  )}
                </div>
              </button>
              
              <button
                onClick={() => router.push('/users')}
                className="text-minimal-gray-400 hover:text-minimal-white transition-colors p-2 hover:bg-minimal-gray-900"
                title="Browse Users"
              >
                <Users className="w-5 h-5" />
              </button>
              
              {user.type === 'admin' && (
                <button
                  onClick={() => router.push('/admin')}
                  className="text-minimal-gray-400 hover:text-minimal-white transition-colors p-2 hover:bg-minimal-gray-900"
                  title="Admin Panel"
                >
                  <Settings className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="text-minimal-gray-400 hover:text-minimal-white transition-colors p-2 hover:bg-minimal-gray-900"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Announcements */}
        {announcements.filter(a => !dismissedAnnouncements.includes(a.id)).map((announcement) => (
          <div key={announcement.id} className="bg-minimal-gray-900 border border-minimal-gray-800 p-4 animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                <div className="mt-1 text-minimal-white">
                  {announcement.type === 'info' && <Info className="w-5 h-5" />}
                  {announcement.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                  {announcement.type === 'success' && <CheckCircle className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-minimal-white mb-1">{announcement.title}</h3>
                  <p className="text-minimal-gray-400 text-sm mb-2 leading-relaxed whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-minimal-gray-500">
                    {announcement.createdBy} • {new Date(announcement.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dismissAnnouncement(announcement.id)}
                className="text-minimal-gray-400 hover:text-minimal-white transition-colors p-1 ml-3"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Post Creation */}
        <div className="bg-minimal-gray-900 border border-minimal-gray-800 p-6">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="What's on your mind? Share your thoughts..."
            className="w-full bg-transparent text-minimal-white placeholder-minimal-gray-400 resize-none focus:outline-none text-lg leading-relaxed"
            rows={3}
            maxLength={500}
          />
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-minimal-gray-800">
            <span className="text-sm text-minimal-gray-400">
              {newPost.length}/500 characters
            </span>
            
            <button
              onClick={handlePost}
              disabled={!newPost.trim() || loading}
              className="bg-minimal-white text-minimal-black hover:bg-minimal-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-2 px-6 transition-colors"
            >
              <Send className="w-4 h-4 inline mr-2" />
              <span>{loading ? 'Posting...' : 'Post'}</span>
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-minimal-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts or users..."
            className="w-full pl-10 pr-4 py-3 bg-minimal-gray-900 border border-minimal-gray-800 text-minimal-white placeholder-minimal-gray-400 focus:outline-none focus:border-minimal-white transition-colors"
          />
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-minimal-gray-400">
                {searchQuery ? 'No posts found matching your search.' : 'No posts yet. Be the first to share your thoughts!'}
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} className="bg-minimal-gray-900 border border-minimal-gray-800 p-6 animate-fade-in hover:border-minimal-gray-700 transition-colors">
                {/* Post Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-minimal-white flex items-center justify-center">
                      <span className="text-sm font-bold text-minimal-black">
                        {post.author.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <button
                        onClick={() => router.push(`/profile/${getUsernameFromAuthor(post.authorId, post.author)}`)}
                        className="font-medium text-minimal-white hover:text-minimal-gray-300 transition-colors text-left"
                      >
                        {post.author}
                      </button>
                      <p className="text-sm text-minimal-gray-400">{formatTime(post.timestamp)}</p>
                    </div>
                  </div>
                  
                  {/* Delete button - show for own posts or if admin */}
                  {(post.authorId === user.id || user.type === 'admin') && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-minimal-gray-400 hover:text-minimal-white transition-colors p-2"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Post Content */}
                <p className="text-minimal-white mb-4 leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </p>

                {/* Post Actions */}
                <div className="flex items-center space-x-6 pt-3 border-t border-minimal-gray-800">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-2 transition-colors ${
                      post.likedBy.includes(user.id)
                        ? 'text-minimal-white'
                        : 'text-minimal-gray-400 hover:text-minimal-white'
                    }`}
                  >
                    <Heart 
                      className={`w-5 h-5 ${post.likedBy.includes(user.id) ? 'fill-current animate-pulse-like' : ''}`} 
                    />
                    <span className="text-sm font-medium">{post.likes}</span>
                  </button>
                  
                  <button 
                    onClick={() => toggleComments(post.id)}
                    className={`flex items-center space-x-2 transition-colors ${
                      showComments[post.id]
                        ? 'text-minimal-white'
                        : 'text-minimal-gray-400 hover:text-minimal-white'
                    }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm">{post.comments}</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 text-minimal-gray-400 hover:text-minimal-white transition-colors">
                    <Share className="w-5 h-5" />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
                
                {/* Comments Section */}
                {showComments[post.id] && (
                  <div className="mt-4 pt-4 border-t border-minimal-gray-800 space-y-4">
                    {/* Comment Form */}
                    <div className="flex space-x-3">
                      <div className="w-8 h-8 bg-minimal-white flex items-center justify-center">
                        <span className="text-xs font-bold text-minimal-black">
                          {user?.fullName ? 
                            user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() 
                            : user?.username ? user.username.substring(0, 2).toUpperCase() 
                            : 'U'}
                        </span>
                      </div>
                      <div className="flex-1 space-y-2">
                        <textarea
                          value={newComment[post.id] || ''}
                          onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="Write a comment..."
                          className="w-full px-3 py-2 bg-minimal-black border border-minimal-gray-800 text-minimal-white placeholder-minimal-gray-400 text-sm resize-none focus:outline-none focus:border-minimal-white"
                          rows={2}
                          maxLength={300}
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-minimal-gray-500">
                            {(newComment[post.id] || '').length}/300
                          </span>
                          <button
                            onClick={() => handleComment(post.id)}
                            disabled={!(newComment[post.id]?.trim())}
                            className="bg-minimal-white text-minimal-black hover:bg-minimal-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium py-1 px-3 transition-colors"
                          >
                            Comment
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Comments List */}
                    {getPostComments(post.id).map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="w-8 h-8 bg-minimal-white flex items-center justify-center">
                          <span className="text-xs font-bold text-minimal-black">
                            {comment.author.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="bg-minimal-gray-800 px-3 py-2">
                            <div className="flex items-center space-x-2 mb-1">
                              <button
                                onClick={() => router.push(`/profile/${getUsernameFromAuthor(comment.authorId, comment.author)}`)}
                                className="text-sm font-medium text-minimal-white hover:text-minimal-gray-300 transition-colors"
                              >
                                {comment.author}
                              </button>
                              <span className="text-xs text-minimal-gray-400">
                                {formatTime(comment.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-minimal-gray-300 leading-relaxed whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {getPostComments(post.id).length === 0 && (
                      <div className="text-center py-4">
                        <p className="text-sm text-minimal-gray-400">No comments yet. Be the first to comment!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Stats Footer */}
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-6 text-minimal-gray-400 text-sm">
            <span>{filteredPosts.length} posts</span>
            <span>•</span>
            <span>{filteredPosts.reduce((sum, post) => sum + post.likes, 0)} total likes</span>
            <span>•</span>
            <button
              onClick={() => router.push('/users')}
              className="text-minimal-white hover:text-minimal-gray-300 underline transition-colors"
            >
              Browse {(() => {
                const adminUsersList = localStorage.getItem('adminUsersList')
                return adminUsersList ? JSON.parse(adminUsersList).length : 0
              })()} members
            </button>
            <span>•</span>
            <button
              onClick={() => setShowAnnouncementsModal(true)}
              className="text-minimal-white hover:text-minimal-gray-300 underline transition-colors"
            >
              View All Announcements ({announcements.length})
            </button>
          </div>
        </div>
      </div>

      {/* Announcements Modal */}
      {showAnnouncementsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-minimal-black border border-minimal-gray-800 w-full max-w-4xl max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-minimal-gray-800">
              <div className="flex items-center space-x-3">
                <Info className="w-6 h-6 text-minimal-white" />
                <h2 className="text-xl font-bold text-minimal-white">All Announcements</h2>
              </div>
              <button
                onClick={() => setShowAnnouncementsModal(false)}
                className="text-minimal-gray-400 hover:text-minimal-white transition-colors p-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {announcements.length === 0 ? (
                <div className="text-center py-12">
                  <Info className="w-16 h-16 text-minimal-gray-400 mx-auto mb-4" />
                  <p className="text-minimal-gray-400">No announcements have been created yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => {
                    const isDismissed = dismissedAnnouncements.includes(announcement.id)
                    return (
                      <div
                        key={announcement.id}
                        className={`p-4 bg-minimal-gray-900 border border-minimal-gray-800 ${
                          isDismissed ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <div className="mt-1 text-minimal-white">
                              {announcement.type === 'info' && <Info className="w-5 h-5" />}
                              {announcement.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                              {announcement.type === 'success' && <CheckCircle className="w-5 h-5" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="font-semibold text-minimal-white">{announcement.title}</h3>
                                {isDismissed && (
                                  <span className="text-xs bg-minimal-gray-800 text-minimal-gray-400 px-2 py-0.5">
                                    Dismissed
                                  </span>
                                )}
                              </div>
                              <p className="text-minimal-gray-400 text-sm mb-2 leading-relaxed whitespace-pre-wrap">
                                {announcement.content}
                              </p>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-minimal-gray-500">
                                  {announcement.createdBy} • {new Date(announcement.createdAt).toLocaleString()}
                                </p>
                                {isDismissed ? (
                                  <button
                                    onClick={() => undismissAnnouncement(announcement.id)}
                                    className="text-xs text-minimal-white hover:text-minimal-gray-300 transition-colors font-medium"
                                  >
                                    Show Again
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => dismissAnnouncement(announcement.id)}
                                    className="text-xs text-minimal-gray-400 hover:text-minimal-white transition-colors font-medium"
                                  >
                                    Dismiss
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t border-minimal-gray-800 bg-minimal-black">
              <div className="flex items-center space-x-4 text-sm text-minimal-gray-400">
                <span>{announcements.length} total announcements</span>
                <span>•</span>
                <span>{announcements.length - dismissedAnnouncements.length} active</span>
                <span>•</span>
                <span>{dismissedAnnouncements.length} dismissed</span>
              </div>
              <button
                onClick={() => setShowAnnouncementsModal(false)}
                className="bg-minimal-white text-minimal-black hover:bg-minimal-gray-200 px-4 py-2 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}