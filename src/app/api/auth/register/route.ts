import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { Database } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, fullName, securityKey } = await request.json()

    if (!username || !email || !password || !fullName || !securityKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate security key first
    const keyData = await Database.getSecurityKeyByValue(securityKey)
    if (!keyData || keyData.is_used) {
      return NextResponse.json({ error: 'Invalid or used security key' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await Database.getUserByUsername(username)
    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 })
    }

    const existingEmail = await Database.getUserByEmail(email)
    if (existingEmail) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const newUser = await Database.createUser({
      username,
      email,
      password_hash: passwordHash,
      full_name: fullName,
      user_type: keyData.key_type as 'admin' | 'user'
    })

    // Mark security key as used
    await Database.useSecurityKey(securityKey, newUser.id)

    // Return user data (excluding password)
    const { password_hash, ...userWithoutPassword } = newUser
    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}