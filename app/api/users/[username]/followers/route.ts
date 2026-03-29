import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const MAX_LIMIT = 100

function validateLimit(limit: string | null): number {
  if (!limit) return 50 // default
  const parsed = parseInt(limit, 10)
  if (Number.isNaN(parsed) || parsed <= 0) return 50
  return Math.min(parsed, MAX_LIMIT) // clamp to MAX_LIMIT
}

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const targetUsername = params.username.toLowerCase()
    const { searchParams } = request.nextUrl
    const limit = validateLimit(searchParams.get('limit'))
    const cursor = searchParams.get('cursor') || null

    // Get target user
    const targetUser = await prisma.user.findUnique({
      where: { username: targetUsername },
      select: { id: true },
    })

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get followers with pagination
    const followers = await prisma.follow.findMany({
      where: { followingId: targetUser.id },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            bio: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
    })

    let nextCursor = null
    if (followers.length > limit) {
      nextCursor = followers[limit].id
      followers.pop()
    }

    return NextResponse.json({
      followers: followers.map((f) => ({
        id: f.follower.id,
        username: f.follower.username,
        bio: f.follower.bio,
        avatarUrl: f.follower.avatarUrl,
      })),
      count: followers.length,
      nextCursor,
    })
  } catch (error) {
    console.error('Error fetching followers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch followers' },
      { status: 500 }
    )
  }
}
