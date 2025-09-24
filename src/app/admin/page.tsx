'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Key, 
  Users, 
  Megaphone, 
  Plus, 
  Trash2, 
  Shield, 
  User,
  Copy,
  Check,
  AlertTriangle
} from 'lucide-react'

interface User {
  id: string
  username: string
  email: string
  fullName: string
  type: 'admin' | 'user'
  createdAt: Date
}

interface SecurityKey {
  id: string
  keyValue: string
  keyType: 'admin' | 'user'
  used: boolean
  usedBy?: string
  createdAt: Date
}

interface Announcement {
  id: string
  title: string
  content: string
  type: 'info' | 'warning' | 'success'
  createdAt: Date
  createdBy: string
}

interface ConfirmDialog {
  show: boolean
  title: string
  message: string
  action: () => void
  type: 'danger' | 'warning'
}

export default function AdminDashboard() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<'keys' | 'users' | 'announcements'>('keys')
  
  // Security keys state
  const [securityKeys, setSecurityKeys] = useState<SecurityKey[]>([])
  const [keyGenCount, setKeyGenCount] = useState(1)
  const [keyGenType, setKeyGenType] = useState<'admin' | 'user'>('user')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  
  // Users state
  const [users, setUsers] = useState<User[]>([])
  
  // Announcements state
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'warning' | 'success'
  })
  
  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    show: false,
    title: '',
    message: '',
    action: () => {},
    type: 'danger'
  })

  useEffect(() => {
    // Check if user is logged in and is admin
    const userData = localStorage.getItem('user')
    
    if (!userData) {
      router.push('/')
      return
    }
    
    const user = JSON.parse(userData)
    if (user.type !== 'admin') {
      router.push('/dashboard')
      return
    }
    
    setCurrentUser(user)
    
    // Load data
    loadSecurityKeys()
    loadUsers()
    loadAnnouncements()
  }, [router])

  const loadSecurityKeys = () => {
    const savedKeys = localStorage.getItem('adminSecurityKeys')
    if (savedKeys) {
      setSecurityKeys(JSON.parse(savedKeys))
    } else {
      // Create some default keys
      const defaultKeys: SecurityKey[] = [
        {
          id: '1',
          keyValue: 'ADMIN-SUPER-ACCESS',
          keyType: 'admin',
          used: false,
          createdAt: new Date()
        },
        {
          id: '2',
          keyValue: 'USER-BETA-TESTER',
          keyType: 'user',
          used: false,
          createdAt: new Date()
        }
      ]
      setSecurityKeys(defaultKeys)
      localStorage.setItem('adminSecurityKeys', JSON.stringify(defaultKeys))
    }
  }

  const loadUsers = () => {
    const savedUsers = localStorage.getItem('adminUsersList')
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    }
  }

  const loadAnnouncements = () => {
    const savedAnnouncements = localStorage.getItem('globalAnnouncements')
    if (savedAnnouncements) {
      setAnnouncements(JSON.parse(savedAnnouncements))
    }
  }

  const generateKeys = () => {
    const newKeys: SecurityKey[] = []
    
    for (let i = 0; i < keyGenCount; i++) {
      const keyValue = `${keyGenType.toUpperCase()}-${Math.random().toString(36).substr(2, 8).toUpperCase()}-${Date.now()}`
      
      newKeys.push({
        id: Date.now().toString() + i,
        keyValue,
        keyType: keyGenType,
        used: false,
        createdAt: new Date()
      })
    }
    
    const updatedKeys = [...securityKeys, ...newKeys]
    setSecurityKeys(updatedKeys)
    localStorage.setItem('adminSecurityKeys', JSON.stringify(updatedKeys))
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const deleteKey = (keyId: string) => {
    const updatedKeys = securityKeys.filter(key => key.id !== keyId)
    setSecurityKeys(updatedKeys)
    localStorage.setItem('adminSecurityKeys', JSON.stringify(updatedKeys))
  }

  const deleteUser = (userId: string) => {
    // Remove user from users list
    const updatedUsers = users.filter(user => user.id !== userId)
    setUsers(updatedUsers)
    localStorage.setItem('adminUsersList', JSON.stringify(updatedUsers))
    
    // Remove user's posts
    const posts = JSON.parse(localStorage.getItem('posts') || '[]')
    const updatedPosts = posts.filter((post: any) => post.authorId !== userId)
    localStorage.setItem('posts', JSON.stringify(updatedPosts))
    
    // Remove user's comments
    const comments = JSON.parse(localStorage.getItem('comments') || '[]')
    const updatedComments = comments.filter((comment: any) => comment.authorId !== userId)
    localStorage.setItem('comments', JSON.stringify(updatedComments))
    
    // Remove user's likes from posts
    const postsWithUpdatedLikes = updatedPosts.map((post: any) => ({
      ...post,
      likedBy: post.likedBy ? post.likedBy.filter((id: string) => id !== userId) : [],
      likes: post.likedBy ? post.likedBy.filter((id: string) => id !== userId).length : 0
    }))
    localStorage.setItem('posts', JSON.stringify(postsWithUpdatedLikes))
    
    // Remove user's profile data
    const userProfiles = JSON.parse(localStorage.getItem('userProfiles') || '{}')
    delete userProfiles[userId]
    localStorage.setItem('userProfiles', JSON.stringify(userProfiles))
    
    // Remove user's security key usage if any
    const keys = JSON.parse(localStorage.getItem('adminSecurityKeys') || '[]')
    const updatedKeys = keys.map((key: any) => ({
      ...key,
      used: key.usedBy === userId ? false : key.used,
      usedBy: key.usedBy === userId ? undefined : key.usedBy
    }))
    localStorage.setItem('adminSecurityKeys', JSON.stringify(updatedKeys))
    setSecurityKeys(updatedKeys)
  }

  const createAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content || !currentUser) return
    
    const announcement: Announcement = {
      id: Date.now().toString(),
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      type: newAnnouncement.type,
      createdAt: new Date(),
      createdBy: currentUser.fullName
    }
    
    const updatedAnnouncements = [announcement, ...announcements]
    setAnnouncements(updatedAnnouncements)
    localStorage.setItem('globalAnnouncements', JSON.stringify(updatedAnnouncements))
    
    // Reset form
    setNewAnnouncement({
      title: '',
      content: '',
      type: 'info'
    })
  }

  const deleteAnnouncement = (announcementId: string) => {
    const updatedAnnouncements = announcements.filter(a => a.id !== announcementId)
    setAnnouncements(updatedAnnouncements)
    localStorage.setItem('globalAnnouncements', JSON.stringify(updatedAnnouncements))
  }

  const showConfirmDialog = (title: string, message: string, action: () => void, type: 'danger' | 'warning' = 'danger') => {
    setConfirmDialog({
      show: true,
      title,
      message,
      action,
      type
    })
  }

  const hideConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, show: false }))
  }

  const executeConfirmAction = () => {
    confirmDialog.action()
    hideConfirmDialog()
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-minimal-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-minimal-white mx-auto mb-4"></div>
          <p className="text-minimal-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-minimal-black">
      {/* Header */}
      <header className="bg-minimal-gray-900 border-b border-minimal-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-minimal-gray-400 hover:text-minimal-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8 text-minimal-white" />
                <div>
                  <h1 className="text-2xl font-bold text-minimal-white">Admin Dashboard</h1>
                  <p className="text-sm text-minimal-gray-400">Manage your DarkSphere instance</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-minimal-white">Welcome, {currentUser.fullName}</span>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1 mt-6">
            {[
              { id: 'keys', icon: Key, label: 'Security Keys' },
              { id: 'users', icon: Users, label: 'User Management' },
              { id: 'announcements', icon: Megaphone, label: 'Announcements' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-minimal-white text-minimal-black'
                    : 'text-minimal-gray-400 hover:text-minimal-white hover:bg-minimal-gray-800'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-minimal-gray-900 border border-minimal-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-minimal-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-minimal-white">{users.length}</p>
              </div>
              <Users className="w-8 h-8 text-minimal-white" />
            </div>
          </div>
          
          <div className="bg-minimal-gray-900 border border-minimal-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-minimal-gray-400">Admin Users</p>
                <p className="text-2xl font-bold text-minimal-white">
                  {users.filter(user => user.type === 'admin').length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-minimal-white" />
            </div>
          </div>
          
          <div className="bg-minimal-gray-900 border border-minimal-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-minimal-gray-400">Security Keys</p>
                <p className="text-2xl font-bold text-minimal-white">{securityKeys.length}</p>
              </div>
              <Key className="w-8 h-8 text-minimal-white" />
            </div>
          </div>
          
          <div className="bg-minimal-gray-900 border border-minimal-gray-800 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-minimal-gray-400">Used Keys</p>
                <p className="text-2xl font-bold text-minimal-white">
                  {securityKeys.filter(key => key.used).length}
                </p>
              </div>
              <Key className="w-8 h-8 text-minimal-gray-700" />
            </div>
          </div>
        </div>

        {activeTab === 'keys' && (
          <div className="space-y-6">
            {/* Key Generator */}
            <div className="bg-minimal-gray-900 border border-minimal-gray-800 p-6">
              <h2 className="text-xl font-semibold text-minimal-white mb-4">Generate Security Keys</h2>
              <div className="flex items-end space-x-4">
                <div>
                  <label className="block text-sm font-medium text-minimal-white mb-2">Key Type</label>
                  <select
                    value={keyGenType}
                    onChange={(e) => setKeyGenType(e.target.value as 'admin' | 'user')}
                    className="px-3 py-2 bg-minimal-black border border-minimal-gray-800 text-minimal-white focus:outline-none focus:border-minimal-white"
                  >
                    <option value="user">User Keys</option>
                    <option value="admin">Admin Keys</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-minimal-white mb-2">Count</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={keyGenCount}
                    onChange={(e) => setKeyGenCount(parseInt(e.target.value))}
                    className="px-3 py-2 w-20 bg-minimal-black border border-minimal-gray-800 text-minimal-white focus:outline-none focus:border-minimal-white"
                  />
                </div>
                
                <button
                  onClick={generateKeys}
                  className="bg-minimal-white text-minimal-black hover:bg-minimal-gray-200 font-medium py-2 px-4 flex items-center space-x-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Generate</span>
                </button>
              </div>
            </div>

            {/* Security Keys List */}
            <div className="bg-minimal-gray-900 border border-minimal-gray-800 p-6">
              <h2 className="text-xl font-semibold text-minimal-white mb-4">Security Keys</h2>
              {securityKeys.length === 0 ? (
                <p className="text-minimal-gray-400">No security keys generated yet.</p>
              ) : (
                <div className="space-y-3">
                  {securityKeys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-4 bg-minimal-black border border-minimal-gray-800">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <code className="text-minimal-white font-mono bg-minimal-gray-800 px-2 py-1">
                            {key.keyValue}
                          </code>
                          <span className={`text-xs px-2 py-1 ${
                            key.keyType === 'admin' 
                              ? 'bg-minimal-gray-800 text-minimal-white' 
                              : 'bg-minimal-gray-700 text-minimal-white'
                          }`}>
                            {key.keyType}
                          </span>
                          <span className={`text-xs px-2 py-1 ${
                            key.used 
                              ? 'bg-minimal-gray-600 text-minimal-white' 
                              : 'bg-minimal-gray-800 text-minimal-white'
                          }`}>
                            {key.used ? `Used by: ${key.usedBy || 'Unknown'}` : 'Available'}
                          </span>
                        </div>
                        <p className="text-xs text-minimal-gray-400 mt-1">
                          Created: {new Date(key.createdAt).toLocaleString()}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyKey(key.keyValue)}
                          className="text-minimal-gray-400 hover:text-minimal-white transition-colors p-2"
                          title="Copy key"
                        >
                          {copiedKey === key.keyValue ? (
                            <Check className="w-4 h-4 text-minimal-white" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        
                        <button
                          onClick={() => showConfirmDialog(
                            'Delete Security Key',
                            `Are you sure you want to delete the key "${key.keyValue}"?`,
                            () => deleteKey(key.id)
                          )}
                          className="text-minimal-gray-400 hover:text-minimal-white transition-colors p-2"
                          title="Delete key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-minimal-gray-900 border border-minimal-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-minimal-white">User Management</h2>
              <div className="text-sm text-minimal-gray-400">
                Total Users: {users.length}
              </div>
            </div>
            
            {users.length === 0 ? (
              <p className="text-minimal-gray-400">No users registered yet.</p>
            ) : (
              <div className="space-y-3">
                {users.map((user) => {
                  // Calculate user stats
                  const posts = JSON.parse(localStorage.getItem('posts') || '[]')
                  const userPosts = posts.filter((post: any) => post.authorId === user.id)
                  const comments = JSON.parse(localStorage.getItem('comments') || '[]')
                  const userComments = comments.filter((comment: any) => comment.authorId === user.id)
                  
                  return (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-minimal-black border border-minimal-gray-800">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-minimal-white flex items-center justify-center">
                          <span className="text-minimal-black font-black text-lg">
                            {user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-minimal-white">{user.fullName}</h3>
                            <span className={`text-xs px-2 py-1 ${
                              user.type === 'admin' 
                                ? 'bg-minimal-gray-800 text-minimal-white' 
                                : 'bg-minimal-gray-700 text-minimal-white'
                            }`}>
                              {user.type}
                            </span>
                          </div>
                          <p className="text-sm text-minimal-gray-400">@{user.username}</p>
                          <p className="text-sm text-minimal-gray-400">{user.email}</p>
                          <div className="flex items-center space-x-4 text-xs text-minimal-gray-500 mt-1">
                            <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                            <span>Posts: {userPosts.length}</span>
                            <span>Comments: {userComments.length}</span>
                          </div>
                        </div>
                      </div>
                      
                      {user.id !== currentUser.id && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => router.push(`/profile/${user.username}`)}
                            className="text-minimal-gray-400 hover:text-minimal-white transition-colors p-2"
                            title="View profile"
                          >
                            <User className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => showConfirmDialog(
                              'Delete User Profile',
                              `Are you sure you want to permanently delete "${user.fullName}"?\n\nThis will remove:\n• User account and profile\n• ${userPosts.length} posts\n• ${userComments.length} comments\n• All likes and interactions\n• Profile data and settings\n\nThis action cannot be undone.`,
                              () => deleteUser(user.id),
                              'danger'
                            )}
                            className="text-minimal-gray-400 hover:text-minimal-white transition-colors p-2"
                            title="Delete user permanently"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="space-y-6">
            {/* Create Announcement */}
            <div className="bg-minimal-gray-900 border border-minimal-gray-800 p-6">
              <h2 className="text-xl font-semibold text-minimal-white mb-4">Create Announcement</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-minimal-white mb-2">Title</label>
                  <input
                    type="text"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                    placeholder="Announcement title..."
                    className="w-full px-4 py-2 bg-minimal-black border border-minimal-gray-800 text-minimal-white placeholder-minimal-gray-400 focus:outline-none focus:border-minimal-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-minimal-white mb-2">Content</label>
                  <textarea
                    value={newAnnouncement.content}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                    placeholder="Write your announcement content..."
                    rows={4}
                    className="w-full px-4 py-3 bg-minimal-black border border-minimal-gray-800 text-minimal-white placeholder-minimal-gray-400 focus:outline-none focus:border-minimal-white resize-none"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <label className="block text-sm font-medium text-minimal-white">Type</label>
                    <select
                      value={newAnnouncement.type}
                      onChange={(e) => setNewAnnouncement({...newAnnouncement, type: e.target.value as any})}
                      className="px-3 py-2 bg-minimal-black border border-minimal-gray-800 text-minimal-white focus:outline-none focus:border-minimal-white"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="success">Success</option>
                    </select>
                  </div>
                  
                  <button
                    onClick={createAnnouncement}
                    disabled={!newAnnouncement.title || !newAnnouncement.content}
                    className="bg-minimal-white text-minimal-black hover:bg-minimal-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-2 px-6 flex items-center space-x-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Announcements List */}
            <div className="bg-minimal-gray-900 border border-minimal-gray-800 p-6">
              <h2 className="text-xl font-semibold text-minimal-white mb-4">All Announcements</h2>
              {announcements.length === 0 ? (
                <p className="text-minimal-gray-400">No announcements created yet.</p>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="p-4 bg-minimal-gray-800 border border-minimal-gray-700">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-minimal-white">{announcement.title}</h3>
                            <span className="px-2 py-1 text-xs bg-minimal-gray-700 text-minimal-white">
                              {announcement.type}
                            </span>
                          </div>
                          <p className="text-minimal-gray-400 text-sm mb-2 leading-relaxed whitespace-pre-wrap">
                            {announcement.content}
                          </p>
                          <p className="text-xs text-minimal-gray-500">
                            {announcement.createdBy} • {new Date(announcement.createdAt).toLocaleString()}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => showConfirmDialog(
                            'Delete Announcement',
                            `Are you sure you want to delete "${announcement.title}"?`,
                            () => deleteAnnouncement(announcement.id)
                          )}
                          className="text-minimal-gray-400 hover:text-minimal-white transition-colors p-1 ml-4"
                          title="Delete announcement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-minimal-gray-900 border border-minimal-gray-800 p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-minimal-white" />
              <h3 className="text-lg font-semibold text-minimal-white">{confirmDialog.title}</h3>
            </div>
            
            <p className="text-minimal-gray-400 mb-6 whitespace-pre-line leading-relaxed">{confirmDialog.message}</p>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={hideConfirmDialog}
                className="px-4 py-2 text-minimal-gray-400 hover:text-minimal-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmAction}
                className={`px-4 py-2 font-medium transition-colors ${
                  confirmDialog.type === 'danger' 
                    ? 'bg-minimal-white text-minimal-black hover:bg-minimal-gray-200' 
                    : 'bg-minimal-gray-700 hover:bg-minimal-gray-600 text-minimal-white'
                }`}
              >
                {confirmDialog.type === 'danger' ? 'Delete' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}