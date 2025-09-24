import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { Database } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const { username, password, securityKey } = await request.json()

    if (!username || !password || !securityKey) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate security key first
    const keyData = await Database.getSecurityKeyByValue(securityKey)
    if (!keyData || keyData.is_used) {
      return NextResponse.json({ error: 'Invalid or used security key' }, { status: 400 })
    }

    // Check if user exists
    const user = await Database.getUserByUsername(username)
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Mark security key as used
    await Database.useSecurityKey(securityKey, user.id)

    // Return user data (excluding password)
    const { password_hash, ...userWithoutPassword } = user
    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}