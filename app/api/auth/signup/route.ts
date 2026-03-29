import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'

export async function POST(request: NextRequest) {
  try {
    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Invalid request body format' },
        { status: 400 }
      )
    }

    const { username, password } = body

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    if (username.length < 3 || username.length > 20) {
      return NextResponse.json(
        { error: 'Username must be between 3 and 20 characters' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user - handle TOCTOU race condition
    let user
    try {
      user = await prisma.user.create({
        data: {
          username: username.toLowerCase(),
          passwordHash,
        },
      })
    } catch (createError) {
      // Handle unique constraint violation (username already taken race condition)
      if (
        createError instanceof PrismaClientKnownRequestError &&
        createError.code === 'P2002'
      ) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        )
      }
      // Re-throw other errors to be caught by outer try/catch
      throw createError
    }

    // Generate token
    const token = generateToken(user.id, user.username)

    // Create response and set cookie
    const response = NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          username: user.username,
        }
      },
      { status: 201 }
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
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
