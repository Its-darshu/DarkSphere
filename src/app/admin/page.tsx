'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Key, 
  Users, 
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
  const [activeTab, setActiveTab] = useState<'keys' | 'users'>('keys')
  
  // Security keys state
  const [securityKeys, setSecurityKeys] = useState<SecurityKey[]>([])
  const [keyGenCount, setKeyGenCount] = useState(1)
  const [keyGenType, setKeyGenType] = useState<'admin' | 'user'>('user')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  
  // Users state
  const [users, setUsers] = useState<User[]>([])
  
  // Confirmation dialog state
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
    if (user.user_type !== 'admin') {
      router.push('/dashboard')
      return
    }
    
    setCurrentUser({
      id: user.id,
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      type: user.user_type,
      createdAt: new Date(user.created_at || Date.now())
    })
    
    // Load initial data
    loadSecurityKeys()
    loadUsers()
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      loadSecurityKeys()
      loadUsers()
    }, 3000)
    
    return () => clearInterval(interval)
  }, [router])

  const loadSecurityKeys = async () => {
    try {
      const response = await fetch('/api/security-keys')
      const data = await response.json()
      
      if (response.ok && data.keys) {
        setSecurityKeys(data.keys.map((key: any) => ({
          id: key.id,
          keyValue: key.key_value,
          keyType: key.key_type,
          used: key.is_used,
          usedBy: key.used_by_username || key.used_by,
          createdAt: new Date(key.created_at)
        })))
      }
    } catch (error) {
      console.error('Failed to load security keys:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (response.ok && data.users) {
        setUsers(data.users.map((user: any) => ({
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.full_name,
          type: user.user_type,
          createdAt: new Date(user.created_at)
        })))
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const generateKeys = async () => {
    try {
      const response = await fetch('/api/security-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          count: keyGenCount,
          keyType: keyGenType
        })
      })

      const data = await response.json()

      if (response.ok && data.keys) {
        // Reload security keys to show the new ones
        await loadSecurityKeys()
      } else {
        console.error('Failed to generate keys:', data.error)
      }
    } catch (error) {
      console.error('Error generating keys:', error)
    }
  }

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const deleteKey = async (keyId: string) => {
    try {
      const response = await fetch('/api/security-keys', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyId })
      })

      if (response.ok) {
        await loadSecurityKeys()
      } else {
        console.error('Failed to delete key')
      }
    } catch (error) {
      console.error('Error deleting key:', error)
    }
  }

  const deleteUser = async (userId: string, userFullName: string) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Reload users list to reflect the deletion
        await loadUsers()
        console.log(`✅ Successfully deleted user: ${userFullName}`)
      } else {
        const data = await response.json()
        console.error('Failed to delete user:', data.error)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
    }
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

  const adminStats = {
    totalUsers: users.length,
    totalAdmins: users.filter(user => user.type === 'admin').length,
    totalKeys: securityKeys.length,
    usedKeys: securityKeys.filter(key => key.used).length,
    unusedKeys: securityKeys.filter(key => !key.used).length
  }

  if (!currentUser) {
    return <div className="min-h-screen bg-white text-black flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent mx-auto mb-4"></div>
        <p>Loading admin dashboard...</p>
      </div>
    </div>
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <div className="border-b border-black p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">ADMIN DASHBOARD</h1>
          </div>
          <div className="text-sm">
            Welcome, <span className="font-medium">{currentUser.fullName}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-gray-50 border border-black p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">TOTAL USERS</span>
            </div>
            <div className="text-2xl font-bold">{adminStats.totalUsers}</div>
          </div>
          
          <div className="bg-gray-50 border border-black p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">ADMINS</span>
            </div>
            <div className="text-2xl font-bold">{adminStats.totalAdmins}</div>
          </div>
          
          <div className="bg-gray-50 border border-black p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Key className="w-5 h-5" />
              <span className="text-sm font-medium">TOTAL KEYS</span>
            </div>
            <div className="text-2xl font-bold">{adminStats.totalKeys}</div>
          </div>
          
          <div className="bg-gray-50 border border-black p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Check className="w-5 h-5" />
              <span className="text-sm font-medium">USED KEYS</span>
            </div>
            <div className="text-2xl font-bold">{adminStats.usedKeys}</div>
          </div>
          
          <div className="bg-gray-50 border border-black p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Key className="w-5 h-5" />
              <span className="text-sm font-medium">UNUSED KEYS</span>
            </div>
            <div className="text-2xl font-bold">{adminStats.unusedKeys}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-6 border border-black">
          <button
            onClick={() => setActiveTab('keys')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors
              ${activeTab === 'keys' 
                ? 'bg-black text-white' 
                : 'bg-white text-black hover:bg-gray-100'}`}
          >
            <Key className="w-4 h-4 inline mr-2" />
            SECURITY KEYS
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors border-l border-black
              ${activeTab === 'users' 
                ? 'bg-black text-white' 
                : 'bg-white text-black hover:bg-gray-100'}`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            USER MANAGEMENT
          </button>
        </div>

        {/* Security Keys Tab */}
        {activeTab === 'keys' && (
          <div className="space-y-6">
            {/* Key Generation */}
            <div className="bg-gray-50 border border-black p-6">
              <h3 className="text-lg font-bold mb-4">GENERATE SECURITY KEYS</h3>
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">COUNT</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={keyGenCount}
                    onChange={(e) => setKeyGenCount(parseInt(e.target.value))}
                    className="w-20 px-3 py-2 border border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-inset"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">TYPE</label>
                  <select
                    value={keyGenType}
                    onChange={(e) => setKeyGenType(e.target.value as 'admin' | 'user')}
                    className="px-3 py-2 border border-black bg-white text-black focus:outline-none focus:ring-2 focus:ring-black focus:ring-inset"
                  >
                    <option value="user">USER</option>
                    <option value="admin">ADMIN</option>
                  </select>
                </div>
                <button
                  onClick={generateKeys}
                  className="bg-black text-white px-6 py-2 hover:bg-gray-800 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>GENERATE</span>
                </button>
              </div>
            </div>

            {/* Keys List */}
            <div className="border border-black">
              <div className="bg-gray-50 border-b border-black p-4">
                <h3 className="font-bold">SECURITY KEYS ({securityKeys.length})</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {securityKeys.map((key) => (
                  <div key={key.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <code className="bg-gray-100 px-2 py-1 text-sm font-mono">
                            {key.keyValue}
                          </code>
                          <span className={`px-2 py-1 text-xs font-medium border
                            ${key.keyType === 'admin' 
                              ? 'bg-red-50 border-red-200 text-red-800' 
                              : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                            {key.keyType.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium border
                            ${key.used 
                              ? 'bg-gray-50 border-gray-200 text-gray-600' 
                              : 'bg-green-50 border-green-200 text-green-800'}`}>
                            {key.used ? 'USED' : 'AVAILABLE'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Created: {key.createdAt.toLocaleString()}
                          {key.used && key.usedBy && (
                            <span className="ml-4">Used by: {key.usedBy}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => copyKey(key.keyValue)}
                          className="p-2 hover:bg-gray-100 transition-colors"
                          title="Copy key"
                        >
                          {copiedKey === key.keyValue ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        {!key.used && (
                          <button
                            onClick={() => deleteKey(key.id)}
                            className="p-2 hover:bg-red-50 text-red-600 transition-colors"
                            title="Delete key"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {securityKeys.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No security keys found. Generate some keys to get started.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="border border-black">
              <div className="bg-gray-50 border-b border-black p-4">
                <h3 className="font-bold">REGISTERED USERS ({users.length})</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {users.map((user) => (
                  <div key={user.id} className="border-b border-gray-200 p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex items-center space-x-2">
                            {user.type === 'admin' ? (
                              <Shield className="w-5 h-5 text-red-600" />
                            ) : (
                              <User className="w-5 h-5 text-blue-600" />
                            )}
                            <span className="font-medium">{user.fullName}</span>
                          </div>
                          <span className="text-gray-600">@{user.username}</span>
                          <span className={`px-2 py-1 text-xs font-medium border
                            ${user.type === 'admin' 
                              ? 'bg-red-50 border-red-200 text-red-800' 
                              : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                            {user.type.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {user.email} • Joined: {user.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                      
                      {/* Delete Button - Allow deletion of any user except current admin */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => router.push(`/profile/${user.username}`)}
                          className="p-2 hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors"
                          title="View profile"
                        >
                          <User className="w-4 h-4" />
                        </button>
                        
                        {user.id !== currentUser?.id && (
                          <button
                            onClick={() => showConfirmDialog(
                              `Delete ${user.type === 'admin' ? 'Admin' : 'User'} Profile`,
                              `Are you sure you want to permanently delete ${user.type === 'admin' ? 'ADMIN' : 'user'} "${user.fullName}"?\n\nThis will remove:\n• User account and profile\n• All posts and comments\n• All interactions and data\n\nThis action cannot be undone.`,
                              () => deleteUser(user.id, user.fullName),
                              'danger'
                            )}
                            className="p-2 hover:bg-red-50 text-red-600 hover:text-red-800 transition-colors"
                            title={`Delete ${user.type} profile`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <div className="p-8 text-center text-gray-500">
                    No users found.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {confirmDialog.show && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-black p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold text-black">{confirmDialog.title}</h3>
            </div>
            
            <p className="text-gray-700 mb-6 whitespace-pre-line leading-relaxed">{confirmDialog.message}</p>
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={hideConfirmDialog}
                className="px-4 py-2 text-gray-600 hover:text-black transition-colors border border-gray-300 hover:border-black"
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmAction}
                className={`px-4 py-2 font-medium transition-colors ${
                  confirmDialog.type === 'danger' 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-black text-white hover:bg-gray-800'
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