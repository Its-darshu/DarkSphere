'use client'

import { useState } from 'react'
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
        ? { username: formData.username, password: formData.password }
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
        // Store user session in localStorage for client-side navigation
        localStorage.setItem('user', JSON.stringify(data.user))
        localStorage.setItem('isLoggedIn', 'true')
        
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
            {/* Username */}
            <div>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-inset"
              />
            </div>

            {/* Email (Register only) */}
            {mode === 'register' && (
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-inset"
                />
              </div>
            )}

            {/* Full Name (Register only) */}
            {mode === 'register' && (
              <div>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-inset"
                />
              </div>
            )}

            {/* Password */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 pr-12 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-inset"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-600" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </div>

            {/* Confirm Password (Register only) */}
            {mode === 'register' && (
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 pr-12 border border-black bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black focus:ring-inset"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
            )}

            {/* Security Key (Register only) */}
            {mode === 'register' && (
              <div className="relative">
                <input
                  type="text"
                  name="securityKey"
                  placeholder="Security Key"
                  value={formData.securityKey}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-3 pr-12 border bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-inset transition-colors ${
                    keyValidation.valid === true ? 'border-green-500 focus:ring-green-500 bg-green-50' :
                    keyValidation.valid === false ? 'border-red-500 focus:ring-red-500 bg-red-50' :
                    'border-black focus:ring-black'
                  }`}
                />
                <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-600" />
                
                {keyValidation.checking && (
                  <p className="text-sm text-gray-600 mt-1">
                    Validating security key...
                  </p>
                )}
                {keyValidation.message && (
                  <p className={`text-sm mt-1 ${
                    keyValidation.valid ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {keyValidation.message}
                  </p>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 px-4 font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'PROCESSING...' : (mode === 'login' ? 'LOGIN' : 'REGISTER')}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 text-xs text-center text-gray-600">
            {mode === 'register' ? (
              <>
                <p>Need a security key to join? Contact an admin.</p>
                <p className="mt-1">Security keys are required for registration.</p>
              </>
            ) : (
              <>
                <p>Welcome back to DarkSphere!</p>
                <p className="mt-1">Login with your username and password.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}