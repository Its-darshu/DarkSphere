'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Key } from 'lucide-react'

// Mock security keys for demo
const SECURITY_KEYS = {
  'ADMIN-SUPER-ACCESS': { type: 'admin', used: false },
  'USER-BETA-TESTER': { type: 'user', used: false },
  'USER-WELCOME-2025': { type: 'user', used: false },
  'ADMIN-FOUNDER-KEY': { type: 'admin', used: false }
}

// Simple password hashing simulation (in production use proper bcrypt)
const hashPassword = (password: string): string => {
  return btoa(password + 'darksphere_salt') // Base64 encoding with salt
}

const verifyPassword = (password: string, hash: string): boolean => {
  return hashPassword(password) === hash
}

// Mobile localStorage helper functions
const setStorageItem = (key: string, value: string): boolean => {
  try {
    localStorage.setItem(key, value)
    // Verify it was actually set
    const stored = localStorage.getItem(key)
    if (stored !== value) {
      console.warn('⚠️ localStorage verification failed for key:', key)
      return false
    }
    return true
  } catch (error) {
    console.error('❌ localStorage setItem failed:', error)
    return false
  }
}

const getStorageItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.error('❌ localStorage getItem failed:', error)
    return null
  }
}

export default function HomePage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<'key' | 'register' | 'login'>('key')
  const [securityKey, setSecurityKey] = useState('')
  const [keyValidated, setKeyValidated] = useState(false)
  const [userType, setUserType] = useState<'admin' | 'user'>('user')
  
  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Initialize users if none exist
  const initializeUsers = () => {
    const users = [
      {
        username: 'admin',
        email: 'admin@darksphere.com',
        fullName: 'Admin User',
        type: 'admin',
        id: 'admin-001',
        createdAt: new Date(),
        passwordHash: hashPassword('admin123')
      },
      {
        username: 'testuser', 
        email: 'user@darksphere.com',
        fullName: 'Test User',
        type: 'user',
        id: 'user-001',
        createdAt: new Date(),
        passwordHash: hashPassword('user123')
      }
    ]
    
    setStorageItem('adminUsersList', JSON.stringify(users))
    setError('✅ Demo users created! Try: admin@darksphere.com / admin123')
  }

  const validateSecurityKey = () => {
    setError('')
    if (!securityKey.trim()) {
      setError('Please enter a security key')
      return
    }
    
    // Check hardcoded keys first
    const hardcodedKey = SECURITY_KEYS[securityKey as keyof typeof SECURITY_KEYS]
    if (hardcodedKey && !hardcodedKey.used) {
      setKeyValidated(true)
      setUserType(hardcodedKey.type as 'admin' | 'user')
      setCurrentStep('register')
      return
    }
    
    // Check admin-generated keys from localStorage
    const adminKeys = localStorage.getItem('adminSecurityKeys')
    if (adminKeys) {
      const keys = JSON.parse(adminKeys)
      const adminGeneratedKey = keys.find((key: any) => key.keyValue === securityKey && !key.used)
      
      if (adminGeneratedKey) {
        setKeyValidated(true)
        setUserType(adminGeneratedKey.keyType as 'admin' | 'user')
        setCurrentStep('register')
        return
      }
    }
    
    // Check if key exists but is already used
    if (hardcodedKey && hardcodedKey.used) {
      setError('This security key has already been used')
      return
    }
    
    if (adminKeys) {
      const keys = JSON.parse(adminKeys)
      const usedKey = keys.find((key: any) => key.keyValue === securityKey && key.used)
      if (usedKey) {
        setError('This security key has already been used')
        return
      }
    }
    
    setError('Invalid security key')
  }

  const handleRegister = async () => {
    setError('')
    setLoading(true)
    
    // Validation
    if (!registerForm.username || !registerForm.email || !registerForm.password || !registerForm.fullName) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }
    
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    
    if (registerForm.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }
    
    // Check if email or username already exists
    const adminUsersList = localStorage.getItem('adminUsersList')
    let existingUsers = []
    
    if (adminUsersList) {
      existingUsers = JSON.parse(adminUsersList)
    }
    
    const emailExists = existingUsers.find((user: any) => user.email === registerForm.email)
    const usernameExists = existingUsers.find((user: any) => user.username === registerForm.username)
    
    if (emailExists) {
      setError('Email already registered')
      setLoading(false)
      return
    }
    
    if (usernameExists) {
      setError('Username already taken')
      setLoading(false)
      return
    }
    
    // Simulate API call
    setTimeout(() => {
      // Mark key as used - check both hardcoded and admin-generated keys
      const hardcodedKey = SECURITY_KEYS[securityKey as keyof typeof SECURITY_KEYS]
      if (hardcodedKey) {
        SECURITY_KEYS[securityKey as keyof typeof SECURITY_KEYS].used = true
      } else {
        // Mark admin-generated key as used
        const adminKeys = localStorage.getItem('adminSecurityKeys')
        if (adminKeys) {
          const keys = JSON.parse(adminKeys)
          const keyIndex = keys.findIndex((key: any) => key.keyValue === securityKey)
          if (keyIndex !== -1) {
            keys[keyIndex].used = true
            keys[keyIndex].usedBy = registerForm.username
            keys[keyIndex].usedAt = new Date()
            localStorage.setItem('adminSecurityKeys', JSON.stringify(keys))
          }
        }
      }
      
      // Create new user object
      const newUser = {
        username: registerForm.username,
        email: registerForm.email,
        fullName: registerForm.fullName,
        type: userType,
        id: Date.now().toString(),
        createdAt: new Date(),
        passwordHash: hashPassword(registerForm.password)
      }
      
      // Add user to admin users list
      const updatedUsers = [...existingUsers, newUser]
      localStorage.setItem('adminUsersList', JSON.stringify(updatedUsers))
      
      // Store current user data
      localStorage.setItem('user', JSON.stringify(newUser))
      localStorage.setItem('isLoggedIn', 'true')
      
      // Redirect to dashboard
      router.push('/dashboard')
      setLoading(false)
    }, 1000)
  }

  const handleLogin = async () => {
    setError('')
    setLoading(true)
    
    console.log('🔍 Login Debug - Start')
    console.log('📱 Device:', navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop')
    console.log('📧 Email:', loginForm.email)
    console.log('🔑 Password length:', loginForm.password.length)
    
    if (!loginForm.email || !loginForm.password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }
    
    try {
      // Debug localStorage
      console.log('💾 Checking localStorage support...')
      console.log('💾 localStorage available:', typeof(Storage) !== "undefined")
      
      // Check if user exists in registered users list
      const adminUsersList = getStorageItem('adminUsersList')
      console.log('👥 Users list found:', !!adminUsersList)
      console.log('👥 Users list length:', adminUsersList ? JSON.parse(adminUsersList).length : 0)
      
      let registeredUsers = []
      
      if (adminUsersList) {
        registeredUsers = JSON.parse(adminUsersList)
        console.log('👥 Parsed users:', registeredUsers.length)
      } else {
        console.log('❌ No users list found in localStorage')
        console.log('🔧 Creating default admin user for mobile...')
        
        // Create default admin user if none exist (mobile fallback)
        const defaultAdmin = {
          username: 'admin',
          email: 'admin@darksphere.com', 
          fullName: 'Admin User',
          type: 'admin',
          id: 'default-admin-001',
          createdAt: new Date(),
          passwordHash: hashPassword('admin123') // Default password
        }
        
        const defaultUser = {
          username: 'user',
          email: 'user@darksphere.com',
          fullName: 'Demo User', 
          type: 'user',
          id: 'default-user-001',
          createdAt: new Date(),
          passwordHash: hashPassword('user123') // Default password
        }
        
        registeredUsers = [defaultAdmin, defaultUser]
        
        // Store the default users
        const stored = setStorageItem('adminUsersList', JSON.stringify(registeredUsers))
        if (stored) {
          console.log('✅ Default users created successfully')
          console.log('🔑 Admin: admin@darksphere.com / admin123')
          console.log('🔑 User: user@darksphere.com / user123')
        } else {
          console.error('❌ Failed to create default users')
          setError('Unable to initialize users. localStorage may be disabled.')
          setLoading(false)
          return
        }
      }
      
      // Find user by email
      const existingUser = registeredUsers.find((user: any) => user.email === loginForm.email)
      console.log('🔍 User found:', !!existingUser)
      
      if (!existingUser) {
        console.log('❌ User not found with email:', loginForm.email)
        console.log('📧 Available emails:', registeredUsers.map((u: any) => u.email))
        setError('Invalid email or password. Please check your credentials or register first.')
        setLoading(false)
        return
      }
      
      console.log('👤 Found user:', existingUser.username)
      
      // Debug password verification
      const hashedInput = hashPassword(loginForm.password)
      const storedHash = existingUser.passwordHash
      console.log('🔐 Password hash match:', hashedInput === storedHash)
      
      // Verify password
      if (!verifyPassword(loginForm.password, existingUser.passwordHash)) {
        console.log('❌ Password verification failed')
        setError('Invalid email or password. Please check your credentials.')
        setLoading(false)
        return
      }
      
      console.log('✅ Password verified successfully')
      
      // Add delay for better UX on mobile
      setTimeout(() => {
        try {
          const userToStore = {
            username: existingUser.username,
            email: existingUser.email,
            fullName: existingUser.fullName,
            type: existingUser.type,
            id: existingUser.id
          }
          
          console.log('💾 Storing user data:', userToStore)
          
          const userStored = setStorageItem('user', JSON.stringify(userToStore))
          const loginStored = setStorageItem('isLoggedIn', 'true')
          
          if (!userStored || !loginStored) {
            console.error('❌ Failed to store login data')
            setError('Login storage failed. Please try again.')
            setLoading(false)
            return
          }
          
          console.log('✅ User data stored successfully')
          console.log('🚀 Redirecting to dashboard...')
          
          // Double-check storage worked before redirect
          const verifyUser = getStorageItem('user')
          const verifyLogin = getStorageItem('isLoggedIn')
          
          if (!verifyUser || !verifyLogin) {
            console.error('❌ Storage verification failed before redirect')
            setError('Login storage failed. Please try again.')
            setLoading(false)
            return
          }
          
          console.log('✅ Storage verified, proceeding with redirect')
          router.push('/dashboard')
          setLoading(false)
        } catch (storageError) {
          console.error('❌ Storage error:', storageError)
          setError('Login storage failed. Please try again.')
          setLoading(false)
        }
      }, 500) // Reduced delay
      
    } catch (error) {
      console.error('❌ Login error:', error)
      setError('Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-minimal-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-minimal-white mb-4">
            <span className="text-2xl font-bold text-minimal-black">DS</span>
          </div>
          <h1 className="text-3xl font-bold text-minimal-white mb-2 tracking-tight">DarkSphere</h1>
          <p className="text-minimal-gray-400">Share your dark thoughts with the world</p>
        </div>

        <div className="bg-minimal-gray-900 border border-minimal-gray-800 p-6">
          {/* Security Key Step */}
          {currentStep === 'key' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-minimal-white">Enter Security Key</h2>
              <p className="text-minimal-gray-400 text-sm">
                You need a valid security key to join DarkSphere
              </p>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-minimal-white">Security Key</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-minimal-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={securityKey}
                    onChange={(e) => setSecurityKey(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-minimal-black border border-minimal-gray-800 text-minimal-white placeholder-minimal-gray-400 focus:outline-none focus:border-minimal-white transition-colors"
                    placeholder="Enter your security key"
                    onKeyPress={(e) => e.key === 'Enter' && validateSecurityKey()}
                  />
                </div>
              </div>
              
              {error && (
                <div className="bg-minimal-gray-800 border border-minimal-gray-700 rounded-lg p-3">
                  <p className="text-minimal-white text-sm">{error}</p>
                </div>
              )}
              
              <button
                onClick={validateSecurityKey}
                className="w-full bg-minimal-white text-minimal-black hover:bg-minimal-gray-200 font-medium py-3 px-4 transition-colors"
              >
                Validate Key
              </button>
              
              <div className="text-center">
                <button
                  onClick={() => setCurrentStep('login')}
                  className="text-minimal-white hover:text-minimal-gray-300 text-sm underline transition-colors"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </div>
          )}

          {/* Registration Step */}
          {currentStep === 'register' && keyValidated && (
            <div className="space-y-4">
              <div className="text-center mb-4">
                <div className="inline-flex items-center px-3 py-1 bg-minimal-gray-800 border border-minimal-gray-700">
                  <span className="text-minimal-white text-sm font-medium">
                    {userType === 'admin' ? 'Admin' : 'User'} Key Verified
                  </span>
                </div>
              </div>
              
              <h2 className="text-xl font-semibold text-minimal-white">Create Your Account</h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-minimal-white mb-1">Full Name</label>
                  <input
                    type="text"
                    value={registerForm.fullName}
                    onChange={(e) => setRegisterForm({...registerForm, fullName: e.target.value})}
                    className="w-full px-4 py-3 bg-minimal-black border border-minimal-gray-800 text-minimal-white placeholder-minimal-gray-400 focus:outline-none focus:border-minimal-white transition-colors"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-minimal-white mb-1">Username</label>
                  <input
                    type="text"
                    value={registerForm.username}
                    onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
                    className="w-full px-4 py-3 bg-minimal-black border border-minimal-gray-800 text-minimal-white placeholder-minimal-gray-400 focus:outline-none focus:border-minimal-white transition-colors"
                    placeholder="Choose a username"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-minimal-white mb-1">Email</label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                    className="w-full px-4 py-3 bg-minimal-black border border-minimal-gray-800 text-minimal-white placeholder-minimal-gray-400 focus:outline-none focus:border-minimal-white transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-minimal-white mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                      className="w-full px-4 py-3 pr-10 bg-minimal-black border border-minimal-gray-800 text-minimal-white placeholder-minimal-gray-400 focus:outline-none focus:border-minimal-white transition-colors"
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-minimal-gray-400 hover:text-minimal-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-minimal-white mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                    className="w-full px-4 py-3 bg-minimal-black border border-minimal-gray-800 text-minimal-white placeholder-minimal-gray-400 focus:outline-none focus:border-minimal-white transition-colors"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>
              
              {error && (
                <div className="bg-minimal-gray-800 border border-minimal-gray-700 p-3">
                  <p className="text-minimal-white text-sm">{error}</p>
                </div>
              )}
              
              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-minimal-white text-minimal-black hover:bg-minimal-gray-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-3 px-4 transition-colors"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              
              <button
                onClick={() => setCurrentStep('key')}
                className="w-full text-minimal-gray-400 hover:text-minimal-white text-sm transition-colors"
              >
                ← Back to Security Key
              </button>
            </div>
          )}

          {/* Login Step */}
          {currentStep === 'login' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-minimal-white">Sign In</h2>
              <p className="text-minimal-gray-400 text-sm">
                Enter your registered email and password
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-minimal-white mb-1">Email</label>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                    className="w-full px-4 py-3 bg-minimal-black border border-minimal-gray-800 text-minimal-white placeholder-minimal-gray-400 focus:outline-none focus:border-minimal-white transition-colors text-base"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-minimal-white mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                      className="w-full px-4 py-3 pr-10 bg-minimal-black border border-minimal-gray-800 text-minimal-white placeholder-minimal-gray-400 focus:outline-none focus:border-minimal-white transition-colors text-base"
                      placeholder="Enter your password"
                      onKeyPress={(e) => e.key === 'Enter' && !loading && handleLogin()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-minimal-gray-400 hover:text-minimal-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
              
              {error && (
                <div className="bg-minimal-gray-800 border border-minimal-gray-700 p-3">
                  <p className="text-minimal-white text-sm">{error}</p>
                </div>
              )}
              
              <button
                onClick={handleLogin}
                onTouchEnd={handleLogin} // Add touch support for mobile
                disabled={loading}
                className="w-full bg-minimal-white text-minimal-black hover:bg-minimal-gray-200 active:bg-minimal-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium py-3 px-4 transition-colors touch-manipulation"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
              
              <div className="text-center space-y-2">
                <button
                  onClick={() => setCurrentStep('key')}
                  className="text-minimal-white hover:text-minimal-gray-300 text-sm underline block w-full transition-colors"
                >
                  Need a security key? Get one here
                </button>
                
                <div className="text-xs text-minimal-gray-500 mt-4 p-3 bg-minimal-gray-900 border border-minimal-gray-800">
                  <p className="mb-2">🔧 Mobile Demo Accounts:</p>
                  <p>Admin: admin@darksphere.com / admin123</p>
                  <p>User: user@darksphere.com / user123</p>
                  <button
                    onClick={initializeUsers}
                    className="mt-2 w-full bg-minimal-gray-800 hover:bg-minimal-gray-700 text-minimal-white text-xs py-1 px-2 transition-colors"
                  >
                    🔄 Initialize Demo Users
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}