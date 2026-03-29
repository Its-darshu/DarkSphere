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

    // Get following with pagination
    const following = await prisma.follow.findMany({
      where: { followerId: targetUser.id },
      include: {
        following: {
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
    if (following.length > limit) {
      nextCursor = following[limit].id
      following.pop()
    }

    return NextResponse.json({
      following: following.map((f) => ({
        id: f.following.id,
        username: f.following.username,
        bio: f.following.bio,
        avatarUrl: f.following.avatarUrl,
      })),
      count: following.length,
      nextCursor,
    })
  } catch (error) {
    console.error('Error fetching following:', error)
    return NextResponse.json(
      { error: 'Failed to fetch following' },
      { status: 500 }
    )
  }
}
