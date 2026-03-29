import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash)

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Check if user is banned (only after valid credentials)
    if (user.isBanned) {
      return NextResponse.json(
        { error: 'Your account has been banned' },
        { status: 403 }
      )
    }

    // Generate token
    const token = generateToken(user.id, user.username)

    // Create response and set cookie
    const response = NextResponse.json(
      {
        message: 'Sign in successful',
        user: {
          id: user.id,
          username: user.username,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
        }
      },
      { status: 200 }
    )

    // Set cookie on response
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Signin error:', error)
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    )
  }
}
