import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username: rawUsername } = await params
    const username = rawUsername.toLowerCase()
    const token = request.cookies.get('auth-token')?.value

    let currentUserId: string | null = null
    if (token) {
      const user = verifyToken(token)
      currentUserId = user?.userId || null
    }

    // Get user profile
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if current user follows this user
    let isFollowing = false
    if (currentUserId && currentUserId !== user.id) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: currentUserId,
            followingId: user.id,
          },
        },
      })
      isFollowing = !!follow
    }

    const isOwnProfile = currentUserId === user.id

    return NextResponse.json({
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      _count: user._count,
      isFollowing,
      isOwnProfile,
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    )
  }
}
