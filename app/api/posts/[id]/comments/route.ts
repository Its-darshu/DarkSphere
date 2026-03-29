import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
    const { searchParams } = request.nextUrl
    const limit = parseInt(searchParams.get('limit') || '20')
    const cursor = searchParams.get('cursor') || null

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Get parent comments (not replies)
    const comments = await prisma.comment.findMany({
      where: {
        postId,
        parentCommentId: null,
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
          select: { likes: true, replies: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && { skip: 1, cursor: { id: cursor } }),
    })

    let nextCursor = null
    if (comments.length > limit) {
      nextCursor = comments[limit].id
      comments.pop()
    }

    return NextResponse.json({
      comments: comments.map((c) => ({
        id: c.id,
        content: c.content,
        author: c.author,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        likeCount: c._count.likes,
        replyCount: c._count.replies,
      })),
      nextCursor,
    })
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json(
      { error: 'Failed to load comments' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params
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
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }
    const { content, parentCommentId } = body

    // Validation
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const trimmedContent = content.trim()

    if (trimmedContent.length === 0) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 }
      )
    }

    if (trimmedContent.length > 500) {
      return NextResponse.json(
        { error: 'Comment must be 500 characters or less' },
        { status: 400 }
      )
    }

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // If replying to a comment, verify it exists and belongs to this post
    if (parentCommentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentCommentId },
      })

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        )
      }

      if (parentComment.postId !== postId) {
        return NextResponse.json(
          { error: 'Parent comment does not belong to this post' },
          { status: 400 }
        )
      }
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: trimmedContent,
        postId,
        authorId: user.userId,
        parentCommentId: parentCommentId || null,
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
          select: { likes: true, replies: true },
        },
      },
    })

    return NextResponse.json(
      {
        id: comment.id,
        content: comment.content,
        author: comment.author,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        likeCount: comment._count.likes,
        replyCount: comment._count.replies,
        parentCommentId: comment.parentCommentId,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}
