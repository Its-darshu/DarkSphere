import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/database'

export async function GET() {
  try {
    const users = await Database.getAllUsers()
    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId, updates } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const updatedUser = await Database.updateUser(userId, updates)
    
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return user data (excluding password)
    const { password_hash, ...userWithoutPassword } = updatedUser
    return NextResponse.json({ user: userWithoutPassword })

  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}