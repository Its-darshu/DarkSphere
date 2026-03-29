import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id
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

    // Verify comment exists and user owns it
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
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

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    if (comment.authorId !== user.userId) {
      return NextResponse.json(
        { error: 'You can only edit your own comments' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { content } = body

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

    // Update comment
    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { content: trimmedContent },
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

    return NextResponse.json({
      id: updated.id,
      content: updated.content,
      author: updated.author,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
      likeCount: updated._count.likes,
      replyCount: updated._count.replies,
    })
  } catch (error) {
    console.error('Update comment error:', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const commentId = params.id
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

    // Verify comment exists and user owns it
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { author: { select: { id: true } } },
    })

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 })
    }

    if (comment.authorId !== user.userId) {
      return NextResponse.json(
        { error: 'You can only delete your own comments' },
        { status: 403 }
      )
    }

    // Delete comment (cascade deletes replies and likes via schema)
    await prisma.comment.delete({
      where: { id: commentId },
    })

    return NextResponse.json({ message: 'Comment deleted' })
  } catch (error) {
    console.error('Delete comment error:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}
