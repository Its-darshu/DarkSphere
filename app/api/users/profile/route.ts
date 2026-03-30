import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken, hashPassword, verifyPassword, generateToken } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const profile = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        username: true,
        bio: true,
        avatarUrl: true,
        role: true,
        authProvider: true,
        passwordHash: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const { passwordHash, ...profileData } = profile
    const responseData = {
      ...profileData,
      hasPassword: !!passwordHash,
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { bio, avatarUrl, username, currentPassword, newPassword } = body

    // Validate input
    if (username !== undefined) {
      if (typeof username !== 'string' || username.length < 3 || username.length > 20) {
        return NextResponse.json({ error: 'Username must be between 3 and 20 characters' }, { status: 400 })
      }
      const existing = await prisma.user.findUnique({ where: { username } })
      if (existing && existing.id !== user.userId) {
        return NextResponse.json({ error: 'Username is already taken' }, { status: 400 })
      }
    }

    if (newPassword !== undefined) {
      if (typeof newPassword !== 'string' || newPassword.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 })
      }
      
      const dbUser = await prisma.user.findUnique({ where: { id: user.userId } })
      
      if (!dbUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      if (dbUser.passwordHash) {
        if (!currentPassword) {
          return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 })
        }
        const isPasswordValid = await verifyPassword(currentPassword, dbUser.passwordHash)
        if (!isPasswordValid) return NextResponse.json({ error: 'Incorrect current password' }, { status: 401 })
      }
    }

    if (bio !== undefined && typeof bio !== 'string') {
      return NextResponse.json(
        { error: 'Bio must be a string' },
        { status: 400 }
      )
    }

    if (avatarUrl !== undefined && typeof avatarUrl !== 'string') {
      return NextResponse.json(
        { error: 'Avatar URL must be a string' },
        { status: 400 }
      )
    }

    // Validate avatar URL is a valid HTTP(S) URL
    if (avatarUrl !== undefined && avatarUrl.trim()) {
      try {
        const url = new URL(avatarUrl)
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          return NextResponse.json(
            { error: 'Avatar URL must use HTTP or HTTPS protocol' },
            { status: 400 }
          )
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Avatar URL must be a valid URL' },
          { status: 400 }
        )
      }
    }

    // Validate bio length
    if (bio !== undefined && bio.length > 500) {
      return NextResponse.json(
        { error: 'Bio must be 500 characters or less' },
        { status: 400 }
      )
    }

    // Update user profile
    const updateData: any = {}
    if (username !== undefined) updateData.username = username
    if (newPassword !== undefined) updateData.passwordHash = await hashPassword(newPassword)
    if (bio !== undefined) {
      updateData.bio = bio.trim() || null
    }
    if (avatarUrl !== undefined) {
      updateData.avatarUrl = avatarUrl.trim() || null
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
      },
    })

    const patchResponse = NextResponse.json(updatedUser)

    if (username !== undefined && username !== user.username) {
      const token = generateToken(updatedUser.id, updatedUser.username)
      patchResponse.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      })
    }

    return patchResponse
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}
