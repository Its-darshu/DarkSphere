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
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username: rawUsername } = await params
    const username = rawUsername.toLowerCase()
    const { searchParams } = request.nextUrl
    const limit = validateLimit(searchParams.get('limit'))
    const cursor = searchParams.get('cursor') || null

    // Get user
    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's posts with pagination
    const posts = await prisma.post.findMany({
      where: { authorId: user.id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            retweets: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
    })

    let nextCursor = null
    if (posts.length > limit) {
      nextCursor = posts[limit].id
      posts.pop()
    }

    return NextResponse.json({
      posts: posts.map((post) => ({
        id: post.id,
        content: post.content,
        imageUrl: post.imageUrl,
        createdAt: post.createdAt,
        author: post.author,
        likeCount: post._count.likes,
        commentCount: post._count.comments,
        retweetCount: post._count.retweets,
      })),
      nextCursor,
    })
  } catch (error) {
    console.error('Error fetching user posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user posts' },
      { status: 500 }
    )
  }
}
