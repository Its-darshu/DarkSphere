'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Key } from 'lucide-react'

export default function HomePage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    securityKey: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [keyValidation, setKeyValidation] = useState<{
    checking: boolean
    valid: boolean | null
    message: string
    keyType?: string
  }>({
    checking: false,
    valid: null,
    message: ''
  })
  const router = useRouter()

  // Check for existing login token on component mount
  useEffect(() => {
    const checkExistingLogin = async () => {
      const token = localStorage.getItem('authToken')
      if (token) {
        try {
          setLoading(true)
          const response = await fetch('/api/auth/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })
          })

          if (response.ok) {
            const data = await response.json()
            // Store user data and redirect to dashboard
            localStorage.setItem('user', JSON.stringify(data.user))
            console.log('✅ Auto-login successful:', data.user.username)
            router.push('/dashboard')
            return
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
          }
        } catch (error) {
          console.error('Auto-login failed:', error)
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
        } finally {
          setLoading(false)
        }
      }
    }

    checkExistingLogin()
  }, [router])

  // Validate security key in real-time when user types
  const validateSecurityKey = async (key: string) => {
    if (!key || key.trim() === '') {
      setKeyValidation({ checking: false, valid: null, message: '' })
      return
    }

    setKeyValidation({ checking: true, valid: null, message: 'Checking security key...' })

    try {
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ securityKey: key.trim() })
      })

      const data = await response.json()

      if (data.valid) {
        setKeyValidation({
          checking: false,
          valid: true,
          message: `✅ Valid ${data.keyType} key`,
          keyType: data.keyType
        })
      } else {
        setKeyValidation({
          checking: false,
          valid: false,
          message: `❌ ${data.error}`
        })
      }
    } catch (error) {
      setKeyValidation({
        checking: false,
        valid: false,
        message: '❌ Error validating key'
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validation for registration
    if (mode === 'register') {
      if (!formData.securityKey || formData.securityKey.trim() === '') {
        setError('🔑 Security key is required for registration')
        setLoading(false)
        return
      }

      // FIRST: Validate security key before allowing profile creation
      if (!keyValidation.valid) {
        setError('🔑 Please enter a valid security key before creating your profile')
        setLoading(false)
        return
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long')
        setLoading(false)
        return
      }
      
      console.log('🔑 Security key validated, proceeding with registration')
    }

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      
      // Only send security key for registration
      const requestBody = mode === 'login' 
        ? { 
            username: formData.username, 
            password: formData.password,
            rememberMe: rememberMe
          }
        : formData

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const data = await response.json()

      if (!response.ok) {
        // Better error messages for security key issues
        if (data.error.includes('Invalid security key')) {
          setError('🔑 Security key not found. Please contact an admin for a valid key.')
        } else if (data.error.includes('already been used')) {
          setError('🔑 This security key has already been used. Please request a new one.')
        } else if (data.error.includes('Username already taken')) {
          setError('👤 Username is already taken. Please choose another.')
        } else if (data.error.includes('Email already registered')) {
          setError('📧 Email is already registered. Please use a different email.')
        } else {
          setError(data.error || 'Something went wrong')
        }
        setLoading(false)
        return
      }

      if (data.success && data.user) {
        // Store user session and token in localStorage for persistent login
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('isLoggedIn', 'true')
        
        // Store auth token if provided (for login)
        if (data.token) {
          localStorage.setItem('authToken', data.token)
          console.log('✅ Auth token stored for persistent login')
        }
        
        console.log('✅ Authentication successful, redirecting to dashboard...')
        router.push('/dashboard')
      } else {
        setError('Authentication failed')
        setLoading(false)
      }

    } catch (error) {
      console.error('Authentication error:', error)
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Validate security key in real-time for registration mode
    if (name === 'securityKey' && mode === 'register') {
      // Debounce the validation call
      setTimeout(() => validateSecurityKey(value), 500)
    }
  }

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white border border-black p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">DARKSPHERE</h1>
            <p className="text-sm text-gray-600">
              {mode === 'login' ? 'Welcome back' : 'Join the community'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex mb-6 border border-black">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors
                ${mode === 'login' 
                  ? 'bg-black text-white' 
                  : 'bg-white text-black hover:bg-gray-100'}`}
            >
              LOGIN
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2 px-4 text-sm font-medium transition-colors border-l border-black
                ${mode === 'register' 
                  ? 'bg-black text-white' 
                  : 'bg-white text-black hover:bg-gray-100'}`}
            >
              REGISTER
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Security Key FIRST (Register only) */}
            {mode === 'register' && (
              <div className="space-y-4">
                <div className="text-center py-2">
                  <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-50 border border-gray-200 text-sm">
                    <Key className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-700">Security Key Required</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Enter your security key to proceed with registration</p>
                </div>
                
                <div className="relative">
                  <input
                    type="text"
                    name="securityKey"
                    placeholder="Enter Security Key"
                    value={formData.securityKey}
                    onChange={handleChange}
                    required
                    className={`w-full px-4 py-3 pr-12 border bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-inset transition-all duration-300 ${
                      keyValidation.valid === true ? 'border-green-500 focus:ring-green-500 bg-green-50' :
                      keyValidation.valid === false ? 'border-red-500 focus:ring-red-500 bg-red-50' :
                      'border-gray-300 focus:ring-black focus:border-black'
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {keyValidation.checking ? (
                      <div className="animate-spin w-4 h-4 border-2 border-gray-300 border-t-black rounded-full"></div>
                    ) : keyValidation.valid === true ? (
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : keyValidation.valid === false ? (
                      <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                    ) : (
                      <Key className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {keyValidation.checking && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 inline-flex items-center space-x-2">
                      <div className="animate-spin w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                      <span>Validating security key...</span>
                    </p>
                  </div>
                )}
                
                {keyValidation.message && (
                  <div className={`text-center p-3 border ${
                    keyValidation.valid ? 
                    'bg-green-50 border-green-200 text-green-700' : 
                    'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    <p className="text-sm font-medium inline-flex items-center space-x-2">
                      {keyValidation.valid ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                      <span>{keyValidation.message}</span>
                    </p>
                  </div>
                )}
                
                {/* Progress indicator */}
                {keyValidation.valid === true && (
                  <div className="text-center">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 bg-green-100 border border-green-300 text-green-700 text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Security key verified! Fill out your profile below</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Information (Only show AFTER security key is validated for registration) */}
            {(mode === 'login' || (mode === 'register' && keyValidation.valid === true)) && (
              <>
                {/* Profile Section Header for Registration */}
                {mode === 'register' && keyValidation.valid === true && (
                  <div className="text-center py-3">
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-black text-white text-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span className="font-medium">Create Your Profile</span>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      placeholder="Choose a unique username"
                      value={formData.username}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                    />
                  </div>

                  {/* Email (Register only) */}
                  {mode === 'register' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                      />
                    </div>
                  )}

                  {/* Full Name (Register only) */}
                  {mode === 'register' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        placeholder="Your full name"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                      />
                    </div>
                  )}

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Create a secure password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 pr-12 border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-gray-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password (Register only) */}
                  {mode === 'register' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 pr-12 border border-gray-300 bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all duration-200"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4 text-gray-600" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Remember Me Checkbox (Login only) */}
            {mode === 'login' && (
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                />
                <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
                  Keep me logged in for 30 days
                </label>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button - Only show when security key is valid for registration */}
            {(mode === 'login' || (mode === 'register' && keyValidation.valid === true)) && (
              <button
                type="submit"
                disabled={loading || (mode === 'register' && !keyValidation.valid)}
                className="w-full bg-black text-white py-3 px-4 font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>PROCESSING...</span>
                  </>
                ) : (
                  <>
                    {mode === 'login' ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        <span>LOGIN</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                        <span>CREATE PROFILE</span>
                      </>
                    )}
                  </>
                )}
              </button>
            )}

            {/* Security Key Required Message for Registration */}
            {mode === 'register' && keyValidation.valid !== true && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 p-6 text-center">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <Key className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Security Key Required</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      Enter a valid security key above to unlock the registration form and create your profile.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>

          {/* Info */}
          <div className="mt-8 text-center space-y-4">
            <div className="border-t border-gray-200 pt-6">
              <div className="space-y-3">
                {mode === 'register' ? (
                  <div className="bg-gray-50 border border-gray-200 p-4 text-center">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center justify-center space-x-2">
                      <Key className="w-4 h-4" />
                      <span>Need a Security Key?</span>
                    </h3>
                    <div className="space-y-2 text-xs text-gray-600">
                      <p>Security keys are required for registration to maintain community quality.</p>
                      <p>
                        <a href="#" className="text-black hover:underline font-medium">Contact an admin</a> to request a security key.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-gray-700">Welcome back to DarkSphere!</h3>
                    <p className="text-xs text-gray-600">Login with your credentials to access your account.</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Platform Info */}
            <div className="text-xs text-gray-500 space-y-1">
              <p className="font-medium">© 2025 DarkSphere Community</p>
              <p>Secure • Private • Minimal</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}