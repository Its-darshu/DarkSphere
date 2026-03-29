import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const user = await verifyToken(
      request.cookies.get('auth-token')?.value || ''
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const targetUsername = params.username.toLowerCase()

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { username: targetUsername },
      select: { id: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Can't follow yourself
    if (targetUser.id === user.userId) {
      return NextResponse.json(
        { error: 'You cannot follow yourself' },
        { status: 400 }
      )
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.userId,
          followingId: targetUser.id,
        },
      },
    })

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: user.userId,
            followingId: targetUser.id,
          },
        },
      })

      return NextResponse.json(
        { message: 'Unfollowed successfully', following: false },
        { status: 200 }
      )
    } else {
      // Follow
      try {
        await prisma.follow.create({
          data: {
            followerId: user.userId,
            followingId: targetUser.id,
          },
        })
      } catch (createError: any) {
        // Handle unique constraint error (TOCTOU race: another request already created the follow)
        if (createError.code === 'P2002') {
          // Another request beat us to it, but follow exists now
          return NextResponse.json(
            { message: 'Followed successfully', following: true },
            { status: 201 }
          )
        }
        throw createError // Re-throw other errors
      }

      return NextResponse.json(
        { message: 'Followed successfully', following: true },
        { status: 201 }
      )
    }
  } catch (error) {
    console.error('Error toggling follow:', error)
    return NextResponse.json(
      { error: 'Failed to toggle follow' },
      { status: 500 }
    )
  }
}
