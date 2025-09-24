import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { Database } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, fullName, securityKey } = await request.json()

    if (!username || !email || !password || !fullName || !securityKey) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // FIRST: Validate security key before doing ANYTHING else
    console.log('🔑 Validating security key:', securityKey)
    const keyData = await Database.getSecurityKeyByValue(securityKey)
    
    if (!keyData) {
      console.log('❌ Security key not found in database')
      return NextResponse.json({ error: 'Invalid security key' }, { status: 400 })
    }
    
    if (keyData.is_used) {
      console.log('❌ Security key already used by:', keyData.used_by)
      return NextResponse.json({ error: 'Security key has already been used' }, { status: 400 })
    }
    
    console.log('✅ Security key is valid and unused')

    // SECOND: Check if user already exists
    const existingUser = await Database.getUserByUsername(username)
    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    const existingEmail = await Database.getUserByEmail(email)
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // THIRD: Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // FOURTH: Create user
    console.log('👤 Creating user with key type:', keyData.key_type)
    const newUser = await Database.createUser({
      username,
      email,
      password_hash: passwordHash,
      full_name: fullName,
      user_type: keyData.key_type as 'admin' | 'user'
    })

    // FIFTH: Mark security key as used
    console.log('🔒 Marking security key as used by:', newUser.id)
    await Database.useSecurityKey(securityKey, newUser.id)

    // Return user data (excluding password)
    const { password_hash, ...userWithoutPassword } = newUser
    console.log('🎉 User registration successful:', userWithoutPassword.username)
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('❌ Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}