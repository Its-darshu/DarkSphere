import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/auth'

export async function GET(_request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get posts from followed users + own posts
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { authorId: user.userId }, // Own posts
          {
            author: {
              followers: {
                some: {
                  followerId: user.userId,
                },
              },
            },
          }, // Posts from followed users
        ],
      },
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
        likes: {
          where: {
            userId: user.userId,
          },
          select: {
            id: true,
          },
        },
        retweets: {
          where: {
            userId: user.userId,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
      ],
      take: 50, // Load 50 posts at a time
    })

    // Format response
    const formattedPosts = posts.map((post) => ({
      ...post,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
      retweetCount: post._count.retweets,
      isLiked: post.likes.length > 0,
      isRetweeted: post.retweets.length > 0,
      isOwnPost: post.authorId === user.userId,
      _count: undefined,
      likes: undefined,
      retweets: undefined,
    }))

    return NextResponse.json(formattedPosts)
  } catch (error) {
    console.error('Error fetching posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { content, imageUrl } = await request.json()

    // Validate content
    const trimmedContent = content?.trim() || ''

    if (trimmedContent.length === 0) {
      return NextResponse.json(
        { error: 'Post content cannot be empty' },
        { status: 400 }
      )
    }

    if (trimmedContent.length > 500) {
      return NextResponse.json(
        { error: 'Post must be 500 characters or less' },
        { status: 400 }
      )
    }

    // Create post
    const post = await prisma.post.create({
      data: {
        content: trimmedContent,
        imageUrl: imageUrl || null,
        authorId: user.userId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        ...post,
        likeCount: 0,
        commentCount: 0,
        retweetCount: 0,
        isLiked: false,
        isRetweeted: false,
        isOwnPost: true,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}
